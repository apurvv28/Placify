import React, { useState } from 'react';
import { Upload, X, ArrowRight, CheckCircle, FileText, Loader2, Sparkles, User } from 'lucide-react';

const floatingUsers = [
  { id: 1, name: 'Nisha', role: 'Software Engineer', score: '96%', position: { top: '15%', right: '28%' }, delay: '0s', duration: '8s', color: 'from-pink-500 to-rose-500' },
  { id: 2, name: 'Rahul', role: 'Data Scientist', score: '92%', position: { top: '65%', right: '35%' }, delay: '2s', duration: '9s', color: 'from-blue-500 to-cyan-500' },
  { id: 3, name: 'Sneha', role: 'Product Manager', score: '88%', position: { top: '25%', right: '8%' }, delay: '1s', duration: '7s', color: 'from-green-400 to-emerald-500' },
  { id: 4, name: 'Amit', role: 'UX Designer', score: '94%', position: { top: '75%', right: '15%' }, delay: '3s', duration: '10s', color: 'from-amber-400 to-orange-500' },
  { id: 5, name: 'Nikhil', role: 'Backend Engineer', score: '91%', position: { top: '45%', right: '22%' }, delay: '1.5s', duration: '8.5s', color: 'from-purple-500 to-violet-500' },
];

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
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      // Calls the Express backend on port 5000
      const response = await fetch('http://localhost:5000/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload resume.');
      }

      setSuccessData(data);
    } catch (err) {
      setError(err.message || 'Network error encountered.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFile(null);
    setSuccessData(null);
    setError(null);
  };

  return (
    <div className="relative min-h-[100vh] bg-black text-white flex items-center overflow-hidden pt-20 m-0">
      {/* Background Graphic elements inspired by premium 3D/abstract styles */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[150px] mix-blend-screen" />
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Floating User Icons */}
      <div className="absolute inset-0 z-[5] pointer-events-none hidden md:block">
        {floatingUsers.map((user) => (
          <div
            key={user.id}
            className="absolute animate-float pointer-events-auto"
            style={{
              ...user.position,
              animationDelay: user.delay,
              animationDuration: user.duration,
            }}
            onMouseEnter={() => setActiveUser(user.id)}
            onMouseLeave={() => setActiveUser(null)}
            onClick={() => setActiveUser(activeUser === user.id ? null : user.id)}
          >
            <div className="relative group cursor-pointer">
              {/* User Avatar Circle */}
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 border-2 border-white/20`}>
                {user.name.charAt(0)}
              </div>
              
              {/* Tooltip / Info Popover */}
              <div 
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl transition-all duration-300 origin-top ${activeUser === user.id ? 'opacity-100 scale-100 z-50' : 'opacity-0 scale-95 pointer-events-none'}`}
              >
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm m-0 leading-tight">{user.name}</h4>
                    <p className="text-gray-400 text-xs m-0 leading-tight mt-1">{user.role}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/5">
                  <span className="text-xs text-gray-300 font-medium">ATS Match</span>
                  <span className="text-white font-bold text-sm flex items-center gap-1.5">
                    {user.score} <CheckCircle size={14} className="text-green-400" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300">
              <Sparkles size={14} />
              <span>Version 2.0 AI Parsing Engine Live</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight m-0">
              Land Your Dream Job with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                AI-Powered 
              </span> Intelligence.
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl font-light m-0">
              Get an instant ATS compatibility score and learn from successful resumes shared by peers. 
              Stop guessing, start optimizing your career path.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="group flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 transition-all px-8 py-4 rounded-full text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-1 border-none cursor-pointer"
              >
                Analyze Your Resume for Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <a 
                href="#library"
                className="flex items-center justify-center gap-2 text-white hover:text-indigo-300 transition-colors px-8 py-4 rounded-full text-lg font-medium border border-transparent hover:border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md"
                style={{ textDecoration: 'none' }}
              >
                Browse the Library
              </a>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-black bg-gradient-to-br from-indigo-${i*200} to-purple-500`} />
                ))}
              </div>
              <p className="m-0">Trusted by <span className="text-white font-bold">10,000+</span> students</p>
            </div>
          </div>

          {/* Abstract Visual Graphic (Right side) */}
          <div className="relative hidden lg:block h-[600px] w-full mt-10 lg:mt-0 perspective-1000">
            <div className="absolute inset-0 flex items-center justify-center animate-spin-slow" style={{ animationDuration: '40s' }}>
              <div className="w-[450px] h-[450px] rounded-full border border-indigo-500/30 border-dashed" />
              <div className="absolute w-[350px] h-[350px] rounded-full border border-purple-500/30 border-dashed animate-spin-reverse-slow" style={{ animationDuration: '25s' }} />
              <div className="absolute w-[250px] h-[250px] rounded-full border border-pink-500/30 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 backdrop-blur-3xl animate-pulse" />
            </div>
            
            {/* Floating Document cards */}
            <div className="absolute top-1/4 right-20 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl w-48 shadow-2xl transform rotate-6 animate-float" style={{ animationDelay: '0s' }}>
              <div className="h-2 w-20 bg-indigo-400 rounded-full mb-3" />
              <div className="h-2 w-16 bg-gray-500 rounded-full mb-3" />
              <div className="h-2 w-24 bg-gray-500 rounded-full mb-3" />
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-indigo-300 font-bold">ATS Score</span>
                <span className="text-green-400 font-bold">92%</span>
              </div>
            </div>

            <div className="absolute bottom-1/4 left-10 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl w-48 shadow-2xl transform -rotate-6 animate-float" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={16} className="text-green-400" />
                <div className="h-2 w-16 bg-green-400 rounded-full" />
              </div>
              <div className="h-2 w-full bg-gray-500 rounded-full mb-2" />
              <div className="h-2 w-5/6 bg-gray-500 rounded-full mb-2" />
              <div className="h-2 w-4/6 bg-gray-500 rounded-full" />
            </div>
          </div>

        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal} />
          
          <div className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl transition-all">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition bg-transparent border-none cursor-pointer"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-2 m-0 text-white">Upload Resume</h2>
            <p className="text-gray-400 text-sm mb-6 mt-1">Upload your PDF resume to get an instant extraction and compatibility preview.</p>

            {!successData ? (
              <form onSubmit={handleSubmit}>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors group relative cursor-pointer bg-white/5">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      {file ? <FileText size={24} /> : <Upload size={24} />}
                    </div>
                    {file ? (
                      <div>
                        <p className="text-white font-medium m-0">{file.name}</p>
                        <p className="text-sm text-gray-500 m-0">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <p className="text-gray-400 m-0">Click or drag PDF here to upload</p>
                    )}
                  </div>
                </div>

                {error && (
                   <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                     {error}
                   </div>
                )}

                <button 
                  type="submit" 
                  disabled={!file || loading}
                  className="w-full mt-6 flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition px-6 py-3 rounded-lg text-base font-bold border-none cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Analyze Now'
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 text-green-400">
                  <CheckCircle className="shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold m-0">{successData.message}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 m-0">
                    <FileText size={16} /> Data Extracted Preview:
                  </h3>
                  <div className="bg-black/50 border border-white/10 rounded-lg p-4 h-48 overflow-y-auto custom-scrollbar">
                    <p className="text-xs text-gray-400 leading-relaxed font-mono whitespace-pre-wrap m-0">
                      {successData.snippet}...
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={closeModal}
                  className="w-full bg-white/10 hover:bg-white/20 text-white transition px-6 py-3 rounded-lg text-base font-bold border border-white/5 cursor-pointer mt-4"
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
