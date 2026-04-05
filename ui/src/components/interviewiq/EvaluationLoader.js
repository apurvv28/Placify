import React from 'react';

const steps = [
  'Model 1: Transcript + LLM analysis',
  'Model 2: Anti-cheat frame checks',
  'Model 3: Keyword heuristic scoring',
];

export default function EvaluationLoader() {
  return (
    <div className="rounded-2xl border border-orange-400/30 bg-black/30 backdrop-blur-xl p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-full border-2 border-orange-300 border-t-transparent animate-spin" />
        <p className="text-stone-100 font-semibold text-sm sm:text-base">AI is evaluating your response...</p>
      </div>

      <div className="space-y-3">
        {steps.map((label, idx) => (
          <div
            key={label}
            className="animate-pulse rounded-lg px-3 py-2 bg-white/5 border border-white/10"
            style={{ animationDelay: `${idx * 180}ms` }}
          >
            <p className="text-sm text-stone-300">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
