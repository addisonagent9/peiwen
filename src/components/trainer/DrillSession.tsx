import React, { useCallback, useEffect, useState } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import { DrillCard } from './DrillCard';
import type { DrillItem } from './DrillCard';

type Phase = 'start' | 'active' | 'summary';

interface DrillSessionProps {
  strings: TrainerStrings;
  scope?: 'tier1' | 'all';
  onExit: () => void;
}

export const DrillSession: React.FC<DrillSessionProps> = ({
  strings,
  scope = 'all',
  onExit,
}) => {
  const [phase, setPhase] = useState<Phase>('start');
  const [totalDrilled, setTotalDrilled] = useState<number | null>(null);
  const [totalAvailable, setTotalAvailable] = useState<number | null>(null);
  const [items, setItems] = useState<DrillItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);

  const [hintEnabled, setHintEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('drillHintEnabled');
      return saved === null ? true : saved === 'true';
    } catch { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem('drillHintEnabled', String(hintEnabled)); } catch {}
  }, [hintEnabled]);

  useEffect(() => {
    fetch('/api/trainer/drill/status', { credentials: 'include' })
      .then(r => r.json())
      .then(body => {
        setTotalDrilled(body.totalDrilled ?? 0);
        setTotalAvailable(body.totalAvailable ?? 57);
      })
      .catch(() => {
        setTotalDrilled(0);
        setTotalAvailable(57);
      });
  }, []);

  const startDrill = useCallback(async (count: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trainer/drill/queue?type=char-to-rhyme&limit=${count}&scope=${scope}`, {
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
          {totalDrilled !== null && totalAvailable !== null && (
            <p className="text-creamDim text-sm mt-2">
              {strings.drillStats(totalDrilled, totalAvailable)}
            </p>
          )}
        </header>

        {/* Hint toggle */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-creamDim text-sm">{strings.drillHintLabel}</span>
          <button
            onClick={() => setHintEnabled(!hintEnabled)}
            className={`px-3 py-1 rounded border text-xs transition-colors ${
              hintEnabled
                ? 'border-gold/60 bg-gold/10 text-gold'
                : 'border-ink-line text-creamDim hover:text-cream'
            }`}
          >
            {hintEnabled ? strings.drillHintOn : strings.drillHintOff}
          </button>
        </div>

        {/* Card count buttons */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { count: 5, label: strings.drillPickCount5 },
            { count: 10, label: strings.drillPickCount10 },
            { count: 20, label: strings.drillPickCount20 },
            { count: 57, label: strings.drillPickCountAll },
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
          hintEnabled={hintEnabled}
          onToggleHint={() => setHintEnabled(h => !h)}
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
