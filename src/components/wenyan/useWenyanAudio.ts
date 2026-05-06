/**
 * useWenyanAudio — per-instance audio playback hook (#26 stage D-2,
 * mutex wired in D-2.5).
 *
 * One HTMLAudioElement per hook instance — each <PlayButton> owns its
 * own playback state. Click toggles play/pause. A 404 from the server
 * (e.g., a couplet whose audio hasn't been TTS-batched yet) sets
 * `error` to a non-throwing message; the button surfaces a muted
 * visual rather than crashing.
 *
 * Mutex (#26 D-2.5): claims playbackRegistry on 'play' event; clears
 * on stop / ended / error / unmount. Vocab clicks stop any active
 * background/poem-body/translation sequence and vice versa.
 *
 * Cleanup on unmount: pause + clear src + null the ref + clear registry.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { registerActivePlayback, clearActivePlayback } from './playbackRegistry';

export interface WenyanAudioControls {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  play: () => void;
  stop: () => void;
}

export function useWenyanAudio(tag: string | null): WenyanAudioControls {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stable identity (empty deps) — same fn instance is registered with
  // playbackRegistry across renders, so the registry's identity check works.
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    clearActivePlayback(stop);
  }, []);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      clearActivePlayback(stop);
    };
  }, [stop]);

  // Reset on tag change. PoemReader uses key={poem.id}, so this is
  // mostly defensive — but covers any future caller that swaps tags
  // on the same instance.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    clearActivePlayback(stop);
  }, [tag, stop]);

  const play = useCallback(() => {
    if (!tag) return;

    // Toggle pause if already playing.
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
      clearActivePlayback(stop);
      return;
    }

    setError(null);
    setIsLoading(true);

    const url = `/api/wenyan/audio?tag=${encodeURIComponent(tag)}`;
    const audio = new Audio(url);

    audio.addEventListener('canplay', () => {
      setIsLoading(false);
    });
    audio.addEventListener('play', () => {
      setIsPlaying(true);
      setIsLoading(false);
      registerActivePlayback(stop);
    });
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      clearActivePlayback(stop);
    });
    audio.addEventListener('error', () => {
      // 404 / network error / bad mime. Don't crash; show muted state.
      setError('audio unavailable');
      setIsPlaying(false);
      setIsLoading(false);
      clearActivePlayback(stop);
    });

    audioRef.current = audio;
    // .catch is mandatory — `audio.play()` returns a promise that
    // rejects on 404 / autoplay-blocked / network errors, otherwise
    // surfaces as an uncaught promise rejection.
    audio.play().catch(() => {
      setError('audio unavailable');
      setIsPlaying(false);
      setIsLoading(false);
      clearActivePlayback(stop);
    });
  }, [tag, stop]);

  return { isPlaying, isLoading, error, play, stop };
}
