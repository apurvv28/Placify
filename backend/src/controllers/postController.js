const PostRepository = require('../repositories/PostRepository');
const CommentRepository = require('../repositories/CommentRepository');
const UserRepository = require('../repositories/UserRepository');

const postRepo = new PostRepository();
const commentRepo = new CommentRepository();
const userRepo = new UserRepository();

const formatPost = (post, userId, author) => ({
  id: post.postId,
  title: post.title,
  content: post.content,
  category: post.category,
  author: {
    id: author?.userId || post.authorId,
    name: author?.name || 'Unknown',
    email: author?.email || 'unknown@unknown.com',
  },
  likesCount: post.likes.length,
  liked: post.likes.some((uid) => uid === userId),
  commentsCount: post._commentsCount ?? 0,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

/* ───── CRUD ───── */

// GET /api/posts?category=&page=&limit=
const getPosts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    let result;
    if (category && category !== 'All Posts') {
      result = await postRepo.findByCategory(category, limitNum);
    } else {
      result = await postRepo.findAll(limitNum);
    }

    const posts = result.items;
    
    // Fetch authors and comment counts for all posts
    const postsWithData = await Promise.all(
      posts.map(async (post) => {
        const [author, commentsCount] = await Promise.all([
          userRepo.findById(post.authorId),
          commentRepo.countByPostId(post.postId),
        ]);
        post._commentsCount = commentsCount;
        return { post, author };
      })
    );

    const formatted = postsWithData.map(({ post, author }) => formatPost(post, req.userId, author));

    return res.status(200).json({ posts: formatted, total: posts.length, page: pageNum, limit: limitNum });
  } catch (err) {
    return next(err);
  }
};

// GET /api/posts/:id
const getPostById = async (req, res, next) => {
  try {
    const post = await postRepo.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const author = await userRepo.findById(post.authorId);
    const commentsCount = await commentRepo.countByPostId(post.postId);
    post._commentsCount = commentsCount;

    return res.status(200).json({ post: formatPost(post, req.userId, author) });
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

    const post = await postRepo.create({
      authorId: req.userId,
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
    });

    const author = await userRepo.findById(post.authorId);
    post._commentsCount = 0;

    return res.status(201).json({ message: 'Post created', post: formatPost(post, req.userId, author) });
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await postRepo.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    // Note: DynamoDB doesn't support batch delete by GSI
    // For production, use DynamoDB streams or scheduled cleanup
    await postRepo.delete(post.postId);

    return res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    return next(err);
  }
};

/* ───── LIKES ───── */

// PUT /api/posts/:id/like
const toggleLike = async (req, res, next) => {
  try {
    const post = await postRepo.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const updatedPost = await postRepo.toggleLike(post.postId, req.userId);

    const author = await userRepo.findById(updatedPost.authorId);
    const commentsCount = await commentRepo.countByPostId(updatedPost.postId);
    updatedPost._commentsCount = commentsCount;

    return res.status(200).json({ post: formatPost(updatedPost, req.userId, author) });
  } catch (err) {
    return next(err);
  }
};

/* ───── COMMENTS ───── */

// GET /api/posts/:id/comments
const getComments = async (req, res, next) => {
  try {
    const { items: comments } = await commentRepo.findByPostId(req.params.id);

    const formatted = await Promise.all(comments.map(async (c) => {
      const author = await userRepo.findById(c.authorId);
      return {
        id: c.commentId,
        content: c.content,
        author: { id: c.authorId, name: author?.name || 'Unknown', email: author?.email || 'unknown@unknown.com' },
        createdAt: c.createdAt,
      };
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

    const post = await postRepo.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await commentRepo.create({
      postId: post.postId,
      authorId: req.userId,
      content: content.trim(),
    });

    const author = await userRepo.findById(comment.authorId);

    return res.status(201).json({
      message: 'Comment added',
      comment: {
        id: comment.commentId,
        content: comment.content,
        author: { id: comment.authorId, name: author?.name || 'Unknown', email: author?.email || 'unknown@unknown.com' },
        createdAt: comment.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// DELETE /api/posts/:postId/comments/:commentId
const deleteComment = async (req, res, next) => {
  try {
    const { items } = await commentRepo.findByPostId(req.params.postId, 500);
    const comment = items.find((c) => c.commentId === req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.authorId !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    await commentRepo.delete(req.params.postId, comment.createdAtCommentId);
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
