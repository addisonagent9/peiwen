import React, { useCallback, useEffect, useState } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import type { AnchorPoem } from '../../types/pingshui-trainer';
import { useAudio } from '../../hooks/useAudio';
import { formatJyutping } from './FoundationModule';

interface PairChar {
  char: string;
  pinyin: string;
  jyutping: string;
  rhymeId: string;
}

interface PairItem {
  type: string;
  left: PairChar;
  right: PairChar;
  rhymes: boolean;
  family: string | null;
  teachingNote: { left?: string; right?: string } | null;
  mnemonic: { left?: string; right?: string } | null;
  leftAnchor: AnchorPoem | null;
  rightAnchor: AnchorPoem | null;
  leftLabel: string;
  rightLabel: string;
}

type Phase = 'start' | 'active' | 'summary';

interface DrillPairSessionProps {
  strings: TrainerStrings;
  scope?: 'tier1' | 'all';
  onExit: () => void;
  onSessionComplete?: () => void;
}

export const DrillPairSession: React.FC<DrillPairSessionProps> = ({
  strings,
  scope = 'tier1',
  onExit,
  onSessionComplete,
}) => {
  const [phase, setPhase] = useState<Phase>('start');
  const [items, setItems] = useState<PairItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);

  const startDrill = useCallback(async (count: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trainer/drill/pair-queue?scope=${scope}&limit=${count}`, {
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

  const handleCardComplete = useCallback((correct: boolean) => {
    const allResults = [...sessionResults, correct];
    setSessionResults(allResults);
    if (currentIndex + 1 >= items.length) {
      const cCount = allResults.filter(Boolean).length;
      fetch('/api/trainer/drill/session-complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier: 1, drillNumber: 3, size: allResults.length, correctCount: cCount, wrongCount: allResults.length - cCount }),
      }).then(() => onSessionComplete?.()).catch(() => {});
      setPhase('summary');
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [items, currentIndex, sessionResults, onSessionComplete]);

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
          <h2 className="font-serif text-cream text-2xl tracking-wide">{strings.drill3SessionTitle}</h2>
        </header>
        <div className="grid grid-cols-2 gap-3">
          {[
            { count: 5, label: strings.drillPickCount5 },
            { count: 10, label: strings.drillPickCount10 },
            { count: 20, label: strings.drillPickCount20 },
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

  if (phase === 'active' && items[currentIndex]) {
    return (
      <div className="pt-6 pb-24">
        <PairCard
          key={currentIndex}
          item={items[currentIndex]}
          strings={strings}
          progress={{ current: currentIndex + 1, total: items.length }}
          onComplete={handleCardComplete}
        />
      </div>
    );
  }

  const correctCount = sessionResults.filter(Boolean).length;
  return (
    <div className="pt-6 pb-24 space-y-8 text-center">
      <h2 className="font-serif text-cream text-2xl tracking-wide">{strings.drillSummaryTitle}</h2>
      <p className="text-gold text-3xl font-serif">{strings.drillSummaryStats(correctCount, sessionResults.length)}</p>
      <button onClick={onExit} className="mx-auto px-6 py-3 border border-ink-line rounded text-cream hover:border-cream/40 transition-colors">
        {strings.backToHome}
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// PairCard
// ---------------------------------------------------------------------------

const PairCard: React.FC<{
  item: PairItem;
  strings: TrainerStrings;
  progress: { current: number; total: number };
  onComplete: (correct: boolean) => void;
}> = ({ item, strings, progress, onComplete }) => {
  const [answered, setAnswered] = useState<boolean | null>(null);
  const audio = useAudio();
  const cantoneseAvailable = audio.available && audio.probed && audio.approvedCounts.cantonese > 0;

  const isCorrect = answered !== null && answered === item.rhymes;
  const isWrong = answered !== null && !isCorrect;

  const handleAnswer = (userSaysRhymes: boolean) => {
    if (answered !== null) return;
    setAnswered(userSaysRhymes);
    if (userSaysRhymes === item.rhymes) {
      setTimeout(() => onComplete(true), 600);
    }
  };

  const renderTile = (c: PairChar, label: string) => (
    <div
      role="button"
      tabIndex={0}
      className="relative border border-ink-line rounded-lg p-4 flex flex-col items-center gap-2 flex-1 min-w-0"
    >
      <span className="font-serif text-cream text-4xl sm:text-5xl">{c.char}</span>
      <span className="text-creamDim/60 text-xs font-mono">{c.pinyin} · {formatJyutping(c.jyutping)}</span>
      {answered !== null && (
        <span className="text-xs text-gold font-serif">{label}</span>
      )}
      {cantoneseAvailable && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); audio.play(c.char, 'cantonese'); }}
          className="absolute bottom-2 right-2 w-6 h-6 flex items-center justify-center rounded-full border border-ink-line/50 text-creamDim/50 hover:text-cream text-[9px]"
          aria-label={`Play ${c.char}`}
        >
          <svg width="7" height="7" viewBox="0 0 11 11" aria-hidden>
            <path d="M3 1.5 L3 9.5 L9.5 5.5 Z" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <span className="text-xs text-creamDim">{progress.current} / {progress.total}</span>
      </div>

      <p className="text-cream/80 text-sm font-serif text-center">{strings.drill3PromptRhyme}</p>

      <div className="flex gap-3">
        {renderTile(item.left, item.leftLabel)}
        {renderTile(item.right, item.rightLabel)}
      </div>

      {answered === null && (
        <div className="flex gap-3">
          <button
            onClick={() => handleAnswer(true)}
            className="flex-1 py-3 bg-emerald-600/10 border border-emerald-600/40 text-emerald-400 font-serif tracking-wider rounded hover:bg-emerald-600/20 transition-colors"
          >
            {strings.drill3AnswerYes}
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="flex-1 py-3 bg-rose-400/10 border border-rose-400/40 text-rose-400 font-serif tracking-wider rounded hover:bg-rose-400/20 transition-colors"
          >
            {strings.drill3AnswerNo}
          </button>
        </div>
      )}

      {isCorrect && (
        <p className="text-center text-green-400 font-serif text-sm">✓ {strings.drillCorrect}</p>
      )}

      {isWrong && (
        <WrongAnswerPanel item={item} strings={strings} onContinue={() => onComplete(false)} />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Wrong answer panel
// ---------------------------------------------------------------------------

const WrongAnswerPanel: React.FC<{
  item: PairItem;
  strings: TrainerStrings;
  onContinue: () => void;
}> = ({ item, strings, onContinue }) => (
  <div className="space-y-4 border border-rose-400/30 rounded-lg p-4 bg-rose-400/5">
    {/* Answer reveal */}
    <div>
      <p className="text-xs text-creamDim mb-1">{strings.drill3CorrectAnswer}</p>
      <p className="text-cream text-sm font-serif">
        {item.left.char} → <span className="text-gold">{item.leftLabel}</span>
        {' · '}
        {item.right.char} → <span className="text-gold">{item.rightLabel}</span>
        {' — '}
        <span className={item.rhymes ? 'text-emerald-400' : 'text-rose-400'}>
          {item.rhymes ? strings.drill3AnswerYes : strings.drill3AnswerNo}
        </span>
      </p>
    </div>

    {/* Family */}
    {item.family && (
      <div>
        <p className="text-xs text-creamDim mb-1">家族</p>
        <p className="text-cream text-sm">{item.family}</p>
      </div>
    )}

    {/* Teaching note */}
    {item.teachingNote && (item.teachingNote.left || item.teachingNote.right) && (
      <div>
        <p className="text-xs text-creamDim mb-1">{strings.drill3TeachingNote}</p>
        {item.teachingNote.left === item.teachingNote.right || !item.teachingNote.right ? (
          <p className="text-cream/80 text-sm">{item.teachingNote.left}</p>
        ) : (
          <div className="space-y-1">
            <p className="text-cream/80 text-sm">{item.leftLabel}: {item.teachingNote.left}</p>
            <p className="text-cream/80 text-sm">{item.rightLabel}: {item.teachingNote.right}</p>
          </div>
        )}
      </div>
    )}

    {/* Mnemonic */}
    {item.mnemonic && (item.mnemonic.left || item.mnemonic.right) && (
      <div>
        <p className="text-xs text-creamDim mb-1">{strings.drill3Mnemonic}</p>
        {item.mnemonic.left === item.mnemonic.right || !item.mnemonic.right ? (
          <p className="text-creamDim/80 text-sm italic">{item.mnemonic.left}</p>
        ) : (
          <div className="space-y-1">
            <p className="text-creamDim/80 text-sm italic">{item.leftLabel}: {item.mnemonic.left}</p>
            <p className="text-creamDim/80 text-sm italic">{item.rightLabel}: {item.mnemonic.right}</p>
          </div>
        )}
      </div>
    )}

    {/* Anchor poems */}
    {(item.leftAnchor || item.rightAnchor) && (
      <div>
        <p className="text-xs text-creamDim mb-2">{strings.drill3AnchorPoem}</p>
        {item.leftAnchor && <AnchorPoemInline poem={item.leftAnchor} />}
        {item.rightAnchor && item.rightAnchor !== item.leftAnchor && (
          <div className="mt-2"><AnchorPoemInline poem={item.rightAnchor} /></div>
        )}
      </div>
    )}

    <button
      onClick={onContinue}
      className="w-full py-3 bg-gold/10 border border-gold/40 text-gold font-serif tracking-wider rounded hover:bg-gold/20 transition-colors"
    >
      {strings.drill3Continue}
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// Inline anchor poem with highlighted rhyming chars
// ---------------------------------------------------------------------------

const AnchorPoemInline: React.FC<{ poem: AnchorPoem }> = ({ poem }) => {
  const rhymingChars = new Set(poem.rhymingCharacters.map(rc => rc.char));
  return (
    <div className="border border-ink-line/30 rounded p-3">
      <p className="text-xs text-creamDim mb-1">
        《{poem.title}》<span className="ml-1">{poem.author}</span>
      </p>
      {poem.text.split('\n').map((line, li) => (
        <p key={li} className="font-serif text-cream/80 text-sm leading-[1.8] tracking-widest">
          {[...line].map((ch, ci) => (
            <span key={ci} className={rhymingChars.has(ch) ? 'text-gold font-bold' : ''}>
              {ch}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
};
