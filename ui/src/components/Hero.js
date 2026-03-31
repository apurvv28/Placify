import React, { useState } from 'react';
import { Upload, X, ArrowRight, CheckCircle, FileText, Loader2, Zap } from 'lucide-react';

const floatingUsers = [
  { id: 1, name: 'Nisha', role: 'Software Engineer', score: '96%', position: { top: '15%', right: '28%' }, delay: '0s', duration: '8s' },
  { id: 2, name: 'Soha', role: 'Data Scientist', score: '92%', position: { top: '65%', right: '35%' }, delay: '2s', duration: '9s' },
  { id: 3, name: 'Shantanu', role: 'Product Manager', score: '88%', position: { top: '25%', right: '8%' }, delay: '1s', duration: '7.5s' },
  { id: 4, name: 'Apurv', role: 'UX Designer', score: '94%', position: { top: '75%', right: '15%' }, delay: '3s', duration: '10s' },
];

const INITIALS_COLORS = ['#FF6B35', '#E8A430', '#FF3D00', '#D4621F'];

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);
  const [activeUser, setActiveUser] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a PDF file.'); return; }
    if (file.type !== 'application/pdf') { setError('Only PDF files are supported.'); return; }
    setLoading(true); setError(null);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/parse-resume`, {
        method: 'POST', body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to upload resume.');
      setSuccessData(data);
    } catch (err) {
      setError(err.message || 'Network error encountered.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); setFile(null); setSuccessData(null); setError(null);
  };

  return (
    <div
      className="relative min-h-[100vh] flex items-center overflow-hidden pt-20 m-0"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Radial ember glow background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(255,107,53,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,107,53,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,107,53,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 60%, transparent 100%)',
        }}
      />

      {/* Floating User Cards */}
      <div className="absolute inset-0 z-[5] pointer-events-none hidden md:block">
        {floatingUsers.map((user, idx) => (
          <div
            key={user.id}
            className="absolute pointer-events-auto"
            style={{ ...user.position, animationDelay: user.delay, animationDuration: user.duration, animation: `float ${user.duration} ease-in-out ${user.delay} infinite` }}
            onMouseEnter={() => setActiveUser(user.id)}
            onMouseLeave={() => setActiveUser(null)}
            onClick={() => setActiveUser(activeUser === user.id ? null : user.id)}
          >
            <div className="relative group cursor-pointer">
              {/* Avatar circle */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-all duration-300 ring-2 ring-[#2A2520] group-hover:ring-[#FF6B35]/50"
                style={{ backgroundColor: INITIALS_COLORS[idx % INITIALS_COLORS.length], boxShadow: '0 0 20px rgba(255,107,53,0.2)' }}
              >
                {user.name.charAt(0)}
              </div>

              {/* Hover popover */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 border rounded-lg p-4 shadow-2xl transition-all duration-200 origin-top ${activeUser === user.id ? 'opacity-100 scale-100 z-50' : 'opacity-0 scale-95 pointer-events-none'}`}
                style={{ backgroundColor: '#111111', borderColor: '#2A2520' }}
              >
                <div className="flex items-center gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid #2A2520' }}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: INITIALS_COLORS[idx % INITIALS_COLORS.length] }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm m-0 leading-tight" style={{ color: '#F5F0EB' }}>{user.name}</h4>
                    <p className="text-xs m-0 leading-tight mt-0.5" style={{ color: '#A89E94' }}>{user.role}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center rounded-lg p-2.5" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520' }}>
                  <span className="text-xs" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>ATS Match</span>
                  <span className="font-bold text-sm flex items-center gap-1.5" style={{ color: '#FF6B35', fontFamily: 'JetBrains Mono, monospace' }}>
                    {user.score} <CheckCircle size={12} className="text-[#E8A430]" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-14 sm:py-16 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-8 items-center">

          {/* Text content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8 animate-fade-up">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium"
              style={{ backgroundColor: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)', color: '#FF6B35', fontFamily: 'JetBrains Mono, monospace' }}
            >
              <Zap size={12} className="fill-[#FF6B35]" />
              AI-Powered Resume Intelligence
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight m-0 leading-[1.08]"
              style={{ fontFamily: 'Syne, sans-serif', color: '#F5F0EB' }}
            >
              Get Placed.<br />
              <span
                style={{
                  backgroundImage: 'linear-gradient(135deg, #FF6B35 0%, #E8A430 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Smarter.
              </span>
            </h1>

            <p className="text-base sm:text-lg max-w-md font-light m-0" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
              Get an instant ATS compatibility score and learn from successful resumes shared by peers.
              Stop guessing, start optimizing your career path.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
              <button
                onClick={() => setIsModalOpen(true)}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 border-none cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)',
                  boxShadow: '0 0 20px rgba(255,107,53,0.30)',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 35px rgba(255,107,53,0.50)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(255,107,53,0.30)'}
              >
                Analyze Your Resume for Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="/features"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  textDecoration: 'none',
                  color: '#FF6B35',
                  border: '1px solid rgba(255,107,53,0.35)',
                  backgroundColor: 'transparent',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,107,53,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,107,53,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,107,53,0.35)'; }}
              >
                Explore Features
              </a>
            </div>

            {/* Social proof stat */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs">
              {/* Avatar stack */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['#FF6B35','#E8A430','#FF3D00','#D4621F'].map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-white font-bold text-[10px]"
                      style={{ backgroundColor: c, borderColor: '#0A0A0A' }}>
                      {['N','S','A','R'][i]}
                    </div>
                  ))}
                </div>
                <p className="m-0" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
                  Trusted by <span style={{ color: '#F5F0EB', fontFamily: 'JetBrains Mono, monospace' }}>10,000+</span> students
                </p>
              </div>

              {/* Stat badges */}
              {[
                { num: '98%', label: 'ATS Score' },
                { num: '3×', label: 'More Interviews' },
              ].map(({ num, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span style={{ color: '#FF6B35', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 600 }}>{num}</span>
                  <span style={{ color: '#5C5550', fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual right side */}
          <div className="relative hidden lg:block h-[540px] xl:h-[600px] w-full mt-10 lg:mt-0">
            {/* Outer dashed ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[440px] h-[440px] rounded-full border border-dashed animate-spin-slow" style={{ borderColor: 'rgba(255,107,53,0.15)', animationDuration: '40s' }} />
              <div className="absolute w-[340px] h-[340px] rounded-full border border-dashed animate-spin-reverse-slow" style={{ borderColor: 'rgba(232,164,48,0.12)' }} />
              <div className="absolute w-[240px] h-[240px] rounded-full" style={{ backgroundColor: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.10)' }} />
            </div>

            {/* Floating document card 1 */}
            <div
              className="absolute top-1/4 right-12 p-4 rounded-lg w-48 shadow-2xl transform rotate-6 animate-float"
              style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520', animationDelay: '0s', animationDuration: '8s' }}
            >
              <div className="h-1.5 w-20 rounded mb-3" style={{ backgroundColor: '#FF6B35' }} />
              <div className="h-1.5 w-16 rounded mb-3" style={{ backgroundColor: '#2A2520' }} />
              <div className="h-1.5 w-24 rounded mb-3" style={{ backgroundColor: '#2A2520' }} />
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs font-medium" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>ATS Score</span>
                <span className="font-bold text-sm" style={{ color: '#FF6B35', fontFamily: 'JetBrains Mono, monospace' }}>92%</span>
              </div>
            </div>

            {/* Floating document card 2 */}
            <div
              className="absolute bottom-1/4 left-10 p-4 rounded-lg w-48 shadow-2xl transform -rotate-6 animate-float"
              style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520', animationDelay: '2s', animationDuration: '9s' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={14} className="text-[#E8A430]" />
                <div className="h-1.5 w-16 rounded" style={{ backgroundColor: '#E8A430' }} />
              </div>
              <div className="h-1.5 w-full rounded mb-2" style={{ backgroundColor: '#2A2520' }} />
              <div className="h-1.5 w-5/6 rounded mb-2" style={{ backgroundColor: '#2A2520' }} />
              <div className="h-1.5 w-4/6 rounded" style={{ backgroundColor: '#2A2520' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal} />
          <div
            className="relative w-full max-w-md p-5 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-xl"
            style={{ backgroundColor: '#111111', border: '1px solid #2A2520' }}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 transition bg-transparent border-none cursor-pointer"
              style={{ color: '#A89E94' }}
              onMouseEnter={e => e.currentTarget.style.color = '#F5F0EB'}
              onMouseLeave={e => e.currentTarget.style.color = '#A89E94'}
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-2 m-0" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>Upload Resume</h2>
            <p className="text-sm mb-6 mt-1" style={{ color: '#A89E94' }}>Upload your PDF resume to get an instant extraction and compatibility preview.</p>

            {!successData ? (
              <form onSubmit={handleSubmit}>
                <div
                  className="border-2 border-dashed rounded-xl p-5 sm:p-8 text-center group relative cursor-pointer transition-all duration-200"
                  style={{ borderColor: '#2A2520', backgroundColor: 'rgba(255,107,53,0.02)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,107,53,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2520'}
                >
                  <input
                    type="file" accept=".pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange} disabled={loading}
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: 'rgba(255,107,53,0.12)' }}
                    >
                      {file ? <FileText size={24} style={{ color: '#FF6B35' }} /> : <Upload size={24} style={{ color: '#FF6B35' }} />}
                    </div>
                    {file ? (
                      <div>
                        <p className="font-medium m-0" style={{ color: '#F5F0EB' }}>{file.name}</p>
                        <p className="text-sm m-0" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <p className="m-0" style={{ color: '#A89E94' }}>Click or drag PDF here to upload</p>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 rounded-lg text-sm text-center" style={{ backgroundColor: 'rgba(255,61,0,0.1)', border: '1px solid rgba(255,61,0,0.25)', color: '#FF6B35' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit" disabled={!file || loading}
                  className="w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition px-6 py-3 rounded-lg text-base font-semibold border-none cursor-pointer text-white"
                  style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)' }}
                >
                  {loading ? (<><Loader2 size={20} className="animate-spin" />Processing...</>) : 'Analyze Now'}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: 'rgba(232,164,48,0.08)', border: '1px solid rgba(232,164,48,0.2)', color: '#E8A430' }}>
                  <CheckCircle className="shrink-0 mt-0.5" size={20} />
                  <div><p className="font-semibold m-0">{successData.message}</p></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2 m-0" style={{ color: '#A89E94' }}>
                    <FileText size={16} /> Data Extracted Preview:
                  </h3>
                  <div className="rounded-lg p-4 h-48 overflow-y-auto custom-scrollbar" style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid #2A2520' }}>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap m-0" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>
                      {successData.snippet}...
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full transition px-6 py-3 rounded-lg text-base font-semibold cursor-pointer"
                  style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520', color: '#A89E94' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.4)'; e.currentTarget.style.color = '#F5F0EB'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.color = '#A89E94'; }}
                >
                  Close & View Full Report (Coming Soon)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
