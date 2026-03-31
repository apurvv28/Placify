import React, { useState, useEffect } from 'react';

const FILTERS = ['All', '2026', '2025'];
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function UploadResumeModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '', summary: '', skills: '', company: '', ctc: '', isInternship: false, year: '', stipend: '', file: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => { if (formData[key] !== null && formData[key] !== '') data.append(key, formData[key]); });
      const token = localStorage.getItem('placifyToken');
      const response = await fetch(`${API_BASE}/api/resumes/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: data });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to upload resume'); }
      onSuccess(); onClose();
    } catch (err) { setError(err.message); } finally { setIsSubmitting(false); }
  };

  const inputStyle = { width: '100%', backgroundColor: '#1C1C1C', border: '1px solid #2A2520', borderRadius: '8px', padding: '10px 14px', color: '#F5F0EB', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.2s, box-shadow 0.2s' };
  const focusFns = { onFocus: e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.10)'; }, onBlur: e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.boxShadow = 'none'; } };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar" style={{ backgroundColor: '#111111', border: '1px solid #2A2520' }}>
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg border-none bg-transparent cursor-pointer transition-colors" style={{ color: '#A89E94' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1C1C1C'; e.currentTarget.style.color = '#F5F0EB'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#A89E94'; }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>

        <h2 className="text-xl font-bold mb-5" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>Share Your Journey</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-xs mb-1.5" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Name</label><input type="text" style={inputStyle} {...focusFns} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
          <div><label className="block text-xs mb-1.5" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Summary</label><textarea rows={3} style={{ ...inputStyle, resize: 'none' }} {...focusFns} value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} required /></div>
          <div><label className="block text-xs mb-1.5" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Skills (comma separated)</label><input type="text" style={inputStyle} {...focusFns} value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} required /></div>
          <div><label className="block text-xs mb-1.5" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Company</label><input type="text" style={inputStyle} {...focusFns} value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} required /></div>
          <div><label className="block text-xs mb-1.5" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>CTC in LPA</label><input type="text" style={inputStyle} {...focusFns} value={formData.ctc} onChange={e => setFormData({ ...formData, ctc: e.target.value })} required /></div>

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="internship" checked={formData.isInternship} onChange={e => setFormData({ ...formData, isInternship: e.target.checked })} style={{ accentColor: '#FF6B35' }} />
            <label htmlFor="internship" className="text-xs cursor-pointer select-none" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>This is an internship</label>
          </div>

          {formData.isInternship && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg mt-3" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520' }}>
              <div><label className="block text-xs mb-1.5" style={{ color: '#A89E94' }}>Year</label><input type="text" style={inputStyle} {...focusFns} value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} required /></div>
              <div><label className="block text-xs mb-1.5" style={{ color: '#A89E94' }}>Stipend (per month)</label><input type="text" style={inputStyle} {...focusFns} value={formData.stipend} onChange={e => setFormData({ ...formData, stipend: e.target.value })} required /></div>
            </div>
          )}

          <div>
            <label className="block text-xs mb-1.5" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Upload Resume (PDF, DOCX)</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFormData({ ...formData, file: e.target.files[0] })} required
              className="w-full text-xs file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:cursor-pointer transition-colors"
              style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}
            />
            <style>{`input[type="file"]::file-selector-button { background-color: rgba(255,107,53,0.12); color: #FF6B35; } input[type="file"]::file-selector-button:hover { background-color: rgba(255,107,53,0.22); }`}</style>
          </div>

          {error && <p className="text-sm" style={{ color: '#FF3D00' }}>{error}</p>}
          <button type="submit" disabled={isSubmitting} className="w-full mt-6 py-3 rounded-lg text-sm font-semibold text-white border-none cursor-pointer disabled:opacity-50 transition-all hover:shadow-[0_0_20px_rgba(255,107,53,0.30)] hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)', fontFamily: 'DM Sans, sans-serif' }}>
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
  const user = JSON.parse(localStorage.getItem('placifyUser') || 'null');

  const fetchResumes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/resumes/all`);
      const data = await res.json();
      if (res.ok) {
        const mappedResumes = data.resumes.map(r => ({ ...r, id: r._id || r.resumeId, role: r.isInternship ? 'Intern' : 'Full-time', batch: r.year || 'N/A', tags: Array.isArray(r.skills) ? r.skills : (typeof r.skills === 'string' ? r.skills.split(',').map(s => s.trim()) : []) }));
        setResumes(mappedResumes);
        if (user?.id) setLikedResumes(new Set(mappedResumes.filter(r => r.likes && r.likes.includes(user.id)).map(r => r.id)));
      }
    } catch { /* */ }
  };

  const recordView = async (resumeId) => {
    try {
      const response = await fetch(`${API_BASE}/api/resumes/${resumeId}/view`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setResumes(resumes.map(r => r.id === resumeId ? { ...r, ...data.resume } : r));
        return data.resume;
      }
    } catch { /* */ }
  };

  const toggleLike = async (resumeId) => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_BASE}/api/resumes/${resumeId}/like`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
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
    } catch { /* */ }
  };

  const addComment = async (resumeId) => {
    if (!commentText.trim() || !user?.id) return;
    try {
      setIsAddingComment(true);
      const response = await fetch(`${API_BASE}/api/resumes/${resumeId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ text: commentText }) });
      if (response.ok) {
        const data = await response.json();
        setResumes(resumes.map(r => r.id === resumeId ? { ...r, ...data.resume } : r));
        if (selectedResume?.id === resumeId) setSelectedResume({ ...selectedResume, ...data.resume });
        setCommentText('');
      }
    } catch { /* */ } finally { setIsAddingComment(false); }
  };

  const deleteComment = async (resumeId, commentId) => {
    try {
      const response = await fetch(`${API_BASE}/api/resumes/${resumeId}/comments/${commentId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        setResumes(resumes.map(r => r.id === resumeId ? { ...r, ...data.resume } : r));
        if (selectedResume?.id === resumeId) setSelectedResume({ ...selectedResume, ...data.resume });
      }
    } catch { /* */ }
  };

  useEffect(() => { fetchResumes(); }, []);

  const openResume = (resume) => {
    setSelectedResume(resume);
    recordView(resume.id).then(updatedResume => { if (updatedResume) setSelectedResume(prev => ({ ...prev, ...updatedResume })); });
  };

  const filtered = filter === 'All' ? resumes : resumes.filter((r) => r.batch === filter);

  const inputStyle = { width: '100%', backgroundColor: '#1C1C1C', border: '1px solid #2A2520', borderRadius: '8px', padding: '10px 14px', color: '#F5F0EB', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.2s, box-shadow 0.2s' };
  const focusFns = { onFocus: e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.10)'; }, onBlur: e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.boxShadow = 'none'; } };
  const AVATAR_COLORS = ['#FF6B35', '#E8A430', '#D4621F', '#C8551A', '#FF3D00', '#FF8C5A'];
  const avatarColor = (name) => AVATAR_COLORS[(name || 'U').charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold border-l-2 pl-3" style={{ fontFamily: 'Syne, sans-serif', color: '#F5F0EB', borderLeftColor: '#FF6B35' }}>Placed Resumes</h1>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <button key={f} type="button" onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors border cursor-pointer"
                  style={{ backgroundColor: active ? 'rgba(255,107,53,0.12)' : 'transparent', color: active ? '#FF6B35' : '#A89E94', borderColor: active ? 'rgba(255,107,53,0.30)' : '#2A2520', fontFamily: 'DM Sans, sans-serif' }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = '#1C1C1C'; e.currentTarget.style.color = '#F5F0EB'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#A89E94'; } }}
                >
                  {f === 'All' ? 'All' : `Batch ${f}`}
                </button>
              );
            })}
          </div>

          {user?.studentStatus?.toLowerCase() === 'placed' && (
            <button onClick={() => setShowUploadModal(true)} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border-none cursor-pointer hover:shadow-[0_0_12px_rgba(255,107,53,0.30)] text-white" style={{ background: 'linear-gradient(135deg, #FF6B35, #E8A430)', fontFamily: 'DM Sans, sans-serif' }}>
              + Share Your Journey
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <article key={r.id} onClick={() => openResume(r)} className="rounded-xl p-5 cursor-pointer transition-all duration-200 group" style={{ backgroundColor: '#111111', border: '1px solid #2A2520' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.3)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255,107,53,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-lg" style={{ backgroundColor: avatarColor(r.name) }}>
                {r.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-base truncate transition-colors" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}
                   onMouseEnter={e => e.currentTarget.style.color = '#FF6B35'} onMouseLeave={e => e.currentTarget.style.color = '#F5F0EB'}
                >{r.name}</p>
                <p className="text-xs mt-0.5 font-medium uppercase tracking-wide" style={{ color: '#E8A430', fontFamily: 'JetBrains Mono, monospace' }}>{r.role}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-3 text-sm font-medium" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
              <span className="truncate">{r.company}</span>
              <span style={{ color: '#5C5550' }}>•</span>
              <span className="shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#5C5550' }}>B-{r.batch}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {r.tags && r.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-sm text-[10px] font-medium border" style={{ backgroundColor: 'rgba(255,107,53,0.06)', borderColor: 'rgba(255,107,53,0.20)', color: '#FF6B35', fontFamily: 'DM Sans, sans-serif' }}>{tag}</span>
              ))}
              {r.tags && r.tags.length > 3 && <span className="px-2 py-0.5 rounded-sm text-[10px] font-medium border" style={{ backgroundColor: '#1C1C1C', borderColor: '#2A2520', color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>+{r.tags.length - 3}</span>}
            </div>

            <div className="flex items-center gap-4 text-xs font-medium pt-3" style={{ color: '#5C5550', borderTop: '1px solid #2A2520', fontFamily: 'DM Sans, sans-serif' }}>
              <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>{r.views || 0}</span>
              <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill={likedResumes.has(r.id) ? '#E8A430' : 'none'} stroke={likedResumes.has(r.id) ? '#E8A430' : 'currentColor'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>{r.likeCount || 0}</span>
              <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>{r.commentCount || 0}</span>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-1 md:col-span-3 text-center py-16" style={{ color: '#5C5550', fontFamily: 'DM Sans, sans-serif' }}>No resumes found for this batch.</div>
        )}
      </div>

      {/* Resume Modal */}
      {selectedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setSelectedResume(null)} />
          <div className="relative w-full max-w-4xl rounded-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl" style={{ backgroundColor: '#111111', border: '1px solid #2A2520' }}>
            <button type="button" onClick={() => setSelectedResume(null)} className="absolute top-4 right-4 p-2 rounded-lg border-none bg-transparent cursor-pointer transition-colors" style={{ color: '#A89E94' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1C1C1C'; e.currentTarget.style.color = '#F5F0EB'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#A89E94'; }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Preview */}
              <div className="w-full lg:w-[320px] shrink-0">
                {selectedResume.fileUrl && selectedResume.fileUrl.toLowerCase().endsWith('.pdf') ? (
                  <iframe title="Resume Preview" src={`${API_BASE}${selectedResume.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-[400px] rounded-xl border pointer-events-none shadow-lg" style={{ backgroundColor: 'white', borderColor: '#2A2520' }} />
                ) : (
                  <div className="w-full h-[400px] rounded-xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520' }}>
                    <div className="absolute inset-0 flex flex-col p-6 opacity-30 pointer-events-none">
                      <div className="font-bold text-sm mb-2" style={{ color: '#A89E94' }}>{selectedResume.name}</div>
                      <div className="h-[2px] w-full mb-4" style={{ backgroundColor: '#FF6B35' }}></div>
                      <div className="h-3 w-3/4 mb-2 rounded" style={{ backgroundColor: '#2A2520' }}></div><div className="h-3 w-5/6 mb-4 rounded" style={{ backgroundColor: '#2A2520' }}></div>
                      <div className="h-3 w-full mb-2 rounded" style={{ backgroundColor: '#2A2520' }}></div><div className="h-3 w-4/5 mb-2 rounded" style={{ backgroundColor: '#2A2520' }}></div>
                    </div>
                    <span className="z-10 text-3xl font-black uppercase tracking-widest transform -rotate-12 opacity-50" style={{ color: '#5C5550' }}>Preview</span>
                  </div>
                )}
                
                <div className="mt-5 space-y-3">
                  <button onClick={() => toggleLike(selectedResume.id)} disabled={!user?.id}
                    className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 border-none cursor-pointer transition-all disabled:opacity-50"
                    style={{ backgroundColor: likedResumes.has(selectedResume.id) ? 'rgba(232,164,48,0.15)' : '#1C1C1C', color: likedResumes.has(selectedResume.id) ? '#E8A430' : '#A89E94', fontFamily: 'DM Sans, sans-serif' }}
                    onMouseEnter={e => { if(!likedResumes.has(selectedResume.id)) e.currentTarget.style.backgroundColor='rgba(232,164,48,0.08)'; }}
                    onMouseLeave={e => { if(!likedResumes.has(selectedResume.id)) e.currentTarget.style.backgroundColor='#1C1C1C'; }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={likedResumes.has(selectedResume.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    {likedResumes.has(selectedResume.id) ? 'Liked' : 'Like'}
                  </button>
                  <button type="button" onClick={() => { if (selectedResume.fileUrl) window.open(`${API_BASE}${selectedResume.fileUrl}`, '_blank'); }}
                    className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 border-none cursor-pointer transition-all text-white hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)', boxShadow: '0 0 20px rgba(255,107,53,0.25)', fontFamily: 'DM Sans, sans-serif' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(255,107,53,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(255,107,53,0.25)'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Right Details */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 text-white shadow-xl" style={{ backgroundColor: avatarColor(selectedResume.name), border: '2px solid rgba(255,107,53,0.2)' }}>
                    {selectedResume.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>{selectedResume.name}</h2>
                    <p className="text-sm font-medium" style={{ color: '#E8A430', fontFamily: 'DM Sans, sans-serif' }}>{selectedResume.role} at {selectedResume.company}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[{l:'Views', v:selectedResume.views||0}, {l:'Likes', v:selectedResume.likeCount||0}, {l:'Batch', v:selectedResume.batch}, {l:'CTC', v:selectedResume.ctc ? `${selectedResume.ctc} LPA` : '-'}].map(s => (
                    <div key={s.l} className="p-3 rounded-lg text-center" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520' }}>
                      <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>{s.l}</p>
                      <p className="font-bold text-base" style={{ color: '#F5F0EB', fontFamily: 'DM Sans, sans-serif' }}>{s.v}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl p-5 mb-5" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>About Experience</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>{selectedResume.summary || 'No summary provided.'}</p>
                </div>

                {selectedResume.tags && selectedResume.tags.length > 0 && (
                  <div className="rounded-xl p-5 mb-5" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520' }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>Key Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedResume.tags.map((t) => (
                        <span key={t} className="px-3 py-1 rounded-md text-xs font-medium border" style={{ backgroundColor: 'rgba(255,107,53,0.06)', borderColor: 'rgba(255,107,53,0.25)', color: '#FF6B35', fontFamily: 'DM Sans, sans-serif' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {user?.id && (
                  <div className="mt-4 pt-6" style={{ borderTop: '1px solid #2A2520' }}>
                    <p className="font-bold mb-3" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>Comments</p>
                    <div className="flex gap-2 mb-4">
                      <input type="text" placeholder="Add a comment..." style={inputStyle} {...focusFns} value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment(selectedResume.id)} />
                      <button onClick={() => addComment(selectedResume.id)} disabled={!commentText.trim() || isAddingComment} className="px-4 py-2 rounded-lg font-bold text-sm border-none cursor-pointer transition-colors disabled:opacity-50" style={{ backgroundColor: 'rgba(255,107,53,0.12)', color: '#FF6B35', fontFamily: 'DM Sans, sans-serif' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,107,53,0.22)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,107,53,0.12)'}
                      >{isAddingComment ? '...' : 'Post'}</button>
                    </div>

                    <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                      {selectedResume.comments && selectedResume.comments.length > 0 ? selectedResume.comments.map((comment) => (
                        <div key={comment.id} className="rounded-lg p-3" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520' }}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-sm leading-relaxed" style={{ color: '#F5F0EB', fontFamily: 'DM Sans, sans-serif' }}>{comment.text}</p>
                              <p className="text-[10px] mt-1.5 font-medium" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>{new Date(comment.createdAt).toLocaleDateString()}</p>
                            </div>
                            {user?.id === comment.userId && (
                              <button onClick={() => deleteComment(selectedResume.id, comment.id)} className="bg-transparent border-none cursor-pointer p-1" style={{ color: '#5C5550' }} onMouseEnter={e => e.currentTarget.style.color = '#FF3D00'} onMouseLeave={e => e.currentTarget.style.color = '#5C5550'}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                              </button>
                            )}
                          </div>
                        </div>
                      )) : <p className="text-xs italic" style={{ color: '#5C5550', fontFamily: 'DM Sans, sans-serif' }}>No comments yet. Be the first!</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
