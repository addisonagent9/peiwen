/**
 * 文言教材 API hooks. Stage B endpoints: progress, complete, library.
 * Stage C adds pairing queue + submit. Mirrors the shape of useAdminAudio
 * (credentials: include, throw on non-2xx, JSON in/out).
 */

import { useCallback, useEffect, useState } from 'react';
import type {
  WenyanProgressEntry,
  WenyanLibraryEntry,
  WenyanCompleteResponse,
  PairingQueue,
  PairingSubmitRequest,
  PairingSubmitResponse,
} from '../../data/wenyan/types';

async function jsonFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { credentials: 'include', ...init });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

interface UseWenyanApiReturn {
  progress: WenyanProgressEntry[];
  isLoadingProgress: boolean;
  progressError: string | null;
  refreshProgress: () => Promise<void>;
  completePoem: (poemId: string) => Promise<WenyanCompleteResponse>;
  fetchLibrary: () => Promise<WenyanLibraryEntry[]>;
  fetchPairingQueue: () => Promise<PairingQueue>;
  submitPairing: (payload: PairingSubmitRequest) => Promise<PairingSubmitResponse>;
}

export function useWenyanApi(): UseWenyanApiReturn {
  const [progress, setProgress] = useState<WenyanProgressEntry[]>([]);
  const [isLoadingProgress, setLoadingProgress] = useState(true);
  const [progressError, setProgressError] = useState<string | null>(null);

  const refreshProgress = useCallback(async () => {
    setLoadingProgress(true);
    setProgressError(null);
    try {
      const data = await jsonFetch<{ progress: WenyanProgressEntry[] }>(
        '/api/wenyan/progress',
      );
      setProgress(data.progress ?? []);
    } catch (err) {
      setProgressError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingProgress(false);
    }
  }, []);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const completePoem = useCallback(
    async (poemId: string): Promise<WenyanCompleteResponse> => {
      const data = await jsonFetch<WenyanCompleteResponse>(
        `/api/wenyan/poems/${encodeURIComponent(poemId)}/complete`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({}),
        },
      );
      await refreshProgress();
      return data;
    },
    [refreshProgress],
  );

  const fetchLibrary = useCallback(async (): Promise<WenyanLibraryEntry[]> => {
    const data = await jsonFetch<{ library: WenyanLibraryEntry[] }>(
      '/api/wenyan/library',
    );
    return data.library ?? [];
  }, []);

  const fetchPairingQueue = useCallback(async (): Promise<PairingQueue> => {
    return jsonFetch<PairingQueue>('/api/wenyan/pairing/queue');
  }, []);

  const submitPairing = useCallback(
    async (payload: PairingSubmitRequest): Promise<PairingSubmitResponse> => {
      return jsonFetch<PairingSubmitResponse>('/api/wenyan/pairing/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    },
    [],
  );

  return {
    progress,
    isLoadingProgress,
    progressError,
    refreshProgress,
    completePoem,
    fetchLibrary,
    fetchPairingQueue,
    submitPairing,
  };
}
