import { useCallback, useRef } from 'react';

type ToneShape = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface ToneStep {
  freq: number;
  start: number;
  duration: number;
  gain?: number;
  shape?: ToneShape;
}

function getCtx(ref: React.MutableRefObject<AudioContext | null>): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ref.current) ref.current = new AudioCtx();
  if (ref.current.state === 'suspended') void ref.current.resume();
  return ref.current;
}

function playTones(ctx: AudioContext, steps: ToneStep[]) {
  const now = ctx.currentTime;
  steps.forEach(({ freq, start, duration, gain = 0.2, shape = 'sine' }) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = shape;
    osc.frequency.setValueAtTime(freq, now + start);
    gainNode.gain.setValueAtTime(0, now + start);
    gainNode.gain.linearRampToValueAtTime(gain, now + start + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + duration + 0.02);
  });
}

/**
 * Efeitos sonoros nativos via Web Audio API, sem dependências externas.
 */
export function useSoundEffects() {
  const ctxRef = useRef<AudioContext | null>(null);

  const playCorrect = useCallback(() => {
    const ctx = getCtx(ctxRef);
    if (!ctx) return;
    playTones(ctx, [
      { freq: 660, start: 0, duration: 0.12, shape: 'triangle' },
      { freq: 990, start: 0.1, duration: 0.18, shape: 'triangle' },
    ]);
  }, []);

  const playError = useCallback(() => {
    const ctx = getCtx(ctxRef);
    if (!ctx) return;
    playTones(ctx, [
      { freq: 160, start: 0, duration: 0.28, shape: 'sawtooth', gain: 0.22 },
      { freq: 110, start: 0.12, duration: 0.32, shape: 'sawtooth', gain: 0.22 },
    ]);
  }, []);

  const playTick = useCallback(() => {
    const ctx = getCtx(ctxRef);
    if (!ctx) return;
    playTones(ctx, [{ freq: 880, start: 0, duration: 0.05, shape: 'square', gain: 0.08 }]);
  }, []);

  const playAlarm = useCallback(() => {
    const ctx = getCtx(ctxRef);
    if (!ctx) return;
    playTones(ctx, [
      { freq: 520, start: 0, duration: 0.18, shape: 'square', gain: 0.2 },
      { freq: 400, start: 0.2, duration: 0.18, shape: 'square', gain: 0.2 },
      { freq: 520, start: 0.4, duration: 0.18, shape: 'square', gain: 0.2 },
      { freq: 400, start: 0.6, duration: 0.28, shape: 'square', gain: 0.2 },
    ]);
  }, []);

  return { playCorrect, playError, playTick, playAlarm };
}
