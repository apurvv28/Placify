import React from 'react';
import { Link } from 'react-router-dom';

export default function DeckCard({ deckNumber, unlocked, completed, score }) {
  const cardClass = unlocked
    ? 'border-orange-400/40 hover:border-orange-300/70 hover:-translate-y-0.5'
    : 'border-stone-700/60 opacity-70';

  return (
    <div className={`rounded-2xl border bg-white/5 backdrop-blur-xl p-4 transition-all duration-200 ${cardClass}`}>
      <div className="flex items-center justify-between">
        <p className="text-stone-100 font-semibold">Deck {deckNumber}</p>
        <span className="text-xs px-2 py-1 rounded-full bg-black/30 border border-white/10 text-stone-300">
          {completed ? 'Completed' : unlocked ? 'Unlocked' : 'Locked'}
        </span>
      </div>

      <p className="text-xs text-stone-400 mt-2">3 questions: easy + medium + hard</p>
      <p className="text-sm mt-3 text-orange-300">{completed ? `Avg Rating: ${score ?? '-'}/10` : 'Not attempted yet'}</p>

      {unlocked ? (
        <Link
          to={`/interviewiq/deck/${deckNumber}`}
          className="mt-4 inline-flex items-center justify-center w-full rounded-lg px-3 py-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-400 text-black"
        >
          {completed ? 'Review Deck' : 'Start Deck'}
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-4 inline-flex items-center justify-center w-full rounded-lg px-3 py-2 text-sm font-semibold bg-stone-800 text-stone-500 cursor-not-allowed"
        >
          Locked
        </button>
      )}
    </div>
  );
}
