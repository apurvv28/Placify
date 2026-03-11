const express = require('express');
const { getMessages, sendMessage, markAsSeen, toggleReaction, clearChat } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:userId', protect, getMessages);
router.post('/send/:receiverId', protect, sendMessage);
router.patch('/seen/:senderId', protect, markAsSeen);
router.patch('/react/:messageId', protect, toggleReaction);
router.delete('/clear/:otherUserId', protect, clearChat);

module.exports = router;
