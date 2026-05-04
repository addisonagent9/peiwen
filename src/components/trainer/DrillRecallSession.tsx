import React, { useCallback, useEffect, useState } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import { useAudio } from '../../hooks/useAudio';
import { formatJyutping } from './FoundationModule';
import { useHintToggle } from './useHintToggle';
import { HintTogglePill } from './HintTogglePill';

interface RecallTile {
  char: string;
  pinyin: string;
  jyutping: string;
  belongsToTarget: boolean;
}

interface RecallItem {
  type: string;
  targetRhymeId: string;
  targetLabel: string;
  tiles: RecallTile[];
}

type Phase = 'start' | 'active' | 'summary';
type CardPhase = 'picking' | 'revealed';

interface DrillRecallSessionProps {
  strings: TrainerStrings;
  scope?: 'tier1' | 'tier2' | 'tier3' | 'all';
  tier?: number;
  onExit: () => void;
  onSessionComplete?: () => void;
}

export const DrillRecallSession: React.FC<DrillRecallSessionProps> = ({
  strings,
  scope = 'all',
  tier = 1,
  onExit,
  onSessionComplete,
}) => {
  const [phase, setPhase] = useState<Phase>('start');
  const { hintOn, toggle: toggleHint } = useHintToggle('drill2', false);
  const [items, setItems] = useState<RecallItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const startDrill = useCallback(async (count: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trainer/drill/recall-queue?limit=${count}&scope=${scope}`, {
        credentials: 'include',
      });
      const body = await res.json();
      if (body.items?.length > 0) {
        setItems(body.items);
        setCurrentIndex(0);
        setSessionResults([]);
        setPhase('active');
      }
    } catch {}
    finally { setLoading(false); }
  }, [scope]);

  const handleCardComplete = useCallback((correctCount: number) => {
    setSessionResults(prev => [...prev, correctCount]);
    if (currentIndex + 1 >= items.length) {
      const allResults = [...sessionResults, correctCount];
      const totalCorrect = allResults.reduce((a, b) => a + b, 0);
      const totalWrong = allResults.length * 4 - totalCorrect;
      fetch('/api/trainer/drill/session-complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier, drillNumber: 2, size: allResults.length, correctCount: totalCorrect, wrongCount: totalWrong }),
      }).then(() => onSessionComplete?.()).catch(() => {});
      setPhase('summary');
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [items, currentIndex, sessionResults, onSessionComplete]);

  // Start screen
  if (phase === 'start') {
    return (
      <div className="pt-6 pb-24 space-y-8">
        <header>
          <button onClick={onExit} className="text-creamDim text-xs hover:text-cream transition-colors mb-4 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M6 2 L3 5 L6 8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {strings.backToHome}
          </button>
          <h2 className="font-serif text-cream text-2xl tracking-wide">{strings.drill2SessionTitle}</h2>
        </header>
        <HintTogglePill hintOn={hintOn} onToggle={toggleHint} strings={strings} />

        <div className="grid grid-cols-2 gap-3">
          {[
            { count: 5, label: strings.drillPickCount5 },
            { count: 10, label: strings.drillPickCount10 },
          ].map(({ count, label }) => (
            <button key={count} onClick={() => startDrill(count)} disabled={loading}
              className="py-4 border border-ink-line rounded-lg font-serif text-cream text-lg hover:border-gold/40 hover:text-gold transition-colors disabled:opacity-50">
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Active
  if (phase === 'active' && items[currentIndex]) {
    return (
      <div className="pt-6 pb-24">
        <RecallCard
          key={currentIndex}
          item={items[currentIndex]}
          strings={strings}
          progress={{ current: currentIndex + 1, total: items.length }}
          onComplete={handleCardComplete}
          hintOn={hintOn}
          onToggleHint={toggleHint}
        />
      </div>
    );
  }

  // Summary
  const totalCorrect = sessionResults.reduce((a, b) => a + b, 0);
  const totalCards = sessionResults.length * 4;
  return (
    <div className="pt-6 pb-24 space-y-8 text-center">
      <h2 className="font-serif text-cream text-2xl tracking-wide">{strings.drillSummaryTitle}</h2>
      <p className="text-gold text-3xl font-serif">{strings.drillSummaryStats(totalCorrect, totalCards)}</p>
      <div className="flex justify-center gap-3">
        <button onClick={() => { setPhase('start'); }} className="px-6 py-3 border border-ink-line rounded text-cream hover:border-cream/40 transition-colors">
          {strings.backToHome}
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// RecallCard — one card in the recall drill
// ---------------------------------------------------------------------------

const RecallCard: React.FC<{
  item: RecallItem;
  strings: TrainerStrings;
  progress: { current: number; total: number };
  onComplete: (correctCount: number) => void;
  hintOn: boolean;
  onToggleHint: () => void;
}> = ({ item, strings, progress, onComplete, hintOn, onToggleHint }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [cardPhase, setCardPhase] = useState<CardPhase>('picking');
  const audio = useAudio();
  const cantoneseAvailable = audio.available && audio.probed && audio.approvedCounts.cantonese > 0;

  const toggleTile = (char: string) => {
    if (cardPhase !== 'picking') return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(char)) { next.delete(char); } else if (next.size < 4) { next.add(char); }
      return next;
    });
  };

  const handleSubmit = () => {
    if (selected.size !== 4) return;
    setCardPhase('revealed');
  };

  const correctCount = item.tiles.filter(t => t.belongsToTarget && selected.has(t.char)).length;

  const handleNext = () => {
    onComplete(correctCount);
  };

  return (
    <div className="space-y-6">
      {/* Progress + hint toggle */}
      <div className="flex items-center justify-between">
        <HintTogglePill hintOn={hintOn} onToggle={onToggleHint} strings={strings} />
        <span className="text-xs text-creamDim">{progress.current} / {progress.total}</span>
      </div>

      {/* Prompt */}
      <p className="text-cream/80 text-sm font-serif text-center">{strings.drill2Prompt(item.targetLabel)}</p>

      {/* 4×2 grid */}
      <div className="grid grid-cols-4 gap-2">
        {item.tiles.map(tile => {
          const isPicked = selected.has(tile.char);
          let tileStyle = 'border-ink-line';
          let icon: React.ReactNode = null;

          if (cardPhase === 'revealed') {
            if (isPicked && tile.belongsToTarget) {
              tileStyle = 'border-green-500 bg-green-500/10';
              icon = <span className="text-green-400 text-xs">✓</span>;
            } else if (isPicked && !tile.belongsToTarget) {
              tileStyle = 'border-rose-400 bg-rose-400/10';
              icon = <span className="text-rose-400 text-xs">✕</span>;
            } else if (!isPicked && tile.belongsToTarget) {
              tileStyle = 'ring-2 ring-amber-400/60 border-transparent';
            }
          } else if (isPicked) {
            tileStyle = 'border-gold bg-cream/10';
          }

          return (
            <div
              key={tile.char}
              role="button"
              tabIndex={cardPhase === 'picking' ? 0 : -1}
              aria-disabled={cardPhase === 'revealed'}
              onClick={() => toggleTile(tile.char)}
              onKeyDown={(e) => {
                if (cardPhase !== 'picking') return;
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTile(tile.char); }
              }}
              className={`relative border rounded-lg p-2 flex flex-col items-center gap-1 transition-colors ${
                cardPhase === 'picking' ? 'cursor-pointer' : 'cursor-default'
              } ${tileStyle}`}
            >
              {icon && <span className="absolute top-1 left-1">{icon}</span>}
              <span className="font-serif text-cream text-2xl">{tile.char}</span>
              {hintOn && (
                <span className="text-creamDim/60 text-[10px] font-mono leading-tight">
                  {tile.pinyin} · {formatJyutping(tile.jyutping)}
                </span>
              )}
              {cantoneseAvailable && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); audio.play(tile.char, 'cantonese'); }}
                  className="absolute bottom-1 right-1 w-5 h-5 flex items-center justify-center rounded-full border border-ink-line/50 text-creamDim/50 hover:text-cream text-[8px]"
                  aria-label={`Play ${tile.char}`}
                >
                  <svg width="6" height="6" viewBox="0 0 11 11" aria-hidden>
                    <path d="M3 1.5 L3 9.5 L9.5 5.5 Z" fill="currentColor" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Picked indicator + submit/next */}
      {cardPhase === 'picking' ? (
        <div className="space-y-3">
          <p className="text-center text-creamDim text-sm">{strings.drill2Picked(selected.size)}</p>
          <button
            onClick={handleSubmit}
            disabled={selected.size !== 4}
            className="w-full py-3 bg-gold/10 border border-gold/40 text-gold font-serif tracking-wider rounded hover:bg-gold/20 transition-colors disabled:opacity-30"
          >
            {strings.drill2Submit}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className={`text-center text-xl font-serif font-bold ${correctCount === 4 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {strings.drill2Correct(correctCount)}
          </p>
          <button
            onClick={handleNext}
            className="w-full py-3 bg-gold text-ink-bg font-serif tracking-wider rounded hover:opacity-90 transition-opacity"
          >
            {strings.drill2Next}
          </button>
        </div>
      )}
    </div>
  );
};
