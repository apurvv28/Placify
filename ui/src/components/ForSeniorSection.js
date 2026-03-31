import React from 'react';
import { Briefcase, Award, TrendingUp, Shield } from 'lucide-react';

const seniorFeatures = [
  {
    icon: Briefcase,
    title: 'Executive‑Level Optimization',
    description: 'Tailored feedback for leadership roles – highlight impact, not just responsibilities.',
    color: 'from-[#FF6B35] to-[#FF3D00]',
    bg: 'rgba(255,107,53,0.1)'
  },
  {
    icon: Award,
    title: 'Showcase Achievements',
    description: 'Learn how to quantify your experience and stand out to senior recruiters.',
    color: 'from-[#E8A430] to-[#FF6B35]',
    bg: 'rgba(232,164,48,0.1)'
  },
  {
    icon: TrendingUp,
    title: 'Career Transition Support',
    description: 'Switching industries? Get keyword suggestions for your new path.',
    color: 'from-[#FF3D00] to-[#E8A430]',
    bg: 'rgba(255,61,0,0.1)'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data is never shared – we respect your seniority and discretion.',
    color: 'from-[#FF8C5A] to-[#FF6B35]',
    bg: 'rgba(255,140,90,0.1)'
  },
];

export default function ForSeniorsSection() {
  return (
    <section className="relative py-20 md:py-24 overflow-hidden border-y" style={{ backgroundColor: '#0A0A0A', borderColor: '#1C1C1C', fontFamily: 'DM Sans, sans-serif' }}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[400px] h-[400px] rounded-full blur-[150px] opacity-20" style={{ backgroundColor: '#FF6B35' }} />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full blur-[150px] opacity-20" style={{ backgroundColor: '#E8A430' }} />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, #2A2520 1px, transparent 1px), linear-gradient(to bottom, #2A2520 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-6" style={{ backgroundColor: 'rgba(232,164,48,0.1)', borderColor: 'rgba(232,164,48,0.25)', color: '#E8A430', fontFamily: 'JetBrains Mono, monospace' }}>
            <Award size={14} />
            <span>For Experienced Professionals</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 tracking-tight" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>
            Engineered for Senior Roles, <br className="hidden md:block"/> Not Generic Advice
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed" style={{ color: '#A89E94' }}>
            Senior resumes demand clarity, measurable impact, and strategic positioning. Placify modernizes your profile for ATS algorithms while preserving your executive depth.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          <div className="lg:col-span-2 rounded-2xl p-8 transition-colors" style={{ backgroundColor: '#111111', border: '1px solid #2A2520' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(232,164,48,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2520'}
          >
            <h3 className="text-xl font-bold mb-6" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>What leadership candidates need</h3>
            <ul className="space-y-4 mb-8 m-0 p-0 list-none">
              <li className="flex items-start gap-4 text-sm font-medium" style={{ color: '#A89E94' }}>
                <Shield size={20} className="shrink-0 mt-0.5" style={{ color: '#E8A430' }} />
                Position leadership outcomes over standard task lists.
              </li>
              <li className="flex items-start gap-4 text-sm font-medium" style={{ color: '#A89E94' }}>
                <TrendingUp size={20} className="shrink-0 mt-0.5" style={{ color: '#E8A430' }} />
                Quantify business impact with metrics recruiters notice.
              </li>
              <li className="flex items-start gap-4 text-sm font-medium" style={{ color: '#A89E94' }}>
                <Briefcase size={20} className="shrink-0 mt-0.5" style={{ color: '#E8A430' }} />
                Align phrasing to board, VP, and Director-level expectations.
              </li>
            </ul>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-5" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>Exec Placements</p>
                <p className="text-2xl sm:text-3xl font-black" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>+43%</p>
              </div>
              <div className="rounded-xl p-5" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}>Interview Lift</p>
                <p className="text-2xl sm:text-3xl font-black" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>2.5x</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {seniorFeatures.map((feature, idx) => (
              <div key={idx} className="rounded-2xl p-6 transition-all group cursor-pointer" style={{ backgroundColor: '#111111', border: '1px solid #2A2520' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1C1C1C'; e.currentTarget.style.borderColor = 'rgba(255,107,53,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon size={22} color="#fff" />
                </div>
                <h4 className="font-bold text-lg mb-2" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>{feature.title}</h4>
                <p className="text-sm leading-relaxed font-medium" style={{ color: '#A89E94' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <button className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-colors border-none cursor-pointer"
            style={{ backgroundColor: 'rgba(232,164,48,0.1)', color: '#E8A430', border: '1px solid rgba(232,164,48,0.3)', fontFamily: 'JetBrains Mono, monospace' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(232,164,48,0.2)'; e.currentTarget.style.color = '#F5F0EB'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(232,164,48,0.1)'; e.currentTarget.style.color = '#E8A430'; }}
          >
            Explore Masterclass
            <TrendingUp size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}