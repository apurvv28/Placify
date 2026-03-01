import React from 'react';
import { XCircle, FileWarning, Brain, TrendingDown } from 'lucide-react';

const problems = [
  {
    icon: XCircle,
    title: 'Rejection before an interview',
    description: 'Over 75% of resumes are rejected by Applicant Tracking Systems (ATS) before a human ever sees them.',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: FileWarning,
    title: 'Blind spots in your resume',
    description: 'You don’t know which keywords or formats are causing your resume to be filtered out.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Brain,
    title: 'Outdated advice',
    description: 'Generic tips from blogs don’t work anymore—AI‑driven screening requires a data‑backed approach.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingDown,
    title: 'Wasted opportunities',
    description: 'Each rejected application is a missed chance. Optimize your resume once and apply with confidence.',
    color: 'from-purple-500 to-indigo-500',
  },
];

export default function ProblemSection() {
  return (
    <section className="relative bg-black py-24 overflow-hidden">
      {/* Background grid & glow (same as Hero) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-80 h-80 bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            The{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Problem
            </span>{' '}
            with Traditional Screening
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Most resumes never reach a recruiter. Here’s why your application might be disappearing into a black hole.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              {/* Icon with gradient */}
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${problem.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <problem.icon size={28} className="text-white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{problem.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{problem.description}</p>

              {/* Animated underline on hover */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 group-hover:w-full transition-all duration-300" />
            </div>
          ))}
        </div>

        {/* Additional stat / tagline */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
            <span className="text-indigo-400 font-bold">78%</span> of top companies use ATS – don’t let your resume be filtered out.
          </div>
        </div>
      </div>
    </section>
  );
}