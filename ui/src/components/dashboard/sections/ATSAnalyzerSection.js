import React, { useState, useRef, useCallback } from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const BACKEND = 'http://localhost:5000';

function scoreColor(score) {
  if (score >= 75) return { stroke: 'url(#scoreGradGreen)', text: 'text-emerald-400', label: 'Strong Match', bg: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300' };
  if (score >= 50) return { stroke: 'url(#scoreGradYellow)', text: 'text-yellow-400', label: 'Moderate Match', bg: 'bg-yellow-500/10 border-yellow-400/30 text-yellow-300' };
  return { stroke: 'url(#scoreGradRed)', text: 'text-red-400', label: 'Needs Work', bg: 'bg-red-500/10 border-red-400/30 text-red-300' };
}

function statusBadge(status) {
  const map = {
    pass: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300',
    warn: 'bg-yellow-500/15 border-yellow-400/30 text-yellow-300',
    fail: 'bg-red-500/15 border-red-400/30 text-red-300',
  };
  const icons = { pass: '✓', warn: '⚠', fail: '✗' };
  return { cls: map[status] || map.warn, icon: icons[status] || '?' };
}

function severityBadge(sev) {
  const map = {
    high: 'bg-red-500/15 border-red-400/30 text-red-300',
    medium: 'bg-yellow-500/15 border-yellow-400/30 text-yellow-300',
    low: 'bg-blue-500/15 border-blue-400/30 text-blue-300',
  };
  return map[sev] || map.medium;
}

function priorityBadge(p) {
  const map = {
    high: 'bg-red-500/15 text-red-300 border-red-400/30',
    medium: 'bg-yellow-500/15 text-yellow-300 border-yellow-400/30',
    low: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
  };
  return map[p] || map.medium;
}

const SECTION_LABELS = {
  header: 'Header',
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  certifications: 'Certifications',
  projects: 'Projects',
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionNotes({ sectionNotes }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <h2 className="font-semibold mb-4 text-base">Section Analysis</h2>
      <div className="divide-y divide-white/5">
        {Object.entries(sectionNotes).map(([key, val]) => {
          const { cls, icon } = statusBadge(val.status);
          return (
            <div key={key} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <span className={`shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs border ${cls}`}>
                  {icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-200">{SECTION_LABELS[key] || key}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide border ${cls}`}>
                      {val.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{val.note}</p>
                  {val.fix && val.status !== 'pass' && (
                    <p className="text-xs text-indigo-300 mt-1 leading-relaxed">💡 {val.fix}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KeywordMatch({ keywordMatch }) {
  const { matched = [], partial = [], missing = [], density } = keywordMatch;

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <h2 className="font-semibold mb-1 text-base">Keyword Analysis</h2>
      {density && (
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          <span className="text-gray-300 font-medium">Density: </span>{density}
        </p>
      )}

      {matched.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest mb-2">✓ Matched ({matched.length})</p>
          <div className="flex flex-wrap gap-2">
            {matched.map((k) => (
              <span key={k} className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {partial.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-yellow-400 uppercase tracking-widest mb-2">~ Partial ({partial.length})</p>
          <div className="flex flex-wrap gap-2">
            {partial.map((p) => (
              <span
                key={p.keyword}
                title={p.suggestion}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 border border-yellow-400/30 text-yellow-300 cursor-help"
              >
                {p.keyword} ⓘ
              </span>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Hover over a keyword to see improvement suggestions</p>
        </div>
      )}

      {missing.length > 0 && (
        <div>
          <p className="text-xs font-medium text-red-400 uppercase tracking-widest mb-2">✗ Missing ({missing.length})</p>
          <div className="flex flex-wrap gap-2">
            {missing.map((k) => (
              <span key={k} className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 border border-red-400/30 text-red-300">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FormattingIssues({ issues }) {
  const [open, setOpen] = useState(true);
  if (!issues || issues.length === 0) {
    return (
      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
        <h2 className="font-semibold text-base mb-1">Formatting</h2>
        <p className="text-sm text-emerald-400">✓ No major formatting issues detected.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <h2 className="font-semibold text-base">Formatting Issues <span className="text-red-400">({issues.length})</span></h2>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mt-4 space-y-3">
          {issues.map((iss, i) => (
            <div key={i} className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-medium text-sm text-gray-200">{iss.issue}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide border ${severityBadge(iss.severity)}`}>
                  {iss.severity}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{iss.detail}</p>
              {iss.fix && <p className="text-xs text-indigo-300 mt-1 leading-relaxed">💡 {iss.fix}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ImprovementChecklist({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <h2 className="font-semibold mb-4 text-base">Improvement Checklist</h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
            <div className="flex items-start gap-3">
              <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide border ${priorityBadge(item.priority)}`}>
                {item.priority}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 leading-relaxed">{item.action}</p>
                {item.example && (
                  <pre className="mt-2 bg-black/30 rounded p-2 text-[11px] text-gray-400 whitespace-pre-wrap font-mono overflow-x-auto">
                    {item.example}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NextSteps({ text }) {
  if (!text) return null;
  return (
    <div className="rounded-xl bg-indigo-500/10 border border-indigo-400/25 p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-indigo-400 text-lg">🎯</span>
        <h2 className="font-semibold text-base text-indigo-300">Recommended Next Steps</h2>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
    </div>
  );
}

// ─── Upload Panel ────────────────────────────────────────────────────────────

function UploadPanel({ onAnalyze, loading, error }) {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(f.type)) {
      alert('Only PDF and DOCX files are supported.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert('File must be under 5 MB.');
      return;
    }
    setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) { alert('Please select a resume file first.'); return; }
    onAnalyze(file, jd);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">ATS Resume Analyzer</h1>
      <p className="text-sm text-gray-400">Upload your resume and get an instant AI-powered ATS compatibility report.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop Zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`rounded-2xl border-2 border-dashed transition-all cursor-pointer p-10 text-center
            ${dragging ? 'border-indigo-400/70 bg-indigo-500/10' : file ? 'border-emerald-400/40 bg-emerald-500/5' : 'border-white/15 bg-white/[0.02] hover:bg-white/5 hover:border-indigo-400/40'}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div className="mx-auto w-14 h-14 rounded-full bg-indigo-500/15 flex items-center justify-center mb-4">
            {file ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}
          </div>
          {file ? (
            <p className="font-medium text-emerald-300">{file.name}</p>
          ) : (
            <>
              <p className="font-medium text-gray-200">Drop your resume here or click to upload</p>
              <p className="text-sm text-gray-500 mt-1">PDF, DOCX — Max 5 MB</p>
            </>
          )}
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Job Description <span className="text-gray-500 font-normal">(optional — improves keyword analysis)</span>
          </label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the job description here…"
            rows={4}
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 text-sm text-gray-200 placeholder-gray-600 px-4 py-3 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/60 transition-all"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-400/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3 px-6 font-semibold text-sm bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Analyzing with AI…
            </>
          ) : 'Analyze Resume'}
        </button>
      </form>
    </div>
  );
}

// ─── Link Verification Panel ─────────────────────────────────────────────────

const CATEGORY_META = {
  github_repo:     { icon: '🐙', label: 'GitHub Repo' },
  github_profile:  { icon: '🐙', label: 'GitHub Profile' },
  linkedin:        { icon: '💼', label: 'LinkedIn' },
  certification:   { icon: '🏅', label: 'Certification' },
  portfolio:       { icon: '🌐', label: 'Portfolio / Other' },
};

function StatusChip({ status }) {
  if (status === 'live')         return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">✅ Live</span>;
  if (status === 'dead')         return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 border border-red-400/30 text-red-300">❌ Dead / 404</span>;
  if (status === 'timeout')      return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/15 border border-yellow-400/30 text-yellow-300">⏱ Timeout</span>;
  if (status === 'rate_limited') return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 border border-blue-400/30 text-blue-300">⚠ Rate-limited</span>;
  return null;
}

function LinkVerification({ links }) {
  const [open, setOpen] = useState(true);
  if (!links || links.length === 0) return null;

  const deadCount = links.filter((l) => l.status === 'dead').length;

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-5">
      <button className="w-full flex items-center justify-between text-left" onClick={() => setOpen((v) => !v)}>
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-base">Link Verification</h2>
          <span className="text-xs text-gray-500">{links.length} found</span>
          {deadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 border border-red-400/30 text-red-300">
              {deadCount} dead
            </span>
          )}
        </div>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-2">
          {links.map((link, i) => {
            const cat = CATEGORY_META[link.category] || CATEGORY_META.portfolio;
            const shortUrl = link.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 55);
            return (
              <div key={i} className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
                <div className="flex flex-wrap items-start gap-2">
                  <span className="shrink-0 text-base">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">{cat.label}</span>
                      <StatusChip status={link.status} />
                      {link.httpStatus && link.status !== 'live' && (
                        <span className="text-[10px] text-gray-600">HTTP {link.httpStatus}</span>
                      )}
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-300 hover:text-indigo-200 break-all font-mono transition-colors"
                    >
                      {shortUrl}{link.url.length > 55 ? '…' : ''}
                    </a>
                    {/* GitHub-specific metadata */}
                    {link.meta && link.category === 'github_repo' && (
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        {link.meta.stars !== undefined && (
                          <span className="text-[11px] text-gray-400">⭐ {link.meta.stars} stars</span>
                        )}
                        {link.meta.language && (
                          <span className="text-[11px] text-gray-400">🔤 {link.meta.language}</span>
                        )}
                        {link.meta.lastPushed && (
                          <span className="text-[11px] text-gray-400">📅 Last pushed {link.meta.lastPushed}</span>
                        )}
                        {link.meta.isPrivate && (
                          <span className="text-[11px] text-yellow-400">🔒 Private repo</span>
                        )}
                        {link.meta.description && (
                          <span className="text-[11px] text-gray-500 italic w-full">{link.meta.description.slice(0, 80)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Results Panel ───────────────────────────────────────────────────────────

function ResultsPanel({ analysis, linkVerification, onReset }) {
  const { score, scoreRationale, detectedRole, sectionNotes, keywordMatch, formattingIssues, improvementChecklist, nextSteps } = analysis;
  const { text, label } = scoreColor(score);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">ATS Resume Analyzer</h1>
          {detectedRole && (
            <p className="text-sm text-gray-400 mt-0.5">
              Analyzed for: <span className="text-indigo-300 font-medium">{detectedRole}</span>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors self-start sm:self-auto"
        >
          ← Analyze another
        </button>
      </div>

      {/* Score Gauge + Rationale */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="scoreGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <linearGradient id="scoreGradYellow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient id="scoreGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f87171" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke={scoreColor(score).stroke}
              strokeWidth="10"
              strokeDasharray={`${score * 3.1416} ${314.16 - score * 3.1416}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${text}`}>{score}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-lg">{label}</p>
          {scoreRationale && (
            <p className="text-sm text-gray-400 mt-1 leading-relaxed">{scoreRationale}</p>
          )}
        </div>
      </div>

      {/* All panels */}
      <LinkVerification links={linkVerification} />
      {sectionNotes && <SectionNotes sectionNotes={sectionNotes} />}
      {keywordMatch && <KeywordMatch keywordMatch={keywordMatch} />}
      {formattingIssues && <FormattingIssues issues={formattingIssues} />}
      {improvementChecklist && <ImprovementChecklist items={improvementChecklist} />}
      {nextSteps && <NextSteps text={nextSteps} />}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function ATSAnalyzerSection() {
  const [result, setResult] = useState(null); // { analysis, linkVerification }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (file, jobDescription) => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobDescription) formData.append('jobDescription', jobDescription);

      const res = await fetch(`${BACKEND}/api/ats/analyze`, {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || 'Analysis failed. Please try again.');
        return;
      }

      setResult({ analysis: json.analysis, linkVerification: json.linkVerification || [] });
    } catch (err) {
      setError('Could not connect to server. Make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      {result ? (
        <ResultsPanel analysis={result.analysis} linkVerification={result.linkVerification} onReset={handleReset} />
      ) : (
        <UploadPanel onAnalyze={handleAnalyze} loading={loading} error={error} />
      )}
    </div>
  );
}
