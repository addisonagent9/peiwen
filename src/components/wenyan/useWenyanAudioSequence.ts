/**
 * useWenyanAudioSequence — section-level sequential playback hook
 * (#26 stage D-2.5).
 *
 * Plays an ordered tag array as one continuous experience: clip 0 →
 * 'ended' fires → load clip 1 → ... → past end → reset.
 *
 * Behavior:
 *   - play() — starts at currentIndex (0 if idle, resumes if mid-sequence,
 *     toggles to pause if currently playing)
 *   - stop() — pauses + clears registry; preserves currentIndex for resume
 *   - On 'ended': advance to next; if past end, reset to 0 + idle
 *   - On 'error': halt at current index; user can retry from start
 *   - autoPlay: defers play() to next tick; gated by useRef to dodge
 *     StrictMode double-mount
 *   - Tags-array reference change: full reset (handles poem switch via
 *     PoemReader's key={poem.id} remount, plus defensive case)
 *
 * Mutex: claims playbackRegistry on 'play' event; clears on stop /
 * ended / error / unmount. Any other audio playback is paused first.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { registerActivePlayback, clearActivePlayback } from './playbackRegistry';

export interface WenyanAudioSequenceControls {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  /** -1 when idle/never-played; otherwise the index of the clip being loaded/played. */
  currentIndex: number;
  play: () => void;
  stop: () => void;
}

export function useWenyanAudioSequence(
  tags: string[],
  opts?: { autoPlay?: boolean },
): WenyanAudioSequenceControls {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tagsRef = useRef(tags);
  const indexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const autoPlayFiredRef = useRef(false);

  // Keep tagsRef in sync without forcing dep-array churn elsewhere.
  useEffect(() => {
    tagsRef.current = tags;
  }, [tags]);

  // stop — stable identity (empty deps); referenced by registerActivePlayback,
  // so the same fn instance is what the registry compares against.
  const stop = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {
        // ignore
      }
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsLoading(false);
    clearActivePlayback(stop);
  }, []);

  // playIndex — internal helper; loads + plays the clip at the given index.
  // Recursive on 'ended' (chains chunk i → chunk i+1 → ...).
  const playIndex = useCallback(
    (index: number) => {
      const tagsNow = tagsRef.current;
      if (index < 0 || index >= tagsNow.length) return;

      // Tear down any existing element. Listeners on the old element are
      // GC'd with it once unreferenced.
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {
          // ignore
        }
        audioRef.current = null;
      }

      setError(null);
      setIsLoading(true);
      indexRef.current = index;
      setCurrentIndex(index);

      const tag = tagsNow[index];
      const url = `/api/wenyan/audio?tag=${encodeURIComponent(tag)}`;
      const audio = new Audio(url);

      audio.addEventListener('canplay', () => {
        setIsLoading(false);
      });
      audio.addEventListener('play', () => {
        isPlayingRef.current = true;
        setIsPlaying(true);
        setIsLoading(false);
        registerActivePlayback(stop);
      });
      audio.addEventListener('ended', () => {
        const next = indexRef.current + 1;
        if (next < tagsRef.current.length) {
          playIndex(next);
        } else {
          // Sequence complete — reset for next play.
          isPlayingRef.current = false;
          setIsPlaying(false);
          setIsLoading(false);
          indexRef.current = 0;
          setCurrentIndex(-1);
          clearActivePlayback(stop);
        }
      });
      audio.addEventListener('error', () => {
        setError('audio unavailable');
        isPlayingRef.current = false;
        setIsPlaying(false);
        setIsLoading(false);
        clearActivePlayback(stop);
      });

      audioRef.current = audio;
      audio.play().catch(() => {
        setError('audio unavailable');
        isPlayingRef.current = false;
        setIsPlaying(false);
        setIsLoading(false);
        clearActivePlayback(stop);
      });
    },
    [stop],
  );

  // play — public toggle/resume. Click while playing → pause + preserve
  // index; click while idle → start at preserved index (or 0 if past end).
  const play = useCallback(() => {
    if (tagsRef.current.length === 0) return;

    if (
      isPlayingRef.current &&
      audioRef.current &&
      !audioRef.current.paused
    ) {
      try {
        audioRef.current.pause();
      } catch {
        // ignore
      }
      isPlayingRef.current = false;
      setIsPlaying(false);
      clearActivePlayback(stop);
      return;
    }

    let startIdx = indexRef.current;
    if (startIdx < 0 || startIdx >= tagsRef.current.length) {
      startIdx = 0;
    }
    playIndex(startIdx);
  }, [stop, playIndex]);

  // Reset on tags-array reference change (defensive — PoemReader uses
  // key={poem.id}, so this hook normally remounts on poem change).
  useEffect(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {
        // ignore
      }
      audioRef.current = null;
    }
    isPlayingRef.current = false;
    indexRef.current = 0;
    autoPlayFiredRef.current = false;
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    setCurrentIndex(-1);
    clearActivePlayback(stop);
  }, [tags, stop]);

  // autoPlay on mount — single-fire via useRef gate (StrictMode double-effect
  // would otherwise call play() twice and toggle to pause).
  const autoPlay = opts?.autoPlay ?? false;
  useEffect(() => {
    if (!autoPlay) return;
    if (autoPlayFiredRef.current) return;
    if (tagsRef.current.length === 0) return;
    autoPlayFiredRef.current = true;
    // Defer to next tick — dodges any synchronous mount race with
    // child Audio element construction.
    const id = setTimeout(() => {
      play();
    }, 0);
    return () => clearTimeout(id);
  }, [autoPlay, play]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {
          // ignore
        }
        audioRef.current.src = '';
        audioRef.current = null;
      }
      clearActivePlayback(stop);
    };
  }, [stop]);

  return { isPlaying, isLoading, error, currentIndex, play, stop };
}
