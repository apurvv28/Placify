import React, { useState, useEffect } from 'react';


const FILTERS = ['All', '2026', '2025'];

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
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/resumes/upload`, {
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
              <p className="text-xs text-gray-400 italic">Note: CTC for interns = LA / 0</p>
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

  const userStr = localStorage.getItem('placifyUser');
  const user = userStr ? JSON.parse(userStr) : null;

  const fetchResumes = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/resumes/all`);
      const data = await res.json();
      if (res.ok) {
        const mappedResumes = data.resumes.map(r => ({
          id: r._id,
          name: r.name,
          role: r.isInternship ? 'Intern' : 'Full-time',
          batch: r.year || 'N/A',
          company: r.company,
          views: Math.floor(Math.random() * 1000), // generic random views indicator
          tags: r.skills,
          summary: r.summary,
          fileUrl: r.fileUrl
        }));
        setResumes(mappedResumes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const filtered = filter === 'All' ? resumes : resumes.filter((r) => r.batch === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Placed Student Resumes</h1>
        <div className="flex flex-col items-end gap-2">

          {/* Batch filter pills */}
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
            onClick={() => setSelectedResume(r)}
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
              <span>·</span>
              <span>{r.views} views</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {r.tags.map((tag) => (
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
              {/* Left Column - Resume Preview Thumbnail */}
              <div className="w-full md:w-[280px] shrink-0">
                {selectedResume.fileUrl && selectedResume.fileUrl.toLowerCase().endsWith('.pdf') ? (
                  <iframe 
                    title="Resume Preview"
                    src={`http://localhost:5000${selectedResume.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
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
                          <div className="h-2 w-[85%] bg-white/10 rounded mt-1.5"></div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-[10px] uppercase font-semibold">Skills</span>
                          <div className="h-2 w-3/4 bg-white/10 rounded mt-1"></div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-[10px] uppercase font-semibold">Education</span>
                          <div className="h-2 w-[90%] bg-white/10 rounded mt-1"></div>
                        </div>
                      </div>
                    </div>
                    {selectedResume.fileUrl && (selectedResume.fileUrl.toLowerCase().endsWith('.doc') || selectedResume.fileUrl.toLowerCase().endsWith('.docx')) ? (
                      <span className="absolute z-10 text-white/50 text-xl font-bold select-none uppercase tracking-widest text-center">DOCX File<br/><span className="text-sm font-normal">Download to view</span></span>
                    ) : (
                      <span className="absolute z-10 text-white/5 text-4xl font-black select-none uppercase tracking-widest transform -rotate-12">Preview</span>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Details */}              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold shrink-0">
                    {selectedResume.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedResume.name}</h2>
                    <p className="text-sm text-gray-400">{selectedResume.role} — {selectedResume.company}</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm mb-6 flex-1">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-gray-400 text-xs mb-1">Summary</p>
                    <p className="text-gray-200">Skilled {selectedResume.role.split(' - ')[0]} with strong fundamentals in {selectedResume.tags.join(', ')}. Selected through campus placement at {selectedResume.company}.</p>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-gray-400 text-xs mb-1">Key Skills</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedResume.tags.map((t) => (
                        <span key={t} className="px-2.5 py-1 rounded-full text-xs bg-indigo-500/10 border border-indigo-400/20 text-indigo-300">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-gray-400 text-xs mb-1">Details</p>
                    <p className="text-gray-200">Batch {selectedResume.batch} · {selectedResume.views} views</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedResume.fileUrl) window.open(`http://localhost:5000${selectedResume.fileUrl}`, '_blank');
                  }}
                  className="w-full py-2.5 rounded-lg font-medium transition-colors bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Download Resume
                </button>
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