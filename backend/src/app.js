const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const atsRoutes = require('./routes/atsRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const messageRoutes = require('./routes/messageRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Auth backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/resume', resumeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
