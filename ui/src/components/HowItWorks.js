import React from 'react';
import { Upload, Zap, Eye, Target } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    num: '01',
    title: 'Upload Your Resume',
    description: 'Drag & drop your PDF resume. It`s encrypted and never stored without your permission.',
  },
  {
    icon: Zap,
    num: '02',
    title: 'AI Parsing & Analysis',
    description: 'Our engine extracts text, checks ATS compatibility, and identifies missing keywords.',
  },
  {
    icon: Eye,
    num: '03',
    title: 'Get Your Score & Insights',
    description: 'Receive a detailed breakdown – from formatting issues to content gaps – with actionable tips.',
  },
  {
    icon: Target,
    num: '04',
    title: 'Apply with Confidence',
    description: 'Optimize your resume based on real data and increase your interview chances dramatically.',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden" style={{ backgroundColor: '#111111' }}>

      {/* Ember radial glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 80% 30%, rgba(255,107,53,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4"
            style={{ fontFamily: 'Syne, sans-serif', color: '#F5F0EB' }}
          >
            How{' '}
            <span style={{
              backgroundImage: 'linear-gradient(135deg, #FF6B35 0%, #E8A430 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Placify
            </span>{' '}
            Works
          </h2>
          <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
            From upload to insights in under 60 seconds. No sign‑up required to get your first score.
          </p>
        </div>

        {/* Steps */}
        <div className="relative flex flex-col md:flex-row justify-center items-start md:items-stretch gap-6 md:gap-0">
          {steps.map((step, index) => (
            <div key={index} className="relative flex-1 text-center md:text-left">

              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-8 left-[60%] right-0 h-[1px] border-dashed"
                  style={{ borderColor: '#2A2520', borderTopWidth: '1px' }}
                >
                  {/* Ember dot at end of line */}
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#FF6B35', boxShadow: '0 0 6px rgba(255,107,53,0.6)' }}
                  />
                </div>
              )}

              {/* Step card */}
              <div
                className="relative mx-2 md:mx-3 p-5 sm:p-6 h-full rounded-lg transition-all duration-200 group"
                style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520', borderLeft: '2px solid #FF6B35' }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255,107,53,0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(255,107,53,0.4)';
                  e.currentTarget.style.borderLeftColor = '#FF6B35';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#2A2520';
                  e.currentTarget.style.borderLeftColor = '#FF6B35';
                }}
              >
                {/* Decorative large step number behind card */}
                <div
                  className="absolute top-3 right-4 text-5xl font-extrabold select-none pointer-events-none"
                  style={{ color: 'rgba(255,107,53,0.10)', fontFamily: 'Syne, sans-serif', lineHeight: 1 }}
                >
                  {step.num}
                </div>

                {/* Number badge */}
                <div
                  className="absolute -top-3 left-1/2 md:left-5 -translate-x-1/2 md:translate-x-0 w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #FF6B35, #FF3D00)', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto md:mx-0 mt-4 mb-5 transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: 'rgba(255,107,53,0.10)' }}
                >
                  <step.icon size={24} style={{ color: '#FF6B35' }} />
                </div>

                <h3
                  className="text-base sm:text-lg font-bold mb-3"
                  style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer footnote */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-sm" style={{ color: '#5C5550', fontFamily: 'DM Sans, sans-serif' }}>
            *Premium users get industry‑specific keyword suggestions and competitor analysis.
          </p>
        </div>
      </div>
    </section>
  );
}