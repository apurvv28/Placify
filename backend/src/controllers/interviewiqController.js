const path = require('path');
const { v4: uuidv4 } = require('uuid');
const UserRepository = require('../repositories/UserRepository');
const { SAMPLE_INTERVIEWIQ_QUESTIONS } = require('../data/interviewiqQuestions');
const { uploadInterviewRecordingBuffer } = require('../config/interviewiqS3');
const { runEvaluationPipelineAsync } = require('../services/interviewiqEvaluationService');
const {
  questionRepo,
  progressRepo,
  deckRepo,
  responseRepo,
  getOrGenerateDeck,
  getDeckPreview,
  withoutSampleAnswer,
  finalizeDeckIfEligible,
  buildWeakAreaHeatmap,
} = require('../services/interviewiqService');

const userRepo = new UserRepository();

const asDeckId = (deckNumber) => `deck-${deckNumber}`;

const getResponseTimestamp = (item) =>
  new Date(item?.completedAt || item?.recordedAt || item?.createdAt || 0).getTime();

const dedupeLatestResponsesByQuestion = (responses = []) => {
  const latestByQuestion = new Map();

  for (const item of responses) {
    const questionId = item?.questionId;
    if (!questionId) continue;

    const prev = latestByQuestion.get(questionId);
    if (!prev || getResponseTimestamp(item) >= getResponseTimestamp(prev)) {
      latestByQuestion.set(questionId, item);
    }
  }

  return [...latestByQuestion.values()].sort((a, b) => getResponseTimestamp(a) - getResponseTimestamp(b));
};

const getProgress = async (req, res, next) => {
  try {
    const progress = await progressRepo.findOrCreate(req.userId);
    return res.status(200).json(progress);
  } catch (error) {
    return next(error);
  }
};

const getDeck = async (req, res, next) => {
  try {
    const deckNumber = Number(req.params.deckNumber);
    const { deck, questions } = await getOrGenerateDeck(req.userId, deckNumber);

    return res.status(200).json({
      deck,
      preview: getDeckPreview(questions),
      questions: questions.map(withoutSampleAnswer),
    });
  } catch (error) {
    if (error.code === 'DECK_LOCKED') {
      return res.status(403).json({ message: 'Deck is locked. Complete the current deck first.' });
    }
    return next(error);
  }
};

const startDeck = async (req, res, next) => {
  try {
    const deckNumber = Number(req.params.deckNumber);
    const existingDeck = await deckRepo.findByUserAndDeckNumber(req.userId, deckNumber);

    if (!existingDeck) {
      return res.status(404).json({ message: 'Deck not found. Fetch deck before starting.' });
    }

    const startedDeck = await deckRepo.update(req.userId, deckNumber, {
      status: 'in_progress',
      startedAt: existingDeck.startedAt || new Date().toISOString(),
    });

    return res.status(200).json({ deck: startedDeck });
  } catch (error) {
    return next(error);
  }
};

const uploadResponse = async (req, res, next) => {
  try {
    const { questionId, deckId, deckNumber, transcriptHint } = req.body || {};

    if (!req.file) {
      return res.status(400).json({ message: 'Recording file is required.' });
    }

    if (!questionId || (!deckId && !deckNumber)) {
      return res.status(400).json({ message: 'questionId and deckId/deckNumber are required.' });
    }

    const resolvedDeckId = deckId || asDeckId(Number(deckNumber));
    const resolvedDeckNumber = deckNumber ? Number(deckNumber) : Number(String(resolvedDeckId).replace('deck-', ''));

    const deck = await deckRepo.findByUserAndDeckNumber(req.userId, resolvedDeckNumber);
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found for user.' });
    }

    if (!(deck.questionIds || []).includes(questionId)) {
      return res.status(400).json({ message: 'Question does not belong to this deck.' });
    }

    const questions = await questionRepo.findByIds([questionId]);
    const question = questions[0];

    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const ext = path.extname(req.file.originalname || '').toLowerCase() || '.webm';
    const timestamp = Date.now();
    const s3Key = `${req.userId}/${resolvedDeckId}/${questionId}/${timestamp}${ext}`;

    const uploadResult = await uploadInterviewRecordingBuffer({
      key: s3Key,
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
    });

    const responseId = uuidv4();
    const nowIso = new Date().toISOString();

    await responseRepo.create({
      userId: req.userId,
      responseId,
      questionId,
      questionType: question.type,
      category: question.category,
      deckId: resolvedDeckId,
      deckNumber: resolvedDeckNumber,
      s3Key: uploadResult.key,
      status: 'pending',
      transcriptText: '',
      llmScores: {},
      keywordScores: {},
      antiCheatResult: {},
      finalScore: null,
      recordedAt: nowIso,
      createdAt: nowIso,
    });

    setImmediate(() => {
      runEvaluationPipelineAsync({
        userId: req.userId,
        responseId,
        s3Key: uploadResult.key,
        question,
        transcriptHint: typeof transcriptHint === 'string' ? transcriptHint : '',
      });
    });

    return res.status(202).json({
      message: 'Response uploaded. Evaluation queued.',
      responseId,
      status: 'pending',
    });
  } catch (error) {
    return next(error);
  }
};

const getResponseResult = async (req, res, next) => {
  try {
    const responseId = req.params.responseId;
    const response = await responseRepo.findByUserAndResponseId(req.userId, responseId);

    if (!response) {
      return res.status(404).json({ message: 'Response not found.' });
    }

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};

const getDeckResults = async (req, res, next) => {
  try {
    const deckNumber = Number(req.params.deckNumber);
    const deckId = asDeckId(deckNumber);

    const deck = await deckRepo.findByUserAndDeckNumber(req.userId, deckNumber);
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found.' });
    }

    const progressBefore = await progressRepo.findOrCreate(req.userId);
    const previousBadgeIds = new Set((progressBefore.badges || []).map((badge) => badge.id));

    await finalizeDeckIfEligible(req.userId, deckNumber);

    const refreshedDeck = await deckRepo.findByUserAndDeckNumber(req.userId, deckNumber);
    const responses = await responseRepo.listByUserAndDeck(req.userId, deckId);
    const latestResponses = dedupeLatestResponsesByQuestion(responses);

    const progress = await progressRepo.findOrCreate(req.userId);
    const newBadges = (progress.badges || []).filter((badge) => !previousBadgeIds.has(badge.id));

    return res.status(200).json({
      deck: refreshedDeck,
      responses: latestResponses,
      totalDeckScore: refreshedDeck?.totalScore ?? null,
      badges: progress.badges || [],
      newBadges,
    });
  } catch (error) {
    return next(error);
  }
};

const getHeatmap = async (req, res, next) => {
  try {
    const heatmap = await buildWeakAreaHeatmap(req.userId);
    return res.status(200).json(heatmap);
  } catch (error) {
    return next(error);
  }
};

const isRecruiter = (user) => user?.role === 'recruiter' || user?.workingRole === 'hr';

const getLeaderboard = async (req, res, next) => {
  try {
    const user = await userRepo.findById(req.userId);
    if (!isRecruiter(user)) {
      return res.status(403).json({ message: 'Recruiter access required.' });
    }

    const leaderboard = await progressRepo.listLeaderboard(20);
    const payload = leaderboard.map((item, index) => ({
      rank: index + 1,
      userId: item.userId,
      name: `Candidate-${String(item.userId).slice(-5)}`,
      totalScore: Number(item.totalScore || 0),
      completedDeckCount: Array.isArray(item.completedDecks) ? item.completedDecks.length : 0,
    }));

    return res.status(200).json({ leaderboard: payload });
  } catch (error) {
    return next(error);
  }
};

const getHighlights = async (req, res, next) => {
  try {
    const user = await userRepo.findById(req.userId);
    if (!isRecruiter(user)) {
      return res.status(403).json({ message: 'Recruiter access required.' });
    }

    const topResponses = await responseRepo.listTopResponses(5);
    const highlights = topResponses.map((item) => ({
      responseId: item.responseId,
      userAlias: `Candidate-${String(item.userId).slice(-5)}`,
      questionId: item.questionId,
      deckId: item.deckId,
      finalScore: item.finalScore,
      feedback: item.llmScores?.overallFeedback || null,
      antiCheatFlags: item.antiCheatResult?.flags || [],
    }));

    return res.status(200).json({ highlights });
  } catch (error) {
    return next(error);
  }
};

const seedQuestions = async (req, res, next) => {
  try {
    const user = await userRepo.findById(req.userId);
    const adminEmails = String(process.env.INTERVIEWIQ_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    const isAdmin = adminEmails.includes(String(user?.email || '').toLowerCase()) || user?.workingRole === 'hr';
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    const seededCount = await questionRepo.seedQuestions(SAMPLE_INTERVIEWIQ_QUESTIONS);
    const totalCount = await questionRepo.countAll();

    return res.status(200).json({
      message: 'Question bank seeded successfully.',
      seededCount,
      totalCount,
      targetQuestionBankSize: 300,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProgress,
  getDeck,
  startDeck,
  uploadResponse,
  getResponseResult,
  getDeckResults,
  getHeatmap,
  getLeaderboard,
  getHighlights,
  seedQuestions,
};
