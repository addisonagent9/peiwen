/**
 * 文言教材 — single-poem reader.
 *
 * Sections (top → bottom):
 *   1. Header with back button + poem title/author
 *   2. Background paragraphs
 *   3. Original poem text
 *   4. Translation
 *   5. Vocabulary list (single scrollable column, ink-line/30 separators)
 *   6. Mark-completed button (or "已完成" badge if already done)
 */

import React, { useState } from 'react';
import { wenyanStrings } from '../../i18n/wenyan-strings';
import type { WenyanPoem, WenyanCompleteResponse } from '../../data/wenyan/types';

interface PoemReaderProps {
  poem: WenyanPoem;
  isCompleted: boolean;
  onBack: () => void;
  onComplete: (poemId: string) => Promise<WenyanCompleteResponse>;
}

export function PoemReader({ poem, isCompleted, onBack, onComplete }: PoemReaderProps) {
  const s = wenyanStrings.cn;
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMarkCompleted = async () => {
    setMarking(true);
    setError(null);
    try {
      await onComplete(poem.id);
      // Parent (WenyanModule) refreshes progress + switches view.
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setMarking(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-bg text-cream font-sans antialiased">
      <header className="flex items-center justify-between px-6 py-4 border-b border-ink-line">
        <div className="min-w-0 flex-1 mr-4">
          <h1 className="font-serif text-2xl tracking-wide truncate">{poem.title}</h1>
          <p className="text-creamDim text-xs mt-1">
            {poem.dynasty} · {poem.author}
          </p>
        </div>
        <button
          onClick={onBack}
          className="shrink-0 px-4 py-2 border border-ink-line rounded text-creamDim hover:text-cream hover:border-cream/40 transition-colors text-sm"
        >
          {s.backToList}
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10 pb-24">
        {/* Background */}
        {poem.background.length > 0 && (
          <section>
            <h2 className="font-serif text-creamDim text-sm tracking-wider uppercase mb-4">
              {s.backgroundHeading}
            </h2>
            <div className="space-y-3 text-cream font-serif leading-relaxed">
              {poem.background.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>
        )}

        {/* Poem text */}
        <section>
          <h2 className="font-serif text-creamDim text-sm tracking-wider uppercase mb-4">
            {s.poemTextHeading}
          </h2>
          <pre className="font-serif text-cream text-xl leading-loose whitespace-pre-wrap break-words tracking-wide">
            {poem.fullText}
          </pre>
        </section>

        {/* Translation */}
        <section>
          <h2 className="font-serif text-creamDim text-sm tracking-wider uppercase mb-4">
            {s.translationHeading}
          </h2>
          <p className="font-serif text-creamDim text-base leading-relaxed whitespace-pre-wrap">
            {poem.translation}
          </p>
        </section>

        {/* Vocabulary */}
        <section>
          <h2 className="font-serif text-creamDim text-sm tracking-wider uppercase mb-4">
            {s.vocabHeading}
          </h2>
          <div className="divide-y divide-ink-line/30">
            {poem.vocabulary.map((v, i) => (
              <div key={`${v.word}-${v.senseSlug}-${i}`} className="py-5 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-serif text-gold text-2xl">{v.word}</span>
                  <span className="text-creamDim text-sm">{v.pinyin}</span>
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

        {/* Mark completed */}
        <section className="pt-6 border-t border-ink-line/40">
          {isCompleted ? (
            <p className="text-center text-gold font-serif text-base">{s.completedAlready}</p>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleMarkCompleted}
                disabled={marking}
                className="px-8 py-3 border border-gold/50 rounded text-gold hover:bg-gold hover:text-ink-bg disabled:opacity-50 transition-colors font-serif text-base"
              >
                {marking ? s.loadingProgress : s.markCompleted}
              </button>
              {error && (
                <p className="text-rose text-sm font-serif" role="status">
                  {s.errorMarkingCompleted}: {error}
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
