import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import { useHintToggle } from './useHintToggle';
import { HintTogglePill } from './HintTogglePill';
import { fetchAppSettings, getSettingNumber } from '../../hooks/useAppSettings';

interface Drill4Entry {
  word: string;
  blank_pos: number;
  answer: string;
  answer_pinyin?: string;
  hint_char: string;
  hint_pinyin?: string;
  rhyme: string;
  pinyin: string;
  gloss: string;
}

type Phase = 'start' | 'active' | 'summary';

interface DrillWordSessionProps {
  strings: TrainerStrings;
  scope?: 'tier1' | 'all';
  onExit: () => void;
  onSessionComplete?: () => void;
}

export const DrillWordSession: React.FC<DrillWordSessionProps> = ({
  strings,
  scope = 'tier1',
  onExit,
  onSessionComplete,
}) => {
  const { hintOn, toggle: toggleHint } = useHintToggle('drill4', true);
  const [phase, setPhase] = useState<Phase>('start');
  const [items, setItems] = useState<Drill4Entry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Array<{ correct: boolean; expected: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [correctAdvanceMs, setCorrectAdvanceMs] = useState(1500);

  useEffect(() => {
    fetchAppSettings().then(s => {
      setCorrectAdvanceMs(getSettingNumber(s, 'drill4_correct_advance_ms', 1500));
    });
  }, []);

  const startDrill = useCallback(async (count: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trainer/drill/word-queue?scope=${scope}&limit=${count}`, { credentials: 'include' });
      const body = await res.json();
      if (body.items?.length > 0) {
        setItems(body.items);
        setCurrentIndex(0);
        setResults([]);
        setPhase('active');
      }
    } catch {}
    finally { setLoading(false); }
  }, [scope]);

  const handleCardComplete = useCallback((correct: boolean, expected: string) => {
    const allResults = [...results, { correct, expected }];
    setResults(allResults);
    if (currentIndex + 1 >= items.length) {
      const cCount = allResults.filter(r => r.correct).length;
      fetch('/api/trainer/drill/session-complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier: 1, drillNumber: 4, size: allResults.length, correctCount: cCount, wrongCount: allResults.length - cCount }),
      }).then(() => onSessionComplete?.()).catch(() => {});
      setPhase('summary');
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [items, currentIndex, results, onSessionComplete]);

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
          <h2 className="font-serif text-cream text-2xl tracking-wide">{strings.drill4SessionTitle}</h2>
        </header>
        <HintTogglePill hintOn={hintOn} onToggle={toggleHint} strings={strings} />
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
        <WordCard
          key={currentIndex}
          item={items[currentIndex]}
          strings={strings}
          progress={{ current: currentIndex + 1, total: items.length }}
          hintOn={hintOn}
          onToggleHint={toggleHint}
          correctAdvanceMs={correctAdvanceMs}
          onComplete={handleCardComplete}
        />
      </div>
    );
  }

  const correctCount = results.filter(r => r.correct).length;
  return (
    <div className="pt-6 pb-24 space-y-8 text-center">
      <h2 className="font-serif text-cream text-2xl tracking-wide">{strings.drillSummaryTitle}</h2>
      <p className="text-gold text-3xl font-serif">{strings.drillSummaryStats(correctCount, results.length)}</p>
      <button onClick={onExit} className="mx-auto px-6 py-3 border border-ink-line rounded text-cream hover:border-cream/40 transition-colors">
        {strings.backToHome}
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// WordCard
// ---------------------------------------------------------------------------

const WordCard: React.FC<{
  item: Drill4Entry;
  strings: TrainerStrings;
  progress: { current: number; total: number };
  hintOn: boolean;
  onToggleHint: () => void;
  correctAdvanceMs: number;
  onComplete: (correct: boolean, expected: string) => void;
}> = ({ item, strings, progress, hintOn, onToggleHint, correctAdvanceMs, onComplete }) => {
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; expected: string; addedToLibrary: boolean } | null>(null);
  const isComposing = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async () => {
    const trimmed = userInput.trim();
    if (!trimmed) return;
    const chars = Array.from(trimmed).filter(ch => /\p{Script=Han}/u.test(ch));
    const answer = chars[chars.length - 1] ?? '';
    if (!answer) return;

    try {
      const res = await fetch('/api/trainer/drill/word-response', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ word: item.word, answer, expected: item.answer, rhyme: item.rhyme }),
      });
      const body = await res.json();
      setFeedback({ correct: body.correct, expected: item.answer, addedToLibrary: body.addedToLibrary ?? false });
      if (body.correct) {
        setTimeout(() => onComplete(true, item.answer), correctAdvanceMs);
      }
    } catch {
      setFeedback({ correct: false, expected: item.answer, addedToLibrary: false });
    }
  }, [userInput, item, correctAdvanceMs, onComplete]);

  const displayChars = Array.from(item.word);
  const pinyinParts = item.pinyin.split(/\s+/);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <HintTogglePill hintOn={hintOn} onToggle={onToggleHint} strings={strings} />
        <span className="text-xs text-creamDim">{progress.current} / {progress.total}</span>
      </div>

      <p className="text-cream/80 text-sm font-serif text-center">{strings.drill4Prompt(item.rhyme)}</p>

      <div className="text-center space-y-2">
        <div className="font-serif text-cream" style={{ fontSize: '48px', lineHeight: 1.2 }}>
          {displayChars.map((ch, i) => (
            <span key={i}>
              {i === item.blank_pos ? (
                feedback ? (
                  <span className={feedback.correct ? 'text-emerald-500' : 'text-rose-500'}>{item.answer}</span>
                ) : (
                  <span className="text-gold/30">___</span>
                )
              ) : ch}
            </span>
          ))}
        </div>
        {hintOn && (
          <div className="text-creamDim/60 text-xs font-mono">
            {displayChars.map((_, i) => {
              const py = i === item.blank_pos
                ? (feedback ? (item.answer_pinyin ?? pinyinParts[i] ?? '') : (item.answer_pinyin ?? '?'))
                : (item.hint_pinyin ?? pinyinParts[i] ?? '');
              return <span key={i}>{py}{i < displayChars.length - 1 ? ' ' : ''}</span>;
            })}
          </div>
        )}
      </div>

      {!feedback && (
        <div className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            placeholder={strings.drill4InputPlaceholder}
            onCompositionStart={() => { isComposing.current = true; }}
            onCompositionEnd={(e) => {
              isComposing.current = false;
              const v = (e.currentTarget as HTMLInputElement).value;
              setUserInput(v);
            }}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !isComposing.current) handleSubmit(); }}
            className="w-full px-4 py-3 text-2xl font-serif text-cream text-center bg-ink-bg border border-ink-line rounded focus:border-gold/50 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className="w-full py-3 bg-gold text-ink-bg font-serif tracking-wider rounded hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            {strings.drill4Submit}
          </button>
        </div>
      )}

      {feedback && (
        <div className="space-y-3">
          <p className={`text-center text-xl font-serif font-bold ${feedback.correct ? 'text-emerald-500' : 'text-rose-500'}`}>
            {feedback.correct ? strings.drillCorrect : strings.drillIncorrect}
          </p>
          {!feedback.correct && (
            <p className="text-center text-cream text-sm">
              {strings.drillExplanation(item.answer, item.rhyme)}
            </p>
          )}
          {feedback.addedToLibrary && (
            <p className="text-center text-gold text-xs">{strings.drill4AddedToLibrary}</p>
          )}
          {!feedback.correct && (
            <button
              onClick={() => onComplete(false, item.answer)}
              className="w-full py-3 bg-gold text-ink-bg font-serif tracking-wider rounded hover:opacity-90 transition-opacity"
            >
              {strings.drillContinueNext}
            </button>
          )}
        </div>
      )}

      <p className="text-creamDim/50 text-xs text-center">{item.gloss}</p>
    </div>
  );
};
