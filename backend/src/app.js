const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const path = require('path');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Auth backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/resumes', resumeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
