/**
 * useTrainerApi — API client hook for the trainer backend.
 *
 * Thin wrapper around the M2 endpoints. Uses native fetch with
 * `credentials: 'include'` so the Google OAuth session cookie rides along.
 *
 * No request library (axios, swr, react-query) is introduced — keeps the
 * bundle lean and matches your existing useState-only state convention.
 *
 * All methods return the parsed JSON; errors throw.
 */

import { useCallback, useMemo } from 'react';
import type {
  SRSCard,
  UserRhymeProgress,
  UserTrainerState,
  ReviewGrade,
  DrillType,
} from '../types/pingshui-trainer';

// ---------------------------------------------------------------------------
// Response shapes from M2 endpoints
// ---------------------------------------------------------------------------

interface DueResponse { cards: SRSCard[] }
interface SeedResponse { created: number; total: number }
interface ReviewResponse { card: SRSCard }
interface ProgressResponse { progress: UserRhymeProgress[] }
interface StateResponse { state: UserTrainerState }

interface ApiError {
  error: string;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Low-level fetch helper
// ---------------------------------------------------------------------------

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    ...init,
    headers: {
      'Accept': 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try { body = JSON.parse(text); } catch { /* non-JSON response */ }
  }

  if (!res.ok) {
    const e = (body as ApiError | null);
    throw new Error(e?.error ?? `HTTP_${res.status}`);
  }

  return body as T;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseTrainerApiOptions {
  /** Path prefix. Defaults to '/api'. Override for dev / mock / subpath setups. */
  basePath?: string;
}

export interface TrainerApi {
  // Trainer state
  getState: () => Promise<UserTrainerState>;
  patchState: (patch: Partial<UserTrainerState>) => Promise<UserTrainerState>;
  completeFoundation: () => Promise<UserTrainerState>;
  unlockNextTier: () => Promise<UserTrainerState>;

  // SRS
  getDueCards: () => Promise<SRSCard[]>;
  seedRhyme: (rhymeId: string) => Promise<SeedResponse>;
  reviewCard: (input: {
    cardId: number;
    grade: ReviewGrade;
    drillType: DrillType;
    responseTimeMs?: number;
  }) => Promise<SRSCard>;
  getProgress: () => Promise<UserRhymeProgress[]>;
}

export function useTrainerApi(opts: UseTrainerApiOptions = {}): TrainerApi {
  const base = opts.basePath ?? '/api';

  const getState = useCallback(async (): Promise<UserTrainerState> => {
    const r = await request<StateResponse>(`${base}/trainer/state`);
    return r.state;
  }, [base]);

  const patchState = useCallback(
    async (patch: Partial<UserTrainerState>) => {
      const r = await request<StateResponse>(`${base}/trainer/state`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      return r.state;
    },
    [base],
  );

  const completeFoundation = useCallback(async () => {
    const r = await request<StateResponse>(
      `${base}/trainer/foundation/complete`,
      { method: 'POST' },
    );
    return r.state;
  }, [base]);

  const unlockNextTier = useCallback(async () => {
    const r = await request<StateResponse>(
      `${base}/trainer/tier/unlock`,
      { method: 'POST' },
    );
    return r.state;
  }, [base]);

  const getDueCards = useCallback(async () => {
    const r = await request<DueResponse>(`${base}/srs/due`);
    return r.cards;
  }, [base]);

  const seedRhyme = useCallback(
    async (rhymeId: string) =>
      request<SeedResponse>(`${base}/srs/seed/${encodeURIComponent(rhymeId)}`, {
        method: 'POST',
      }),
    [base],
  );

  const reviewCard = useCallback(
    async (input: {
      cardId: number;
      grade: ReviewGrade;
      drillType: DrillType;
      responseTimeMs?: number;
    }) => {
      const r = await request<ReviewResponse>(`${base}/srs/review`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return r.card;
    },
    [base],
  );

  const getProgress = useCallback(async () => {
    const r = await request<ProgressResponse>(`${base}/srs/progress`);
    return r.progress;
  }, [base]);

  return useMemo(
    () => ({
      getState,
      patchState,
      completeFoundation,
      unlockNextTier,
      getDueCards,
      seedRhyme,
      reviewCard,
      getProgress,
    }),
    [
      getState,
      patchState,
      completeFoundation,
      unlockNextTier,
      getDueCards,
      seedRhyme,
      reviewCard,
      getProgress,
    ],
  );
}
