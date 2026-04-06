import React from 'react';

export default function ScoreBreakdown({ response }) {
  const starRating = Number(response?.llmScores?.starRating ?? response?.finalScore ?? 0);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
        <p className="text-stone-100 font-medium break-all">Question {response?.questionId}</p>
        <span className="text-orange-300 font-semibold">Rating: {Number.isFinite(starRating) ? starRating.toFixed(1) : '-'}/10</span>
      </div>

      {response?.llmScores?.overallFeedback ? (
        <p className="mt-3 text-sm text-stone-300">{response.llmScores.overallFeedback}</p>
      ) : null}
    </div>
  );
}
