import React, { useState, useEffect } from 'react';


const FILTERS = ['All', '2026', '2025'];
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function UploadResumeModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    skills: '',
    company: '',
    ctc: '',
    isInternship: false,
    year: '',
    stipend: '',
    file: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      const token = localStorage.getItem('placifyToken');
      const response = await fetch(`${API_BASE}/api/resumes/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload resume');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[#111127] border border-white/10 p-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>

        <h2 className="text-xl font-bold mb-5">Share Your Journey</h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-400 text-xs mb-1">Name</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500/50" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Summary</label>
            <textarea className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500/50 min-h-[80px]" value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} required />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Skills (comma separated)</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500/50" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} required />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Company</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500/50" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} required />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">CTC in LPA</label>
            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500/50" value={formData.ctc} onChange={e => setFormData({ ...formData, ctc: e.target.value })} required />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="internship" checked={formData.isInternship} onChange={e => setFormData({ ...formData, isInternship: e.target.checked })} className="rounded bg-black border border-white/10 accent-indigo-500" />
            <label htmlFor="internship" className="text-gray-400 text-xs cursor-pointer">This is an internship</label>
          </div>

          {formData.isInternship && (
            <div className="space-y-4 p-3 rounded-lg bg-white/5 border border-white/10 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Year</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500/50" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Stipend (per month)</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-indigo-500/50" value={formData.stipend} onChange={e => setFormData({ ...formData, stipend: e.target.value })} required />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-xs mb-1">Upload Resume (PDF, DOCX)</label>
            <input type="file" accept=".pdf,.doc,.docx" className="w-full text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 cursor-pointer" onChange={e => setFormData({ ...formData, file: e.target.files[0] })} required />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="w-full mt-6 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-sm hover:opacity-90 transition-opacity text-white disabled:opacity-50">
            {isSubmitting ? 'Uploading...' : 'Submit & Share'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PlacedResumesSection() {
  const [filter, setFilter] = useState('All');
  const [selectedResume, setSelectedResume] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [likedResumes, setLikedResumes] = useState(new Set());
  const [commentText, setCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const token = localStorage.getItem('placifyToken');
  const userStr = localStorage.getItem('placifyUser');
  const user = userStr ? JSON.parse(userStr) : null;

  const fetchResumes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/resumes/all`);
      const data = await res.json();
      if (res.ok) {
        const mappedResumes = data.resumes.map(r => ({
          ...r,
          id: r._id || r.resumeId,
          role: r.isInternship ? 'Intern' : 'Full-time',
          batch: r.year || 'N/A',
          tags: Array.isArray(r.skills) ? r.skills : (typeof r.skills === 'string' ? r.skills.split(',').map(s => s.trim()) : []),
        }));
        setResumes(mappedResumes);
        // Track which resumes current user has liked
        if (user?.id) {
          const liked = new Set(mappedResumes.filter(r => r.likes && r.likes.includes(user.id)).map(r => r.id));
          setLikedResumes(liked);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const recordView = async (resumeId) => {
    try {
      const response = await fetch(`${API_BASE}/api/resumes/${resumeId}/view`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setResumes(resumes.map(r => r.id === resumeId ? { ...r, ...data.resume } : r));
        return data.resume;
      }
    } catch (err) {
      console.error('Failed to record view:', err);
    }
  };

  const toggleLike = async (resumeId) => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_BASE}/api/resumes/${resumeId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setResumes(resumes.map(r => r.id === resumeId ? { ...r, ...data.resume } : r));
        if (data.resume.likes && data.resume.likes.includes(user.id)) {
          setLikedResumes(prev => new Set([...prev, resumeId]));
          if (selectedResume?.id === resumeId) setSelectedResume({ ...selectedResume, ...data.resume });
        } else {
          setLikedResumes(prev => { const next = new Set(prev); next.delete(resumeId); return next; });
          if (selectedResume?.id === resumeId) setSelectedResume({ ...selectedResume, ...data.resume });
        }
      }
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const addComment = async (resumeId) => {
    if (!commentText.trim() || !user?.id) return;
    try {
      setIsAddingComment(true);
      const response = await fetch(`${API_BASE}/api/resumes/${resumeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText }),
      });
      if (response.ok) {
        const data = await response.json();
        setResumes(resumes.map(r => r.id === resumeId ? { ...r, ...data.resume } : r));
        if (selectedResume?.id === resumeId) setSelectedResume({ ...selectedResume, ...data.resume });
        setCommentText('');
      }
    } catch (err) {
      console.error('Comment failed:', err);
    } finally {
      setIsAddingComment(false);
    }
  };

  const deleteComment = async (resumeId, commentId) => {
    try {
      const response = await fetch(`${API_BASE}/api/resumes/${resumeId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setResumes(resumes.map(r => r.id === resumeId ? { ...r, ...data.resume } : r));
        if (selectedResume?.id === resumeId) setSelectedResume({ ...selectedResume, ...data.resume });
      }
    } catch (err) {
      console.error('Delete comment failed:', err);
    }
  };

  useEffect(() => {
    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openResume = (resume) => {
    setSelectedResume(resume);
    recordView(resume.id).then(updatedResume => {
      if (updatedResume) {
        setSelectedResume(prev => ({ ...prev, ...updatedResume }));
      }
    });
  };

  const filtered = filter === 'All' ? resumes : resumes.filter((r) => r.batch === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Placed Student Resumes</h1>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                  }`}
              >
                Batch {f}
              </button>
            ))}
          </div>

          {user?.studentStatus?.toLowerCase() === 'placed' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-gradient-to-r from-indigo-500/80 to-purple-600/80 text-white border border-indigo-400/50 hover:from-indigo-500 hover:to-purple-600 shadow-sm"
            >
              + Share Your Journey
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((r) => (
          <article
            key={r.id}
            onClick={() => openResume(r)}
            className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold shrink-0">
                {r.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm group-hover:text-indigo-300 transition-colors truncate">{r.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <span>{r.company}</span>
              <span>·</span>
              <span>Batch {r.batch}</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                {r.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill={likedResumes.has(r.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                {r.likeCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                {r.commentCount || 0}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {r.tags && r.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Resume Detail Modal */}
      {selectedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedResume(null)} />
          <div className="relative w-full max-w-3xl rounded-2xl bg-[#111127] border border-white/10 p-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedResume(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Column - Resume Preview */}
              <div className="w-full md:w-[280px] shrink-0">
                {selectedResume.fileUrl && selectedResume.fileUrl.toLowerCase().endsWith('.pdf') ? (
                  <iframe 
                    title="Resume Preview"
                    src={`${API_BASE}${selectedResume.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-[340px] rounded-lg border border-white/10 bg-white overflow-hidden pointer-events-none"
                    style={{ backgroundColor: 'white' }}
                  />
                ) : (
                  <div className="relative w-full rounded-lg bg-white/10 border border-white/10 p-5 h-[340px] flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 flex flex-col p-4 opacity-50 pointer-events-none">
                      <div className="text-white font-bold text-sm mb-2">{selectedResume.name}</div>
                      <div className="h-[1px] w-full bg-indigo-500/50 mb-4"></div>
                      <div className="space-y-3 w-full">
                        <div>
                          <span className="text-gray-500 text-[10px] uppercase font-semibold">Experience</span>
                          <div className="h-2 w-full bg-white/10 rounded mt-1"></div>
                        </div>
                      </div>
                    </div>
                    <span className="absolute z-10 text-white/5 text-4xl font-black select-none uppercase tracking-widest transform -rotate-12">Preview</span>
                  </div>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold shrink-0">
                    {selectedResume.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedResume.name}</h2>
                    <p className="text-sm text-gray-400">{selectedResume.role} — {selectedResume.company}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm flex-1 mb-6">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-gray-400 text-xs mb-2">Engagement</p>
                    <div className="flex flex-wrap gap-3">
                      <span className="flex items-center gap-1.5 text-gray-200">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        {selectedResume.views || 0} views
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-200">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={likedResumes.has(selectedResume.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                        {selectedResume.likeCount || 0} likes
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-200">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        {selectedResume.commentCount || 0} comments
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-gray-400 text-xs mb-1">Summary</p>
                    <p className="text-gray-200">{selectedResume.summary || 'No summary provided'}</p>
                  </div>

                  {selectedResume.tags && selectedResume.tags.length > 0 && (
                    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                      <p className="text-gray-400 text-xs mb-2">Key Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedResume.tags.map((t) => (
                          <span key={t} className="px-2.5 py-1 rounded-full text-xs bg-indigo-500/10 border border-indigo-400/20 text-indigo-300">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-gray-400 text-xs mb-1">Details</p>
                    <p className="text-gray-200">Batch {selectedResume.batch} {selectedResume.ctc && `· ${selectedResume.ctc} LPA`}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <button
                    onClick={() => toggleLike(selectedResume.id)}
                    disabled={!user?.id}
                    className={`w-full py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      likedResumes.has(selectedResume.id)
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={likedResumes.has(selectedResume.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    {likedResumes.has(selectedResume.id) ? 'Liked' : 'Like Resume'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedResume.fileUrl) window.open(`${API_BASE}${selectedResume.fileUrl}`, '_blank');
                    }}
                    className="w-full py-2.5 rounded-lg font-medium transition-colors bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    Download Resume
                  </button>
                </div>

                {/* Comments Section */}
                {user?.id && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addComment(selectedResume.id)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
                      />
                      <button
                        onClick={() => addComment(selectedResume.id)}
                        disabled={!commentText.trim() || isAddingComment}
                        className="px-3 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-medium text-sm disabled:opacity-50 transition-colors"
                      >
                        {isAddingComment ? '...' : 'Send'}
                      </button>
                    </div>

                    {selectedResume.comments && selectedResume.comments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-400 font-semibold">Comments</p>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                          {selectedResume.comments.map((comment) => (
                            <div key={comment.id} className="rounded-lg bg-white/5 border border-white/10 p-2.5 text-xs">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-gray-300 font-medium">{comment.text}</p>
                                  <p className="text-gray-500 text-[10px] mt-1">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                {user?.id === comment.userId && (
                                  <button
                                    onClick={() => deleteComment(selectedResume.id, comment.id)}
                                    className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Upload Modal */}
      {showUploadModal && <UploadResumeModal onClose={() => setShowUploadModal(false)} onSuccess={fetchResumes} />}
    </div>
  );
}
