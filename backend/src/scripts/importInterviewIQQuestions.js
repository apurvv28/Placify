const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { BatchWriteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../config/dynamodb');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const KEYWORDS_BY_CATEGORY = {
  leadership: ['lead', 'guide', 'direct', 'manage', 'mentor', 'coach', 'inspire', 'motivate', 'delegate', 'decide', 'initiative', 'responsibility', 'accountable', 'vision', 'strategy'],
  'conflict resolution': ['resolve', 'mediate', 'negotiate', 'compromise', 'communicate', 'listen', 'understand', 'empathize', 'calm', 'solution', 'agree', 'disagree', 'apologize', 'feedback'],
  teamwork: ['collaborate', 'cooperate', 'support', 'help', 'share', 'contribute', 'coordinate', 'together', 'collective', 'joint', 'assist', 'partner', 'align', 'synergy'],
  adaptability: ['adapt', 'adjust', 'flexible', 'pivot', 'change', 'learn', 'new', 'different', 'unexpected', 'modify', 'evolve', 'respond', 'agile', 'resilient'],
  'problem solving': ['solve', 'debug', 'fix', 'resolve', 'troubleshoot', 'analyze', 'identify', 'root cause', 'solution', 'creative', 'approach', 'method', 'systematic', 'logical'],
  'pressure & deadlines': ['deadline', 'urgent', 'pressure', 'stress', 'time', 'schedule', 'deliver', 'commit', 'prioritize', 'focus', 'calm', 'composed', 'overtime', 'critical'],
  communication: ['communicate', 'clarity', 'listen', 'present', 'feedback', 'stakeholder', 'email', 'document', 'align', 'explain', 'persuade', 'negotiate', 'escalate'],
  'number series': ['pattern', 'sequence', 'difference', 'multiple', 'square', 'cube', 'prime', 'fibonacci', 'arithmetic', 'geometric', 'increment', 'decrement', 'ratio'],
  syllogisms: ['all', 'some', 'none', 'conclusion', 'premise', 'logical', 'deductive', 'venn', 'set', 'subset', 'universal', 'particular', 'categorical'],
  'data sufficiency': ['sufficient', 'necessary', 'statement', 'alone', 'together', 'both', 'either', 'neither', 'enough', 'information', 'condition', 'combine'],
  'coding logic': ['loop', 'condition', 'variable', 'function', 'recursion', 'iteration', 'array', 'output', 'syntax', 'logic', 'algorithm', 'complexity', 'return'],
  'verbal reasoning': ['analogy', 'coding', 'decoding', 'sequence', 'pattern', 'assumption', 'inference', 'conclusion', 'classification', 'order', 'ranking'],
  'arrangements & patterns': ['position', 'order', 'sequence', 'row', 'circle', 'arrangement', 'sitting', 'left', 'right', 'between', 'opposite', 'adjacent', 'clockwise'],
};

const STAR_HINTS = [
  'Situation: what was the context?',
  'Task: what responsibility did you own?',
  'Action: what did you do specifically?',
  'Result: what measurable outcome happened?',
];

const normalize = (value) => String(value || '').trim().toLowerCase();

const parseQuestions = (raw) => {
  const lines = raw.split(/\r?\n/);
  const questions = [];

  let currentType = null;
  let currentCategory = null;
  let currentDifficulty = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^##\s+BEHAVIORAL QUESTIONS/i.test(trimmed)) {
      currentType = 'behavioral';
      continue;
    }

    if (/^##\s+LOGICAL REASONING QUESTIONS/i.test(trimmed)) {
      currentType = 'logical';
      continue;
    }

    const categoryMatch = trimmed.match(/^###\s+Category:\s+(.+?)\s*\(\d+ questions\)/i);
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim();
      continue;
    }

    const difficultyMatch = trimmed.match(/^\*\*(Easy|Medium|Hard)\s*\(\d+ questions\)\*\*/i);
    if (difficultyMatch) {
      currentDifficulty = difficultyMatch[1].toLowerCase();
      continue;
    }

    const questionMatch = trimmed.match(/^(\d{1,3})\.\s+(.+)$/);
    if (!questionMatch) continue;
    if (!currentType || !currentCategory || !currentDifficulty) continue;

    const numericId = Number(questionMatch[1]);
    const text = questionMatch[2].trim();
    const typeToken = currentType === 'behavioral' ? 'b' : 'l';
    const questionId = `iq-${typeToken}-${String(numericId).padStart(3, '0')}`;

    const categoryKey = normalize(currentCategory);
    const keywords = KEYWORDS_BY_CATEGORY[categoryKey] || [];

    questions.push({
      questionId,
      text,
      type: currentType,
      difficulty: currentDifficulty,
      category: currentCategory,
      keywords,
      starHints: currentType === 'behavioral' ? STAR_HINTS : [],
      sampleAnswer: '',
      source: 'question-deck.txt',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return questions;
};

const validateDistribution = (questions) => {
  const behavioral = questions.filter((q) => q.type === 'behavioral').length;
  const logical = questions.filter((q) => q.type === 'logical').length;
  const total = questions.length;

  if (total !== 300) {
    throw new Error(`Expected 300 questions, found ${total}.`);
  }

  if (behavioral !== 210 || logical !== 90) {
    throw new Error(`Expected behavioral/logical = 210/90, found ${behavioral}/${logical}.`);
  }

  const difficultyCounts = questions.reduce((acc, item) => {
    const key = `${item.type}:${item.difficulty}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    total,
    behavioral,
    logical,
    difficultyCounts,
  };
};

const batchWriteAll = async (items) => {
  const tableName = TABLES.INTERVIEWIQ_QUESTIONS;
  const chunkSize = 25;

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);

    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: chunk.map((item) => ({ PutRequest: { Item: item } })),
        },
      })
    );

    process.stdout.write(`Imported ${Math.min(i + chunk.length, items.length)}/${items.length}\r`);
  }

  process.stdout.write('\n');
};

const getExistingCount = async () => {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.INTERVIEWIQ_QUESTIONS,
      Select: 'COUNT',
    })
  );

  return Number(result.Count || 0);
};

const main = async () => {
  const apply = process.argv.includes('--apply');
  const sourcePath = path.resolve(__dirname, '../../../question-deck.txt');

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source file not found: ${sourcePath}`);
  }

  const raw = fs.readFileSync(sourcePath, 'utf-8');
  const questions = parseQuestions(raw);
  const report = validateDistribution(questions);

  console.log('Parsed question deck successfully.');
  console.log(`Total: ${report.total}, Behavioral: ${report.behavioral}, Logical: ${report.logical}`);
  console.log('Difficulty buckets:', report.difficultyCounts);

  if (!apply) {
    console.log('Dry run only. Re-run with --apply to write into DynamoDB.');
    return;
  }

  const before = await getExistingCount();
  console.log(`Current table count before import: ${before}`);

  await batchWriteAll(questions);

  const after = await getExistingCount();
  console.log(`Import completed. Table count after import: ${after}`);
};

main().catch((error) => {
  console.error('Import failed:', error.message);
  process.exit(1);
});
