const { Server } = require('socket.io');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

let io;
const userSocketMap = {}; // userId -> socketId mapping

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : ['http://localhost:3000', 'https://placify-ai.vercel.app'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const secret = process.env.JWT_SECRET || 'change_me';
      const decoded = jwt.verify(token, secret);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    userSocketMap[userId] = socket.id;

    console.log(`User connected: ${userId} with socketId: ${socket.id}`);

    // Update user status in DB
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true });
    } catch (e) {
      console.error('Error updating user online status:', e);
    }

    // Broadcast online users
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      delete userSocketMap[userId];
      
      try {
        await User.findByIdAndUpdate(userId, { 
          isOnline: false, 
          lastSeen: new Date() 
        });
      } catch (e) {
        console.error('Error updating user offline status:', e);
      }

      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });

    // Handle typing events (WhatsApp style)
    socket.on('typing', ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { senderId: userId });
      }
    });

    socket.on('stopTyping', ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('stopTyping', { senderId: userId });
      }
    });
  });
};

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getReceiverSocketId, getIO };
