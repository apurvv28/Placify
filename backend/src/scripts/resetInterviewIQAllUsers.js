require('dotenv').config();

const {
  ScanCommand,
  BatchWriteCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLES } = require('../config/dynamodb');

const chunk = (items, size) => {
  const output = [];
  for (let i = 0; i < items.length; i += size) {
    output.push(items.slice(i, i + size));
  }
  return output;
};

const scanAll = async (tableName, projectionExpression) => {
  const items = [];
  let exclusiveStartKey;

  do {
    const response = await docClient.send(
      new ScanCommand({
        TableName: tableName,
        ProjectionExpression: projectionExpression,
        ExclusiveStartKey: exclusiveStartKey,
      })
    );

    items.push(...(response.Items || []));
    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return items;
};

const deleteByKeys = async (tableName, keys) => {
  if (!keys.length) return;

  const keyBatches = chunk(keys, 25);
  for (const batch of keyBatches) {
    const requestItems = {
      [tableName]: batch.map((Key) => ({
        DeleteRequest: { Key },
      })),
    };

    await docClient.send(new BatchWriteCommand({ RequestItems: requestItems }));
  }
};

const defaultProgress = (userId) => ({
  userId,
  currentDeck: 1,
  completedDecks: [],
  totalScore: 0,
  badges: [],
  streakData: {
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
  },
  weakAreas: [],
  updatedAt: new Date().toISOString(),
});

const main = async () => {
  const apply = process.argv.includes('--apply');

  const [progressKeys, deckKeys, responseKeys] = await Promise.all([
    scanAll(TABLES.INTERVIEWIQ_USER_PROGRESS, 'userId'),
    scanAll(TABLES.INTERVIEWIQ_DECKS, 'userId, deckNumber'),
    scanAll(TABLES.INTERVIEWIQ_RESPONSES, 'userId, responseId'),
  ]);

  console.log('InterviewIQ reset summary');
  console.log(`- Progress rows: ${progressKeys.length}`);
  console.log(`- Deck rows: ${deckKeys.length}`);
  console.log(`- Response rows: ${responseKeys.length}`);

  if (!apply) {
    console.log('Dry run only. Re-run with --apply to execute reset.');
    return;
  }

  await deleteByKeys(
    TABLES.INTERVIEWIQ_DECKS,
    deckKeys.map((item) => ({ userId: item.userId, deckNumber: item.deckNumber }))
  );

  await deleteByKeys(
    TABLES.INTERVIEWIQ_RESPONSES,
    responseKeys.map((item) => ({ userId: item.userId, responseId: item.responseId }))
  );

  for (const { userId } of progressKeys) {
    await docClient.send(
      new PutCommand({
        TableName: TABLES.INTERVIEWIQ_USER_PROGRESS,
        Item: defaultProgress(userId),
      })
    );
  }

  console.log('Reset applied successfully. All users are back to deck 1 with zero progress.');
};

main().catch((error) => {
  console.error('Failed to reset InterviewIQ data:', error.message);
  process.exit(1);
});
