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
}

module.exports = ResumeRepository;
