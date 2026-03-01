import React from 'react';
import { Upload, Zap, Eye, Target } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Resume',
    description: 'Drag & drop your PDF resume. It’s encrypted and never stored without your permission.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Zap,
    title: 'AI Parsing & Analysis',
    description: 'Our engine extracts text, checks ATS compatibility, and identifies missing keywords.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Eye,
    title: 'Get Your Score & Insights',
    description: 'Receive a detailed breakdown – from formatting issues to content gaps – with actionable tips.',
    color: 'from-green-400 to-emerald-500',
  },
  {
    icon: Target,
    title: 'Apply with Confidence',
    description: 'Optimize your resume based on real data and increase your interview chances dramatically.',
    color: 'from-amber-400 to-orange-500',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-black py-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            How{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Placify
            </span>{' '}
            Works
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            From upload to insights in under 60 seconds. No sign‑up required to get your first score.
          </p>
        </div>

        {/* Steps with connecting line */}
        <div className="relative flex flex-col md:flex-row justify-center items-start md:items-stretch gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative flex-1 text-center md:text-left group">
              {/* Connector line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-white/10 to-transparent" />
              )}

              {/* Step card */}
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full hover:bg-white/10 transition-all duration-300 hover:-translate-y-2">
                {/* Number badge */}
                <div className="absolute -top-3 left-1/2 md:left-6 -translate-x-1/2 md:translate-x-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto md:mx-0 mt-4 mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <step.icon size={28} className="text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Demo hint */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            *Premium users get industry‑specific keyword suggestions and competitor analysis.
          </p>
        </div>
      </div>
    </section>
  );
}