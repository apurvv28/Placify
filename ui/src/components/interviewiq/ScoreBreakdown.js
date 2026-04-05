import React from 'react';

export default function ScoreBreakdown({ response }) {
  const llmTotal =
    Number(response?.llmScores?.clarity || 0) +
    Number(response?.llmScores?.relevance || 0) +
    Number(response?.llmScores?.depth || 0) +
    Number(response?.llmScores?.communication || 0) +
    Number(response?.llmScores?.starScore || 0);

  const keywordScore = Number(response?.keywordScores?.keywordScore || 0);
  const antiCheatFlag = response?.antiCheatResult?.cheatDetected;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
        <p className="text-stone-100 font-medium break-all">Question {response?.questionId}</p>
        <span className="text-orange-300 font-semibold">Final: {response?.finalScore ?? '-'}%</span>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mt-3">
        <div className="rounded-lg border border-orange-400/30 px-3 py-2 bg-orange-500/5">
          <p className="text-xs text-stone-400">LLM Score</p>
          <p className="text-lg font-semibold text-orange-300">{llmTotal}</p>
        </div>

        <div className="rounded-lg border border-amber-400/30 px-3 py-2 bg-amber-500/5">
          <p className="text-xs text-stone-400">Keyword Match</p>
          <p className="text-lg font-semibold text-amber-300">{keywordScore}%</p>
        </div>

        <div className="rounded-lg border border-white/10 px-3 py-2 bg-black/30">
          <p className="text-xs text-stone-400">Anti-Cheat</p>
          <p className={`text-lg font-semibold ${antiCheatFlag ? 'text-rose-300' : 'text-emerald-300'}`}>
            {antiCheatFlag ? 'Flagged' : 'Clean'}
          </p>
        </div>
      </div>
    </div>
  );
}
