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
    const mimeType = String(file.mimetype || '').toLowerCase();
    const originalName = String(file.originalname || '').toLowerCase();
    const fieldName = String(file.fieldname || '').toLowerCase();

    // This endpoint only accepts the interview recorder payload under "recording".
    // Browsers can send inconsistent mime/filename metadata (e.g. empty type or "blob").
    // Accept the expected field while still keeping a media-oriented heuristic.
    const isExpectedRecordingField = fieldName === 'recording';
    const hasKnownVideoExtension = /\.(webm|mp4|mov|m4v|ogg|mkv)$/i.test(originalName);
    const isVideoMime = mimeType.startsWith('video/');
    const isBrowserGenericMime = mimeType === 'application/octet-stream';
    const isRecorderMediaMime = /(audio|video)\/(webm|mp4|quicktime|ogg|x-matroska)/i.test(mimeType);
    const hasUnknownBrowserBlobMetadata = mimeType === '' || originalName === '' || originalName === 'blob';

    if (isExpectedRecordingField && (isVideoMime || isRecorderMediaMime || isBrowserGenericMime || hasKnownVideoExtension || hasUnknownBrowserBlobMetadata)) {
      return cb(null, true);
    }

    if (isVideoMime || isRecorderMediaMime || (isBrowserGenericMime && hasKnownVideoExtension) || hasKnownVideoExtension) {
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
