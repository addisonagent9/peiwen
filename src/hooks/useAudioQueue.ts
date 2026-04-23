import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseAudioReturn } from './useAudio';

export interface UseAudioQueueReturn {
  /** Whether the queue is actively playing through items. */
  active: boolean;
  /** Index of the currently-playing item in the queue, or -1 if idle. */
  currentIndex: number;
  /** Start sequential playback of the given texts from the beginning. */
  start: (texts: string[], voice?: 'mandarin' | 'cantonese') => void;
  /** Pause playback, preserving current position for resume. */
  pause: () => void;
  /** Resume playback from the paused position. */
  resume: () => void;
  /** Stop playback and fully reset (position lost). */
  stop: () => void;
}

export function useAudioQueue(audio: UseAudioReturn): UseAudioQueueReturn {
  const [active, setActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const queueRef = useRef<string[]>([]);
  const voiceRef = useRef<'mandarin' | 'cantonese'>('mandarin');
  const activeRef = useRef(false);
  const indexRef = useRef(-1);

  const playAt = useCallback(async (idx: number) => {
    if (idx >= queueRef.current.length) {
      activeRef.current = false;
      indexRef.current = -1;
      setActive(false);
      setCurrentIndex(-1);
      return;
    }
    indexRef.current = idx;
    setCurrentIndex(idx);
    await audio.play(queueRef.current[idx], voiceRef.current);
  }, [audio]);

  const playNext = useCallback(async () => {
    await playAt(indexRef.current + 1);
  }, [playAt]);

  useEffect(() => {
    if (!activeRef.current) return;
    if (audio.state === 'idle' && audio.currentText === null && indexRef.current >= 0) {
      playNext();
    }
    if (audio.state === 'error') {
      playNext();
    }
  }, [audio.state, audio.currentText, playNext]);

  const start = useCallback(
    (texts: string[], voice?: 'mandarin' | 'cantonese') => {
      audio.stop();
      queueRef.current = texts;
      voiceRef.current = voice ?? 'mandarin';
      indexRef.current = -1;
      activeRef.current = true;
      setActive(true);
      setCurrentIndex(-1);
      playNext();
    },
    [audio, playNext],
  );

  const pause = useCallback(() => {
    activeRef.current = false;
    setActive(false);
    audio.stop();
  }, [audio]);

  const resume = useCallback(() => {
    if (indexRef.current < 0 || queueRef.current.length === 0) return;
    activeRef.current = true;
    setActive(true);
    playAt(indexRef.current);
  }, [playAt]);

  const stop = useCallback(() => {
    activeRef.current = false;
    indexRef.current = -1;
    queueRef.current = [];
    setActive(false);
    setCurrentIndex(-1);
    audio.stop();
  }, [audio]);

  return { active, currentIndex, start, pause, resume, stop };
}
