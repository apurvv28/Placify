const express = require('express');
const {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLike,
  getComments,
  addComment,
  deleteComment,
} = require('../controllers/postController');
const protect = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.get('/:id', protect, getPostById);
router.delete('/:id', protect, deletePost);

router.put('/:id/like', protect, toggleLike);

router.get('/:id/comments', protect, getComments);
router.post('/:id/comments', protect, addComment);
router.delete('/:postId/comments/:commentId', protect, deleteComment);

module.exports = router;
