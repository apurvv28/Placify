import React, { useState, useEffect, useCallback } from 'react';

const API = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/posts`;
const CATEGORIES = ['All Posts', 'Success Story', 'Resume', 'Interview Prep', 'Experiences', 'Internship', 'Study Group', 'General'];

const CATEGORY_COLORS = {
  'Success Story': { bg: 'rgba(232,164,48,0.12)', border: 'rgba(232,164,48,0.30)', text: '#E8A430' },
  'Resume':        { bg: 'rgba(255,107,53,0.12)', border: 'rgba(255,107,53,0.30)', text: '#FF6B35' },
  'Interview Prep':{ bg: 'rgba(255,61,0,0.12)',   border: 'rgba(255,61,0,0.30)',   text: '#FF3D00' },
  'Experiences':   { bg: 'rgba(255,107,53,0.10)', border: 'rgba(255,107,53,0.25)', text: '#FF8C5A' },
  'Internship':    { bg: 'rgba(212,98,31,0.12)',   border: 'rgba(212,98,31,0.30)', text: '#D4621F' },
  'Study Group':   { bg: 'rgba(200,85,26,0.12)',   border: 'rgba(200,85,26,0.30)', text: '#C8551A' },
  'General':       { bg: 'rgba(42,37,32,0.6)',     border: '#2A2520',              text: '#A89E94' },
};

const AVATAR_COLORS = ['#FF6B35', '#E8A430', '#D4621F', '#C8551A', '#FF3D00', '#FF8C5A'];
const avatarColor = (name) => AVATAR_COLORS[(name || '?').charCodeAt(0) % AVATAR_COLORS.length];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const inputStyle = { width: '100%', backgroundColor: '#1C1C1C', border: '1px solid #2A2520', borderRadius: '8px', padding: '10px 14px', color: '#F5F0EB', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.2s, box-shadow 0.2s' };
const focusFns = {
  onFocus: e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.10)'; },
  onBlur:  e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.boxShadow = 'none'; },
};

/* ─── Create Post Modal ─────────────────────────────────────────────────────── */
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
      setLoading(true); setError('');
      const token = localStorage.getItem('placifyToken');
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), category }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to create post'); return; }
      onCreated(data.post);
      setTitle(''); setContent(''); setCategory('General'); onClose();
    } catch { setError('Unable to connect to server'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl p-6 shadow-2xl" style={{ backgroundColor: '#111111', border: '1px solid #2A2520' }} onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>Create a Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs mb-2" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c !== 'All Posts').map((c) => {
                const col = CATEGORY_COLORS[c] || CATEGORY_COLORS['General'];
                const active = category === c;
                return (
                  <button key={c} type="button" onClick={() => setCategory(c)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all border cursor-pointer"
                    style={{ backgroundColor: active ? col.bg : 'transparent', border: `1px solid ${active ? col.border : '#2A2520'}`, color: active ? col.text : '#A89E94', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="Give your post a title..." style={inputStyle} {...focusFns} />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} maxLength={5000} placeholder="Share your experience..." style={{ ...inputStyle, resize: 'none' }} {...focusFns} />
          </div>
          {error && <p className="text-sm" style={{ color: '#FF6B35' }}>{error}</p>}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm transition-colors border-none cursor-pointer" style={{ backgroundColor: 'transparent', color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.color = '#F5F0EB'}
              onMouseLeave={e => e.currentTarget.style.color = '#A89E94'}
            >Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 border-none cursor-pointer text-white"
              style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)', fontFamily: 'DM Sans, sans-serif' }}>
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Comment Item ─────────────────────────────────────────────────────────── */
function CommentItem({ comment, currentUserId, onDelete }) {
  return (
    <div className="flex gap-3 py-3" style={{ borderBottom: '1px solid rgba(42,37,32,0.5)' }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-white" style={{ backgroundColor: avatarColor(comment.author.name) }}>
        {comment.author.name?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: '#F5F0EB', fontFamily: 'DM Sans, sans-serif' }}>{comment.author.name}</span>
          <span className="text-[10px]" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>{timeAgo(comment.createdAt)}</span>
          {comment.author.id === currentUserId && (
            <button type="button" onClick={() => onDelete(comment.id)} className="ml-auto text-[10px] bg-transparent border-none cursor-pointer transition-colors" style={{ color: '#5C5550' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FF3D00'}
              onMouseLeave={e => e.currentTarget.style.color = '#5C5550'}
            >delete</button>
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>{comment.content}</p>
      </div>
    </div>
  );
}

/* ─── Post Card ────────────────────────────────────────────────────────────── */
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

  const toggleComments = () => { const next = !showComments; setShowComments(next); if (next && comments.length === 0) fetchComments(); };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API}/${post.id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: newComment.trim() }) });
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

  const col = CATEGORY_COLORS[post.category] || CATEGORY_COLORS['General'];

  return (
    <article
      className="rounded-lg p-4 transition-all duration-200"
      style={{ backgroundColor: '#111111', border: '1px solid #2A2520' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.20)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2520'; }}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ backgroundColor: avatarColor(post.author.name) }}>
          {post.author.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm" style={{ color: '#F5F0EB', fontFamily: 'DM Sans, sans-serif' }}>{post.author.name}</span>
            <span className="text-[10px]" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>{timeAgo(post.createdAt)}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-sm border" style={{ backgroundColor: col.bg, borderColor: col.border, color: col.text, fontFamily: 'JetBrains Mono, monospace' }}>{post.category}</span>
            {post.author.id === currentUserId && (
              <button type="button" onClick={() => onDelete(post.id)} className="ml-auto text-[10px] bg-transparent border-none cursor-pointer transition-colors" style={{ color: '#5C5550' }}
                onMouseEnter={e => e.currentTarget.style.color = '#FF3D00'}
                onMouseLeave={e => e.currentTarget.style.color = '#5C5550'}
              >delete</button>
            )}
          </div>
          <h3 className="text-sm font-semibold mt-1" style={{ color: '#F5F0EB', fontFamily: 'DM Sans, sans-serif' }}>{post.title}</h3>
          <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>{post.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: '#5C5550' }}>
            <button type="button" onClick={() => onLike(post.id)}
              className="flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0"
              style={{ color: post.liked ? '#FF6B35' : '#5C5550', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => { if (!post.liked) e.currentTarget.style.color = '#FF6B35'; }}
              onMouseLeave={e => { if (!post.liked) e.currentTarget.style.color = '#5C5550'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" /><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
              {post.likesCount}
            </button>
            <button type="button" onClick={toggleComments}
              className="flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0"
              style={{ color: showComments ? '#FF6B35' : '#5C5550', fontFamily: 'DM Sans, sans-serif' }}
              onMouseEnter={e => { if (!showComments) e.currentTarget.style.color = '#FF6B35'; }}
              onMouseLeave={e => { if (!showComments) e.currentTarget.style.color = '#5C5550'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              {localCommentsCount} {localCommentsCount === 1 ? 'reply' : 'replies'}
            </button>
          </div>

          {showComments && (
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid #2A2520' }}>
              <form onSubmit={handleAddComment} className="flex gap-2 mb-3">
                <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }} {...focusFns} />
                <button type="submit" disabled={submitting || !newComment.trim()} className="px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-40 border cursor-pointer transition-colors"
                  style={{ backgroundColor: 'rgba(255,107,53,0.12)', borderColor: 'rgba(255,107,53,0.30)', color: '#FF6B35', fontFamily: 'DM Sans, sans-serif' }}>
                  {submitting ? '...' : 'Reply'}
                </button>
              </form>
              {loadingComments
                ? <p className="text-xs text-center py-2" style={{ color: '#5C5550' }}>Loading…</p>
                : comments.length === 0
                  ? <p className="text-xs text-center py-2" style={{ color: '#5C5550' }}>No comments yet. Be the first!</p>
                  : <div className="max-h-60 overflow-y-auto custom-scrollbar divide-y" style={{ borderColor: 'rgba(42,37,32,0.5)' }}>
                    {comments.map((c) => <CommentItem key={c.id} comment={c} currentUserId={currentUserId} onDelete={handleDeleteComment} />)}
                  </div>
              }
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* ═══════════════ MAIN COMPONENT ═══════════════════════════════════════════════ */
export default function CommunitySection() {
  const [activeTab, setActiveTab] = useState('All Posts');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const token = localStorage.getItem('placifyToken');
  const user = JSON.parse(localStorage.getItem('placifyUser') || '{}');

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

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API}/${postId}/like`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likesCount: data.post.likesCount, liked: data.post.liked } : p)));
    } catch { /* silent */ }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const res = await fetch(`${API}/${postId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch { /* silent */ }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold border-l-2 pl-3" style={{ fontFamily: 'Syne, sans-serif', color: '#F5F0EB', borderLeftColor: '#FF6B35' }}>Community</h1>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: 'rgba(255,107,53,0.10)', border: '1px solid rgba(255,107,53,0.25)', color: '#FF6B35', fontFamily: 'JetBrains Mono, monospace' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#FF6B35' }} />
          LIVE
        </span>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {CATEGORIES.map((tab) => {
          const col = CATEGORY_COLORS[tab] || CATEGORY_COLORS['General'];
          const active = activeTab === tab;
          return (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border-none cursor-pointer"
              style={{ backgroundColor: active ? col.bg : 'rgba(42,37,32,0.4)', border: `1px solid ${active ? col.border : '#2A2520'}`, color: active ? col.text : '#A89E94', fontFamily: 'DM Sans, sans-serif' }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Create prompt */}
      <div
        className="rounded-lg p-4 flex items-center gap-3 cursor-pointer transition-all duration-200"
        style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520' }}
        onClick={() => setShowCreateModal(true)}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.30)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2520'; }}
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ backgroundColor: avatarColor(user.name) }}>
          {(user.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 rounded-lg px-4 py-2.5 text-sm" style={{ backgroundColor: 'rgba(10,10,10,0.5)', border: '1px solid #2A2520', color: '#5C5550', fontFamily: 'DM Sans, sans-serif' }}>
          Share your placement experience, tips, or questions...
        </div>
      </div>

      <CreatePostModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={(p) => { if (activeTab === 'All Posts' || activeTab === p.category) setPosts((prev) => [p, ...prev]); }} />

      {/* Posts list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF6B35', borderTopColor: 'transparent' }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#5C5550' }}>
          <svg className="mx-auto w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          <p className="text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>No posts yet in this category.</p>
          <button type="button" onClick={() => setShowCreateModal(true)} className="mt-3 text-sm border-none cursor-pointer bg-transparent transition-colors" style={{ color: '#FF6B35', fontFamily: 'DM Sans, sans-serif' }}
            onMouseEnter={e => e.currentTarget.style.color = '#E8A430'}
            onMouseLeave={e => e.currentTarget.style.color = '#FF6B35'}
          >Be the first to post!</button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} onLike={handleLike} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
