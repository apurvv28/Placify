const express = require('express');
const { getAllUsers, blockUser, unblockUser, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getAllUsers);
router.get('/profile', protect, getUserProfile);
router.get('/profile/:userId', protect, getUserProfile);
router.patch('/block/:userId', protect, blockUser);
router.patch('/unblock/:userId', protect, unblockUser);


module.exports = router;
