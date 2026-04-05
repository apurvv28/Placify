import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function QuestionRecorder({ question, onRecorded, onError }) {
  const prepSecondsTotal = 30;
  const recordSecondsTotal = 120;

  const [phase, setPhase] = useState('prep');
  const [prepSeconds, setPrepSeconds] = useState(prepSecondsTotal);
  const [recordSeconds, setRecordSeconds] = useState(recordSecondsTotal);
  const [streamReady, setStreamReady] = useState(false);

  const mediaRecorderRef = useRef(null);
  const stopRequestedRef = useRef(false);
  const chunksRef = useRef([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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
      videoBitsPerSecond: 220000,
      audioBitsPerSecond: 48000,
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
            width: { ideal: 640 },
            height: { ideal: 360 },
            frameRate: { ideal: 15, max: 24 },
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

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3">
        <p className="text-stone-100 font-semibold text-sm sm:text-base">{question?.type?.toUpperCase()} • {question?.difficulty?.toUpperCase()}</p>
        <p className="text-orange-300 text-sm font-semibold">{timerLabel}</p>
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
  );
}
