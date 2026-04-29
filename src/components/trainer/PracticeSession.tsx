import React, { useCallback, useRef, useState } from 'react';

type Phase = 'active' | 'summary';

interface PracticeSessionProps {
  rhymeLabel: string;
  size: 5 | 10 | 20;
  onExit: () => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  rhymeLabel,
  size,
  onExit,
}) => {
  const [phase, setPhase] = useState<Phase>('active');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [dupeCount, setDupeCount] = useState(0);

  const handleSlotComplete = useCallback((added: boolean) => {
    if (added) setNewCount(n => n + 1);
    else setDupeCount(n => n + 1);
    if (currentIndex + 1 >= size) {
      setPhase('summary');
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex, size]);

  const handleSlotWrong = useCallback(() => {
    if (currentIndex + 1 >= size) {
      setPhase('summary');
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex, size]);

  if (phase === 'active') {
    return (
      <div className="pt-6 pb-24">
        <PracticeCard
          key={currentIndex}
          rhymeLabel={rhymeLabel}
          progress={{ current: currentIndex + 1, total: size }}
          onCorrect={handleSlotComplete}
          onWrong={handleSlotWrong}
        />
      </div>
    );
  }

  return (
    <div className="pt-6 pb-24 space-y-8 text-center">
      <h2 className="font-serif text-cream text-2xl tracking-wide">练习完成</h2>
      <div className="space-y-2">
        <p className="text-gold text-3xl font-serif">
          收集新字 {newCount} 个 · 回忆 {dupeCount} 个
        </p>
      </div>
      <button
        onClick={onExit}
        className="mx-auto px-6 py-3 border border-ink-line rounded text-cream hover:border-cream/40 transition-colors"
      >
        返回 {rhymeLabel}
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// PracticeCard — one slot in the practice session
// ---------------------------------------------------------------------------

const PracticeCard: React.FC<{
  rhymeLabel: string;
  progress: { current: number; total: number };
  onCorrect: (added: boolean) => void;
  onWrong: () => void;
}> = ({ rhymeLabel, progress, onCorrect, onWrong }) => {
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; added: boolean; message?: string } | null>(null);
  const isComposing = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async () => {
    const trimmed = userInput.trim();
    if (!trimmed) return;
    const chars = Array.from(trimmed).filter(ch => /\p{Script=Han}/u.test(ch));
    if (chars.length !== 1) {
      setFeedback({ correct: false, added: false, message: '请输入单个汉字' });
      return;
    }
    const char = chars[0];

    try {
      const res = await fetch('/api/trainer/drill/library/add', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rhyme_id: rhymeLabel, char, source: 'practice' }),
      });
      const body = await res.json();
      if (res.ok) {
        setFeedback({ correct: true, added: body.added ?? false });
        setTimeout(() => onCorrect(body.added ?? false), 800);
      } else if (body.reason === 'char_not_in_rhyme') {
        const actuals: string[] = body.actual_rhymes ?? [];
        const msg = actuals.length > 0
          ? `「${char}」属于${actuals.join('、')}韵部，不属于${rhymeLabel}`
          : `「${char}」无平声读音，不属于${rhymeLabel}`;
        setFeedback({ correct: false, added: false, message: msg });
      } else {
        setFeedback({ correct: false, added: false, message: '提交失败,请重试' });
      }
    } catch {
      setFeedback({ correct: false, added: false, message: '网络错误' });
    }
  }, [userInput, rhymeLabel, onCorrect, onWrong]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs text-creamDim font-mono">{rhymeLabel}</span>
        <span className="text-xs text-creamDim">{progress.current} / {progress.total}</span>
      </div>

      <div className="text-center">
        <p className="text-cream/80 text-sm font-serif">
          请写出一个属于 <span className="text-gold">{rhymeLabel}</span> 韵部的平声字
        </p>
      </div>

      <div className="flex justify-center">
        {feedback ? (
          <span
            className={`font-serif text-center ${feedback.correct ? 'text-emerald-500' : 'text-rose-500'}`}
            style={{ fontSize: '48px', lineHeight: 1.2 }}
          >
            {userInput.trim()}
          </span>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            onCompositionStart={() => { isComposing.current = true; }}
            onCompositionEnd={(e) => {
              isComposing.current = false;
              setUserInput((e.currentTarget as HTMLInputElement).value);
            }}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !isComposing.current) handleSubmit(); }}
            className="w-16 h-16 text-center font-serif bg-ink-bg border-b-2 border-gold/50 text-cream outline-none focus:border-gold"
            style={{ fontSize: '48px', lineHeight: 1.2 }}
          />
        )}
      </div>

      {!feedback && (
        <button
          onClick={handleSubmit}
          disabled={!userInput.trim()}
          className="w-full py-3 bg-gold text-ink-bg font-serif tracking-wider rounded hover:opacity-90 transition-opacity disabled:opacity-30"
        >
          提交
        </button>
      )}

      {feedback && (
        <div className="space-y-3">
          <p className={`text-center text-xl font-serif font-bold ${feedback.correct ? 'text-emerald-500' : 'text-rose-500'}`}>
            {feedback.correct ? (feedback.added ? '✓ 新字收集!' : '✓ 已收录') : '✕'}
          </p>
          {feedback.message && (
            <p className="text-center text-cream/80 text-sm">{feedback.message}</p>
          )}
          {!feedback.correct && (
            <button
              onClick={onWrong}
              className="w-full py-3 bg-gold text-ink-bg font-serif tracking-wider rounded hover:opacity-90 transition-opacity"
            >
              下一题
            </button>
          )}
        </div>
      )}
    </div>
  );
};
