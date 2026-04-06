const InterviewIQQuestionRepository = require('../repositories/InterviewIQQuestionRepository');
const InterviewIQProgressRepository = require('../repositories/InterviewIQProgressRepository');
const InterviewIQDeckRepository = require('../repositories/InterviewIQDeckRepository');
const InterviewIQResponseRepository = require('../repositories/InterviewIQResponseRepository');

const questionRepo = new InterviewIQQuestionRepository();
const progressRepo = new InterviewIQProgressRepository();
const deckRepo = new InterviewIQDeckRepository();
const responseRepo = new InterviewIQResponseRepository();
const PASSING_DECK_STAR_RATING = 5;

const DECK_MILESTONE_BADGES = {
  1: { id: 'deck-1', name: 'Deck 1 Complete', icon: '🥉', description: 'Completed your first InterviewIQ deck' },
  5: { id: 'deck-5', name: 'Deck 5 Complete', icon: '🏅', description: 'Completed 5 InterviewIQ decks' },
  10: { id: 'deck-10', name: 'Deck 10 Complete', icon: '🎖️', description: 'Completed 10 InterviewIQ decks' },
  50: { id: 'deck-50', name: 'Deck 50 Complete', icon: '🏆', description: 'Completed 50 InterviewIQ decks' },
  100: { id: 'deck-100', name: 'Deck 100 Complete', icon: '👑', description: 'Completed all 100 InterviewIQ decks' },
};

const STATIC_BADGES = {
  PERFECT_ROUND: { id: 'perfect-round', name: 'Perfect Round', icon: '✨', description: 'Scored 90%+ in a single deck' },
  STREAK_7: { id: 'streak-7', name: '7-Day Streak', icon: '🔥', description: 'Practiced on 7 consecutive days' },
  STAR_MASTER: { id: 'star-master', name: 'STAR Master', icon: '⭐', description: 'Scored full STAR structure in 10 behavioral answers' },
};

const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const repeatToLength = (items, targetLength) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  const output = [];
  while (output.length < targetLength) {
    for (const item of shuffle(items)) {
      output.push(item);
      if (output.length >= targetLength) break;
    }
  }

  return output.slice(0, targetLength);
};

const orderQuestionsByIds = (questions, questionIds) => {
  const orderMap = new Map(questionIds.map((questionId, index) => [questionId, index]));
  return [...questions].sort((a, b) => (orderMap.get(a.questionId) ?? 0) - (orderMap.get(b.questionId) ?? 0));
};

const isEasyMediumHardQuestions = (questions) => {
  if (!Array.isArray(questions) || questions.length !== 3) return false;
  return questions[0]?.difficulty === 'easy' && questions[1]?.difficulty === 'medium' && questions[2]?.difficulty === 'hard';
};

const hasSameQuestionIds = (left, right) => {
  if (!Array.isArray(left) || !Array.isArray(right)) return false;
  if (left.length !== right.length) return false;
  return left.every((id, index) => id === right[index]);
};

const withoutSampleAnswer = (question) => {
  const { sampleAnswer, ...safeQuestion } = question;
  return safeQuestion;
};

const getDateOnlyUTC = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : null);

const updateStreakData = (streakData, nowIso) => {
  const today = getDateOnlyUTC(nowIso);
  const lastDate = getDateOnlyUTC(streakData?.lastPracticeDate);

  if (lastDate === today) {
    return {
      currentStreak: Number(streakData?.currentStreak || 0),
      longestStreak: Number(streakData?.longestStreak || 0),
      lastPracticeDate: streakData?.lastPracticeDate || nowIso,
    };
  }

  const yesterday = new Date(`${today}T00:00:00.000Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayDate = yesterday.toISOString().slice(0, 10);

  const isConsecutive = lastDate === yesterdayDate;
  const currentStreak = isConsecutive ? Number(streakData?.currentStreak || 0) + 1 : 1;
  const longestStreak = Math.max(Number(streakData?.longestStreak || 0), currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastPracticeDate: nowIso,
  };
};

const awardBadgeIfMissing = (badges, badge) => {
  if (badges.some((entry) => entry.id === badge.id)) return badges;
  return [...badges, { ...badge, unlockedAt: new Date().toISOString() }];
};

const buildDeckPlanFromQuestions = (questions) => {
  if (!Array.isArray(questions) || questions.length < 300) {
    throw new Error('Question bank must contain at least 300 questions to create 100 decks.');
  }

  const byDifficulty = {
    easy: shuffle(questions.filter((question) => question.difficulty === 'easy')),
    medium: shuffle(questions.filter((question) => question.difficulty === 'medium')),
    hard: shuffle(questions.filter((question) => question.difficulty === 'hard')),
  };

  const easyQuestions = repeatToLength(byDifficulty.easy, 100);
  const mediumQuestions = repeatToLength(byDifficulty.medium, 100);
  const hardQuestions = repeatToLength(byDifficulty.hard, 100);

  if (easyQuestions.length < 100 || mediumQuestions.length < 100 || hardQuestions.length < 100) {
    throw new Error('Question bank must contain enough easy, medium, and hard questions to create 100 decks.');
  }

  const deckPlan = [];

  for (let i = 0; i < 100; i += 1) {
    deckPlan.push([easyQuestions[i].questionId, mediumQuestions[i].questionId, hardQuestions[i].questionId]);
  }

  return deckPlan;
};

const hasValidDeckPlan = (deckPlan, questionById) => {
  if (!Array.isArray(deckPlan) || deckPlan.length !== 100) return false;
  return deckPlan.every((deck) => {
    if (!Array.isArray(deck) || deck.length !== 3 || !deck.every((id) => typeof id === 'string')) {
      return false;
    }

    if (!questionById) return true;

    const questions = deck.map((questionId) => questionById.get(questionId));
    return questions.every(Boolean) && isEasyMediumHardQuestions(questions);
  });
};

const ensureUserDeckPlan = async (userId, progress) => {
  const allQuestions = await questionRepo.findAll();
  const questionById = new Map(allQuestions.map((question) => [question.questionId, question]));

  if (hasValidDeckPlan(progress?.deckPlan, questionById)) {
    return progress.deckPlan;
  }

  const deckPlan = buildDeckPlanFromQuestions(allQuestions);
  await progressRepo.update(userId, { deckPlan });

  return deckPlan;
};

const getOrGenerateDeck = async (userId, deckNumber) => {
  const progress = await progressRepo.findOrCreate(userId);
  const deckPlan = await ensureUserDeckPlan(userId, progress);

  if (deckNumber < 1 || deckNumber > 100) {
    throw new Error('Deck number must be between 1 and 100');
  }

  if (deckNumber > Number(progress.currentDeck || 1)) {
    const err = new Error('Deck is locked');
    err.code = 'DECK_LOCKED';
    throw err;
  }

  const existingDeck = await deckRepo.findByUserAndDeckNumber(userId, deckNumber);
  const questionIds = deckPlan[deckNumber - 1];
  if (!Array.isArray(questionIds) || questionIds.length !== 3) {
    throw new Error(`Deck plan entry missing for deck ${deckNumber}.`);
  }

  if (existingDeck) {
    const existingIds = existingDeck.questionIds || [];
    const existingQuestions = await questionRepo.findByIds(existingIds);
    const orderedExistingQuestions = orderQuestionsByIds(existingQuestions, existingIds);
    const hasValidComposition = isEasyMediumHardQuestions(orderedExistingQuestions);

    if (existingDeck.status !== 'completed' && (!hasValidComposition || !hasSameQuestionIds(existingIds, questionIds))) {
      const repairedDeck = await deckRepo.update(userId, deckNumber, {
        questionIds,
        status: 'not_started',
        startedAt: null,
        completedAt: null,
        totalScore: null,
      });

      const repairedQuestions = await questionRepo.findByIds(questionIds);
      return {
        deck: repairedDeck,
        questions: orderQuestionsByIds(repairedQuestions, questionIds),
      };
    }

    return {
      deck: existingDeck,
      questions: orderedExistingQuestions,
    };
  }

  const deck = await deckRepo.create({
    userId,
    deckNumber,
    deckId: `deck-${deckNumber}`,
    questionIds,
    status: 'not_started',
    startedAt: null,
    completedAt: null,
    totalScore: null,
    createdAt: new Date().toISOString(),
  });

  const questions = await questionRepo.findByIds(questionIds);
  return { deck, questions: orderQuestionsByIds(questions, questionIds) };
};

const getDeckPreview = (questions) =>
  questions.map((question) => ({
    questionId: question.questionId,
    type: question.type,
    difficulty: question.difficulty,
  }));

const finalizeDeckIfEligible = async (userId, deckNumber) => {
  const deck = await deckRepo.findByUserAndDeckNumber(userId, deckNumber);
  if (!deck) return null;
  if (deck.status === 'completed') return deck;

  const responses = await responseRepo.listByUserAndDeck(userId, deck.deckId);
  const completedResponses = responses.filter((response) => response.status === 'completed');

  const latestByQuestion = new Map();
  for (const item of completedResponses) {
    const key = item.questionId;
    if (!key) continue;

    const prev = latestByQuestion.get(key);
    const itemTime = new Date(item.completedAt || item.recordedAt || item.createdAt || 0).getTime();
    const prevTime = prev ? new Date(prev.completedAt || prev.recordedAt || prev.createdAt || 0).getTime() : -1;

    if (!prev || itemTime >= prevTime) {
      latestByQuestion.set(key, item);
    }
  }

  const scoredResponses = [...latestByQuestion.values()];
  if (scoredResponses.length < 3) return null;

  const totalScore = Math.round(
    (scoredResponses.reduce((acc, item) => acc + Number(item.finalScore || 0), 0) / scoredResponses.length) * 10
  ) / 10;

  if (!(totalScore > PASSING_DECK_STAR_RATING)) {
    return deckRepo.update(userId, deckNumber, {
      status: 'in_progress',
      completedAt: null,
      totalScore,
    });
  }

  const completedDeck = await deckRepo.update(userId, deckNumber, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    totalScore,
  });

  const progress = await progressRepo.findOrCreate(userId);
  const completedDecks = [...new Set([...(progress.completedDecks || []), deckNumber])].sort((a, b) => a - b);
  const currentDeck = Math.min(100, Math.max(Number(progress.currentDeck || 1), deckNumber + 1));

  let badges = [...(progress.badges || [])];

  if (DECK_MILESTONE_BADGES[deckNumber]) {
    badges = awardBadgeIfMissing(badges, DECK_MILESTONE_BADGES[deckNumber]);
  }

  if (totalScore >= 9) {
    badges = awardBadgeIfMissing(badges, STATIC_BADGES.PERFECT_ROUND);
  }

  const allResponses = await responseRepo.listByUser(userId);
  const behavioralStarMasterCount = allResponses.filter(
    (item) => item.status === 'completed' && item.questionType === 'behavioral' && Number(item.llmScores?.starRating || 0) >= 10
  ).length;

  if (behavioralStarMasterCount >= 10) {
    badges = awardBadgeIfMissing(badges, STATIC_BADGES.STAR_MASTER);
  }

  const streakData = updateStreakData(progress.streakData || {}, new Date().toISOString());
  if (streakData.currentStreak >= 7) {
    badges = awardBadgeIfMissing(badges, STATIC_BADGES.STREAK_7);
  }

  const nextTotalScore = Number(progress.totalScore || 0) + totalScore;

  await progressRepo.update(userId, {
    currentDeck,
    completedDecks,
    totalScore: nextTotalScore,
    badges,
    streakData,
  });

  return completedDeck;
};

const buildWeakAreaHeatmap = async (userId) => {
  const responses = await responseRepo.listByUser(userId);
  const completed = responses.filter((item) => item.status === 'completed');

  if (completed.length < 10) {
    return {
      available: false,
      message: 'Heatmap requires at least 10 completed responses.',
      focusAreas: [],
      categories: [],
    };
  }

  const categoryMap = new Map();
  for (const item of completed) {
    if (!item.category) continue;
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, []);
    }
    categoryMap.get(item.category).push(Number(item.finalScore || 0));
  }

  const categories = [...categoryMap.entries()].map(([category, scores]) => {
    const averageScore = Math.round((scores.reduce((acc, score) => acc + score, 0) / scores.length) * 10) / 10;
    return {
      category,
      averageScore,
      attempts: scores.length,
      percentileColor:
        averageScore >= 8 ? 'bg-emerald-500/30' : averageScore >= 6 ? 'bg-amber-500/30' : 'bg-rose-500/30',
    };
  });

  const focusAreas = [...categories]
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3)
    .map((item) => item.category);

  await progressRepo.update(userId, { weakAreas: focusAreas });

  return {
    available: true,
    focusAreas,
    categories,
  };
};

module.exports = {
  questionRepo,
  progressRepo,
  deckRepo,
  responseRepo,
  getOrGenerateDeck,
  getDeckPreview,
  withoutSampleAnswer,
  finalizeDeckIfEligible,
  buildWeakAreaHeatmap,
};
