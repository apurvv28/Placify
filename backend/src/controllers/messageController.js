const Message = require('../models/Message');
const User = require('../models/User');
const { getReceiverSocketId, getIO } = require('../socket');

// Fetch full conversation between logged-in user and the selected user
exports.getMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const { userId: otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      deletedBy: { $ne: userId } // Exclude messages that this user cleared
    }).sort({ createdAt: 1 });

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

    // Check if receiver has blocked sender
    const receiver = await User.findById(receiverId);
    if (receiver && receiver.blockedUsers.includes(senderId)) {
      return res.status(403).json({ message: 'You have been blocked by this user' });
    }

    // Check if sender has blocked receiver
    const sender = await User.findById(senderId);
    if (sender && sender.blockedUsers.includes(receiverId)) {
      return res.status(403).json({ message: 'You have blocked this user. Unblock them to send messages' });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
    });

    await newMessage.save();

    // Emit via Socket.IO to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      const io = getIO();
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all messages from that sender as seen
exports.markAsSeen = async (req, res) => {
  try {
    const receiverId = req.userId;
    const { senderId } = req.params;

    await Message.updateMany(
      { senderId, receiverId, seen: false },
      { $set: { seen: true } }
    );

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

// Toggle a reaction on a message
exports.toggleReaction = async (req, res) => {
  try {
    const userId = req.userId;
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Check if user already reacted with this emoji
    const existingIndex = message.reactions.findIndex(r => r.userId.toString() === userId.toString() && r.emoji === emoji);

    if (existingIndex > -1) {
      // Remove reaction
      message.reactions.splice(existingIndex, 1);
    } else {
      // Add or update reaction (WhatsApp allows one emoji per user usually, or multiple?)
      // We'll allow one emoji per user for now.
      const userReactIndex = message.reactions.findIndex(r => r.userId.toString() === userId.toString());
      if (userReactIndex > -1) {
        message.reactions[userReactIndex].emoji = emoji;
      } else {
        message.reactions.push({ userId, emoji });
      }
    }

    await message.save();

    // Notify other user via socket
    const otherUserId = message.senderId.toString() === userId.toString() ? message.receiverId : message.senderId;
    const otherSocketId = getReceiverSocketId(otherUserId);
    if (otherSocketId) {
      getIO().to(otherSocketId).emit('messageReaction', { messageId, reactions: message.reactions });
    }

    res.status(200).json(message.reactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear all messages in a conversation for the current user
exports.clearChat = async (req, res) => {
  try {
    const userId = req.userId;
    const { otherUserId } = req.params;

    await Message.updateMany(
      {
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      { $addToSet: { deletedBy: userId } }
    );

    res.status(200).json({ message: 'Chat cleared for you' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
