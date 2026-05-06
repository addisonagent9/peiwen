/**
 * 文言教材 — top-level module router.
 *
 * State machine: 'list' ↔ 'reader' ↔ 'pairing'. Loads completion progress
 * on mount (admin-gated /api/wenyan/progress) and pipes it into the list
 * view's checkmarks + the reader view's "已完成 ✓" badge. Bundled poem
 * content comes from src/data/wenyan/poems.json — no API call for content.
 *
 * Pairing trigger (Stage C): /poems/:id/complete returns pairingDue: true
 * every 3 completions; on that signal, transition to 'pairing' instead of
 * back to 'list'. After pairing exit ('返回模块'), fall back to 'list'.
 */

import React, { useEffect, useState } from 'react';
import poemsData from '../../data/wenyan/poems.json';
import type { WenyanContent, WenyanPoem } from '../../data/wenyan/types';
import { wenyanStrings } from '../../i18n/wenyan-strings';
import { useWenyanApi } from './useWenyanApi';
import { PoemListView } from './PoemListView';
import { PoemReader } from './PoemReader';
import { WenyanPairingSession } from './WenyanPairingSession';

const content = poemsData as WenyanContent;

/**
 * Cyclical next-unfinished search. Walks `displayOrder` forward from
 * `currentPoemId+1` to the end, then wraps to 0..currentPoemId-1. Treats
 * `currentPoemId` itself as just-completed (so we never loop back to it).
 * Returns null if every poem is completed.
 */
function findNextUnfinishedPoemId(
  displayOrder: string[],
  completedSet: Set<string>,
  currentPoemId: string,
): string | null {
  const completed = new Set(completedSet);
  completed.add(currentPoemId);
  const idx = displayOrder.indexOf(currentPoemId);
  if (idx === -1) return null;
  for (let i = idx + 1; i < displayOrder.length; i++) {
    if (!completed.has(displayOrder[i])) return displayOrder[i];
  }
  for (let i = 0; i < idx; i++) {
    if (!completed.has(displayOrder[i])) return displayOrder[i];
  }
  return null;
}

interface WenyanModuleProps {
  onExit: () => void;
  userName?: string | null;
}

type ViewMode = 'list' | 'reader' | 'pairing';

export function WenyanModule({ onExit, userName }: WenyanModuleProps) {
  const s = wenyanStrings.cn;
  const { progress, isLoadingProgress, progressError, completePoem, fetchLibrary } =
    useWenyanApi();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPoemId, setSelectedPoemId] = useState<string | null>(null);
  const [vocabCount, setVocabCount] = useState<number>(0);
  const [isLoadingVocab, setIsLoadingVocab] = useState(true);

  // Fetch library on mount to gate the manual pairing button (#26 stage C-2:
  // button visible iff user has ≥5 vocab entries — the floor for /pairing/queue).
  useEffect(() => {
    let cancelled = false;
    fetchLibrary()
      .then((library) => {
        if (cancelled) return;
        setVocabCount(library.length);
        setIsLoadingVocab(false);
      })
      .catch(() => {
        // Swallow — vocab count defaults to 0, hides button. Graceful degradation.
        if (cancelled) return;
        setVocabCount(0);
        setIsLoadingVocab(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchLibrary]);

  if (isLoadingProgress) {
    return (
      <div className="min-h-screen bg-ink-bg text-cream flex items-center justify-center">
        <span className="font-serif text-lg text-creamDim animate-pulse">
          {s.loadingProgress}
        </span>
      </div>
    );
  }

  if (progressError) {
    return (
      <div className="min-h-screen bg-ink-bg text-cream flex items-center justify-center p-8">
        <div className="max-w-xs text-center space-y-4">
          <p className="text-rose font-serif">{s.errorLoadingProgress}</p>
          <p className="text-creamDim text-xs">{progressError}</p>
          <button
            onClick={onExit}
            className="px-4 py-2 border border-ink-line rounded text-cream hover:bg-cream hover:text-ink-bg transition-colors"
          >
            {s.backToHome}
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'pairing') {
    return (
      <WenyanPairingSession
        onExit={async () => {
          // Refresh vocab count — mastery may have changed; covers edge cases
          // where the user's vocab state shifted during the session.
          try {
            const library = await fetchLibrary();
            setVocabCount(library.length);
          } catch {
            // Ignore — keep prior count.
          }
          setSelectedPoemId(null);
          setViewMode('list');
        }}
      />
    );
  }

  if (viewMode === 'reader' && selectedPoemId) {
    const poem: WenyanPoem | undefined = content.poems.find(
      (p) => p.id === selectedPoemId,
    );
    if (!poem) {
      // Shouldn't happen — list only surfaces poems from content.poems.
      setSelectedPoemId(null);
      setViewMode('list');
      return null;
    }
    const completedSet = new Set(progress.map((p) => p.poem_id));
    const nextUnfinishedId = findNextUnfinishedPoemId(
      content.displayOrder,
      completedSet,
      selectedPoemId,
    );
    return (
      <PoemReader
        // key forces unmount + remount on poem change → scroll resets to top.
        key={poem.id}
        poem={poem}
        nextUnfinishedPoemId={nextUnfinishedId}
        onBack={() => setViewMode('list')}
        onComplete={async (poemId) => {
          const result = await completePoem(poemId);
          // Stage C: trigger pairing exercise every 3 completions.
          if (result.pairingDue) {
            setSelectedPoemId(null);
            setViewMode('pairing');
          } else {
            // Re-compute after /complete — `progress` may not yet reflect the
            // mutation, so explicitly add poemId to the completed set.
            const updatedCompleted = new Set([
              ...progress.map((p) => p.poem_id),
              poemId,
            ]);
            const next = findNextUnfinishedPoemId(
              content.displayOrder,
              updatedCompleted,
              poemId,
            );
            if (next) {
              setSelectedPoemId(next);
              // viewMode stays 'reader'; key={poem.id} swap drives remount.
            } else {
              setSelectedPoemId(null);
              setViewMode('list');
            }
          }
          return result;
        }}
      />
    );
  }

  // Default: list view
  return (
    <PoemListView
      content={content}
      progress={progress}
      vocabCount={vocabCount}
      isLoadingVocab={isLoadingVocab}
      userName={userName ?? null}
      onSelect={(poemId) => {
        setSelectedPoemId(poemId);
        setViewMode('reader');
      }}
      onStartPairing={() => {
        setViewMode('pairing');
      }}
      onExit={onExit}
    />
  );
}
