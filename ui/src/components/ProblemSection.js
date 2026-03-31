import React from 'react';
import { XCircle, FileWarning, Brain, TrendingDown } from 'lucide-react';

const problems = [
  {
    icon: XCircle,
    title: 'Rejection before an interview',
    description: 'Over 75% of resumes are rejected by Applicant Tracking Systems (ATS) before a human ever sees them.',
    num: '01',
  },
  {
    icon: FileWarning,
    title: 'Blind spots in your resume',
    description: 'You don`t know which keywords or formats are causing your resume to be filtered out.',
    num: '02',
  },
  {
    icon: Brain,
    title: 'Outdated advice',
    description: 'Generic tips from blogs don`t work anymore—AI‑driven screening requires a data‑backed approach.',
    num: '03',
  },
  {
    icon: TrendingDown,
    title: 'Wasted opportunities',
    description: 'Each rejected application is a missed chance. Optimize your resume once and apply with confidence.',
    num: '04',
  },
];

export default function ProblemSection() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden" style={{ backgroundColor: '#0A0A0A' }}>

      {/* Ember radial glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 20% 60%, rgba(255,107,53,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-up">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4"
            style={{ fontFamily: 'Syne, sans-serif', color: '#F5F0EB' }}
          >
            The{' '}
            <span style={{
              backgroundImage: 'linear-gradient(135deg, #FF6B35 0%, #E8A430 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Problem
            </span>{' '}
            with Traditional Screening
          </h2>
          <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
            Most resumes never reach a recruiter. Here's why your application might be disappearing into a black hole.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group relative p-5 sm:p-6 rounded-lg transition-all duration-200 cursor-default"
              style={{ backgroundColor: '#111111', border: '1px solid #2A2520' }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,107,53,0.35)';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(255,107,53,0.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2A2520';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Card number — top right */}
              <span
                className="absolute top-4 right-4 text-xs font-medium"
                style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace' }}
              >
                {problem.num}
              </span>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: 'rgba(255,107,53,0.10)' }}
              >
                <problem.icon size={24} style={{ color: '#FF6B35' }} />
              </div>

              <h3
                className="text-base sm:text-lg font-bold mb-3"
                style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}
              >
                {problem.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
                {problem.description}
              </p>

              {/* Bottom ember line on hover */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-full transition-all duration-300 rounded-b-lg"
                style={{ background: 'linear-gradient(90deg, #FF6B35, #E8A430)' }}
              />
            </div>
          ))}
        </div>

        {/* Bottom stat */}
        <div className="mt-12 md:mt-16 text-center">
          <div
            className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm"
            style={{ backgroundColor: '#111111', border: '1px solid #2A2520', color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}
          >
            <span style={{ color: '#FF6B35', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>78%</span>
            of top companies use ATS – don't let your resume be filtered out.
          </div>
        </div>
      </div>
    </section>
  );
}