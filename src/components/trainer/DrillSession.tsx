import React, { useCallback, useEffect, useState } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import { DrillCard } from './DrillCard';
import type { DrillItem } from './DrillCard';

type Phase = 'start' | 'active' | 'summary';

interface DrillSessionProps {
  strings: TrainerStrings;
  onExit: () => void;
}

export const DrillSession: React.FC<DrillSessionProps> = ({
  strings,
  onExit,
}) => {
  const [phase, setPhase] = useState<Phase>('start');
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [items, setItems] = useState<DrillItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/trainer/drill/queue?limit=0', { credentials: 'include' })
      .then(r => r.json())
      .then(body => setDueCount(body.dueCount ?? 0))
      .catch(() => setDueCount(0));
  }, []);

  const startDrill = useCallback(async (count: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trainer/drill/queue?type=char-to-rhyme&limit=${count}`, {
        credentials: 'include',
      });
      const body = await res.json();
      if (body.items?.length > 0) {
        setItems(body.items);
        setCurrentIndex(0);
        setResults([]);
        setPhase('active');
      }
    } catch {
      // stay on start screen
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnswer = useCallback((correct: boolean) => {
    const item = items[currentIndex];
    fetch('/api/trainer/drill/response', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text: item.text, correct, drillType: 'char-to-rhyme' }),
    }).catch(() => {});

    setResults(prev => [...prev, correct]);

    if (currentIndex + 1 >= items.length) {
      setPhase('summary');
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [items, currentIndex]);

  // --- Start screen ---
  if (phase === 'start') {
    return (
      <div className="pt-6 pb-24 space-y-8">
        <header>
          <button
            onClick={onExit}
            className="text-creamDim text-xs hover:text-cream transition-colors mb-4 flex items-center gap-1"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M6 2 L3 5 L6 8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {strings.backToHome}
          </button>
          <h2 className="font-serif text-cream text-2xl tracking-wide">
            {strings.drillSessionTitle}
          </h2>
          {dueCount !== null && (
            <p className="text-creamDim text-sm mt-2">
              {strings.drillDueCount(dueCount)}
            </p>
          )}
        </header>

        <div className="grid grid-cols-2 gap-3">
          {[
            { count: 5, label: strings.drillPickCount5 },
            { count: 10, label: strings.drillPickCount10 },
            { count: 20, label: strings.drillPickCount20 },
            { count: 50, label: strings.drillPickCountAll },
          ].map(({ count, label }) => (
            <button
              key={count}
              onClick={() => startDrill(count)}
              disabled={loading}
              className="py-4 border border-ink-line rounded-lg font-serif text-cream text-lg hover:border-gold/40 hover:text-gold transition-colors disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Active drill ---
  if (phase === 'active' && items[currentIndex]) {
    return (
      <div className="pt-6 pb-24">
        <DrillCard
          key={currentIndex}
          item={items[currentIndex]}
          onAnswer={handleAnswer}
          progress={{ current: currentIndex + 1, total: items.length }}
          strings={strings}
        />
      </div>
    );
  }

  // --- Summary ---
  const correctCount = results.filter(Boolean).length;
  return (
    <div className="pt-6 pb-24 space-y-8 text-center">
      <h2 className="font-serif text-cream text-2xl tracking-wide">
        {strings.drillSummaryTitle}
      </h2>
      <p className="text-gold text-3xl font-serif">
        {strings.drillSummaryStats(correctCount, results.length)}
      </p>
      <button
        onClick={onExit}
        className="mx-auto px-6 py-3 border border-ink-line rounded text-cream hover:border-cream/40 transition-colors"
      >
        {strings.backToHome}
      </button>
    </div>
  );
};
