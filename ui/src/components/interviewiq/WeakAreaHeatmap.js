import React from 'react';

export default function WeakAreaHeatmap({ heatmap }) {
  if (!heatmap?.available) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-stone-100 font-semibold">Weak Area Heatmap</p>
        <p className="text-sm text-stone-400 mt-2">{heatmap?.message || 'Complete more attempts to unlock heatmap.'}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
        <p className="text-stone-100 font-semibold">Weak Area Heatmap</p>
        <p className="text-xs text-stone-400 break-words">Focus areas: {heatmap.focusAreas.join(', ')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
        {(heatmap.categories || []).map((cell) => (
          <div key={cell.category} className={`rounded-xl border border-white/10 p-3 ${cell.percentileColor}`}>
            <p className="text-sm text-stone-100">{cell.category}</p>
            <p className="text-lg text-orange-200 font-semibold">{cell.averageScore}%</p>
            <p className="text-xs text-stone-400">{cell.attempts} attempts</p>
          </div>
        ))}
      </div>
    </div>
  );
}
