import React, { useState, useEffect, useCallback } from 'react';

const API = \`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts\`;
const CATEGORIES = ['All Posts', 'Success Story', 'Resume', 'Interview Prep', 'Experiences', 'Internship', 'Study Group', 'General'];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

/* ─── Create Post Modal ─── */
function CreatePostModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError('Title and content are required'); return; }
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('placifyToken');
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), category }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to create post'); return; }
      onCreated(data.post);
      setTitle(''); setContent(''); setCategory('General');
      onClose();
    } catch {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-[#111114] border border-white/10 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">Create a Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter(c => c !== 'All Posts').map((c) => (
                <button key={c} type="button" onClick={() => setCategory(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${category === c ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="Give your post a title..."
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400/50" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} maxLength={5000} placeholder="Share your experience..."
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400/50 resize-none" />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white disabled:opacity-50">
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Comment Item ─── */
function CommentItem({ comment, currentUserId, onDelete }) {
  return (
    <div className="flex gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold shrink-0">
        {getInitial(comment.author.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{comment.author.name}</span>
          <span className="text-[10px] text-gray-500">{timeAgo(comment.createdAt)}</span>
          {comment.author.id === currentUserId && (
            <button type="button" onClick={() => onDelete(comment.id)} className="ml-auto text-[10px] text-red-400 hover:text-red-300">delete</button>
          )}
        </div>
        <p className="text-xs text-gray-300 mt-0.5">{comment.content}</p>
      </div>
    </div>
  );
}

/* ─── Post Card ─── */
function PostCard({ post, currentUserId, onLike, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.commentsCount);

  const token = localStorage.getItem('placifyToken');

  const fetchComments = useCallback(async () => {
    try {
      setLoadingComments(true);
      const res = await fetch(`${API}/${post.id}/comments`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) { setComments(data.comments); setLocalCommentsCount(data.comments.length); }
    } catch { /* silent */ } finally { setLoadingComments(false); }
  }, [post.id, token]);

  const toggleComments = () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) fetchComments();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API}/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();
      if (res.ok) { setComments((prev) => [data.comment, ...prev]); setLocalCommentsCount((c) => c + 1); setNewComment(''); }
    } catch { /* silent */ } finally { setSubmitting(false); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`${API}/${post.id}/comments/${commentId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { setComments((prev) => prev.filter((c) => c.id !== commentId)); setLocalCommentsCount((c) => c - 1); }
    } catch { /* silent */ }
  };

  const categoryColors = {
    'Success Story': 'bg-emerald-500/15 text-emerald-300',
    'Resume': 'bg-blue-500/15 text-blue-300',
    'Interview Prep': 'bg-amber-500/15 text-amber-300',
    'Experiences': 'bg-pink-500/15 text-pink-300',
    'Internship': 'bg-violet-500/15 text-violet-300',
    'Study Group': 'bg-cyan-500/15 text-cyan-300',
    'General': 'bg-white/10 text-gray-300',
  };

  return (
    <article className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold shrink-0">
          {getInitial(post.author.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{post.author.name}</span>
            <span className="text-xs text-gray-500">{timeAgo(post.createdAt)}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColors[post.category] || categoryColors['General']}`}>{post.category}</span>
            {post.author.id === currentUserId && (
              <button type="button" onClick={() => onDelete(post.id)} className="ml-auto text-[10px] text-red-400 hover:text-red-300">delete</button>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white mt-1">{post.title}</h3>
          <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{post.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <button type="button" onClick={() => onLike(post.id)} className={`flex items-center gap-1 transition-colors ${post.liked ? 'text-indigo-400' : 'hover:text-indigo-300'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
              {post.likesCount}
            </button>
            <button type="button" onClick={toggleComments} className="flex items-center gap-1 hover:text-indigo-300 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              {localCommentsCount} {localCommentsCount === 1 ? 'reply' : 'replies'}
            </button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-4 border-t border-white/10 pt-3">
              <form onSubmit={handleAddComment} className="flex gap-2 mb-3">
                <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..."
                  className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400/50" />
                <button type="submit" disabled={submitting || !newComment.trim()}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 disabled:opacity-40">
                  {submitting ? '...' : 'Reply'}
                </button>
              </form>
              {loadingComments ? (
                <p className="text-xs text-gray-500 text-center py-2">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-2">No comments yet. Be the first!</p>
              ) : (
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {comments.map((c) => (
                    <CommentItem key={c.id} comment={c} currentUserId={currentUserId} onDelete={handleDeleteComment} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */
export default function CommunitySection() {
  const [activeTab, setActiveTab] = useState('All Posts');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const token = localStorage.getItem('placifyToken');
  const user = JSON.parse(localStorage.getItem('placifyUser') || '{}');
  const currentUserId = user.id;

  /* ── Fetch posts ── */
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const url = activeTab === 'All Posts' ? API : `${API}?category=${encodeURIComponent(activeTab)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setPosts(data.posts);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [activeTab, token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  /* ── Like toggle ── */
  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API}/${postId}/like`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likesCount: data.post.likesCount, liked: data.post.liked } : p)));
      }
    } catch { /* silent */ }
  };

  /* ── Delete post ── */
  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const res = await fetch(`${API}/${postId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch { /* silent */ }
  };

  /* ── Post created ── */
  const handlePostCreated = (newPost) => {
    if (activeTab === 'All Posts' || activeTab === newPost.category) {
      setPosts((prev) => [newPost, ...prev]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Community</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Placements Hub
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {CATEGORIES.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* New post prompt */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3 cursor-pointer hover:bg-white/[0.07] transition-colors"
        onClick={() => setShowCreateModal(true)}>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold shrink-0">
          {getInitial(user.name)}
        </div>
        <div className="flex-1 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-gray-500">
          Share your placement experience, tips, or questions...
        </div>
      </div>

      {/* Create modal */}
      <CreatePostModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={handlePostCreated} />

      {/* Posts list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <svg className="mx-auto w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          <p className="text-sm">No posts yet in this category.</p>
          <button type="button" onClick={() => setShowCreateModal(true)} className="mt-3 text-indigo-400 text-sm hover:underline">Be the first to post!</button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={currentUserId} onLike={handleLike} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
