const express = require('express');
const { getResume, saveResume, clearResume } = require('../controllers/resumeController');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getResume);
router.post('/', protect, saveResume);
router.delete('/', protect, clearResume);

module.exports = router;
