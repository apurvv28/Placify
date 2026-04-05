const { docClient, TABLES } = require('../config/dynamodb');
const { PutCommand, ScanCommand, BatchGetCommand } = require('@aws-sdk/lib-dynamodb');

class InterviewIQQuestionRepository {
  async countAll() {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLES.INTERVIEWIQ_QUESTIONS,
        Select: 'COUNT',
      })
    );
    return Number(result.Count || 0);
  }

  async seedQuestions(questions) {
    for (const question of questions) {
      await docClient.send(
        new PutCommand({
          TableName: TABLES.INTERVIEWIQ_QUESTIONS,
          Item: question,
        })
      );
    }
    return questions.length;
  }

  async findAll() {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLES.INTERVIEWIQ_QUESTIONS,
      })
    );
    return result.Items || [];
  }

  async findByIds(questionIds) {
    if (!Array.isArray(questionIds) || questionIds.length === 0) return [];

    const result = await docClient.send(
      new BatchGetCommand({
        RequestItems: {
          [TABLES.INTERVIEWIQ_QUESTIONS]: {
            Keys: questionIds.map((questionId) => ({ questionId })),
          },
        },
      })
    );

    return result?.Responses?.[TABLES.INTERVIEWIQ_QUESTIONS] || [];
  }

  async findByTypeAndDifficulty(type, difficulty) {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLES.INTERVIEWIQ_QUESTIONS,
        FilterExpression: '#type = :type AND #difficulty = :difficulty',
        ExpressionAttributeNames: {
          '#type': 'type',
          '#difficulty': 'difficulty',
        },
        ExpressionAttributeValues: {
          ':type': type,
          ':difficulty': difficulty,
        },
      })
    );

    return result.Items || [];
  }
}

module.exports = InterviewIQQuestionRepository;
