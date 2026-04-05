const { docClient, TABLES } = require('../config/dynamodb');
const { GetCommand, PutCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

class InterviewIQProgressRepository {
  defaultProgress(userId) {
    return {
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
    };
  }

  async findByUserId(userId) {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLES.INTERVIEWIQ_USER_PROGRESS,
        Key: { userId },
      })
    );

    return result.Item || null;
  }

  async findOrCreate(userId) {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;

    const progress = this.defaultProgress(userId);
    await docClient.send(
      new PutCommand({
        TableName: TABLES.INTERVIEWIQ_USER_PROGRESS,
        Item: progress,
      })
    );
    return progress;
  }

  async update(userId, updateData) {
    const updateFields = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    let counter = 0;

    const payload = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    for (const [key, value] of Object.entries(payload)) {
      counter += 1;
      const nameKey = `#k${counter}`;
      const valueKey = `:v${counter}`;
      expressionAttributeNames[nameKey] = key;
      expressionAttributeValues[valueKey] = value;
      updateFields.push(`${nameKey} = ${valueKey}`);
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLES.INTERVIEWIQ_USER_PROGRESS,
        Key: { userId },
        UpdateExpression: `SET ${updateFields.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    return result.Attributes || null;
  }

  async listLeaderboard(limit = 20) {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLES.INTERVIEWIQ_USER_PROGRESS,
      })
    );

    const items = result.Items || [];
    return items
      .sort((a, b) => Number(b.totalScore || 0) - Number(a.totalScore || 0))
      .slice(0, limit);
  }
}

module.exports = InterviewIQProgressRepository;
