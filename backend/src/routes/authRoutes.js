const express = require('express');
const { register, login, getCurrentUser, saveOnboarding, getAllUsers, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.put('/onboarding', protect, saveOnboarding);
router.get('/users', protect, getAllUsers);
router.put('/profile', protect, updateProfile);

module.exports = router;
