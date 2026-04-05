import React from 'react';

export default function StreakCounter({ currentStreak = 0, longestStreak = 0 }) {
  return (
    <div className="rounded-2xl border border-orange-400/30 bg-orange-500/10 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="text-stone-100 font-semibold">Current Streak: {currentStreak} day(s)</p>
          <p className="text-xs text-stone-300">Longest streak: {longestStreak} day(s)</p>
        </div>
      </div>
    </div>
  );
}
