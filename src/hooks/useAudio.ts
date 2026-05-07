/**
 * useAudio — React hook for playing trainer audio clips.
 *
 * Wraps the GET /api/audio/:text endpoint. Uses a native HTMLAudioElement
 * routed through a Web Audio API graph (MediaElementAudioSourceNode →
 * GainNode → destination) so per-voice amplitude calibration can be
 * applied client-side at playback time (#21 Path C).
 *
 * Supports voice parameter (mandarin | cantonese) for Cantonese evidence rows.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// #21 Stage Part 2 — per-voice gain map for amplitude calibration.
// Rocky (Alibaba Cantonese secondary) outputs at noticeably lower
// amplitude than WanLung (Azure primary). +20% linear gain is a
// placeholder; calibrate via listen-test.
const VOICE_GAIN_MAP: Record<string, number> = {
  Rocky: 1.2,
};
const DEFAULT_GAIN = 1.0;

function gainFor(voiceId: string | null): number {
  if (!voiceId) return DEFAULT_GAIN;
  return VOICE_GAIN_MAP[voiceId] ?? DEFAULT_GAIN;
}

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
  // #21 Path C — Web Audio graph wrapping the HTMLAudioElement so per-voice
  // gain can be applied at playback time. Lazy-created on first play() call
  // (AudioContext requires a user gesture on Safari).
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  // AbortController for in-flight fetch — protects against rapid play()
  // calls where an earlier fetch resolves after a later one starts.
  const abortRef = useRef<AbortController | null>(null);
  // Track the active blob URL so we can revoke it on src-swap / unmount.
  const blobUrlRef = useRef<string | null>(null);

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

  // Lazy-build the Web Audio graph. Idempotent — subsequent calls are no-ops.
  // Note: createMediaElementSource "captures" the element — once wrapped,
  // el.volume no longer affects loudness directly (only the GainNode does).
  const ensureAudioGraph = useCallback(() => {
    if (audioCtxRef.current) return;
    const el = getAudio();
    type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
    const Ctor =
      window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!Ctor) return; // No Web Audio support — fall through to plain playback
    const ctx = new Ctor();
    const source = ctx.createMediaElementSource(el);
    const gain = ctx.createGain();
    gain.gain.value = DEFAULT_GAIN;
    source.connect(gain).connect(ctx.destination);
    audioCtxRef.current = ctx;
    sourceNodeRef.current = source;
    gainNodeRef.current = gain;
  }, [getAudio]);

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

      // Cancel any in-flight previous fetch
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      // Revoke prior blob URL (browser releases the underlying buffer)
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      const el = getAudio();
      ensureAudioGraph();
      const ctx = audioCtxRef.current;
      const gain = gainNodeRef.current;
      // Safari requires resume() after a user gesture; play() is the gesture.
      if (ctx && ctx.state === 'suspended') {
        try { await ctx.resume(); } catch { /* ignored */ }
      }

      const voiceParam = voice ?? 'mandarin';
      const url =
        `${basePath}/audio/${encodeURIComponent(text)}?voice=${encodeURIComponent(voiceParam)}`;

      // Interrupt any currently-playing clip
      try { el.pause(); } catch { /* ignored */ }

      setState('loading');
      setCurrentText(text);

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

      let response: Response;
      try {
        response = await fetch(url, {
          credentials: 'include',
          signal: controller.signal,
        });
      } catch (err) {
        // Aborted by a subsequent play() call — silently bail.
        if ((err as Error).name === 'AbortError') return;
        setState('error');
        setCurrentText(null);
        el.removeEventListener('ended', onEnded);
        el.removeEventListener('error', onError);
        console.warn('[useAudio] fetch failed:', err);
        return;
      }

      if (!response.ok) {
        setState('error');
        setCurrentText(null);
        el.removeEventListener('ended', onEnded);
        el.removeEventListener('error', onError);
        return;
      }

      // Apply per-voice gain BEFORE the source starts emitting samples.
      const voiceId = response.headers.get('X-Voice-Id');
      if (gain) {
        gain.gain.value = gainFor(voiceId);
      }

      let blob: Blob;
      try {
        blob = await response.blob();
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setState('error');
        setCurrentText(null);
        el.removeEventListener('ended', onEnded);
        el.removeEventListener('error', onError);
        return;
      }

      const blobUrl = URL.createObjectURL(blob);
      blobUrlRef.current = blobUrl;
      el.src = blobUrl;

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
    [basePath, getAudio, ensureAudioGraph],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.src = '';
      }
      const ctx = audioCtxRef.current;
      if (ctx) {
        // MediaElementAudioSourceNode is bound to one element, so each hook
        // instance has its own context. Close to free resources.
        ctx.close().catch(() => { /* ignored */ });
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
