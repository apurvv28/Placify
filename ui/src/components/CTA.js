import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative bg-black py-24 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[200px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-6">
          <Sparkles size={14} />
          <span>Completely free – no credit card required</span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
          Ready to unlock your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            true potential
          </span>
          ?
        </h2>

        <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
          Join thousands of students and professionals who have already improved their resumes with Placify. Get your ATS score in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="group flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 transition-all px-8 py-4 rounded-full text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-1">
            Analyze Your Resume Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button className="flex items-center justify-center gap-2 text-white hover:text-indigo-300 transition-colors px-8 py-4 rounded-full text-lg font-medium border border-transparent hover:border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md">
            See Sample Report
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          🔒 No sign‑up required for basic analysis. Your privacy is our priority.
        </p>
      </div>
    </section>
  );
}