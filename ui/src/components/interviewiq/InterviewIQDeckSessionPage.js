import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { interviewIqApi } from './api';
import QuestionRecorder from './QuestionRecorder';
import EvaluationLoader from './EvaluationLoader';
import ScoreBreakdown from './ScoreBreakdown';
import BadgeShelf from './BadgeShelf';
import InterviewIQLayout from './InterviewIQLayout';

export default function InterviewIQDeckSessionPage() {
  const { deckNumber } = useParams();

  const [deckData, setDeckData] = useState(null);
  const [step, setStep] = useState('overview');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [resultsPayload, setResultsPayload] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDeck = async () => {
      try {
        const data = await interviewIqApi.getDeck(deckNumber);
        setDeckData(data);
      } catch (err) {
        setError(err.message || 'Unable to load deck.');
      }
    };
    loadDeck();
  }, [deckNumber]);

  const questions = useMemo(() => deckData?.questions || [], [deckData]);

  const pollResponseUntilDone = async (responseId) => {
    for (let i = 0; i < 50; i += 1) {
      const response = await interviewIqApi.getResponse(responseId);
      if (response.status === 'completed' || response.status === 'failed') {
        return response;
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    return interviewIqApi.getResponse(responseId);
  };

  const startDeck = async () => {
    try {
      await interviewIqApi.startDeck(deckNumber);
      setStep('question');
    } catch (err) {
      setError(err.message || 'Unable to start deck.');
    }
  };

  const handleRecorded = async (blob) => {
    try {
      setStep('evaluating');
      const question = questions[activeQuestionIndex];
      const upload = await interviewIqApi.uploadResponse({
        recordingBlob: blob,
        questionId: question.questionId,
        deckId: deckData?.deck?.deckId,
        deckNumber,
      });

      const evaluated = await pollResponseUntilDone(upload.responseId);
      setResponses((prev) => [...prev, evaluated]);

      if (activeQuestionIndex < questions.length - 1) {
        setActiveQuestionIndex((prev) => prev + 1);
        setStep('question');
        return;
      }

      const deckResults = await interviewIqApi.getDeckResults(deckNumber);
      setResultsPayload(deckResults);
      setStep('results');
    } catch (err) {
      setError(err.message || 'Failed during recording upload/evaluation.');
      setStep('question');
    }
  };

  return (
    <InterviewIQLayout>
      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="max-w-5xl mx-auto space-y-5">
        <header className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs uppercase text-orange-300">InterviewIQ</p>
              <h1 className="text-2xl font-bold text-stone-100">Deck {deckNumber}</h1>
            </div>
            <Link to="/interviewiq" className="text-sm text-stone-300 border border-white/20 rounded-lg px-3 py-2 text-center">Back to Dashboard</Link>
          </div>
        </header>

        {error && <div className="rounded-xl border border-rose-300/30 bg-rose-500/10 p-4 text-rose-200">{error}</div>}

        {!deckData ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-stone-300">Loading deck...</div>
        ) : null}

        {deckData && step === 'overview' ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-stone-100 font-semibold">Deck Overview</p>
            <p className="text-sm text-stone-400 mt-1">3 questions will be asked: 30s prep + 2m recording each.</p>

            <div className="grid md:grid-cols-3 gap-3 mt-4">
              {(deckData.preview || []).map((q) => (
                <div key={q.questionId} className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="text-stone-200 text-sm">{q.type.toUpperCase()}</p>
                  <p className="text-orange-300 text-xs mt-1">{q.difficulty.toUpperCase()}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={startDeck}
              className="mt-5 w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 text-black font-semibold"
            >
              Start Session
            </button>
          </div>
        ) : null}

        {deckData && step === 'question' && questions[activeQuestionIndex] ? (
          <QuestionRecorder
            question={questions[activeQuestionIndex]}
            onRecorded={handleRecorded}
            onError={(message) => setError(message)}
          />
        ) : null}

        {step === 'evaluating' ? <EvaluationLoader /> : null}

        {step === 'results' ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
              <p className="text-emerald-200 text-sm">Deck Completed</p>
              <p className="text-stone-100 text-2xl font-bold mt-1">Total Score: {resultsPayload?.totalDeckScore ?? '-'}%</p>
            </div>

            {(resultsPayload?.responses || responses).map((response) => (
              <ScoreBreakdown key={response.responseId} response={response} />
            ))}

            <BadgeShelf badges={resultsPayload?.badges || []} />
          </div>
        ) : null}
        </div>
      </div>
    </InterviewIQLayout>
  );
}
