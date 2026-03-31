const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const atsRoutes = require('./routes/atsRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const path = require('path');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const messageRoutes = require('./routes/messageRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const userRoutes = require('./routes/userRoutes');
const { isS3ResumeStorageEnabled, getResumeObject } = require('./config/s3');

const app = express();

const corsOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [
      'http://localhost:3000',
      'https://placify-ai.vercel.app',
      'https://placify-294zb9z4r-apurv-saktepars-projects.vercel.app',
    ];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/uploads/:filename', async (req, res, next) => {
  if (!isS3ResumeStorageEnabled()) return next();

  try {
    const file = await getResumeObject(req.params.filename);
    if (file.contentType) res.setHeader('Content-Type', file.contentType);
    if (typeof file.contentLength === 'number') {
      res.setHeader('Content-Length', String(file.contentLength));
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    file.body.on('error', next);
    file.body.pipe(res);
  } catch (error) {
    if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) {
      return next();
    }
    return next(error);
  }
});

if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.use('/uploads', express.static('/tmp/uploads'));
}
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/resumes', resumeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
