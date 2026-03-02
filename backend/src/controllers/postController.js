const Post = require('../models/Post');
const Comment = require('../models/Comment');

/* ───── helpers ───── */
const populateAuthor = { path: 'author', select: 'name email' };

const formatPost = (post, userId) => ({
  id: post._id,
  title: post.title,
  content: post.content,
  category: post.category,
  author: {
    id: post.author._id,
    name: post.author.name,
    email: post.author.email,
  },
  likesCount: post.likes.length,
  liked: post.likes.some((uid) => uid.toString() === userId),
  commentsCount: post._commentsCount ?? 0,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

/* ───── CRUD ───── */

// GET /api/posts?category=&page=&limit=
const getPosts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category && category !== 'All Posts') filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate(populateAuthor)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Post.countDocuments(filter),
    ]);

    // Gather comment counts for all returned posts in one query
    const postIds = posts.map((p) => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    commentCounts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const formatted = posts.map((p) => {
      p._commentsCount = countMap[p._id.toString()] || 0;
      return formatPost(p, req.userId);
    });

    return res.status(200).json({ posts: formatted, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    return next(err);
  }
};

// GET /api/posts/:id
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(populateAuthor);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const commentsCount = await Comment.countDocuments({ post: post._id });
    post._commentsCount = commentsCount;

    return res.status(200).json({ post: formatPost(post, req.userId) });
  } catch (err) {
    return next(err);
  }
};

// POST /api/posts
const createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await Post.create({
      author: req.userId,
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
    });

    const populated = await post.populate(populateAuthor);
    populated._commentsCount = 0;

    return res.status(201).json({ message: 'Post created', post: formatPost(populated, req.userId) });
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    return res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    return next(err);
  }
};

/* ───── LIKES ───── */

// PUT /api/posts/:id/like
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const idx = post.likes.indexOf(req.userId);
    if (idx === -1) {
      post.likes.push(req.userId);
    } else {
      post.likes.splice(idx, 1);
    }

    await post.save();
    await post.populate(populateAuthor);

    const commentsCount = await Comment.countDocuments({ post: post._id });
    post._commentsCount = commentsCount;

    return res.status(200).json({ post: formatPost(post, req.userId) });
  } catch (err) {
    return next(err);
  }
};

/* ───── COMMENTS ───── */

// GET /api/posts/:id/comments
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate({ path: 'author', select: 'name email' })
      .sort({ createdAt: -1 });

    const formatted = comments.map((c) => ({
      id: c._id,
      content: c.content,
      author: { id: c.author._id, name: c.author.name, email: c.author.email },
      createdAt: c.createdAt,
    }));

    return res.status(200).json({ comments: formatted });
  } catch (err) {
    return next(err);
  }
};

// POST /api/posts/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      post: post._id,
      author: req.userId,
      content: content.trim(),
    });

    const populated = await comment.populate({ path: 'author', select: 'name email' });

    return res.status(201).json({
      message: 'Comment added',
      comment: {
        id: populated._id,
        content: populated.content,
        author: { id: populated.author._id, name: populated.author.name, email: populated.author.email },
        createdAt: populated.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/posts/:postId/comments/:commentId
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    await comment.deleteOne();
    return res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLike,
  getComments,
  addComment,
  deleteComment,
};
