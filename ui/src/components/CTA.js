import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-[#0A0A0A] font-sans">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="absolute w-[800px] h-[800px] rounded-full blur-[200px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #2A2520 1px, transparent 1px), linear-gradient(to bottom, #2A2520 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ backgroundColor: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)', color: '#FF6B35', fontFamily: 'JetBrains Mono, monospace' }}>
          <Sparkles size={14} className="animate-pulse" />
          <span>No Credit Card Required</span>
        </div>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-8 tracking-tight" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>
          Accelerate your{' '}
          <span style={{ color: 'transparent', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(135deg, #FF6B35 0%, #E8A430 100%)' }}>
            career trajectory
          </span>.
        </h2>

        <p className="text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
          Join elite candidates using Placify's professional grade tools to optimize their resumes and confidently navigate the placement season.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/auth"
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition-all text-white hover:scale-105"
            style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)', boxShadow: '0 0 40px rgba(255,107,53,0.3)', fontFamily: 'DM Sans, sans-serif' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 60px rgba(255,107,53,0.5)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(255,107,53,0.3)'}
          >
            Start Analyzing Now
            <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>

          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition-all cursor-pointer border"
            style={{ backgroundColor: 'transparent', borderColor: '#2A2520', color: '#F5F0EB', fontFamily: 'DM Sans, sans-serif' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1C1C1C'; e.currentTarget.style.borderColor = 'rgba(232,164,48,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#2A2520'; }}
          >
            View Sample Report
          </button>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest mt-10 opacity-70" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>
          🔒 Bank-level data encryption • 100% Privacy
        </p>
      </div>
    </section>
  );
}