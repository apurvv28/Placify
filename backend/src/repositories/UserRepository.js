const { v4: uuidv4 } = require('uuid');
const { docClient, TABLES } = require('../config/dynamodb');
const { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

class UserRepository {
  async findAll(limit = null) {
    try {
      const items = [];
      let lastEvaluatedKey;

      do {
        const params = {
          TableName: TABLES.USERS,
          ExclusiveStartKey: lastEvaluatedKey,
        };

        // Optional cap for callers that want a bounded result set
        if (limit && limit > 0) {
          params.Limit = Math.max(1, limit - items.length);
        }

        const result = await docClient.send(new ScanCommand(params));
        items.push(...(result.Items || []));
        lastEvaluatedKey = result.LastEvaluatedKey;

        if (limit && items.length >= limit) {
          return items.slice(0, limit);
        }
      } while (lastEvaluatedKey);

      return items;
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email.toLowerCase(),
        },
      }));
      return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async findById(userId) {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.USERS,
        Key: { userId },
      }));
      return result.Item || null;
    } catch (error) {
      throw error;
    }
  }

  async create(userData) {
    try {
      const userId = userData.userId || uuidv4();
      const now = new Date().toISOString();

      const item = {
        userId,
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: userData.password,
        profileType: userData.profileType || null,
        workingRole: userData.workingRole || null,
        studentStatus: userData.studentStatus || null,
        onboardingCompleted: userData.onboardingCompleted || false,
        linkedinUrl: userData.linkedinUrl || null,
        lastSeen: userData.lastSeen || now,
        isOnline: userData.isOnline || false,
        avatar: userData.avatar || null,
        blockedUsers: userData.blockedUsers || [],
        createdAt: userData.createdAt || now,
        updatedAt: userData.updatedAt || now,
      };

      await docClient.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: item,
      }));

      return item;
    } catch (error) {
      throw error;
    }
  }

  async update(userId, updateData) {
    try {
      const now = new Date().toISOString();
      const updateFields = [];
      const expressionAttributeValues = {
        ':updatedAt': now,
      };
      const expressionAttributeNames = {};
      let counter = 0;

      for (const [key, value] of Object.entries(updateData)) {
        if (key !== 'userId') {
          counter++;
          const nameKey = `#attr${counter}`;
          const placeholder = `:val${counter}`;
          expressionAttributeNames[nameKey] = key;
          updateFields.push(`${nameKey} = ${placeholder}`);
          expressionAttributeValues[placeholder] = value;
        }
      }

      if (updateFields.length === 0) {
        return await this.findById(userId);
      }

      updateFields.push('updatedAt = :updatedAt');

      const result = await docClient.send(new UpdateCommand({
        TableName: TABLES.USERS,
        Key: { userId },
        UpdateExpression: `SET ${updateFields.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      }));

      return result.Attributes;
    } catch (error) {
      throw error;
    }
  }

  async delete(userId) {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.USERS,
        Key: { userId },
      }));
      return true;
    } catch (error) {
      throw error;
    }
  }

  async toggleBlockUser(userId, targetUserId) {
    try {
      const user = await this.findById(userId);
      if (!user) throw new Error('User not found');

      const isBlocked = user.blockedUsers.includes(targetUserId);
      const updatedBlockedUsers = isBlocked
        ? user.blockedUsers.filter(uid => uid !== targetUserId)
        : [...(user.blockedUsers || []), targetUserId];

      return await this.update(userId, { blockedUsers: updatedBlockedUsers });
    } catch (error) {
      throw error;
    }
  }

  async getBlockedUsers(userId) {
    try {
      const user = await this.findById(userId);
      return user?.blockedUsers || [];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserRepository;
