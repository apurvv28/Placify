import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function QuestionRecorder({ question, onRecorded, onError, onRestart, onGoBack }) {
  const prepSecondsTotal = 30;
  const recordSecondsTotal = 120;
  const silenceDetectionThreshold = 20; // seconds

  const [phase, setPhase] = useState('prep');
  const [prepSeconds, setPrepSeconds] = useState(prepSecondsTotal);
  const [recordSeconds, setRecordSeconds] = useState(recordSecondsTotal);
  const [streamReady, setStreamReady] = useState(false);
  const [showSilencePopup, setShowSilencePopup] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState(0);

  const mediaRecorderRef = useRef(null);
  const stopRequestedRef = useRef(false);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceStartTimeRef = useRef(null);

  const getRecorderConfig = () => {
    const candidateTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];

    const supportedType = candidateTypes.find((type) => {
      try {
        return typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type);
      } catch (_err) {
        return false;
      }
    });

    const config = {
      videoBitsPerSecond: 160000,
      audioBitsPerSecond: 32000,
    };

    if (supportedType) {
      config.mimeType = supportedType;
    }

    return config;
  };

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 480 },
            height: { ideal: 270 },
            frameRate: { ideal: 12, max: 18 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
            sampleRate: 16000,
          },
        });
        if (!mounted) return;

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup audio analysis for silence detection
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 512;
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        setStreamReady(true);
      } catch (error) {
        onError?.('Unable to access webcam/microphone. Please allow permissions.');
      }
    };

    setup();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {
          // Ignore errors if already closed
        });
      }
    };
  }, [onError]);

  useEffect(() => {
    if (phase !== 'prep' || !streamReady) return undefined;

    const timer = setInterval(() => {
      setPrepSeconds((prev) => {
        if (prev <= 1) {
          setPhase('recording');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, streamReady]);

  // Silence detection during recording
  useEffect(() => {
    if (phase !== 'recording' || !analyserRef.current) return undefined;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId;

    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      
      // Threshold for detecting speech (adjust as needed)
      const speechThreshold = 10;
      const speaking = average > speechThreshold;
      
      setIsSpeaking(speaking);

      if (speaking) {
        silenceStartTimeRef.current = null;
        setSilenceTimer(0);
      } else {
        if (silenceStartTimeRef.current === null) {
          silenceStartTimeRef.current = Date.now();
        } else {
          const silenceDuration = Math.floor((Date.now() - silenceStartTimeRef.current) / 1000);
          setSilenceTimer(silenceDuration);
          
          if (silenceDuration >= silenceDetectionThreshold && !showSilencePopup) {
            setShowSilencePopup(true);
          }
        }
      }

      animationFrameId = requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [phase, showSilencePopup, silenceDetectionThreshold]);

  useEffect(() => {
    if (phase !== 'recording' || !streamRef.current) return undefined;

    stopRequestedRef.current = false;
    let recorder;
    try {
      recorder = new MediaRecorder(streamRef.current, getRecorderConfig());
    } catch (error) {
      onError?.('Unable to start recording on this browser. Please refresh and try again.');
      setPhase('prep');
      return undefined;
    }
    chunksRef.current = [];

    const stopRecorder = () => {
      if (stopRequestedRef.current || recorder.state === 'inactive') {
        return;
      }

      stopRequestedRef.current = true;
      recorder.stop();
    };

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {
          // Ignore errors if already closed
        });
      }
      onRecorded?.(blob);
      setPhase('done');
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;

    const timer = setInterval(() => {
      setRecordSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          stopRecorder();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    };
  }, [phase, onRecorded, onError]);

  const timerLabel = useMemo(() => {
    if (phase === 'prep') return `Preparation: ${prepSeconds}s`;
    if (phase === 'recording') return `Recording: ${recordSeconds}s`;
    return 'Uploading...';
  }, [phase, prepSeconds, recordSeconds]);

  const finishRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      return;
    }

    stopRequestedRef.current = true;
    recorder.stop();
  };

  const handleRestartRecording = () => {
    setShowSilencePopup(false);
    setSilenceTimer(0);
    silenceStartTimeRef.current = null;
    
    // Stop current recording
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      stopRequestedRef.current = true;
      recorder.stop();
    }
    
    // Reset to prep phase
    setPhase('prep');
    setPrepSeconds(prepSecondsTotal);
    setRecordSeconds(recordSecondsTotal);
    chunksRef.current = [];
    
    // Call parent restart handler if provided
    if (onRestart) {
      onRestart();
    }
  };

  const handleGoBack = () => {
    setShowSilencePopup(false);
    
    // Stop current recording
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      stopRequestedRef.current = true;
      recorder.stop();
    }
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {
        // Ignore errors if already closed
      });
    }
    
    // Call parent go back handler
    if (onGoBack) {
      onGoBack();
    }
  };

  const handleContinueRecording = () => {
    setShowSilencePopup(false);
    setSilenceTimer(0);
    silenceStartTimeRef.current = null;
  };

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3">
          <p className="text-stone-100 font-semibold text-sm sm:text-base">{question?.type?.toUpperCase()} • {question?.difficulty?.toUpperCase()}</p>
          <div className="flex items-center gap-3">
            {phase === 'recording' && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-xs text-stone-400">{isSpeaking ? 'Speaking' : 'Silent'}</span>
              </div>
            )}
            <p className="text-orange-300 text-sm font-semibold">{timerLabel}</p>
          </div>
        </div>

        <p className="text-stone-200 text-sm leading-relaxed mb-4">{question?.text}</p>

        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-[220px] sm:h-[300px] lg:h-[340px] object-cover" />
        </div>

        {phase === 'recording' ? (
          <button
            type="button"
            onClick={finishRecording}
            className="mt-4 inline-flex w-full sm:w-auto justify-center items-center rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25"
          >
            Finish Answer
          </button>
        ) : null}

        <p className="text-xs text-stone-400 mt-3">
          {phase === 'prep'
            ? 'Use prep time to structure your answer.'
            : phase === 'recording'
            ? 'Recording has started automatically. Click Finish Answer when you are done.'
            : 'Response captured. Running evaluation...'}
        </p>
      </div>

      {/* Silence Detection Popup */}
      {showSilencePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/75" />
          <div className="relative w-full max-w-md rounded-2xl border border-orange-300/40 bg-zinc-950 p-6 text-center shadow-2xl">
            <div className="text-5xl mb-4">🎤</div>
            <p className="text-xl font-bold text-stone-100 mb-2">Are you still there?</p>
            <p className="text-sm text-stone-300 mb-6">
              Your voice is not audible. We haven't detected any speech for {silenceTimer} seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleContinueRecording}
                className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2.5 font-semibold text-white transition hover:opacity-90"
              >
                Continue Recording
              </button>
              <button
                type="button"
                onClick={handleRestartRecording}
                className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 font-semibold text-black transition hover:opacity-90"
              >
                Start Again
              </button>
              <button
                type="button"
                onClick={handleGoBack}
                className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 font-semibold text-stone-200 transition hover:bg-white/10"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
