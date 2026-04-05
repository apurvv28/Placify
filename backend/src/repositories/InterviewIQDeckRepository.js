const { docClient, TABLES } = require('../config/dynamodb');
const { GetCommand, PutCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

class InterviewIQDeckRepository {
  async findByUserAndDeckNumber(userId, deckNumber) {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLES.INTERVIEWIQ_DECKS,
        Key: { userId, deckNumber },
      })
    );
    return result.Item || null;
  }

  async create(deck) {
    await docClient.send(
      new PutCommand({
        TableName: TABLES.INTERVIEWIQ_DECKS,
        Item: deck,
      })
    );
    return deck;
  }

  async update(userId, deckNumber, updateData) {
    const updateFields = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    let counter = 0;

    for (const [key, value] of Object.entries(updateData)) {
      counter += 1;
      const nameKey = `#k${counter}`;
      const valueKey = `:v${counter}`;
      expressionAttributeNames[nameKey] = key;
      updateFields.push(`${nameKey} = ${valueKey}`);
      expressionAttributeValues[valueKey] = value;
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLES.INTERVIEWIQ_DECKS,
        Key: { userId, deckNumber },
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
        TableName: TABLES.INTERVIEWIQ_DECKS,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
    );

    return result.Items || [];
  }
}

module.exports = InterviewIQDeckRepository;
