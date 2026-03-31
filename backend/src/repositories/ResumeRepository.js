const { v4: uuidv4 } = require('uuid');
const { docClient, TABLES } = require('../config/dynamodb');
const { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

class ResumeRepository {
  async findById(resumeId) {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.RESUMES,
        Key: { resumeId },
      }));
      return result.Item || null;
    } catch (error) {
      throw error;
    }
  }

  async findByUserId(userId, limit = 50, lastKey = null) {
    try {
      const params = {
        TableName: TABLES.RESUMES,
        IndexName: 'userId-createdAt-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
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
      if (error?.name === 'ResourceNotFoundException') {
        return { items: [], lastKey: undefined };
      }
      throw error;
    }
  }

  async findByHasFile(hasFile = '1', limit = 50, lastKey = null) {
    try {
      const params = {
        TableName: TABLES.RESUMES,
        IndexName: 'hasFile-createdAt-index',
        KeyConditionExpression: 'hasFile = :hasFile',
        ExpressionAttributeValues: {
          ':hasFile': hasFile,
        },
        ScanIndexForward: false,
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
      if (error?.name === 'ResourceNotFoundException') {
        return { items: [], lastKey: undefined };
      }
      throw error;
    }
  }

  async create(resumeData) {
    try {
      const resumeId = resumeData.resumeId || uuidv4();
      const now = new Date().toISOString();

      const item = {
        resumeId,
        userId: resumeData.userId,
        template: resumeData.template || 'Modern',
        professionalSummary: resumeData.professionalSummary || '',
        personalInfo: resumeData.personalInfo || {},
        languages: resumeData.languages || [],
        experience: resumeData.experience || [],
        projects: resumeData.projects || [],
        education: resumeData.education || [],
        skills: resumeData.skills || [],
        name: resumeData.name || null,
        summary: resumeData.summary || null,
        company: resumeData.company || null,
        ctc: resumeData.ctc || null,
        isInternship: resumeData.isInternship || false,
        year: resumeData.year || null,
        stipend: resumeData.stipend || null,
        fileUrl: resumeData.fileUrl || null,
        hasFile: resumeData.fileUrl ? '1' : '0',
        createdAt: resumeData.createdAt || now,
        updatedAt: resumeData.updatedAt || now,
        views: resumeData.views || 0,
        likes: resumeData.likes || [],
        likeCount: resumeData.likeCount || 0,
        comments: resumeData.comments || [],
        commentCount: resumeData.commentCount || 0,
      };

      await docClient.send(new PutCommand({
        TableName: TABLES.RESUMES,
        Item: item,
      }));

      return item;
    } catch (error) {
      throw error;
    }
  }

  async update(resumeId, updateData) {
    try {
      const now = new Date().toISOString();
      const updateFields = [];
      const expressionAttributeValues = {
        ':updatedAt': now,
      };
      let counter = 0;

      for (const [key, value] of Object.entries(updateData)) {
        if (key !== 'resumeId') {
          counter++;
          const placeholder = `:val${counter}`;
          updateFields.push(`${key} = ${placeholder}`);
          expressionAttributeValues[placeholder] = value;
        }
      }

      if (updateFields.length === 0) {
        return await this.findById(resumeId);
      }

      // Update hasFile based on fileUrl if fileUrl is being updated
      if (updateData.fileUrl !== undefined) {
        counter++;
        const placeholder = `:hasFile`;
        updateFields.push(`hasFile = ${placeholder}`);
        expressionAttributeValues[placeholder] = updateData.fileUrl ? '1' : '0';
      }

      updateFields.push('updatedAt = :updatedAt');

      const result = await docClient.send(new UpdateCommand({
        TableName: TABLES.RESUMES,
        Key: { resumeId },
        UpdateExpression: `SET ${updateFields.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      }));

      return result.Attributes;
    } catch (error) {
      throw error;
    }
  }

  async delete(resumeId) {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.RESUMES,
        Key: { resumeId },
      }));
      return true;
    } catch (error) {
      throw error;
    }
  }

  async incrementViews(resumeId) {
    try {
      const result = await docClient.send(new UpdateCommand({
        TableName: TABLES.RESUMES,
        Key: { resumeId },
        UpdateExpression: 'SET views = if_not_exists(views, :zero) + :inc, updatedAt = :now',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':inc': 1,
          ':now': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      }));
      return result.Attributes;
    } catch (error) {
      throw error;
    }
  }

  async toggleLike(resumeId, userId) {
    try {
      const resume = await this.findById(resumeId);
      if (!resume) throw new Error('Resume not found');
      const likes = resume.likes || [];
      const likeIndex = likes.indexOf(userId);
      const isLiking = likeIndex === -1;
      if (isLiking) {
        likes.push(userId);
      } else {
        likes.splice(likeIndex, 1);
      }
      const result = await docClient.send(new UpdateCommand({
        TableName: TABLES.RESUMES,
        Key: { resumeId },
        UpdateExpression: 'SET likes = :likes, likeCount = :count, updatedAt = :now',
        ExpressionAttributeValues: {
          ':likes': likes,
          ':count': likes.length,
          ':now': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      }));
      return { ...result.Attributes, isLiking };
    } catch (error) {
      throw error;
    }
  }

  async addComment(resumeId, userId, text) {
    try {
      const resume = await this.findById(resumeId);
      if (!resume) throw new Error('Resume not found');
      const commentId = `${userId}-${Date.now()}`;
      const comment = {
        id: commentId,
        userId,
        text,
        createdAt: new Date().toISOString(),
      };
      const comments = resume.comments || [];
      comments.push(comment);
      const result = await docClient.send(new UpdateCommand({
        TableName: TABLES.RESUMES,
        Key: { resumeId },
        UpdateExpression: 'SET comments = :comments, commentCount = :count, updatedAt = :now',
        ExpressionAttributeValues: {
          ':comments': comments,
          ':count': comments.length,
          ':now': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      }));
      return result.Attributes;
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(resumeId, commentId) {
    try {
      const resume = await this.findById(resumeId);
      if (!resume) throw new Error('Resume not found');
      const comments = (resume.comments || []).filter(c => c.id !== commentId);
      const result = await docClient.send(new UpdateCommand({
        TableName: TABLES.RESUMES,
        Key: { resumeId },
        UpdateExpression: 'SET comments = :comments, commentCount = :count, updatedAt = :now',
        ExpressionAttributeValues: {
          ':comments': comments,
          ':count': comments.length,
          ':now': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW',
      }));
      return result.Attributes;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ResumeRepository;
