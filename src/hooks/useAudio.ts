/**
 * useAudio — React hook for playing trainer audio clips.
 *
 * Wraps the GET /api/audio/:text endpoint. Uses the native HTMLAudioElement
 * for playback — no Web Audio API complexity, no external library, works on
 * every browser that ships an <audio> element.
 *
 * ── Graceful unavailability ──────────────────────────────────────────────────
 * On first mount, probes /api/audio/status. If the backend reports
 * available=false, `available` stays false and `play()` is a no-op. This lets
 * the UI render audio buttons as disabled instead of showing broken icons.
 *
 * ── Single global element ────────────────────────────────────────────────────
 * We share one Audio element across all playback calls — calling play on a
 * new src stops any previous clip, which is the behavior we want (tap one
 * character, tap another, second one interrupts the first).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAudioOptions {
  /** Base path prefix. Defaults to '/api'. */
  basePath?: string;
  /** Voice preference. Defaults to server-side default (zh-TW-HsiaoChenNeural). */
  voice?: string;
}

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'error';

export interface UseAudioReturn {
  /** Whether audio synthesis is available on the backend. False during probe + after negative result. */
  available: boolean;
  /** Whether the hook is still probing the backend. */
  probed: boolean;
  /** Current playback state. */
  state: PlaybackState;
  /** Text currently playing, or null if idle. */
  currentText: string | null;
  /** Play the given text. Safe to call even if unavailable — will be a no-op. */
  play: (text: string) => Promise<void>;
  /** Stop playback immediately. */
  stop: () => void;
}

export function useAudio(opts: UseAudioOptions = {}): UseAudioReturn {
  const basePath = opts.basePath ?? '/api';
  const voice = opts.voice;

  const [available, setAvailable] = useState(false);
  const [probed, setProbed] = useState(false);
  const [state, setState] = useState<PlaybackState>('idle');
  const [currentText, setCurrentText] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Probe backend availability once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${basePath}/audio/status`, {
          credentials: 'include',
        });
        if (cancelled) return;
        if (res.ok) {
          const body = (await res.json()) as { available?: boolean };
          setAvailable(Boolean(body?.available));
        } else {
          setAvailable(false);
        }
      } catch {
        if (!cancelled) setAvailable(false);
      } finally {
        if (!cancelled) setProbed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [basePath]);

  // Lazy-create the shared <audio> element
  const getAudio = useCallback((): HTMLAudioElement => {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = 'auto';
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setState('idle');
    setCurrentText(null);
  }, []);

  const play = useCallback(
    async (text: string): Promise<void> => {
      if (!text) return;
      if (!available) {
        // Silent no-op when unavailable — UI is already rendering disabled buttons.
        return;
      }

      const el = getAudio();
      const url =
        `${basePath}/audio/${encodeURIComponent(text)}` +
        (voice ? `?voice=${encodeURIComponent(voice)}` : '');

      // Interrupt any currently-playing clip
      try { el.pause(); } catch { /* ignored */ }

      setState('loading');
      setCurrentText(text);
      el.src = url;

      const onEnded = () => {
        setState('idle');
        setCurrentText(null);
        el.removeEventListener('ended', onEnded);
        el.removeEventListener('error', onError);
      };
      const onError = () => {
        setState('error');
        setCurrentText(null);
        el.removeEventListener('ended', onEnded);
        el.removeEventListener('error', onError);
      };
      el.addEventListener('ended', onEnded);
      el.addEventListener('error', onError);

      try {
        // el.play() returns a Promise that rejects on autoplay policies,
        // network errors, or format issues. Handle all of them uniformly.
        await el.play();
        setState('playing');
      } catch (err) {
        setState('error');
        setCurrentText(null);
        el.removeEventListener('ended', onEnded);
        el.removeEventListener('error', onError);
        // Don't throw — audio failure shouldn't break the whole UI.
        // eslint-disable-next-line no-console
        console.warn('[useAudio] play failed:', err);
      }
    },
    [available, basePath, getAudio, voice],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.src = '';
      }
    };
  }, []);

  return {
    available,
    probed,
    state,
    currentText,
    play,
    stop,
  };
}
