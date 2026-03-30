const { v4: uuidv4 } = require('uuid');
const { docClient, TABLES } = require('../config/dynamodb');
const { GetCommand, PutCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

class CommentRepository {
  async findByPostId(postId, limit = 50, lastKey = null) {
    try {
      const params = {
        TableName: TABLES.COMMENTS,
        KeyConditionExpression: 'postId = :postId',
        ExpressionAttributeValues: {
          ':postId': postId,
        },
        ScanIndexForward: false, // Descending order (newest first)
        Limit: limit,
      };

      if (lastKey) {
        params.ExclusiveStartKey = lastKey;
      }

      const result = await docClient.send(new QueryCommand(params));
      return {
        items: result.Items || [],
        lastKey: result.LastEvaluatedKey,
      };
    } catch (error) {
      throw error;
    }
  }

  async findById(postId, createdAtCommentId) {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.COMMENTS,
        Key: {
          postId,
          createdAtCommentId,
        },
      }));
      return result.Item || null;
    } catch (error) {
      throw error;
    }
  }

  async create(commentData) {
    try {
      const commentId = commentData.commentId || uuidv4();
      const now = new Date().toISOString();
      const createdAtCommentId = `${now}#${commentId}`;

      const item = {
        postId: commentData.postId,
        createdAtCommentId,
        commentId,
        authorId: commentData.authorId,
        content: commentData.content,
        createdAt: now,
        updatedAt: now,
      };

      await docClient.send(new PutCommand({
        TableName: TABLES.COMMENTS,
        Item: item,
      }));

      return item;
    } catch (error) {
      throw error;
    }
  }

  async delete(postId, createdAtCommentId) {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.COMMENTS,
        Key: {
          postId,
          createdAtCommentId,
        },
      }));
      return true;
    } catch (error) {
      throw error;
    }
  }

  async countByPostId(postId) {
    try {
      // Use KeyConditionExpression to count without fetching all items
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.COMMENTS,
        KeyConditionExpression: 'postId = :postId',
        ExpressionAttributeValues: {
          ':postId': postId,
        },
        Select: 'COUNT',
      }));
      return result.Count || 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CommentRepository;
