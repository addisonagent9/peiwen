/**
 * 文言教材 — single-poem reader (Stage C-4 redesign).
 *
 * Layout (top → bottom):
 *   1. Sticky trainer-aligned header — chevron back + centered title +
 *      animated gold brush-stroke divider (verbatim from PoemListView).
 *   2. Dynasty · author meta line (centered, muted).
 *   3. Background paragraphs.
 *   4. Original poem text.
 *   5. Translation.
 *   6. Vocabulary list (single scrollable column, ink-line/30 separators).
 *   7. Action button — text dynamic via `nextUnfinishedPoemId` prop:
 *        '下一首' if more unfinished poems remain in the cycle, else '返回列表'.
 *      Always present (no static "已完成 ✓" fallback). Click fires onComplete;
 *      parent (WenyanModule) decides routing (next poem / pairing / list).
 */

import React, { useMemo, useState } from 'react';
import { wenyanStrings } from '../../i18n/wenyan-strings';
import { PlayButton } from './PlayButton';
import { SequencePlayButton } from './SequencePlayButton';
import { useWenyanAudioSequence } from './useWenyanAudioSequence';
import type { WenyanPoem, WenyanCompleteResponse } from '../../data/wenyan/types';

interface PoemReaderProps {
  poem: WenyanPoem;
  nextUnfinishedPoemId: string | null;
  onBack: () => void;
  onComplete: (poemId: string) => Promise<WenyanCompleteResponse>;
}

export function PoemReader({
  poem,
  nextUnfinishedPoemId,
  onBack,
  onComplete,
}: PoemReaderProps) {
  const s = wenyanStrings.cn;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buttonText = submitting
    ? s.loadingProgress
    : nextUnfinishedPoemId
      ? s.nextPoem
      : s.returnToList;

  // Audio tag arrays for section-header SequencePlayButtons. Memoized so
  // hook deps (tags reference identity) only churn when the underlying
  // poem changes — though PoemReader's key={poem.id} also forces remount.
  const backgroundTags = useMemo(
    () => poem.background.map((_, i) => `wenyan:background:${poem.id}:chunk-${i + 1}`),
    [poem.id, poem.background],
  );
  const couplets = useMemo(
    () => poem.fullText.split('\n').map((l) => l.trim()).filter(Boolean),
    [poem.fullText],
  );
  const coupletTags = useMemo(
    () => couplets.map((_, i) => `wenyan:poem-body:${poem.id}:couplet-${i + 1}`),
    [poem.id, couplets],
  );
  const translationTags = useMemo(
    () => [`wenyan:translation:${poem.id}`],
    [poem.id],
  );

  // D-2.6: hooks lifted out of SequencePlayButton so the parent can
  // subscribe to `currentIndex` for the active-item border indicator.
  // Mutex still works because each hook participates in playbackRegistry
  // internally — three sibling hooks just register/clear in turn.
  const bgSeq = useWenyanAudioSequence(backgroundTags, { autoPlay: true });
  const cpSeq = useWenyanAudioSequence(coupletTags);
  const trSeq = useWenyanAudioSequence(translationTags);

  const handleClick = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onComplete(poem.id);
      // Parent handles routing. With key={poem.id} on this component, an advance
      // triggers full remount, so this state is naturally discarded.
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-bg text-cream font-sans antialiased">
      {/* Header — chevron back + centered title + brush-stroke divider */}
      <header className="sticky top-0 z-20 bg-ink-bg/95 backdrop-blur-sm">
        <div className="max-w-screen-sm mx-auto px-5 py-4 flex items-center">
          <div className="w-10">
            <button
              onClick={onBack}
              aria-label={s.backToList}
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
            <h1 className="font-serif text-cream text-lg tracking-wide truncate">
              {poem.title}
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

        {/* Scoped keyframes — identical to PoemListView; harmless collision. */}
        <style>{`
          @keyframes pw-brushstroke {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </header>

      <main className="max-w-screen-sm mx-auto px-5 pb-20 pt-6 space-y-10">
        {/* Dynasty · author meta */}
        <p className="text-center text-creamDim text-xs mt-4">
          {poem.dynasty} · {poem.author}
        </p>

        {/* Background — D-2.6: button moved ABOVE content (left-aligned pill).
            Each chunk gets a left-border indicator while it's the active
            currentIndex (transition-all duration-300; transparent border
            reserved when inactive to prevent layout jumping). */}
        {poem.background.length > 0 && (
          <section>
            <h2 className="font-serif text-creamDim text-sm tracking-wider uppercase mb-3">
              {s.backgroundHeading}
            </h2>
            <SequencePlayButton
              label={s.backgroundHeading}
              isPlaying={bgSeq.isPlaying}
              isLoading={bgSeq.isLoading}
              error={bgSeq.error}
              onClick={bgSeq.play}
              size="sm"
            />
            <div className="mt-4 space-y-3 text-cream font-serif leading-relaxed">
              {poem.background.map((para, i) => {
                const isActive = bgSeq.isPlaying && bgSeq.currentIndex === i;
                return (
                  <p
                    key={i}
                    className={`pl-3 transition-all duration-300 ${
                      isActive
                        ? 'border-l-2 border-gold/60'
                        : 'border-l-2 border-transparent'
                    }`}
                  >
                    {para}
                  </p>
                );
              })}
            </div>
          </section>
        )}

        {/* Poem text — section-header pill above couplets; per-couplet
            border-l indicator while playing. */}
        <section>
          <h2 className="font-serif text-creamDim text-sm tracking-wider uppercase mb-3">
            {s.poemTextHeading}
          </h2>
          <SequencePlayButton
            label={s.poemTextHeading}
            isPlaying={cpSeq.isPlaying}
            isLoading={cpSeq.isLoading}
            error={cpSeq.error}
            onClick={cpSeq.play}
            size="sm"
          />
          <div className="mt-4 space-y-3 font-serif text-cream text-xl leading-loose tracking-wide">
            {couplets.map((line, i) => {
              const isActive = cpSeq.isPlaying && cpSeq.currentIndex === i;
              return (
                <div
                  key={i}
                  className={`pl-3 break-words transition-all duration-300 ${
                    isActive
                      ? 'border-l-2 border-gold/60'
                      : 'border-l-2 border-transparent'
                  }`}
                >
                  {line}
                </div>
              );
            })}
          </div>
        </section>

        {/* Translation — single clip; whole paragraph highlights while playing. */}
        <section>
          <h2 className="font-serif text-creamDim text-sm tracking-wider uppercase mb-3">
            {s.translationHeading}
          </h2>
          <SequencePlayButton
            label={s.translationHeading}
            isPlaying={trSeq.isPlaying}
            isLoading={trSeq.isLoading}
            error={trSeq.error}
            onClick={trSeq.play}
            size="sm"
          />
          <p
            className={`mt-4 pl-3 font-serif text-creamDim text-base leading-relaxed whitespace-pre-wrap transition-all duration-300 ${
              trSeq.isPlaying
                ? 'border-l-2 border-gold/60'
                : 'border-l-2 border-transparent'
            }`}
          >
            {poem.translation}
          </p>
        </section>

        {/* Vocabulary — each entry's word headline gets a play button on the right */}
        <section>
          <h2 className="font-serif text-creamDim text-sm tracking-wider uppercase mb-4">
            {s.vocabHeading}
          </h2>
          <div className="divide-y divide-ink-line/30">
            {poem.vocabulary.map((v, i) => (
              <div key={`${v.word}-${v.senseSlug}-${i}`} className="py-5 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-baseline gap-3 flex-wrap min-w-0">
                    <span className="font-serif text-gold text-2xl">{v.word}</span>
                    <span className="text-creamDim text-sm">{v.pinyin}</span>
                  </div>
                  <PlayButton
                    tag={`wenyan:vocab:${poem.id}:${v.senseSlug}`}
                    size="sm"
                  />
                </div>
                <p className="text-cream text-base leading-relaxed">
                  <span className="text-creamDim text-xs mr-2 align-middle">{s.vocabAncient}</span>
                  {v.ancientMeaning}
                </p>
                <p className="text-creamDim text-sm leading-relaxed">
                  <span className="mr-2 align-middle">↔</span>
                  <span className="text-creamDim/80 text-xs mr-2 align-middle">{s.vocabModern}</span>
                  {v.modernMeaning}
                </p>
                {v.notes && (
                  <p className="text-creamDim/70 text-sm italic leading-relaxed">
                    <span className="not-italic text-creamDim/60 text-xs mr-2 align-middle">{s.vocabNotes}</span>
                    {v.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Action button — always present, dynamic text */}
        <section className="pt-6 border-t border-ink-line/40">
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleClick}
              disabled={submitting}
              className="px-8 py-3 border border-gold/50 rounded text-gold hover:bg-gold hover:text-ink-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-serif text-base"
            >
              {buttonText}
            </button>
            {error && (
              <p className="text-rose text-sm font-serif" role="status">
                {s.errorMarkingCompleted}: {error}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
