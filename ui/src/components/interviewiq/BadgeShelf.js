import React from 'react';

const MILESTONES = [
  { id: 'deck-1', name: 'Deck 1', icon: '🥉' },
  { id: 'deck-5', name: 'Deck 5', icon: '🏅' },
  { id: 'deck-10', name: 'Deck 10', icon: '🎖️' },
  { id: 'deck-50', name: 'Deck 50', icon: '🏆' },
  { id: 'deck-100', name: 'Deck 100', icon: '👑' },
  { id: 'perfect-round', name: 'Perfect Round', icon: '✨' },
  { id: 'streak-7', name: '7-Day Streak', icon: '🔥' },
  { id: 'star-master', name: 'STAR Master', icon: '⭐' },
];

export default function BadgeShelf({ badges = [] }) {
  const unlocked = new Map((badges || []).map((badge) => [badge.id, badge]));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
      <p className="text-stone-100 font-semibold mb-3">Badges</p>
      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {MILESTONES.map((badge) => {
          const isUnlocked = unlocked.has(badge.id);
          const unlockedBadge = unlocked.get(badge.id);

          return (
            <div
              key={badge.id}
              className={`min-w-[120px] rounded-xl border p-3 ${
                isUnlocked
                  ? 'border-orange-400/40 bg-orange-500/10 animate-fade-up'
                  : 'border-white/10 bg-black/25 opacity-70'
              }`}
            >
              <p className="text-xl">{isUnlocked ? badge.icon : '🔒'}</p>
              <p className="text-xs sm:text-sm text-stone-100 mt-1">{badge.name}</p>
              <p className="text-[11px] text-stone-400 mt-1">
                {isUnlocked && unlockedBadge?.unlockedAt ? 'Unlocked' : 'Locked'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
