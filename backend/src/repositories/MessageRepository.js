const { v4: uuidv4 } = require('uuid');
const { docClient, TABLES } = require('../config/dynamodb');
const { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

class MessageRepository {
  // Helper to generate conversation ID consistently
  _generateConversationId(userId1, userId2) {
    const [a, b] = [userId1, userId2].sort();
    return `${a}#${b}`;
  }

  async findByConversation(senderId, receiverId, limit = 50, lastKey = null) {
    try {
      const conversationId = this._generateConversationId(senderId, receiverId);

      const params = {
        TableName: TABLES.MESSAGES,
        KeyConditionExpression: 'conversationId = :conversationId',
        ExpressionAttributeValues: {
          ':conversationId': conversationId,
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

  async findById(conversationId, createdAtMessageId) {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.MESSAGES,
        Key: {
          conversationId,
          createdAtMessageId,
        },
      }));
      return result.Item || null;
    } catch (error) {
      throw error;
    }
  }

  async findUnreadByReceiver(receiverId, limit = 50, lastKey = null) {
    try {
      const params = {
        TableName: TABLES.MESSAGES,
        IndexName: 'receiverId-seenCreatedAt-index',
        KeyConditionExpression: 'receiverId = :receiverId AND begins_with(seenCreatedAt, :unseenPrefix)',
        ExpressionAttributeValues: {
          ':receiverId': receiverId,
          ':unseenPrefix': '0#', // Messages where seen = false
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

  async create(messageData) {
    try {
      const messageId = messageData.messageId || uuidv4();
      const now = new Date().toISOString();
      const conversationId = this._generateConversationId(messageData.senderId, messageData.receiverId);
      const createdAtMessageId = `${now}#${messageId}`;
      const seen = messageData.seen || false;
      const seenCreatedAt = `${seen ? '1' : '0'}#${now}`;

      const item = {
        conversationId,
        createdAtMessageId,
        messageId,
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        text: messageData.text || '',
        seen,
        seenCreatedAt,
        reactions: messageData.reactions || [],
        deletedBy: messageData.deletedBy || [],
        createdAt: now,
        updatedAt: now,
      };

      await docClient.send(new PutCommand({
        TableName: TABLES.MESSAGES,
        Item: item,
      }));

      return item;
    } catch (error) {
      throw error;
    }
  }

  async update(conversationId, createdAtMessageId, updateData) {
    try {
      const now = new Date().toISOString();
      const updateFields = [];
      const expressionAttributeValues = {
        ':updatedAt': now,
      };
      let counter = 0;

      for (const [key, value] of Object.entries(updateData)) {
        if (key !== 'conversationId' && key !== 'createdAtMessageId') {
          counter++;
          const placeholder = `:val${counter}`;
          updateFields.push(`${key} = ${placeholder}`);
          expressionAttributeValues[placeholder] = value;
        }
      }

      if (updateFields.length === 0) {
        return await this.findById(conversationId, createdAtMessageId);
      }

      updateFields.push('updatedAt = :updatedAt');

      // If updating 'seen' status, also update seenCreatedAt
      if (updateData.seen !== undefined) {
        const seenValue = updateData.seen ? '1' : '0';
        const createdAt = createdAtMessageId.split('#')[0];
        expressionAttributeValues[':seenCreatedAt'] = `${seenValue}#${createdAt}`;
        updateFields.push('seenCreatedAt = :seenCreatedAt');
      }

      const result = await docClient.send(new UpdateCommand({
        TableName: TABLES.MESSAGES,
        Key: {
          conversationId,
          createdAtMessageId,
        },
        UpdateExpression: `SET ${updateFields.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      }));

      return result.Attributes;
    } catch (error) {
      throw error;
    }
  }

  async delete(conversationId, createdAtMessageId) {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.MESSAGES,
        Key: {
          conversationId,
          createdAtMessageId,
        },
      }));
      return true;
    } catch (error) {
      throw error;
    }
  }

  async markAsRead(conversationId, createdAtMessageId) {
    try {
      return await this.update(conversationId, createdAtMessageId, { seen: true });
    } catch (error) {
      throw error;
    }
  }

  async addReaction(conversationId, createdAtMessageId, userId, emoji) {
    try {
      const message = await this.findById(conversationId, createdAtMessageId);
      if (!message) throw new Error('Message not found');

      // Check if user already reacted
      const existingReactionIndex = message.reactions.findIndex(r => r.userId === userId);
      let updatedReactions = [...(message.reactions || [])];

      if (existingReactionIndex !== -1) {
        // Update existing reaction
        updatedReactions[existingReactionIndex] = { userId, emoji };
      } else {
        // Add new reaction
        updatedReactions.push({ userId, emoji });
      }

      return await this.update(conversationId, createdAtMessageId, { reactions: updatedReactions });
    } catch (error) {
      throw error;
    }
  }

  async removeReaction(conversationId, createdAtMessageId, userId) {
    try {
      const message = await this.findById(conversationId, createdAtMessageId);
      if (!message) throw new Error('Message not found');

      const updatedReactions = (message.reactions || []).filter(r => r.userId !== userId);
      return await this.update(conversationId, createdAtMessageId, { reactions: updatedReactions });
    } catch (error) {
      throw error;
    }
  }

  async markDeletedBy(conversationId, createdAtMessageId, userId) {
    try {
      const message = await this.findById(conversationId, createdAtMessageId);
      if (!message) throw new Error('Message not found');

      const deletedBy = [...(message.deletedBy || [])];
      if (!deletedBy.includes(userId)) {
        deletedBy.push(userId);
      }

      return await this.update(conversationId, createdAtMessageId, { deletedBy });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MessageRepository;
