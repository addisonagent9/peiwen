/**
 * useAudio — React hook for playing trainer audio clips.
 *
 * Wraps the GET /api/audio/:text endpoint. Uses the native HTMLAudioElement
 * for playback — no Web Audio API complexity, no external library.
 *
 * Supports voice parameter (mandarin | cantonese) for Cantonese evidence rows.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAudioOptions {
  /** Base path prefix. Defaults to '/api'. */
  basePath?: string;
}

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'error';

export interface ApprovedCounts {
  mandarin: number;
  cantonese: number;
}

export interface UseAudioReturn {
  /** Whether audio synthesis is available on the backend. */
  available: boolean;
  /** Whether the hook is still probing the backend. */
  probed: boolean;
  /** Current playback state. */
  state: PlaybackState;
  /** Text currently playing, or null if idle. */
  currentText: string | null;
  /** Play the given text with optional voice kind. */
  play: (text: string, voice?: 'mandarin' | 'cantonese') => Promise<void>;
  /** Stop playback immediately. */
  stop: () => void;
  /** Count of approved clips by voice kind. */
  approvedCounts: ApprovedCounts;
}

export function useAudio(opts: UseAudioOptions = {}): UseAudioReturn {
  const basePath = opts.basePath ?? '/api';

  const [available, setAvailable] = useState(false);
  const [probed, setProbed] = useState(false);
  const [state, setState] = useState<PlaybackState>('idle');
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [approvedCounts, setApprovedCounts] = useState<ApprovedCounts>({ mandarin: 0, cantonese: 0 });

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
          const body = await res.json() as {
            available?: boolean;
            approvedClips?: { mandarin?: number; cantonese?: number };
          };
          setAvailable(Boolean(body?.available));
          if (body?.approvedClips) {
            setApprovedCounts({
              mandarin: body.approvedClips.mandarin ?? 0,
              cantonese: body.approvedClips.cantonese ?? 0,
            });
          }
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
    async (text: string, voice?: 'mandarin' | 'cantonese'): Promise<void> => {
      if (!text) return;

      const el = getAudio();
      const voiceParam = voice ?? 'mandarin';
      const url =
        `${basePath}/audio/${encodeURIComponent(text)}?voice=${encodeURIComponent(voiceParam)}`;

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
        await el.play();
        setState('playing');
      } catch (err) {
        setState('error');
        setCurrentText(null);
        el.removeEventListener('ended', onEnded);
        el.removeEventListener('error', onError);
        console.warn('[useAudio] play failed:', err);
      }
    },
    [basePath, getAudio],
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
    approvedCounts,
  };
}
