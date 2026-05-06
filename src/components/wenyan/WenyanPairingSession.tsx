/**
 * 文言教材 — pairing exercise (#26 Stage C).
 *
 * UX: two columns of 5 rows each. Click a left (word) row to select,
 * then click a right (meaning) row to pair them. Click an already-paired
 * row to unpair. Submit when all 5 are paired. SVG overlay draws lines
 * between paired rows; recomputed on layout changes (mount, resize,
 * pairs map mutation).
 *
 * Layout is two-column at all viewport sizes — the line-drawing UX
 * doesn't translate to vertical stacking. Gap narrows on mobile.
 *
 * Color tokens follow DrillPairSession conventions:
 *   correct → border-emerald-600/40 bg-emerald-600/10, stroke #10b981
 *   wrong   → border-rose-400/40 bg-rose-400/10, stroke rose token
 *   selected (col A) → ring-2 ring-gold/60
 *   paired (default) → border-cream/40, stroke cream/40
 */

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { wenyanStrings } from '../../i18n/wenyan-strings';
import { useWenyanApi } from './useWenyanApi';
import type {
  PairingQueue,
  PairingSubmitResponse,
  PairingMeaning,
} from '../../data/wenyan/types';

interface WenyanPairingSessionProps {
  onExit: () => void;
}

interface LineSpec {
  pairKey: string;       // word_entry_id-meaning_entry_id
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  state: 'pending' | 'correct' | 'wrong';
}

const LINE_COLORS = {
  pending: 'currentColor',         // inherits from parent text-cream/40
  correct: '#10b981',               // emerald-500
  wrong:   'rgb(251 113 133 / 0.9)', // rose-400 approx
} as const;

export function WenyanPairingSession({ onExit }: WenyanPairingSessionProps) {
  const s = wenyanStrings.cn;
  const { fetchPairingQueue, submitPairing } = useWenyanApi();

  const [queue, setQueue] = useState<PairingQueue | null>(null);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState<string | null>(null);

  // pairs: word_entry_id → meaning_entry_id
  const [pairs, setPairs] = useState<Map<number, number>>(new Map());
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [results, setResults] = useState<PairingSubmitResponse | null>(null);

  // Refs for line endpoint computation
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const meaningRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [lines, setLines] = useState<LineSpec[]>([]);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // ─── Queue fetch ───────────────────────────────────────────────────────
  const loadQueue = useCallback(async () => {
    setQueueLoading(true);
    setQueueError(null);
    try {
      const q = await fetchPairingQueue();
      setQueue(q);
      setPairs(new Map());
      setSelectedWordId(null);
      setResults(null);
      setSubmitError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setQueueError(msg);
    } finally {
      setQueueLoading(false);
    }
  }, [fetchPairingQueue]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // ─── Layout — recompute lines after pairs / size changes ──────────────
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      setLines([]);
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const next: LineSpec[] = [];

    const buildLine = (
      wordId: number,
      meaningId: number,
      state: LineSpec['state'],
    ) => {
      const w = wordRefs.current.get(wordId);
      const m = meaningRefs.current.get(meaningId);
      if (!w || !m) return;
      const wr = w.getBoundingClientRect();
      const mr = m.getBoundingClientRect();
      next.push({
        pairKey: `${wordId}-${meaningId}`,
        x1: wr.right - containerRect.left,
        y1: wr.top + wr.height / 2 - containerRect.top,
        x2: mr.left - containerRect.left,
        y2: mr.top + mr.height / 2 - containerRect.top,
        state,
      });
    };

    if (results) {
      // Post-submit: lines reflect submitted pairings, colored by correctness.
      for (const r of results.results) {
        buildLine(
          r.word_entry_id,
          r.user_meaning_entry_id,
          r.correct ? 'correct' : 'wrong',
        );
      }
    } else {
      for (const [wordId, meaningId] of pairs) {
        buildLine(wordId, meaningId, 'pending');
      }
    }
    setLines(next);
  }, [pairs, results, containerSize, queue]);

  // Window-resize listener — triggers layout recompute via containerSize.
  useEffect(() => {
    const onResize = () => {
      const c = containerRef.current;
      if (!c) return;
      setContainerSize({ w: c.clientWidth, h: c.clientHeight });
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [queue]);

  // ─── Click handlers ────────────────────────────────────────────────────
  const handleWordClick = (wordId: number) => {
    if (results || submitting) return;
    if (pairs.has(wordId)) {
      // Unpair
      const next = new Map(pairs);
      next.delete(wordId);
      setPairs(next);
      setSelectedWordId(null);
      return;
    }
    setSelectedWordId(wordId);
  };

  const handleMeaningClick = (meaningId: number) => {
    if (results || submitting) return;
    // Find the word currently paired to this meaning, if any.
    let pairedWordId: number | null = null;
    for (const [w, m] of pairs) {
      if (m === meaningId) { pairedWordId = w; break; }
    }
    if (pairedWordId !== null) {
      // Unpair and re-select that word for the user's convenience.
      const next = new Map(pairs);
      next.delete(pairedWordId);
      setPairs(next);
      setSelectedWordId(pairedWordId);
      return;
    }
    if (selectedWordId === null) return; // no word selected → no-op
    const next = new Map(pairs);
    next.set(selectedWordId, meaningId);
    setPairs(next);
    setSelectedWordId(null);
  };

  const handleSubmit = async () => {
    if (!queue || pairs.size !== 5 || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const submitPairs = Array.from(pairs.entries()).map(([w, m]) => ({
        word_entry_id: w,
        meaning_entry_id: m,
      }));
      const resp = await submitPairing({
        pairingId: queue.pairingId,
        pairs: submitPairs,
      });
      setResults(resp);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render branches ───────────────────────────────────────────────────
  if (queueLoading) {
    return (
      <div className="min-h-screen bg-ink-bg text-cream flex items-center justify-center">
        <span className="font-serif text-lg text-creamDim animate-pulse">
          {s.pairingLoading}
        </span>
      </div>
    );
  }

  if (queueError || !queue) {
    const isInsufficient = queueError?.includes('INSUFFICIENT_VOCABULARY');
    return (
      <div className="min-h-screen bg-ink-bg text-cream flex items-center justify-center p-8">
        <div className="max-w-sm text-center space-y-4">
          <p className="text-rose font-serif">
            {isInsufficient ? s.pairingErrorInsufficient : s.pairingErrorLoad}
          </p>
          {queueError && !isInsufficient && (
            <p className="text-creamDim text-xs">{queueError}</p>
          )}
          <div className="flex justify-center gap-3">
            {!isInsufficient && (
              <button
                onClick={loadQueue}
                className="px-4 py-2 border border-ink-line rounded text-cream hover:border-cream/40 transition-colors"
              >
                {s.pairingRetry}
              </button>
            )}
            <button
              onClick={onExit}
              className="px-4 py-2 border border-ink-line rounded text-creamDim hover:text-cream hover:border-cream/40 transition-colors"
            >
              {s.pairingRestart}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const meaningsById = new Map<number, PairingMeaning>(
    queue.meanings.map(m => [m.entry_id, m]),
  );
  const meaningTextFor = (entryId: number) =>
    meaningsById.get(entryId)?.text ?? '';
  const wordById = new Map(queue.words.map(w => [w.entry_id, w]));
  const wordFor = (entryId: number) => wordById.get(entryId);

  const allPaired = pairs.size === 5;

  return (
    <div className="min-h-screen bg-ink-bg text-cream font-sans antialiased">
      <header className="flex items-center justify-between px-6 py-4 border-b border-ink-line">
        <div>
          <h1 className="font-serif text-2xl tracking-wide">{s.pairingTitle}</h1>
          <p className="text-creamDim text-xs mt-1">{s.pairingPrompt}</p>
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 border border-ink-line rounded text-creamDim hover:text-cream hover:border-cream/40 transition-colors text-sm"
        >
          {s.pairingRestart}
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-32">
        {/* Status line */}
        <p className="text-center text-creamDim text-xs mb-6">
          {results
            ? s.pairingResultsHeading(results.correct_count, results.total_count)
            : allPaired
              ? s.pairingPairsAllSet
              : s.pairingPairsRemaining(5 - pairs.size)}
        </p>

        {/* Two-column pairing grid */}
        <div
          ref={containerRef}
          className="relative grid grid-cols-2 gap-4 sm:gap-12 md:gap-20"
        >
          {/* Column A: words */}
          <div className="space-y-3">
            {queue.words.map(w => {
              const isPaired = pairs.has(w.entry_id);
              const isSelected = selectedWordId === w.entry_id;
              const resultRow = results?.results.find(r => r.word_entry_id === w.entry_id);
              let stateClass = 'border-ink-line';
              if (resultRow) {
                stateClass = resultRow.correct
                  ? 'border-emerald-600/40 bg-emerald-600/10'
                  : 'border-rose-400/40 bg-rose-400/10';
              } else if (isSelected) {
                stateClass = 'border-gold/60 ring-2 ring-gold/40';
              } else if (isPaired) {
                stateClass = 'border-cream/40';
              }
              return (
                <button
                  key={w.entry_id}
                  ref={el => {
                    if (el) wordRefs.current.set(w.entry_id, el);
                    else wordRefs.current.delete(w.entry_id);
                  }}
                  onClick={() => handleWordClick(w.entry_id)}
                  disabled={!!results || submitting}
                  className={`w-full px-3 sm:px-4 py-3 sm:py-4 border rounded-md text-left transition-colors disabled:cursor-default ${stateClass}`}
                >
                  <div className="font-serif text-gold text-xl sm:text-2xl leading-tight">
                    {w.word}
                  </div>
                  {w.pinyin && (
                    <div className="text-creamDim text-xs mt-0.5">{w.pinyin}</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Column B: meanings (shuffled) */}
          <div className="space-y-3">
            {queue.meanings.map(m => {
              // Find which word, if any, is paired with this meaning.
              let pairedWordId: number | null = null;
              for (const [w, mid] of pairs) {
                if (mid === m.entry_id) { pairedWordId = w; break; }
              }
              const isPaired = pairedWordId !== null;
              const resultRow = results?.results.find(r => r.user_meaning_entry_id === m.entry_id);
              let stateClass = 'border-ink-line';
              if (resultRow) {
                stateClass = resultRow.correct
                  ? 'border-emerald-600/40 bg-emerald-600/10'
                  : 'border-rose-400/40 bg-rose-400/10';
              } else if (isPaired) {
                stateClass = 'border-cream/40';
              }
              return (
                <button
                  key={m.entry_id}
                  ref={el => {
                    if (el) meaningRefs.current.set(m.entry_id, el);
                    else meaningRefs.current.delete(m.entry_id);
                  }}
                  onClick={() => handleMeaningClick(m.entry_id)}
                  disabled={!!results || submitting}
                  className={`w-full px-3 sm:px-4 py-3 sm:py-4 border rounded-md text-left transition-colors disabled:cursor-default ${stateClass}`}
                >
                  <p className="text-cream text-sm sm:text-base leading-snug">{m.text}</p>
                </button>
              );
            })}
          </div>

          {/* SVG overlay — drawn over the columns; pointer-events:none so
              clicks pass through to the rows beneath. */}
          <svg
            className="absolute inset-0 pointer-events-none text-cream/40"
            width="100%"
            height="100%"
            aria-hidden="true"
          >
            {lines.map(l => (
              <line
                key={l.pairKey}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                strokeWidth={2}
                stroke={LINE_COLORS[l.state]}
              />
            ))}
          </svg>
        </div>

        {/* Submit / results actions */}
        <div className="mt-10 flex flex-col items-center gap-4">
          {!results && (
            <>
              <button
                onClick={handleSubmit}
                disabled={!allPaired || submitting}
                className="px-8 py-3 border border-gold/50 rounded text-gold hover:bg-gold hover:text-ink-bg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gold transition-colors font-serif text-base"
              >
                {submitting ? s.pairingLoading : s.pairingSubmit}
              </button>
              {submitError && (
                <p className="text-rose text-sm font-serif" role="status">
                  {s.pairingErrorSubmit}: {submitError}
                </p>
              )}
            </>
          )}
          {results && (
            <>
              {/* Per-pair results detail */}
              <div className="w-full max-w-xl space-y-3 mb-2">
                {results.results.map(r => {
                  const word = wordFor(r.word_entry_id);
                  const userMeaning = meaningTextFor(r.user_meaning_entry_id);
                  const correctMeaning = meaningTextFor(r.actual_meaning_entry_id);
                  return (
                    <div
                      key={r.word_entry_id}
                      className={`px-4 py-3 rounded border ${r.correct ? 'border-emerald-600/40 bg-emerald-600/5' : 'border-rose-400/40 bg-rose-400/5'}`}
                    >
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-serif text-gold text-lg">{word?.word}</span>
                        <span className="text-creamDim text-xs">{word?.pinyin}</span>
                        <span className="text-creamDim text-sm mx-1">→</span>
                        <span className={`text-sm ${r.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {userMeaning}
                        </span>
                      </div>
                      {!r.correct && (
                        <p className="text-creamDim text-xs mt-1.5">
                          {s.pairingCorrectAnswer}{correctMeaning}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={onExit}
                className="px-8 py-3 border border-gold/50 rounded text-gold hover:bg-gold hover:text-ink-bg transition-colors font-serif text-base"
              >
                {s.pairingRestart}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
