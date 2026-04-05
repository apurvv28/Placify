const os = require('os');
const path = require('path');
const fs = require('fs/promises');
const { spawn } = require('child_process');
const { randomUUID } = require('crypto');
const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require('@aws-sdk/client-transcribe');
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
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
const bedrockRuntimeClient = new BedrockRuntimeClient(awsClientConfig);

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically'];

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
      return transcriptText;
    }

    if (status === 'FAILED') {
      throw new Error(job?.FailureReason || 'Amazon Transcribe job failed');
    }

    await wait(pollMs);
  }

  throw new Error('Amazon Transcribe timed out');
};

const getLLMAnalysisFromBedrock = async ({ transcriptText, questionType }) => {
  const modelId = getEnv('INTERVIEWIQ_BEDROCK_MODEL_ID', 'amazon.nova-micro-v1:0');
  const maxTokens = Number(getEnv('INTERVIEWIQ_BEDROCK_MAX_TOKENS', '512'));

  const systemPrompt = [
    'You are an expert HR evaluator.',
    'Score this interview response on: clarity (0-25), relevance (0-25), depth (0-25), communication (0-25).',
    'For behavioral questions also score STAR structure adherence (bonus 0-10).',
    'Return strict JSON with fields:',
    '{ clarity, relevance, depth, communication, starScore, overallFeedback, strengths, improvements, fillerWordCount }',
  ].join(' ');

  const response = await bedrockRuntimeClient.send(
    new ConverseCommand({
      modelId,
      system: [{ text: systemPrompt }],
      messages: [
        {
          role: 'user',
          content: [
            {
              text: `Question type: ${questionType}\nTranscript:\n${transcriptText}`,
            },
          ],
        },
      ],
      inferenceConfig: {
        maxTokens,
        temperature: 0.1,
      },
    })
  );

  const outputText =
    response?.output?.message?.content
      ?.map((item) => item?.text || '')
      .join('\n') || '';

  const parsedOutput = extractJsonObject(outputText) || {};

  return {
    clarity: clamp(Number(parsedOutput.clarity || 0), 0, 25),
    relevance: clamp(Number(parsedOutput.relevance || 0), 0, 25),
    depth: clamp(Number(parsedOutput.depth || 0), 0, 25),
    communication: clamp(Number(parsedOutput.communication || 0), 0, 25),
    starScore: questionType === 'behavioral' ? clamp(Number(parsedOutput.starScore || 0), 0, 10) : 0,
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
      clarity: 0,
      relevance: 0,
      depth: 0,
      communication: 0,
      starScore: 0,
      overallFeedback: 'Transcript unavailable. Score could not be fully evaluated.',
      strengths: [],
      improvements: ['Please ensure microphone permissions and AWS transcription availability.'],
      fillerWordCount,
      transcriptText: transcriptText || '',
      transcriptAvailable: false,
      llmAvailable: false,
    };
  }

  const clarity = clamp(Math.round(Math.min(25, wordCount / 8) - fillerWordCount * 0.3), 0, 25);
  const relevance = clamp(Math.round(Math.min(25, wordCount / 10) + 5), 0, 25);
  const depth = clamp(Math.round(Math.min(25, wordCount / 12) + 4), 0, 25);
  const communication = clamp(Math.round(Math.min(25, wordCount / 9) - fillerWordCount * 0.2), 0, 25);

  const hasSituation = /\bsituation\b/i.test(transcriptText);
  const hasTask = /\btask\b/i.test(transcriptText);
  const hasAction = /\baction\b/i.test(transcriptText);
  const hasResult = /\bresult\b/i.test(transcriptText);
  const starScore =
    questionType === 'behavioral' ? [hasSituation, hasTask, hasAction, hasResult].filter(Boolean).length * 2.5 : 0;

  return {
    clarity,
    relevance,
    depth,
    communication,
    starScore,
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
  } catch {
    transcriptText = transcriptHint || '';
  }

  if (!transcriptText) {
    transcriptText = transcriptHint || '';
  }

  if (!transcriptText) {
    return getModel1TranscriptAndLLM({ transcriptText: '', questionType });
  }

  try {
    const llmScores = await getLLMAnalysisFromBedrock({ transcriptText, questionType });
    return {
      ...llmScores,
      transcriptText,
      transcriptAvailable: true,
      llmAvailable: true,
    };
  } catch {
    return getModel1TranscriptAndLLM({ transcriptText, questionType });
  }
};

const getModel2AntiCheat = async ({ s3Key }) => {
  const hfApiKey = process.env.HUGGINGFACE_API_KEY || '';
  const configuredModel = getEnv('INTERVIEWIQ_HF_MODEL', 'google/mediapipe-face-detection');
  const fallbackModels = [
    configuredModel,
    'facebook/detr-resnet-50',
    'hustvl/yolos-tiny',
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

const getModel3KeywordHeuristic = ({ transcriptText, keywords }) => {
  const tokens = tokenize(transcriptText).map(stem);
  const tokenSet = new Set(tokens);
  const normalizedKeywords = (keywords || []).map((keyword) => stem(String(keyword).toLowerCase()));

  const matchedKeywords = normalizedKeywords.filter((keyword) => tokenSet.has(keyword));
  const missedKeywords = normalizedKeywords.filter((keyword) => !tokenSet.has(keyword));
  const fillerCount = countFillerWords(transcriptText);

  const baseScore = normalizedKeywords.length
    ? (matchedKeywords.length / normalizedKeywords.length) * 100
    : 0;

  const penalty = fillerCount > 3 ? (fillerCount - 3) * 2 : 0;
  const keywordScore = clamp(Math.round(baseScore - penalty), 0, 100);

  return {
    keywordScore,
    fillerCount,
    matchedKeywords,
    missedKeywords,
  };
};

const getFinalScore = ({ llmScores, keywordScores, antiCheatResult }) => {
  const transcriptLLMRaw =
    Number(llmScores.clarity || 0) +
    Number(llmScores.relevance || 0) +
    Number(llmScores.depth || 0) +
    Number(llmScores.communication || 0) +
    Number(llmScores.starScore || 0);

  const isBehavioral = Number(llmScores.starScore || 0) > 0;
  const llmMax = isBehavioral ? 110 : 100;
  const llmPercent = clamp(Math.round((transcriptLLMRaw / llmMax) * 100), 0, 100);

  const antiCheatUnavailable =
    antiCheatResult?.confidenceScore === null ||
    (Array.isArray(antiCheatResult?.flags) && antiCheatResult.flags.includes('evaluation_unavailable'));

  const antiCheatScore = antiCheatUnavailable
    ? 50
    : antiCheatResult?.cheatDetected
    ? clamp(100 - Number(antiCheatResult?.confidenceScore || 100), 0, 100)
    : 100;

  const keywordPercent = clamp(Number(keywordScores.keywordScore || 0), 0, 100);

  const hasTranscript = Boolean(llmScores?.transcriptAvailable);
  const hasKeywordSignal = keywordPercent > 0;

  if (!hasTranscript && !hasKeywordSignal) {
    return 0;
  }

  const finalScore = llmPercent * 0.45 + keywordPercent * 0.35 + antiCheatScore * 0.2;

  return clamp(Math.round(finalScore), 0, 100);
};

const runEvaluationPipelineAsync = async ({
  userId,
  responseId,
  s3Key,
  question,
  transcriptHint,
}) => {
  let transcriptS3Key = null;

  try {
    await responseRepo.update(userId, responseId, {
      status: 'processing',
      processingStartedAt: new Date().toISOString(),
    });

    const model1 = await getModel1TranscriptAndLLMReal({
      s3Key,
      transcriptHint,
      questionType: question.type,
    });

    const model2 = await getModel2AntiCheat({ s3Key });

    const model3 = getModel3KeywordHeuristic({
      transcriptText: model1.transcriptText,
      keywords: question.keywords,
    });

    const finalScore = getFinalScore({
      llmScores: model1,
      keywordScores: model3,
      antiCheatResult: model2,
    });

    transcriptS3Key = await putTranscriptTextToS3({
      userId,
      responseId,
      transcriptText: model1.transcriptText,
    });

    await responseRepo.update(userId, responseId, {
      status: 'completed',
      s3Key: transcriptS3Key,
      transcriptText: model1.transcriptText,
      llmScores: {
        clarity: model1.clarity,
        relevance: model1.relevance,
        depth: model1.depth,
        communication: model1.communication,
        starScore: model1.starScore,
        overallFeedback: model1.overallFeedback,
        strengths: model1.strengths,
        improvements: model1.improvements,
        fillerWordCount: model1.fillerWordCount,
      },
      keywordScores: model3,
      antiCheatResult: model2,
      finalScore,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    const fallbackTranscriptText = transcriptHint || '';

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
  } finally {
    try {
      await deleteRecordingObject(s3Key);
    } catch {
      // Best effort cleanup to avoid retaining raw recordings.
    }
  }
};

module.exports = {
  runEvaluationPipelineAsync,
};
