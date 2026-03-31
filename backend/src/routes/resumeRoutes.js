const express = require('express');
const { getResume, saveResume, clearResume, createResume, getResumes } = require('../controllers/resumeController');
const protect = require('../middlewares/authMiddleware');
const multer = require('multer');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, cb) {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test((file.originalname || '').toLowerCase());
    const mimetype = filetypes.test((file.mimetype || '').toLowerCase());
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC/DOCX files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Resume Builder Routes
router.get('/', protect, getResume);
router.post('/', protect, saveResume);
router.delete('/', protect, clearResume);

// Placed Student Resume Upload Routes
router.get('/all', getResumes);
router.post('/upload', protect, upload.single('file'), createResume);

module.exports = router;
