import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import DeckCard from './DeckCard';
import BadgeShelf from './BadgeShelf';
import WeakAreaHeatmap from './WeakAreaHeatmap';
import StreakCounter from './StreakCounter';
import { interviewIqApi } from './api';
import InterviewIQLayout from './InterviewIQLayout';

export default function InterviewIQDashboardPage() {
  const token = localStorage.getItem('placifyToken');
  const [progress, setProgress] = useState(null);
  const [heatmap, setHeatmap] = useState({ available: false, categories: [], focusAreas: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [progressData, heatmapData] = await Promise.all([
          interviewIqApi.getProgress(),
          interviewIqApi.getHeatmap().catch(() => ({ available: false, categories: [], focusAreas: [] })),
        ]);
        setProgress(progressData);
        setHeatmap(heatmapData);
      } catch (err) {
        setError(err.message || 'Failed to load InterviewIQ dashboard.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const decks = useMemo(() => {
    const completedDecks = progress?.completedDecks || [];
    const completedSet = new Set(completedDecks);
    const batchIndex = Math.floor(completedDecks.length / 8);
    const startDeck = batchIndex * 8 + 1;
    const endDeck = Math.min(startDeck + 7, 100);

    return Array.from({ length: endDeck - startDeck + 1 }, (_, idx) => startDeck + idx).map((deckNumber) => ({
      deckNumber,
      unlocked: deckNumber <= Number(progress?.currentDeck || 1),
      completed: completedSet.has(deckNumber),
      score: null,
    }));
  }, [progress]);

  const deckWindow = useMemo(() => {
    const completedCount = (progress?.completedDecks || []).length;
    const batchIndex = Math.floor(completedCount / 8);
    const startDeck = batchIndex * 8 + 1;
    const endDeck = Math.min(startDeck + 7, 100);
    return { startDeck, endDeck };
  }, [progress]);

  if (!token) return <Navigate to="/auth" replace />;

  return (
    <InterviewIQLayout>
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="max-w-7xl mx-auto space-y-6">
        <header className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-orange-300">InterviewIQ</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-100" style={{ fontFamily: 'Syne, sans-serif' }}>
                HR Interview Preparation
              </h1>
              <p className="text-sm text-stone-400 mt-1">Deck-based practice with AI evaluation, badges, and weak-area tracking.</p>
            </div>
            <div className="flex w-full md:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Link to={`/interviewiq/deck/${progress?.currentDeck || 1}`} className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 text-black font-semibold text-sm text-center">
                Continue Deck {progress?.currentDeck || 1}
              </Link>
              <Link to="/interviewiq/history" className="px-4 py-2 rounded-lg border border-white/20 text-stone-200 text-sm text-center">
                View History
              </Link>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-stone-300">Loading InterviewIQ dashboard...</div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6 text-rose-200">{error}</div>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-stone-100 font-semibold">Deck Progress</p>
                  <p className="text-xs text-stone-400">Completed: {(progress?.completedDecks || []).length}/100</p>
                </div>
                <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400"
                    style={{ width: `${Math.min(100, ((progress?.completedDecks || []).length / 100) * 100)}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-stone-400">
                  <p>
                    Showing decks {deckWindow.startDeck}-{deckWindow.endDeck}
                  </p>
                  <p>
                    Next batch appears after completing deck {deckWindow.endDeck}
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {decks.map((deck) => (
                    <DeckCard
                      key={deck.deckNumber}
                      deckNumber={deck.deckNumber}
                      unlocked={deck.unlocked}
                      completed={deck.completed}
                      score={deck.score}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <StreakCounter
                  currentStreak={Number(progress?.streakData?.currentStreak || 0)}
                  longestStreak={Number(progress?.streakData?.longestStreak || 0)}
                />
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-stone-100 font-semibold">Total Rating Points</p>
                  <p className="text-3xl mt-2 font-bold text-orange-300">{Number(progress?.totalScore || 0).toFixed(1)}</p>
                </div>
              </div>
            </div>

            <BadgeShelf badges={progress?.badges || []} />
            <WeakAreaHeatmap heatmap={heatmap} />
          </>
        )}
        </div>
      </div>
    </InterviewIQLayout>
  );
}
