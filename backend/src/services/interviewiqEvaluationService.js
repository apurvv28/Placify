const os = require('os');
const path = require('path');
const fs = require('fs/promises');
const { spawn } = require('child_process');
const { randomUUID } = require('crypto');
const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require('@aws-sdk/client-transcribe');
const InterviewIQResponseRepository = require('../repositories/InterviewIQResponseRepository');
const { interviewRecordingBucket } = require('../config/interviewiqS3');

const responseRepo = new InterviewIQResponseRepository();

const getEnv = (name, fallback = '') => {
  const value = process.env[name];
  if (typeof value !== 'string') return fallback;
  return value.trim();
};

const region = getEnv('AWS_REGION', 'ap-south-1');
const accessKeyId = getEnv('AWS_ACCESS_KEY_ID', '');
const secretAccessKey = getEnv('AWS_SECRET_ACCESS_KEY', '');
const sessionToken = getEnv('AWS_SESSION_TOKEN', '');

const awsClientConfig = {
  region,
};

if (accessKeyId && secretAccessKey) {
  awsClientConfig.credentials = {
    accessKeyId,
    secretAccessKey,
    ...(sessionToken ? { sessionToken } : {}),
  };
}

const s3Client = new S3Client(awsClientConfig);
const transcribeClient = new TranscribeClient(awsClientConfig);

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically'];
const strictEvaluationEnabled = getEnv('INTERVIEWIQ_STRICT_EVALUATION', 'true').toLowerCase() !== 'false';
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_TRANSCRIBE_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const MAX_EVAL_CONCURRENCY = Number(getEnv('INTERVIEWIQ_EVAL_MAX_CONCURRENT', '4')) || 4;
const MAX_EVAL_QUEUE_SIZE = Number(getEnv('INTERVIEWIQ_EVAL_MAX_QUEUE', '200')) || 200;

const evalQueue = [];
let activeEvaluations = 0;

const logEval = (responseId, message, details = null) => {
  const prefix = `[InterviewIQ Evaluation][response:${responseId}] ${message}`;
  if (details === null || details === undefined) {
    console.log(prefix);
    return;
  }
  console.log(prefix, details);
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getMediaFormatFromS3Key = (s3Key = '') => {
  const ext = String(path.extname(s3Key || '') || '')
    .toLowerCase()
    .replace('.', '');

  if (ext === 'm4v') return 'mp4';
  if (ext === 'mkv') return 'webm';
  if (ext === 'mov' || ext === 'mp4' || ext === 'webm' || ext === 'ogg') return ext;
  return 'webm';
};

const safeJsonParse = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

const getGroqApiKey = () => {
  const apiKey = getEnv('GROQ_API_KEY', '');
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY is not configured.');
  }
  return apiKey;
};

const tokenize = (text) =>
  (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const stem = (word) => {
  if (!word) return word;
  return word
    .replace(/(ing|ed|ly|es|s)$/i, '')
    .trim();
};

const countFillerWords = (text) => {
  const normalized = (text || '').toLowerCase();
  let count = 0;
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${escapeRegExp(filler)}\\b`, 'g');
    const matches = normalized.match(regex);
    if (matches) count += matches.length;
  }
  return count;
};

const extractJsonObject = (rawText) => {
  if (!rawText) return null;

  const direct = safeJsonParse(rawText, null);
  if (direct && typeof direct === 'object') return direct;

  const codeFenceMatch = rawText.match(/```json\s*([\s\S]*?)```/i);
  if (codeFenceMatch?.[1]) {
    const parsed = safeJsonParse(codeFenceMatch[1].trim(), null);
    if (parsed && typeof parsed === 'object') return parsed;
  }

  const objectMatch = rawText.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) {
    const parsed = safeJsonParse(objectMatch[0], null);
    if (parsed && typeof parsed === 'object') return parsed;
  }

  return null;
};

const runCommand = async (command, args) => {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'ignore' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
};

const putTranscriptTextToS3 = async ({ userId, responseId, transcriptText }) => {
  const transcriptKey = `${userId}/transcripts/${responseId}.txt`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: interviewRecordingBucket,
      Key: transcriptKey,
      Body: transcriptText || '',
      ContentType: 'text/plain; charset=utf-8',
    })
  );

  return transcriptKey;
};

const deleteRecordingObject = async (s3Key) => {
  if (!s3Key) return;

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: interviewRecordingBucket,
      Key: s3Key,
    })
  );
};

const getTranscriptFromTranscribe = async ({ s3Key }) => {
  const transcriptionJobName = `interviewiq-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const mediaUri = `s3://${interviewRecordingBucket}/${s3Key}`;

  console.log('[InterviewIQ Evaluation][transcribe] Starting transcription job', {
    transcriptionJobName,
    s3Key,
    mediaUri,
  });

  await transcribeClient.send(
    new StartTranscriptionJobCommand({
      TranscriptionJobName: transcriptionJobName,
      LanguageCode: getEnv('INTERVIEWIQ_TRANSCRIBE_LANGUAGE', 'en-US'),
      MediaFormat: getMediaFormatFromS3Key(s3Key),
      Media: {
        MediaFileUri: mediaUri,
      },
      OutputBucketName: interviewRecordingBucket,
    })
  );

  const maxAttempts = Number(getEnv('INTERVIEWIQ_TRANSCRIBE_MAX_POLLS', '30'));
  const pollMs = Number(getEnv('INTERVIEWIQ_TRANSCRIBE_POLL_MS', '4000'));

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await transcribeClient.send(
      new GetTranscriptionJobCommand({
        TranscriptionJobName: transcriptionJobName,
      })
    );

    const job = response.TranscriptionJob;
    const status = job?.TranscriptionJobStatus;

    if (status === 'COMPLETED') {
      const transcriptFileUri = job?.Transcript?.TranscriptFileUri;
      if (!transcriptFileUri) return '';

      const fileResponse = await fetch(transcriptFileUri);
      if (!fileResponse.ok) throw new Error(`Unable to download transcript: HTTP ${fileResponse.status}`);

      const transcriptJson = await fileResponse.json();
      const transcriptText = transcriptJson?.results?.transcripts?.[0]?.transcript || '';
      console.log('[InterviewIQ Evaluation][transcribe] Transcription completed', {
        transcriptionJobName,
        transcriptLength: transcriptText.length,
      });
      return transcriptText;
    }

    if (status === 'FAILED') {
      console.error('[InterviewIQ Evaluation][transcribe] Transcription failed', {
        transcriptionJobName,
        reason: job?.FailureReason || 'unknown',
      });
      throw new Error(job?.FailureReason || 'Amazon Transcribe job failed');
    }

    await wait(pollMs);
  }

  throw new Error('Amazon Transcribe timed out');
};

const getTranscriptFromGroqAudio = async ({ s3Key }) => {
  const modelName = getEnv('INTERVIEWIQ_GROQ_TRANSCRIBE_MODEL', 'whisper-large-v3-turbo');
  const apiKey = getGroqApiKey();

  console.log('[InterviewIQ Evaluation][groq-transcribe] Starting Groq transcription', {
    modelName,
    s3Key,
  });

  const objectResponse = await s3Client.send(
    new GetObjectCommand({
      Bucket: interviewRecordingBucket,
      Key: s3Key,
    })
  );

  const mediaBuffer = await streamToBuffer(objectResponse.Body);
  const ext = String(path.extname(s3Key || '') || '.webm').replace('.', '') || 'webm';
  const mimeType = ext === 'mp4' ? 'video/mp4' : ext === 'mov' ? 'video/quicktime' : 'video/webm';
  const fileName = `recording.${ext}`;

  const formData = new FormData();
  formData.append('file', new Blob([mediaBuffer], { type: mimeType }), fileName);
  formData.append('model', modelName);
  formData.append('temperature', '0');

  const response = await fetch(GROQ_TRANSCRIBE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errText = String(payload?.error?.message || payload?.error || `HTTP ${response.status}`);
    throw new Error(`Groq transcription failed: ${errText}`);
  }

  const transcriptText = String(payload?.text || '').trim();

  console.log('[InterviewIQ Evaluation][groq-transcribe] Groq transcription completed', {
    transcriptLength: transcriptText.length,
  });

  return transcriptText;
};

const getLLMAnalysisFromGroqLlama = async ({ transcriptText, questionType }) => {
  const modelId = getEnv('INTERVIEWIQ_GROQ_MODEL', 'llama-3.3-70b-versatile');
  const maxTokens = Number(getEnv('INTERVIEWIQ_GROQ_MAX_TOKENS', '512'));
  const apiKey = getGroqApiKey();

  console.log('[InterviewIQ Evaluation][groq-llama] Starting strict star rating evaluation', {
    modelId,
    questionType,
    transcriptLength: String(transcriptText || '').length,
    strictEvaluationEnabled,
  });

  const systemPrompt = [
    'You are an expert HR evaluator.',
    'Use strict grading standards and be conservative with high ratings.',
    'Score the response with a single starRating from 0 to 10 (can include one decimal place).',
    'A score of 10 should be extremely rare and reserved for exceptional answers.',
    'Question type context is provided. For behavioral answers, enforce STAR completeness in the rating.',
    'Return strict JSON with fields:',
    '{ starRating, overallFeedback, strengths, improvements, fillerWordCount }',
    'Do not include any additional fields.',
  ].join(' ');

  const payload = {
    model: modelId,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Question type: ${questionType}\nTranscript:\n${transcriptText}`,
      },
    ],
    temperature: 0,
    max_tokens: maxTokens,
  };

  const response = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errText = String(data?.error?.message || data?.error || `HTTP ${response.status}`);
    throw new Error(`Groq chat completion failed: ${errText}`);
  }

  const outputText = String(data?.choices?.[0]?.message?.content || '');

  const parsedOutput = extractJsonObject(outputText) || {};

  const parsedStarRating = Number(parsedOutput.starRating);
  if (!Number.isFinite(parsedStarRating)) {
    console.error('[InterviewIQ Evaluation][groq-llama] Invalid or missing starRating in model output', {
      rawOutputPreview: String(outputText || '').slice(0, 400),
    });
    throw new Error('Groq response missing valid starRating.');
  }

  console.log('[InterviewIQ Evaluation][groq-llama] Evaluation succeeded', {
    starRating: parsedStarRating,
  });

  return {
    starRating: clamp(Math.round(parsedStarRating * 10) / 10, 0, 10),
    overallFeedback: String(parsedOutput.overallFeedback || 'Evaluation completed.'),
    strengths: Array.isArray(parsedOutput.strengths) ? parsedOutput.strengths.map(String) : [],
    improvements: Array.isArray(parsedOutput.improvements) ? parsedOutput.improvements.map(String) : [],
    fillerWordCount: Number(parsedOutput.fillerWordCount || countFillerWords(transcriptText)),
  };
};

const getModel1TranscriptAndLLM = async ({ transcriptText, questionType }) => {
  // Local heuristic baseline used when external AI integrations are unavailable.
  const words = tokenize(transcriptText);
  const wordCount = words.length;
  const fillerWordCount = countFillerWords(transcriptText);

  if (!wordCount) {
    return {
      starRating: 0,
      overallFeedback: 'Transcript unavailable. Score could not be fully evaluated.',
      strengths: [],
      improvements: ['Please ensure microphone permissions and AWS transcription availability.'],
      fillerWordCount,
      transcriptText: transcriptText || '',
      transcriptAvailable: false,
      llmAvailable: false,
    };
  }

  const clarity = clamp(Math.min(2.5, wordCount / 35) - fillerWordCount * 0.06, 0, 2.5);
  const relevance = clamp(Math.min(2.5, wordCount / 45) + 0.5, 0, 2.5);
  const depth = clamp(Math.min(2.5, wordCount / 55) + 0.4, 0, 2.5);
  const communication = clamp(Math.min(2.5, wordCount / 40) - fillerWordCount * 0.05, 0, 2.5);

  const hasSituation = /\bsituation\b/i.test(transcriptText);
  const hasTask = /\btask\b/i.test(transcriptText);
  const hasAction = /\baction\b/i.test(transcriptText);
  const hasResult = /\bresult\b/i.test(transcriptText);
  const behavioralBonus =
    questionType === 'behavioral' ? [hasSituation, hasTask, hasAction, hasResult].filter(Boolean).length * 0.625 : 0;

  const starRating = clamp(Math.round((clarity + relevance + depth + communication + behavioralBonus) * 10) / 10, 0, 10);

  return {
    starRating,
    overallFeedback: 'Automated baseline feedback generated from transcript quality signals.',
    strengths: ['Structure is understandable', 'Core points are communicated'],
    improvements: ['Use fewer filler words', 'Add quantified results where possible'],
    fillerWordCount,
    transcriptText: transcriptText || '',
    transcriptAvailable: true,
    llmAvailable: false,
  };
};

const getModel1TranscriptAndLLMReal = async ({ s3Key, transcriptHint, questionType }) => {
  let transcriptText = '';

  try {
    transcriptText = await getTranscriptFromTranscribe({ s3Key });
  } catch (error) {
    console.warn('[InterviewIQ Evaluation][pipeline] Transcribe unavailable, falling back to transcriptHint', {
      s3Key,
      reason: error.message || 'unknown',
    });

    try {
      transcriptText = await getTranscriptFromGroqAudio({ s3Key });
    } catch (groqTranscribeError) {
      console.warn('[InterviewIQ Evaluation][pipeline] Groq transcription unavailable, falling back to transcriptHint', {
        s3Key,
        reason: groqTranscribeError.message || 'unknown',
      });
      transcriptText = transcriptHint || '';
    }
  }

  if (!transcriptText) {
    transcriptText = transcriptHint || '';
  }

  if (!transcriptText) {
    return getModel1TranscriptAndLLM({ transcriptText: '', questionType });
  }

  try {
    const llmScores = await getLLMAnalysisFromGroqLlama({ transcriptText, questionType });
    return {
      ...llmScores,
      transcriptText,
      transcriptAvailable: true,
      llmAvailable: true,
    };
  } catch (error) {
    console.error('[InterviewIQ Evaluation][pipeline] Groq Llama evaluation failed', {
      reason: error.message || 'unknown',
      strictEvaluationEnabled,
    });

    if (strictEvaluationEnabled) {
      throw new Error(`Strict evaluation failed: ${error.message || 'Bedrock unavailable'}`);
    }

    return getModel1TranscriptAndLLM({ transcriptText, questionType });
  }
};

const getModel2AntiCheat = async ({ s3Key }) => {
  const hfApiKey = process.env.HUGGINGFACE_API_KEY || '';
  const configuredModel = getEnv('INTERVIEWIQ_HF_MODEL', 'microsoft/Florence-2-large');
  const fallbackModels = [
    configuredModel,
    'Salesforce/blip2-opt-2.7b',
    'facebook/detr-resnet-50',
  ].filter(Boolean);

  const parsePersonDetections = (prediction) => {
    const items = Array.isArray(prediction) ? prediction : [];
    return items.filter((item) => {
      const label = String(item?.label || item?.class || item?.name || '').toLowerCase();
      if (!label) {
        // Face detector style outputs may not include labels; treat bounding-box entries as valid detections.
        return Boolean(item?.box || item?.xmin !== undefined || item?.xmax !== undefined);
      }
      return label.includes('person') || label.includes('human') || label.includes('face');
    });
  };

  if (!hfApiKey) {
    return {
      cheatDetected: false,
      flags: ['evaluation_unavailable'],
      confidenceScore: null,
    };
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'interviewiq-'));
  const videoPath = path.join(tempDir, 'recording.webm');
  const framePattern = path.join(tempDir, 'frame-%03d.jpg');

  try {
    const objectResponse = await s3Client.send(
      new GetObjectCommand({
        Bucket: interviewRecordingBucket,
        Key: s3Key,
      })
    );

    const videoBuffer = await streamToBuffer(objectResponse.Body);
    await fs.writeFile(videoPath, videoBuffer);

    // Sample one frame every 10 seconds.
    await runCommand('ffmpeg', ['-i', videoPath, '-vf', 'fps=1/10', framePattern, '-hide_banner', '-loglevel', 'error']);

    const files = (await fs.readdir(tempDir)).filter((name) => /^frame-\d+\.jpg$/.test(name)).sort();
    if (!files.length) {
      return {
        cheatDetected: false,
        flags: ['evaluation_unavailable'],
        confidenceScore: null,
      };
    }

    let multipleFacesCount = 0;
    let noFaceCount = 0;

    let selectedModel = null;

    for (const fileName of files) {
      const frameBuffer = await fs.readFile(path.join(tempDir, fileName));

      let detections = [];
      let modelWorked = false;

      const modelsToTry = selectedModel ? [selectedModel] : fallbackModels;
      let lastModelError = null;

      for (const modelName of modelsToTry) {
        const response = await fetch(`https://api-inference.huggingface.co/models/${modelName}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfApiKey}`,
            'Content-Type': 'application/octet-stream',
          },
          body: frameBuffer,
        });

        const payload = await response.json().catch(() => ({}));
        const apiError = String(payload?.error || '');

        if (!response.ok || apiError) {
          lastModelError = new Error(apiError || `HF API failed with status ${response.status}`);
          continue;
        }

        selectedModel = modelName;
        detections = parsePersonDetections(payload);
        modelWorked = true;
        break;
      }

      if (!modelWorked) {
        throw lastModelError || new Error('No available Hugging Face model could process frames.');
      }

      if (detections.length === 0) noFaceCount += 1;
      if (detections.length > 1) multipleFacesCount += 1;
    }

    const flags = [];
    if (multipleFacesCount > 0) flags.push('multiple_faces_detected');
    if (noFaceCount > 1) flags.push('face_absent_for_extended_duration');

    const cheatDetected = flags.length > 0;
    const confidenceScore = clamp(Math.round(((multipleFacesCount + noFaceCount) / files.length) * 100), 0, 100);

    return {
      cheatDetected,
      flags,
      confidenceScore,
      modelUsed: selectedModel,
    };
  } catch {
    return {
      cheatDetected: false,
      flags: ['evaluation_unavailable'],
      confidenceScore: null,
      modelUsed: null,
    };
  } finally {
    try {
      const files = await fs.readdir(tempDir);
      await Promise.all(files.map((fileName) => fs.unlink(path.join(tempDir, fileName)).catch(() => {})));
      await fs.rmdir(tempDir).catch(() => {});
    } catch {
      // Ignore cleanup failures.
    }
  }

};

const runEvaluationPipelineTask = async ({
  userId,
  responseId,
  s3Key,
  question,
  transcriptHint,
}) => {
  let transcriptS3Key = null;

  try {
    logEval(responseId, 'Pipeline started', {
      userId,
      s3Key,
      questionId: question?.questionId,
      questionType: question?.type,
      strictEvaluationEnabled,
      hasTranscriptHint: Boolean(transcriptHint),
    });

    await responseRepo.update(userId, responseId, {
      status: 'processing',
      processingStartedAt: new Date().toISOString(),
    });

    logEval(responseId, 'Status updated to processing');

    const model1 = await getModel1TranscriptAndLLMReal({
      s3Key,
      transcriptHint,
      questionType: question.type,
    });

    logEval(responseId, 'Model evaluation ready', {
      transcriptAvailable: model1.transcriptAvailable,
      llmAvailable: model1.llmAvailable,
      transcriptLength: String(model1.transcriptText || '').length,
      starRating: model1.starRating,
    });

    const finalScore = clamp(Math.round(Number(model1.starRating || 0) * 10) / 10, 0, 10);

    logEval(responseId, 'Final score computed', { finalScore });

    transcriptS3Key = await putTranscriptTextToS3({
      userId,
      responseId,
      transcriptText: model1.transcriptText,
    });

    logEval(responseId, 'Transcript persisted', {
      transcriptS3Key,
      transcriptLength: String(model1.transcriptText || '').length,
    });

    await responseRepo.update(userId, responseId, {
      status: 'completed',
      s3Key: transcriptS3Key,
      transcriptText: model1.transcriptText,
      llmScores: {
        starRating: model1.starRating,
        overallFeedback: model1.overallFeedback,
        strengths: model1.strengths,
        improvements: model1.improvements,
        fillerWordCount: model1.fillerWordCount,
      },
      keywordScores: {},
      antiCheatResult: {},
      finalScore,
      completedAt: new Date().toISOString(),
    });

    logEval(responseId, 'Pipeline completed successfully', { finalScore });
  } catch (error) {
    const fallbackTranscriptText = transcriptHint || '';

    logEval(responseId, 'Pipeline failed', {
      error: error.message || 'Evaluation pipeline failed',
    });

    if (!transcriptS3Key && fallbackTranscriptText) {
      try {
        transcriptS3Key = await putTranscriptTextToS3({
          userId,
          responseId,
          transcriptText: fallbackTranscriptText,
        });
      } catch {
        transcriptS3Key = null;
      }
    }

    await responseRepo.update(userId, responseId, {
      status: 'failed',
      ...(transcriptS3Key ? { s3Key: transcriptS3Key } : {}),
      ...(fallbackTranscriptText ? { transcriptText: fallbackTranscriptText } : {}),
      evaluationError: error.message || 'Evaluation pipeline failed',
      completedAt: new Date().toISOString(),
    });

    logEval(responseId, 'Failure persisted on response record');
  } finally {
    try {
      await deleteRecordingObject(s3Key);
      logEval(responseId, 'Raw recording deleted from S3');
    } catch {
      // Best effort cleanup to avoid retaining raw recordings.
      logEval(responseId, 'Raw recording cleanup skipped due to delete failure');
    }
  }
};

const processEvaluationQueue = () => {
  while (activeEvaluations < MAX_EVAL_CONCURRENCY && evalQueue.length > 0) {
    const job = evalQueue.shift();
    activeEvaluations += 1;

    runEvaluationPipelineTask(job.payload)
      .catch((error) => {
        console.error('[InterviewIQ Evaluation][queue] Unexpected execution error', {
          jobId: job.id,
          error: error?.message || 'unknown',
        });
      })
      .finally(() => {
        activeEvaluations = Math.max(0, activeEvaluations - 1);
        processEvaluationQueue();
      });
  }
};

const hasEvaluationCapacity = () => evalQueue.length < MAX_EVAL_QUEUE_SIZE;

const getEvaluationQueueStats = () => ({
  active: activeEvaluations,
  queued: evalQueue.length,
  maxConcurrent: MAX_EVAL_CONCURRENCY,
  maxQueue: MAX_EVAL_QUEUE_SIZE,
});

const enqueueEvaluationPipeline = (payload) => {
  if (!hasEvaluationCapacity()) {
    return {
      accepted: false,
      reason: 'queue_full',
      stats: getEvaluationQueueStats(),
    };
  }

  const job = {
    id: randomUUID(),
    payload,
    queuedAt: Date.now(),
  };

  evalQueue.push(job);
  processEvaluationQueue();

  return {
    accepted: true,
    jobId: job.id,
    stats: getEvaluationQueueStats(),
  };
};

module.exports = {
  enqueueEvaluationPipeline,
  hasEvaluationCapacity,
  getEvaluationQueueStats,
};
