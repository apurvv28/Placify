const { docClient, TABLES } = require('../config/dynamodb');
const { GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

class InterviewIQResponseRepository {
  async create(response) {
    await docClient.send(
      new PutCommand({
        TableName: TABLES.INTERVIEWIQ_RESPONSES,
        Item: response,
      })
    );
    return response;
  }

  async findByUserAndResponseId(userId, responseId) {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLES.INTERVIEWIQ_RESPONSES,
        Key: { userId, responseId },
      })
    );

    return result.Item || null;
  }

  async update(userId, responseId, updateData) {
    const updateFields = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    let counter = 0;

    for (const [key, value] of Object.entries(updateData)) {
      counter += 1;
      const nameKey = `#k${counter}`;
      const valueKey = `:v${counter}`;
      expressionAttributeNames[nameKey] = key;
      expressionAttributeValues[valueKey] = value;
      updateFields.push(`${nameKey} = ${valueKey}`);
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLES.INTERVIEWIQ_RESPONSES,
        Key: { userId, responseId },
        UpdateExpression: `SET ${updateFields.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    return result.Attributes || null;
  }

  async listByUser(userId) {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLES.INTERVIEWIQ_RESPONSES,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
    );

    return result.Items || [];
  }

  async listByUserAndDeck(userId, deckId) {
    const items = await this.listByUser(userId);
    return items.filter((item) => item.deckId === deckId);
  }

  async listTopResponses(limit = 5) {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLES.INTERVIEWIQ_RESPONSES,
      })
    );

    const items = result.Items || [];
    return items
      .filter((item) => Number(item.finalScore || 0) >= 9.5 && item.status === 'completed')
      .sort((a, b) => Number(b.finalScore || 0) - Number(a.finalScore || 0))
      .slice(0, limit);
  }
}

module.exports = InterviewIQResponseRepository;
