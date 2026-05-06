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

import React, { useState } from 'react';
import poemsData from '../../data/wenyan/poems.json';
import type { WenyanContent, WenyanPoem } from '../../data/wenyan/types';
import { wenyanStrings } from '../../i18n/wenyan-strings';
import { useWenyanApi } from './useWenyanApi';
import { PoemListView } from './PoemListView';
import { PoemReader } from './PoemReader';
import { WenyanPairingSession } from './WenyanPairingSession';

const content = poemsData as WenyanContent;

interface WenyanModuleProps {
  onExit: () => void;
  userName?: string | null;
}

type ViewMode = 'list' | 'reader' | 'pairing';

export function WenyanModule({ onExit }: WenyanModuleProps) {
  const s = wenyanStrings.cn;
  const { progress, isLoadingProgress, progressError, completePoem } = useWenyanApi();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPoemId, setSelectedPoemId] = useState<string | null>(null);

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
        onExit={() => {
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
    const isCompleted = progress.some((p) => p.poem_id === poem.id);
    return (
      <PoemReader
        poem={poem}
        isCompleted={isCompleted}
        onBack={() => setViewMode('list')}
        onComplete={async (poemId) => {
          const result = await completePoem(poemId);
          // Stage C: trigger pairing exercise every 3 completions.
          if (result.pairingDue) {
            setSelectedPoemId(null);
            setViewMode('pairing');
          } else {
            setSelectedPoemId(null);
            setViewMode('list');
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
      onSelect={(poemId) => {
        setSelectedPoemId(poemId);
        setViewMode('reader');
      }}
      onExit={onExit}
    />
  );
}
