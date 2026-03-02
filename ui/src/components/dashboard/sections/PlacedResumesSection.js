import React, { useState } from 'react';

const RESUMES = [
  { id: 1, name: 'Aarav Sharma', role: 'SDE - Product Company', batch: '2026', company: 'Amazon', views: '1.2k', tags: ['React', 'Node.js', 'DSA'] },
  { id: 2, name: 'Meera Patel', role: 'Data Analyst - FinTech', batch: '2025', company: 'Goldman Sachs', views: '940', tags: ['Python', 'SQL', 'Tableau'] },
  { id: 3, name: 'Karthik R.', role: 'Full Stack - Startup', batch: '2026', company: 'Razorpay', views: '1.5k', tags: ['Next.js', 'MongoDB', 'TypeScript'] },
  { id: 4, name: 'Sneha G.', role: 'ML Engineer', batch: '2025', company: 'Microsoft', views: '870', tags: ['PyTorch', 'NLP', 'Docker'] },
  { id: 5, name: 'Arjun V.', role: 'Backend Engineer', batch: '2026', company: 'Google', views: '2.1k', tags: ['Go', 'gRPC', 'Kubernetes'] },
  { id: 6, name: 'Divya K.', role: 'Frontend Developer', batch: '2025', company: 'Flipkart', views: '680', tags: ['React', 'CSS', 'TypeScript'] },
];

const FILTERS = ['All', '2026', '2025'];

export default function PlacedResumesSection() {
  const [filter, setFilter] = useState('All');
  const [selectedResume, setSelectedResume] = useState(null);

  const filtered = filter === 'All' ? RESUMES : RESUMES.filter((r) => r.batch === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Placed Student Resumes</h1>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
              }`}
            >
              Batch {f}
            </button>
          ))}
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
          <div className="relative w-full max-w-lg rounded-2xl bg-[#111127] border border-white/10 p-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedResume(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold shrink-0">
                {selectedResume.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedResume.name}</h2>
                <p className="text-sm text-gray-400">{selectedResume.role} — {selectedResume.company}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
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
              className="w-full mt-5 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Download Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
