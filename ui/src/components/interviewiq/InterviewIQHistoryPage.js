import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { interviewIqApi } from './api';
import InterviewIQLayout from './InterviewIQLayout';

export default function InterviewIQHistoryPage() {
  const token = localStorage.getItem('placifyToken');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const progress = await interviewIqApi.getProgress();
        const completedDecks = [...(progress.completedDecks || [])].sort((a, b) => b - a).slice(0, 20);

        const deckResults = await Promise.all(
          completedDecks.map(async (deckNumber) => {
            const payload = await interviewIqApi.getDeckResults(deckNumber);
            return {
              deckNumber,
              score: payload.totalDeckScore,
              responses: payload.responses || [],
              completedAt: payload.deck?.completedAt,
            };
          })
        );

        setRows(deckResults);
      } catch (err) {
        setError(err.message || 'Unable to load history.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (!token) return <Navigate to="/auth" replace />;

  return (
    <InterviewIQLayout>
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="max-w-5xl mx-auto space-y-4">
        <header className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-orange-300">InterviewIQ</p>
            <h1 className="text-2xl font-bold text-stone-100">Practice History</h1>
          </div>
          <Link to="/interviewiq" className="text-sm text-stone-300 border border-white/20 rounded-lg px-3 py-2 text-center">Back to Dashboard</Link>
        </header>

        {loading ? <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-stone-300">Loading history...</div> : null}
        {error ? <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 p-4 text-rose-200">{error}</div> : null}

        {!loading && !error && rows.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-stone-300">No completed decks yet.</div>
        ) : null}

        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.deckNumber} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-stone-100 font-semibold">Deck {row.deckNumber}</p>
                <p className="text-orange-300 font-semibold">{row.score}%</p>
              </div>
              <p className="text-xs text-stone-400 mt-1">{row.completedAt ? new Date(row.completedAt).toLocaleString() : 'Pending completion timestamp'}</p>
              <p className="text-sm text-stone-300 mt-2">Responses: {row.responses.length}</p>
            </div>
          ))}
        </div>
        </div>
      </div>
    </InterviewIQLayout>
  );
}
