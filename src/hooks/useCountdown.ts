import { useEffect, useRef, useState } from 'react';

interface UseCountdownOptions {
  onTick?: (secondsLeft: number) => void;
  onFinish?: () => void;
}

export function useCountdown(totalSeconds: number, options: UseCountdownOptions = {}) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!running) return undefined;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        const next = s - 1;
        if (next <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          optionsRef.current.onFinish?.();
          return 0;
        }
        optionsRef.current.onTick?.(next);
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function reset(newTotal = totalSeconds) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(newTotal);
  }

  function addSeconds(delta: number) {
    setSecondsLeft((s) => Math.max(0, s + delta));
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return {
    secondsLeft,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset,
    addSeconds,
    label: `${minutes}:${seconds}`,
    finished: secondsLeft === 0,
  };
}

/** Cronômetro que conta para CIMA — usado no ranking do Quem Eu Sou (tempo usado). */
export function useStopwatch() {
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return undefined;
    intervalRef.current = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsElapsed(0);
  }

  const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
  const seconds = String(secondsElapsed % 60).padStart(2, '0');

  return {
    secondsElapsed,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset,
    label: `${minutes}:${seconds}`,
  };
}
