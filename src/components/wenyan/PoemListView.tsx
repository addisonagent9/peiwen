/**
 * 文言教材 — poem list view. Renders the 5 poems in displayOrder with
 * a completion checkmark for poems the user has already finished.
 */

import React from 'react';
import { wenyanStrings } from '../../i18n/wenyan-strings';
import type { WenyanContent, WenyanPoem, WenyanProgressEntry } from '../../data/wenyan/types';

interface PoemListViewProps {
  content: WenyanContent;
  progress: WenyanProgressEntry[];
  vocabCount: number;
  isLoadingVocab: boolean;
  onSelect: (poemId: string) => void;
  onStartPairing: () => void;
  onExit: () => void;
}

export function PoemListView({
  content,
  progress,
  vocabCount,
  isLoadingVocab,
  onSelect,
  onStartPairing,
  onExit,
}: PoemListViewProps) {
  const s = wenyanStrings.cn;
  const completedSet = new Set(progress.map((p) => p.poem_id));
  const orderedPoems: WenyanPoem[] = content.displayOrder
    .map((id) => content.poems.find((p) => p.id === id))
    .filter((p): p is WenyanPoem => p !== undefined);
  const showPairingButton = !isLoadingVocab && vocabCount >= 5;

  return (
    <div className="min-h-screen bg-ink-bg text-cream font-sans antialiased">
      <header className="flex items-center justify-between px-6 py-4 border-b border-ink-line">
        <button
          onClick={onExit}
          className="px-4 py-2 border border-ink-line rounded text-creamDim hover:text-cream hover:border-cream/40 transition-colors text-sm"
        >
          {s.backToHome}
        </button>
        <div className="flex flex-col items-end gap-0.5">
          <h1 className="font-serif text-2xl tracking-wide text-cream">
            {s.moduleTitle}
          </h1>
          <p className="text-creamDim text-xs">{s.moduleSubtitle}</p>
        </div>
        {showPairingButton ? (
          <button
            onClick={onStartPairing}
            title={s.practicePairingHint}
            className="px-4 py-2 border border-gold/50 rounded text-gold hover:bg-gold hover:text-ink-bg transition-colors text-sm font-serif"
          >
            {s.practicePairingButton}
          </button>
        ) : (
          <div className="w-[88px]" aria-hidden="true" />
        )}
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <h2 className="font-serif text-creamDim text-sm tracking-wider uppercase">
          {s.poemListHeading}
        </h2>

        <div className="space-y-3">
          {orderedPoems.map((poem) => {
            const completed = completedSet.has(poem.id);
            const firstLine = poem.fullText.split('\n')[0] ?? '';
            return (
              <button
                key={poem.id}
                onClick={() => onSelect(poem.id)}
                className="w-full text-left px-5 py-4 border border-ink-line rounded-md hover:border-gold/40 hover:bg-cream/5 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-gold text-lg">{poem.title}</span>
                      <span className="text-creamDim text-xs">
                        {poem.dynasty} · {poem.author}
                      </span>
                    </div>
                    <p className="font-serif text-cream text-sm truncate">{firstLine}</p>
                  </div>
                  {completed && (
                    <span
                      className="shrink-0 text-gold text-xs px-2 py-0.5 rounded-full border border-gold/40 bg-gold/10"
                      aria-label={s.completedBadge}
                    >
                      {s.completedBadge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
