const express = require('express');
const {
	register,
	login,
	requestPasswordReset,
	verifyPasswordResetOtp,
	resetPassword,
	getCurrentUser,
	saveOnboarding,
	getAllUsers,
	updateProfile,
} = require('../controllers/authController');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password/request', requestPasswordReset);
router.post('/forgot-password/verify', verifyPasswordResetOtp);
router.post('/forgot-password/reset', resetPassword);
router.get('/me', protect, getCurrentUser);
router.put('/onboarding', protect, saveOnboarding);
router.get('/users', protect, getAllUsers);
router.put('/profile', protect, updateProfile);

module.exports = router;
