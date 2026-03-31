import React, { useState, useRef, useCallback } from 'react';
import { generatePdfReport } from '../../../utils/generatePdfReport';

const BACKEND = (process.env.REACT_APP_API_URL || 'http://localhost:5000');

function scoreColor(score) {
  if (score >= 75) return { stroke: 'url(#scoreGradGreen)', textColor: '#E8A430', label: 'Strong Match', badgeBg: 'rgba(232,164,48,0.10)', badgeBorder: 'rgba(232,164,48,0.30)', badgeText: '#E8A430' };
  if (score >= 50) return { stroke: 'url(#scoreGradAmber)', textColor: '#FF6B35', label: 'Moderate Match', badgeBg: 'rgba(255,107,53,0.10)', badgeBorder: 'rgba(255,107,53,0.30)', badgeText: '#FF6B35' };
  return { stroke: 'url(#scoreGradRed)', textColor: '#FF3D00', label: 'Needs Work', badgeBg: 'rgba(255,61,0,0.10)', badgeBorder: 'rgba(255,61,0,0.30)', badgeText: '#FF3D00' };
}

function statusBadge(status) {
  const map = {
    pass: { bg: 'rgba(232,164,48,0.12)', border: 'rgba(232,164,48,0.30)', text: '#E8A430', icon: '✓' },
    warn: { bg: 'rgba(255,107,53,0.12)', border: 'rgba(255,107,53,0.30)', text: '#FF6B35', icon: '⚠' },
    fail: { bg: 'rgba(255,61,0,0.12)', border: 'rgba(255,61,0,0.30)', text: '#FF3D00', icon: '✗' },
  };
  return map[status] || map.warn;
}

function severityBadge(sev) {
  const map = {
    high: { bg: 'rgba(255,61,0,0.12)', border: 'rgba(255,61,0,0.30)', text: '#FF3D00' },
    medium: { bg: 'rgba(255,107,53,0.12)', border: 'rgba(255,107,53,0.30)', text: '#FF6B35' },
    low: { bg: 'rgba(232,164,48,0.12)', border: 'rgba(232,164,48,0.30)', text: '#E8A430' },
  };
  return map[sev] || map.medium;
}

function priorityBadge(p) {
  const map = {
    high: { bg: 'rgba(255,61,0,0.12)', border: 'rgba(255,61,0,0.30)', text: '#FF3D00' },
    medium: { bg: 'rgba(255,107,53,0.12)', border: 'rgba(255,107,53,0.30)', text: '#FF6B35' },
    low: { bg: 'rgba(232,164,48,0.12)', border: 'rgba(232,164,48,0.30)', text: '#E8A430' },
  };
  return map[p] || map.medium;
}

const SECTION_LABELS = { header: 'Header', summary: 'Summary', experience: 'Experience', education: 'Education', skills: 'Skills', certifications: 'Certifications', projects: 'Projects' };

const panelStyle = { backgroundColor: '#1C1C1C', border: '1px solid #2A2520', borderRadius: '10px', padding: '20px' };

function SectionNotes({ sectionNotes }) {
  return (
    <div style={panelStyle}>
      <h2 className="font-semibold mb-4 text-base" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>Section Analysis</h2>
      <div className="divide-y" style={{ borderColor: 'rgba(42,37,32,0.6)' }}>
        {Object.entries(sectionNotes).map(([key, val]) => {
          const b = statusBadge(val.status);
          return (
            <div key={key} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs border" style={{ backgroundColor: b.bg, borderColor: b.border, color: b.text }}>
                  {b.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>{SECTION_LABELS[key] || key}</span>
                    <span className="px-2 py-0.5 rounded-sm text-[10px] font-medium uppercase tracking-wide border" style={{ backgroundColor: b.bg, borderColor: b.border, color: b.text, fontFamily: 'JetBrains Mono, monospace' }}>
                      {val.status}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: '#5C5550', fontFamily: 'DM Sans, sans-serif' }}>{val.note}</p>
                  {val.fix && val.status !== 'pass' && (
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#FF6B35', fontFamily: 'DM Sans, sans-serif' }}>💡 {val.fix}</p>
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
    <div style={panelStyle}>
      <h2 className="font-semibold mb-1 text-base" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>Keyword Analysis</h2>
      {density && <p className="text-xs mb-4 leading-relaxed" style={{ color: '#5C5550' }}><span style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Density: </span>{density}</p>}
      {matched.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: '#E8A430', fontFamily: 'JetBrains Mono, monospace' }}>✓ Matched ({matched.length})</p>
          <div className="flex flex-wrap gap-2">
            {matched.map((k) => <span key={k} className="px-2.5 py-1 rounded-sm text-xs font-medium" style={{ backgroundColor: 'rgba(232,164,48,0.10)', border: '1px solid rgba(232,164,48,0.25)', color: '#E8A430', fontFamily: 'DM Sans, sans-serif' }}>{k}</span>)}
          </div>
        </div>
      )}
      {partial.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: '#FF6B35', fontFamily: 'JetBrains Mono, monospace' }}>~ Partial ({partial.length})</p>
          <div className="flex flex-wrap gap-2">
            {partial.map((p) => <span key={p.keyword} title={p.suggestion} className="px-2.5 py-1 rounded-sm text-xs font-medium cursor-help" style={{ backgroundColor: 'rgba(255,107,53,0.10)', border: '1px solid rgba(255,107,53,0.25)', color: '#FF6B35', fontFamily: 'DM Sans, sans-serif' }}>{p.keyword} ⓘ</span>)}
          </div>
          <p className="text-[11px] mt-1" style={{ color: '#5C5550' }}>Hover over a keyword to see improvement suggestions</p>
        </div>
      )}
      {missing.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: '#FF3D00', fontFamily: 'JetBrains Mono, monospace' }}>✗ Missing ({missing.length})</p>
          <div className="flex flex-wrap gap-2">
            {missing.map((k) => <span key={k} className="px-2.5 py-1 rounded-sm text-xs font-medium" style={{ backgroundColor: 'rgba(255,61,0,0.10)', border: '1px solid rgba(255,61,0,0.25)', color: '#FF3D00', fontFamily: 'DM Sans, sans-serif' }}>{k}</span>)}
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
      <div style={panelStyle}>
        <h2 className="font-semibold text-base mb-1" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>Formatting</h2>
        <p className="text-sm" style={{ color: '#E8A430' }}>✓ No major formatting issues detected.</p>
      </div>
    );
  }
  return (
    <div style={panelStyle}>
      <button className="w-full flex items-center justify-between text-left border-none cursor-pointer p-0" style={{ background: 'none' }} onClick={() => setOpen((v) => !v)}>
        <h2 className="font-semibold text-base" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>Formatting Issues <span style={{ color: '#FF3D00' }}>({issues.length})</span></h2>
        <span style={{ color: '#5C5550' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mt-4 space-y-3">
          {issues.map((iss, i) => {
            const b = severityBadge(iss.severity);
            return (
              <div key={i} className="rounded-lg p-3" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #2A2520' }}>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-medium text-sm" style={{ color: '#A89E94' }}>{iss.issue}</span>
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-medium uppercase tracking-wide border" style={{ backgroundColor: b.bg, borderColor: b.border, color: b.text, fontFamily: 'JetBrains Mono, monospace' }}>{iss.severity}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#5C5550', fontFamily: 'DM Sans, sans-serif' }}>{iss.detail}</p>
                {iss.fix && <p className="text-xs mt-1 leading-relaxed" style={{ color: '#FF6B35' }}>💡 {iss.fix}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ImprovementChecklist({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={panelStyle}>
      <h2 className="font-semibold mb-4 text-base" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>Improvement Checklist</h2>
      <div className="space-y-3">
        {items.map((item, i) => {
          const b = priorityBadge(item.priority);
          return (
            <div key={i} className="rounded-lg p-3" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #2A2520' }}>
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 px-2 py-0.5 rounded-sm text-[10px] font-medium uppercase tracking-wide border" style={{ backgroundColor: b.bg, borderColor: b.border, color: b.text, fontFamily: 'JetBrains Mono, monospace' }}>{item.priority}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>{item.action}</p>
                  {item.example && (
                    <pre className="mt-2 rounded p-2 text-[11px] whitespace-pre-wrap overflow-x-auto" style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>
                      {item.example}
                    </pre>
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

function NextSteps({ text }) {
  if (!text) return null;
  return (
    <div className="rounded-lg p-5" style={{ backgroundColor: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.20)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: '#FF6B35', fontSize: '18px' }}>🎯</span>
        <h2 className="font-semibold text-base" style={{ color: '#FF6B35', fontFamily: 'Syne, sans-serif' }}>Recommended Next Steps</h2>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>{text}</p>
    </div>
  );
}

const CATEGORY_META = {
  github_repo: { icon: '🐙', label: 'GitHub Repo' }, github_profile: { icon: '🐙', label: 'GitHub Profile' },
  linkedin: { icon: '💼', label: 'LinkedIn' }, certification: { icon: '🏅', label: 'Certification' },
  portfolio: { icon: '🌐', label: 'Portfolio / Other' },
};

function StatusChip({ status }) {
  const chips = {
    live:         { bg: 'rgba(232,164,48,0.12)', border: 'rgba(232,164,48,0.3)', text: '#E8A430', label: '✅ Live' },
    dead:         { bg: 'rgba(255,61,0,0.12)',   border: 'rgba(255,61,0,0.3)',   text: '#FF3D00', label: '❌ Dead / 404' },
    timeout:      { bg: 'rgba(255,107,53,0.12)', border: 'rgba(255,107,53,0.3)', text: '#FF6B35', label: '⏱ Timeout' },
    rate_limited: { bg: 'rgba(232,164,48,0.10)', border: 'rgba(232,164,48,0.2)', text: '#E8A430', label: '⚠ Rate-limited' },
  };
  const c = chips[status];
  if (!c) return null;
  return <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold border" style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text, fontFamily: 'JetBrains Mono, monospace' }}>{c.label}</span>;
}

function LinkVerification({ links }) {
  const [open, setOpen] = useState(true);
  if (!links || links.length === 0) return null;
  const deadCount = links.filter((l) => l.status === 'dead').length;
  return (
    <div style={panelStyle}>
      <button className="w-full flex items-center justify-between text-left border-none cursor-pointer p-0" style={{ background: 'none' }} onClick={() => setOpen((v) => !v)}>
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-base" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>Link Verification</h2>
          <span className="text-xs" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>{links.length} found</span>
          {deadCount > 0 && <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold border" style={{ backgroundColor: 'rgba(255,61,0,0.12)', borderColor: 'rgba(255,61,0,0.3)', color: '#FF3D00', fontFamily: 'JetBrains Mono, monospace' }}>{deadCount} dead</span>}
        </div>
        <span style={{ color: '#5C5550' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mt-4 space-y-2">
          {links.map((link, i) => {
            const cat = CATEGORY_META[link.category] || CATEGORY_META.portfolio;
            const shortUrl = link.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 55);
            return (
              <div key={i} className="rounded-lg p-3" style={{ backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #2A2520' }}>
                <div className="flex flex-wrap items-start gap-2">
                  <span className="shrink-0 text-base">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>{cat.label}</span>
                      <StatusChip status={link.status} />
                      {link.httpStatus && link.status !== 'live' && <span className="text-[10px]" style={{ color: '#5C5550' }}>HTTP {link.httpStatus}</span>}
                    </div>
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs break-all transition-colors"
                      style={{ color: '#FF6B35', fontFamily: 'JetBrains Mono, monospace' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#E8A430'}
                      onMouseLeave={e => e.currentTarget.style.color = '#FF6B35'}
                    >
                      {shortUrl}{link.url.length > 55 ? '…' : ''}
                    </a>
                    {link.meta && link.category === 'github_repo' && (
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        {link.meta.stars !== undefined && <span className="text-[11px]" style={{ color: '#5C5550' }}>⭐ {link.meta.stars} stars</span>}
                        {link.meta.language && <span className="text-[11px]" style={{ color: '#5C5550' }}>🔤 {link.meta.language}</span>}
                        {link.meta.lastPushed && <span className="text-[11px]" style={{ color: '#5C5550' }}>📅 Last pushed {link.meta.lastPushed}</span>}
                        {link.meta.isPrivate && <span className="text-[11px]" style={{ color: '#FF6B35' }}>🔒 Private repo</span>}
                        {link.meta.description && <span className="text-[11px] italic w-full" style={{ color: '#5C5550' }}>{link.meta.description.slice(0, 80)}</span>}
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

function UploadPanel({ onAnalyze, loading, error }) {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(f.type)) { alert('Only PDF and DOCX files are supported.'); return; }
    if (f.size > 5 * 1024 * 1024) { alert('File must be under 5 MB.'); return; }
    setFile(f);
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }, []);
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold border-l-2 pl-3" style={{ fontFamily: 'Syne, sans-serif', color: '#F5F0EB', borderLeftColor: '#FF6B35' }}>ATS Resume Analyzer</h1>
      <p className="text-sm" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Upload your resume and get an instant AI-powered ATS compatibility report.</p>

      <form onSubmit={(e) => { e.preventDefault(); if (!file) { alert('Please select a resume file first.'); return; } onAnalyze(file, jd); }} className="space-y-4">
        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop} onDragOver={onDragOver} onDragLeave={() => setDragging(false)}
          className="rounded-xl border-2 border-dashed cursor-pointer p-10 text-center transition-all duration-200"
          style={{
            borderColor: dragging ? '#FF6B35' : file ? 'rgba(232,164,48,0.4)' : '#2A2520',
            backgroundColor: dragging ? 'rgba(255,107,53,0.06)' : file ? 'rgba(232,164,48,0.03)' : '#111111',
            boxShadow: dragging ? '0 0 20px rgba(255,107,53,0.15)' : 'none',
          }}
          onMouseEnter={e => { if (!file && !dragging) e.currentTarget.style.borderColor = 'rgba(255,107,53,0.45)'; }}
          onMouseLeave={e => { if (!file && !dragging) e.currentTarget.style.borderColor = '#2A2520'; }}
        >
          <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          <div className="mx-auto w-14 h-14 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(255,107,53,0.12)' }}>
            {file
              ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8A430" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            }
          </div>
          {file
            ? <p className="font-medium" style={{ color: '#E8A430', fontFamily: 'DM Sans, sans-serif' }}>{file.name}</p>
            : <>
              <p className="font-medium" style={{ color: '#F5F0EB', fontFamily: 'DM Sans, sans-serif' }}>Drop your resume here or click to upload</p>
              <p className="text-sm mt-1" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>PDF, DOCX — Max 5 MB</p>
            </>
          }
        </div>

        {/* Job description */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
            Job Description <span style={{ color: '#5C5550', fontWeight: 400 }}>(optional — improves keyword analysis)</span>
          </label>
          <textarea
            value={jd} onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the job description here…"
            rows={4}
            className="w-full rounded-lg text-sm resize-none transition-all"
            style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520', color: '#F5F0EB', padding: '12px 16px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.55)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.10)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        {error && <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: 'rgba(255,61,0,0.10)', border: '1px solid rgba(255,61,0,0.28)', color: '#FF6B35', fontFamily: 'DM Sans, sans-serif' }}>{error}</div>}

        <button
          type="submit" disabled={loading}
          className="w-full rounded-lg py-3 px-6 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-white border-none cursor-pointer hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)', boxShadow: '0 0 20px rgba(255,107,53,0.25)', fontFamily: 'DM Sans, sans-serif' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(255,107,53,0.45)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(255,107,53,0.25)'}
        >
          {loading ? (<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Analyzing with AI…</>) : 'Analyze Resume'}
        </button>
      </form>
    </div>
  );
}

export function ResultsPanel({ analysis, linkVerification, onReset }) {
  const { score, scoreRationale, detectedRole, sectionNotes, keywordMatch, formattingIssues, improvementChecklist, nextSteps } = analysis;
  const sc = scoreColor(score);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generatePdfReport(analysis, linkVerification, 'Candidate');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold border-l-2 pl-3 flex items-center gap-3" style={{ fontFamily: 'Syne, sans-serif', color: '#F5F0EB', borderLeftColor: '#FF6B35' }}>
            ATS Resume Analyzer
            <button 
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 border-none cursor-pointer text-[#F5F0EB]"
              style={{ backgroundColor: '#FF6B35', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
            </button>
          </h1>
          {detectedRole && <p className="text-sm mt-1 pl-3" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Analyzed for: <span style={{ color: '#FF6B35', fontWeight: 600 }}>{detectedRole}</span></p>}
        </div>
        <button type="button" onClick={onReset} className="text-sm transition-colors self-start sm:self-auto border-none cursor-pointer bg-transparent" style={{ color: '#FF6B35', fontFamily: 'DM Sans, sans-serif' }}
          onMouseEnter={e => e.currentTarget.style.color = '#E8A430'}
          onMouseLeave={e => e.currentTarget.style.color = '#FF6B35'}
        >
          ← Analyze another
        </button>
      </div>

      {/* Score gauge */}
      <div className="rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520' }}>
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="scoreGradGreen" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#E8A430" /><stop offset="100%" stopColor="#FF6B35" /></linearGradient>
              <linearGradient id="scoreGradAmber" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#FF3D00" /></linearGradient>
              <linearGradient id="scoreGradRed" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FF3D00" /><stop offset="100%" stopColor="#CC2000" /></linearGradient>
            </defs>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#2A2520" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke={sc.stroke} strokeWidth="10"
              strokeDasharray={`${score * 3.1416} ${314.16 - score * 3.1416}`} strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: sc.textColor, fontFamily: 'JetBrains Mono, monospace' }}>{score}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-lg" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>{sc.label}</p>
          {scoreRationale && <p className="text-sm mt-1 leading-relaxed" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>{scoreRationale}</p>}
        </div>
      </div>

      <LinkVerification links={linkVerification} />
      {sectionNotes && <SectionNotes sectionNotes={sectionNotes} />}
      {keywordMatch && <KeywordMatch keywordMatch={keywordMatch} />}
      {formattingIssues && <FormattingIssues issues={formattingIssues} />}
      {improvementChecklist && <ImprovementChecklist items={improvementChecklist} />}
      {nextSteps && <NextSteps text={nextSteps} />}
    </div>
  );
}

export default function ATSAnalyzerSection() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (file, jobDescription) => {
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobDescription) formData.append('jobDescription', jobDescription);
      const res = await fetch(`${BACKEND}/api/ats/analyze`, { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.error || 'Analysis failed. Please try again.'); return; }
      setResult({ analysis: json.analysis, linkVerification: json.linkVerification || [] });
    } catch { setError('Could not connect to server. Make sure the backend is running on port 5000.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {result
        ? <ResultsPanel analysis={result.analysis} linkVerification={result.linkVerification} onReset={() => { setResult(null); setError(''); }} />
        : <UploadPanel onAnalyze={handleAnalyze} loading={loading} error={error} />
      }
    </div>
  );
}
