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
    <section className="relative bg-black py-16 md:py-20 overflow-hidden border-y border-white/5">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-[110px]" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-5">
            <Award size={14} />
            <span>For Experienced Professionals</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">
            Built for Senior Roles, Not Generic Resume Advice
          </h2>
          <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto">
            Senior resumes need clarity, measurable impact, and strategic positioning. Placify helps you modernize for ATS while preserving executive depth and credibility.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-4">What senior candidates need most</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Shield size={18} className="text-indigo-300 shrink-0 mt-0.5" />
                Position leadership outcomes instead of task lists.
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <TrendingUp size={18} className="text-indigo-300 shrink-0 mt-0.5" />
                Quantify business impact with metrics recruiters notice.
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Briefcase size={18} className="text-indigo-300 shrink-0 mt-0.5" />
                Align language to board, VP, and director-level expectations.
              </li>
            </ul>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Executive placements</p>
                <p className="text-xl sm:text-2xl font-bold text-white">+43%</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Interview rate lift</p>
                <p className="text-xl sm:text-2xl font-bold text-white">2.5x</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {seniorFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon size={20} className="text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button className="group inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
            Explore Senior Features
            <TrendingUp size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}