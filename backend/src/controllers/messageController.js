const MessageRepository = require('../repositories/MessageRepository');
const UserRepository = require('../repositories/UserRepository');
const { getReceiverSocketId, getIO } = require('../socket');

const messageRepo = new MessageRepository();
const userRepo = new UserRepository();
const buildClientMessage = (m) => ({
  _id: `${m.conversationId}__${m.createdAtMessageId}`,
  conversationId: m.conversationId,
  createdAtMessageId: m.createdAtMessageId,
  senderId: m.senderId,
  receiverId: m.receiverId,
  text: m.text,
  seen: m.seen,
  reactions: m.reactions || [],
  deletedBy: m.deletedBy || [],
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
});

exports.getMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const { userId: otherUserId } = req.params;

    const { items } = await messageRepo.findByConversation(userId, otherUserId, 500);
    const messages = items
      .filter((m) => !(m.deletedBy || []).includes(userId))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(buildClientMessage);

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Save message to DB and emit via Socket.IO
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { receiverId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const receiver = await userRepo.findById(receiverId);
    if (receiver && receiver.blockedUsers.includes(senderId)) {
      return res.status(403).json({ message: 'You have been blocked by this user' });
    }

    const sender = await userRepo.findById(senderId);
    if (sender && sender.blockedUsers.includes(receiverId)) {
      return res.status(403).json({ message: 'You have blocked this user. Unblock them to send messages' });
    }

    const newMessage = await messageRepo.create({
      senderId,
      receiverId,
      text,
    });

    // Emit via Socket.IO to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      const io = getIO();
      io.to(receiverSocketId).emit('newMessage', buildClientMessage(newMessage));
    }

    res.status(201).json(buildClientMessage(newMessage));
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markAsSeen = async (req, res) => {
  try {
    const receiverId = req.userId;
    const { senderId } = req.params;

    const { items } = await messageRepo.findByConversation(receiverId, senderId, 500);
    const pending = items.filter((m) => m.senderId === senderId && m.receiverId === receiverId && !m.seen);
    await Promise.all(pending.map((m) => messageRepo.markAsRead(m.conversationId, m.createdAtMessageId)));

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      const io = getIO();
      io.to(senderSocketId).emit('messagesSeen', { seenBy: receiverId });
    }

    res.status(200).json({ message: 'Messages marked as seen' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleReaction = async (req, res) => {
  try {
    const userId = req.userId;
    const { messageId: opaqueId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    const [conversationId, createdAtMessageId] = opaqueId.split('__');
    if (!conversationId || !createdAtMessageId) {
      return res.status(400).json({ message: 'Invalid message id' });
    }

    const message = await messageRepo.findById(conversationId, createdAtMessageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const existing = (message.reactions || []).find((r) => r.userId === userId && r.emoji === emoji);

    if (existing) {
      await messageRepo.removeReaction(conversationId, createdAtMessageId, userId);
    } else {
      await messageRepo.addReaction(conversationId, createdAtMessageId, userId, emoji);
    }

    const updated = await messageRepo.findById(conversationId, createdAtMessageId);

    // Notify other user via socket
    const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
    const otherSocketId = getReceiverSocketId(otherUserId);
    if (otherSocketId) {
      getIO().to(otherSocketId).emit('messageReaction', { messageId: opaqueId, reactions: updated.reactions || [] });
    }

    res.status(200).json(updated.reactions || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.clearChat = async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.params;

    const { items } = await messageRepo.findByConversation(userId, otherUserId, 500);
    await Promise.all(items.map((m) => messageRepo.markDeletedBy(m.conversationId, m.createdAtMessageId, userId)));

    res.status(200).json({ message: 'Chat cleared for you' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
