const express = require('express');
const multer = require('multer');
const protect = require('../middlewares/authMiddleware');
const {
  getProgress,
  getDeck,
  startDeck,
  uploadResponse,
  getResponseResult,
  getDeckResults,
  getHeatmap,
  getLeaderboard,
  getHighlights,
  seedQuestions,
} = require('../controllers/interviewiqController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 80 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if ((file.mimetype || '').startsWith('video/')) {
      return cb(null, true);
    }
    return cb(new Error('Only video files are allowed.'));
  },
});

router.get('/progress', protect, getProgress);
router.get('/deck/:deckNumber', protect, getDeck);
router.post('/deck/:deckNumber/start', protect, startDeck);
router.post('/response/upload', protect, upload.single('recording'), uploadResponse);
router.get('/response/:responseId', protect, getResponseResult);
router.get('/deck/:deckNumber/results', protect, getDeckResults);
router.get('/heatmap', protect, getHeatmap);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/highlights', protect, getHighlights);
router.get('/questions/seed', protect, seedQuestions);

module.exports = router;
