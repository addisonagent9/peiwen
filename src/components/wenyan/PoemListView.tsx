/**
 * 文言教材 — poem list view (Stage C-3 redesign).
 *
 * Layout mirrors the trainer module's PingshuiTrainer/TrainerHome pattern:
 *   1. Sticky header with chevron back button + centered title (text-lg)
 *      + animated gold brush-stroke divider underneath.
 *   2. Greeting line ("你好, {userName}") and the "练习配对" button on
 *      the same row, inside the max-w-screen-sm content container.
 *   3. SectionLabel divider with flanking horizontal lines and
 *      centered "诗目" text.
 *   4. Poem cards (per-card visuals unchanged from Stage B).
 *
 * The SectionLabel JSX is inlined here rather than extracted as a shared
 * helper — kept minimal until another wenyan view needs the same divider.
 */

import React from 'react';
import { wenyanStrings } from '../../i18n/wenyan-strings';
import type { WenyanContent, WenyanPoem, WenyanProgressEntry } from '../../data/wenyan/types';

interface PoemListViewProps {
  content: WenyanContent;
  progress: WenyanProgressEntry[];
  vocabCount: number;
  isLoadingVocab: boolean;
  userName: string | null;
  onSelect: (poemId: string) => void;
  onStartPairing: () => void;
  onExit: () => void;
}

export function PoemListView({
  content,
  progress,
  vocabCount,
  isLoadingVocab,
  userName,
  onSelect,
  onStartPairing,
  onExit,
}: PoemListViewProps) {
  const s = wenyanStrings.cn;
  const completedSet = new Set(progress.map((p) => p.poem_id));
  const orderedPoems: WenyanPoem[] = content.displayOrder
    .map((id) => content.poems.find((p) => p.id === id))
    .filter((p): p is WenyanPoem => p !== undefined);
  // Stage C-5: split by completion state into two sections.
  const inProgressPoems = orderedPoems.filter((p) => !completedSet.has(p.id));
  const completedPoems = orderedPoems.filter((p) => completedSet.has(p.id));
  const showPairingButton = !isLoadingVocab && vocabCount >= 5;

  return (
    <div className="min-h-screen bg-ink-bg text-cream font-sans antialiased">
      {/* Header — chevron back + centered title + spacer + brush-stroke divider */}
      <header className="sticky top-0 z-20 bg-ink-bg/95 backdrop-blur-sm">
        <div className="max-w-screen-sm mx-auto px-5 py-4 flex items-center">
          <div className="w-10">
            <button
              onClick={onExit}
              aria-label={s.backToHome}
              className="w-10 h-10 -ml-2 flex items-center justify-center text-creamDim hover:text-cream transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M11.5 3.5 L5.5 9 L11.5 14.5"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 text-center">
            <h1 className="font-serif text-cream text-lg tracking-wide">
              {s.moduleTitle}
            </h1>
          </div>

          <div className="w-10" />
        </div>

        {/* Brush-stroke gold divider — animated once on mount */}
        <div className="max-w-screen-sm mx-auto px-5">
          <svg
            viewBox="0 0 320 4"
            preserveAspectRatio="none"
            className="w-full h-[3px] text-gold"
            aria-hidden
          >
            <path
              d="M 4 2 Q 160 0.5 316 2"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
              style={{
                strokeDasharray: 320,
                strokeDashoffset: 320,
                animation: 'pw-brushstroke 1.2s ease-out forwards',
              }}
            />
          </svg>
        </div>

        {/* Scoped keyframes — identical animation name as TrainerHeader; harmless collision */}
        <style>{`
          @keyframes pw-brushstroke {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </header>

      <main className="max-w-screen-sm mx-auto px-5 pb-20 pt-6 space-y-8">
        {/* Greeting + practice button row */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-3xl text-cream tracking-wide min-w-0 truncate">
            {userName ? s.greeting(userName) : ''}
          </h2>
          {showPairingButton && (
            <button
              onClick={onStartPairing}
              title={s.practicePairingHint}
              className="shrink-0 px-4 py-2 border border-emerald-600/50 rounded text-emerald-600 hover:bg-emerald-600 hover:text-ink-bg transition-colors text-sm font-serif whitespace-nowrap"
            >
              {s.practicePairingButton}
            </button>
          )}
        </div>

        {/* In Progress section — full card layout (Stage B's design carries
            forward). Stage C-5 split: only un-completed poems render here. */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px flex-1 bg-ink-line" />
            <span className="text-creamDim text-xs tracking-[0.2em] uppercase">
              {s.inProgressSectionTitle}
            </span>
            <span className="h-px flex-1 bg-ink-line" />
          </div>

          <div className="space-y-3">
            {inProgressPoems.map((poem) => {
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
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Completed section — simple title list (no card framing). Rendered
            only when at least one poem is completed; default state hides it. */}
        {completedPoems.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px flex-1 bg-ink-line" />
              <span className="text-creamDim text-xs tracking-[0.2em] uppercase">
                {s.completedSectionTitle}
              </span>
              <span className="h-px flex-1 bg-ink-line" />
            </div>

            <div className="divide-y divide-ink-line/30">
              {completedPoems.map((poem) => (
                <button
                  key={poem.id}
                  onClick={() => onSelect(poem.id)}
                  className="w-full flex items-center justify-between gap-4 py-3 text-left text-creamDim hover:text-cream transition-colors"
                >
                  <span className="font-serif text-base">{poem.title}</span>
                  <span className="text-xs whitespace-nowrap">
                    {poem.author} · {poem.dynasty}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
