const { v4: uuidv4 } = require('uuid');
const { docClient, TABLES } = require('../config/dynamodb');
const { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

class PostRepository {
  async findById(postId) {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.POSTS,
        Key: { postId },
      }));
      return result.Item || null;
    } catch (error) {
      throw error;
    }
  }

  async findByCategory(category, limit = 20, lastKey = null) {
    try {
      const params = {
        TableName: TABLES.POSTS,
        IndexName: 'category-createdAt-index',
        KeyConditionExpression: 'category = :category',
        ExpressionAttributeValues: {
          ':category': category,
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

  async findByAuthor(authorId, limit = 20, lastKey = null) {
    try {
      const params = {
        TableName: TABLES.POSTS,
        IndexName: 'authorId-createdAt-index',
        KeyConditionExpression: 'authorId = :authorId',
        ExpressionAttributeValues: {
          ':authorId': authorId,
        },
        ScanIndexForward: false, // Descending
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

  async findAll(limit = 20, lastKey = null) {
    try {
      const params = {
        TableName: TABLES.POSTS,
        Limit: limit,
      };

      if (lastKey) {
        params.ExclusiveStartKey = lastKey;
      }

      const result = await docClient.send(new ScanCommand(params));
      return {
        items: result.Items || [],
        lastKey: result.LastEvaluatedKey,
      };
    } catch (error) {
      throw error;
    }
  }

  async create(postData) {
    try {
      const postId = postData.postId || uuidv4();
      const now = new Date().toISOString();

      const item = {
        postId,
        authorId: postData.authorId,
        title: postData.title,
        content: postData.content,
        category: postData.category || 'General',
        likes: postData.likes || [],
        likesCount: (postData.likes || []).length,
        createdAt: postData.createdAt || now,
        updatedAt: postData.updatedAt || now,
      };

      await docClient.send(new PutCommand({
        TableName: TABLES.POSTS,
        Item: item,
      }));

      return item;
    } catch (error) {
      throw error;
    }
  }

  async update(postId, updateData) {
    try {
      const now = new Date().toISOString();
      const updateFields = [];
      const expressionAttributeValues = {
        ':updatedAt': now,
      };
      let counter = 0;

      for (const [key, value] of Object.entries(updateData)) {
        if (key !== 'postId') {
          counter++;
          const placeholder = `:val${counter}`;
          updateFields.push(`${key} = ${placeholder}`);
          expressionAttributeValues[placeholder] = value;
        }
      }

      if (updateFields.length === 0) {
        return await this.findById(postId);
      }

      updateFields.push('updatedAt = :updatedAt');

      const result = await docClient.send(new UpdateCommand({
        TableName: TABLES.POSTS,
        Key: { postId },
        UpdateExpression: `SET ${updateFields.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      }));

      return result.Attributes;
    } catch (error) {
      throw error;
    }
  }

  async delete(postId) {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.POSTS,
        Key: { postId },
      }));
      return true;
    } catch (error) {
      throw error;
    }
  }

  async toggleLike(postId, userId) {
    try {
      const post = await this.findById(postId);
      if (!post) throw new Error('Post not found');

      const isLiked = post.likes.includes(userId);
      const updatedLikes = isLiked
        ? post.likes.filter(uid => uid !== userId)
        : [...(post.likes || []), userId];

      return await this.update(postId, {
        likes: updatedLikes,
        likesCount: updatedLikes.length,
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PostRepository;
