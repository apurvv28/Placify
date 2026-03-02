import React, { useState } from 'react';

const KEYWORD_RESULTS = [
  { keyword: 'React', found: true },
  { keyword: 'Node.js', found: true },
  { keyword: 'REST APIs', found: true },
  { keyword: 'TypeScript', found: false },
  { keyword: 'CI/CD', found: false },
  { keyword: 'Agile', found: true },
  { keyword: 'Docker', found: false },
  { keyword: 'SQL', found: true },
];

const SECTION_SCORES = [
  { section: 'Contact Info', score: 100, max: 100 },
  { section: 'Summary', score: 70, max: 100 },
  { section: 'Experience', score: 85, max: 100 },
  { section: 'Skills', score: 60, max: 100 },
  { section: 'Education', score: 90, max: 100 },
  { section: 'Projects', score: 75, max: 100 },
];

export default function ATSAnalyzerSection() {
  const [hasUploaded, setHasUploaded] = useState(false);

  if (!hasUploaded) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">ATS Resume Analyzer</h1>

        <div
          onClick={() => setHasUploaded(true)}
          className="rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/5 hover:border-indigo-400/40 transition-all cursor-pointer p-10 sm:p-16 text-center"
        >
          <div className="mx-auto w-14 h-14 rounded-full bg-indigo-500/15 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="font-medium text-gray-200">Drop your resume here or click to upload</p>
          <p className="text-sm text-gray-500 mt-1">PDF, DOCX — Max 5 MB</p>
        </div>
      </div>
    );
  }

  const overallScore = 78;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">ATS Resume Analyzer</h1>
        <button
          type="button"
          onClick={() => setHasUploaded(false)}
          className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
        >
          ← Upload another
        </button>
      </div>

      {/* Overall Score */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-5 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-28 h-28 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke="url(#scoreGrad)" strokeWidth="10"
              strokeDasharray={`${overallScore * 3.14} ${314 - overallScore * 3.14}`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{overallScore}%</span>
          </div>
        </div>
        <div>
          <p className="font-semibold text-lg">Good Match</p>
          <p className="text-sm text-gray-400 mt-1">Your resume matches well but could improve in Skills and TypeScript/Docker keywords.</p>
        </div>
      </div>

      {/* Section Scores */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
        <h2 className="font-semibold mb-4">Section Scores</h2>
        <div className="space-y-3">
          {SECTION_SCORES.map((s) => (
            <div key={s.section}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-300">{s.section}</span>
                <span className="font-medium">{s.score}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400 transition-all"
                  style={{ width: `${s.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyword Match */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
        <h2 className="font-semibold mb-4">Keyword Match</h2>
        <div className="flex flex-wrap gap-2">
          {KEYWORD_RESULTS.map((k) => (
            <span
              key={k.keyword}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                k.found
                  ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-400/30 text-red-300'
              }`}
            >
              {k.found ? '✓' : '✗'} {k.keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
