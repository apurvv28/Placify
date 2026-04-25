import React from 'react';

export default function ScoreBreakdown({ response }) {
  const starRating = Number(response?.llmScores?.starRating ?? response?.finalScore ?? 0);
  const strengths = response?.llmScores?.strengths || [];
  const improvements = response?.llmScores?.improvements || [];
  const fillerWordCount = response?.llmScores?.fillerWordCount || 0;

  // Generate star visualization
  const fullStars = Math.floor(starRating);
  const hasHalfStar = starRating % 1 >= 0.5;
  const emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0);

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="text-orange-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-orange-400">⯨</span>);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-stone-600">★</span>);
    }
    return stars;
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3">
        <p className="text-stone-100 font-medium">Question {response?.questionId}</p>
        <div className="flex items-center gap-2">
          <div className="flex text-lg">{renderStars()}</div>
          <span className="text-orange-300 font-semibold text-lg">
            {Number.isFinite(starRating) ? starRating.toFixed(1) : '-'}/10
          </span>
        </div>
      </div>

      {response?.llmScores?.overallFeedback ? (
        <div className="mt-3 p-3 rounded-lg bg-black/30 border border-white/5">
          <p className="text-xs uppercase text-stone-400 mb-1">Overall Feedback</p>
          <p className="text-sm text-stone-300">{response.llmScores.overallFeedback}</p>
        </div>
      ) : null}

      {strengths.length > 0 ? (
        <div className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-400/20">
          <p className="text-xs uppercase text-emerald-300 mb-2 font-semibold">✓ Strengths</p>
          <ul className="space-y-1">
            {strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-stone-300 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {improvements.length > 0 ? (
        <div className="mt-3 p-3 rounded-lg bg-orange-500/5 border border-orange-400/20">
          <p className="text-xs uppercase text-orange-300 mb-2 font-semibold">→ Areas for Improvement</p>
          <ul className="space-y-1">
            {improvements.map((improvement, idx) => (
              <li key={idx} className="text-sm text-stone-300 flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">•</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {fillerWordCount > 0 ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-stone-400">
          <span>Filler words detected:</span>
          <span className="font-semibold text-stone-300">{fillerWordCount}</span>
        </div>
      ) : null}
    </div>
  );
}
