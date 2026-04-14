const express = require('express');
const { generateChatResponse } = require('../controllers/chatbotController');
const { chatbotRateLimit } = require('../middlewares/aiRateLimitMiddleware');

const router = express.Router();

// Route: POST /api/chatbot
router.post('/', chatbotRateLimit, generateChatResponse);

module.exports = router;
