import React from 'react';
import { Briefcase, Award, TrendingUp, Shield } from 'lucide-react';

const seniorFeatures = [
  {
    icon: Briefcase,
    title: 'Executive‑Level Optimization',
    description: 'Tailored feedback for leadership roles – highlight impact, not just responsibilities.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Award,
    title: 'Showcase Achievements',
    description: 'Learn how to quantify your experience and stand out to senior recruiters.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: TrendingUp,
    title: 'Career Transition Support',
    description: 'Switching industries? Get keyword suggestions for your new path.',
    color: 'from-green-400 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data is never shared – we respect your seniority and discretion.',
    color: 'from-amber-400 to-orange-500',
  },
];

export default function ForSeniorsSection() {
  return (
    <section className="relative bg-black py-24 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/20 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side: text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-6">
              <Award size={14} />
              <span>For Experienced Professionals</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Senior <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Doesn’t Mean Obsolete
              </span>
            </h2>

            <p className="text-lg text-gray-400 mb-8">
              Your experience is your greatest asset – but only if it’s presented right. Placify helps senior professionals adapt their resumes for modern ATS without losing their unique value.
            </p>

            <ul className="space-y-4">
              {seniorFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shrink-0 mt-1`}
                  >
                    <feature.icon size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{feature.title}</h4>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <button className="mt-8 group flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/10 px-6 py-3 rounded-full text-base font-medium transition-all hover:-translate-y-1">
              Learn More About Senior Features
              <TrendingUp size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right side: abstract graphic */}
          <div className="relative hidden lg:block h-[500px] perspective-1000">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-96 h-96">
                {/* Rotating rings */}
                <div className="absolute inset-0 rounded-full border border-indigo-500/30 border-dashed animate-spin-slow" style={{ animationDuration: '30s' }} />
                <div className="absolute inset-4 rounded-full border border-purple-500/30 border-dashed animate-spin-reverse-slow" style={{ animationDuration: '20s' }} />
                <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 backdrop-blur-3xl" />

                {/* Floating stat cards */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl w-48 shadow-2xl animate-float">
                  <p className="text-xs text-gray-300">Executive placements</p>
                  <p className="text-2xl font-bold text-white">+43%</p>
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl w-48 shadow-2xl animate-float" style={{ animationDelay: '1s' }}>
                  <p className="text-xs text-gray-300">Interview rate increase</p>
                  <p className="text-2xl font-bold text-white">2.5x</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}