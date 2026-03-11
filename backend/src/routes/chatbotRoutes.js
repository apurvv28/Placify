const express = require('express');
const { generateChatResponse } = require('../controllers/chatbotController');

const router = express.Router();

// Route: POST /api/chatbot
router.post('/', generateChatResponse);

module.exports = router;
