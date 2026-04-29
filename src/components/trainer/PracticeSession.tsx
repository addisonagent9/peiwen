import React, { useCallback, useEffect, useRef, useState } from 'react';

interface QueueSlot {
  slot_index: number;
  tier_hint: number;
  seed_examples: string[];
}

type Phase = 'loading' | 'active' | 'summary';

const TIER_LABELS: Record<number, string> = {
  1: '简单',
  2: '中等',
  3: '进阶',
  4: '罕见',
};

interface PracticeSessionProps {
  rhymeId: string;
  rhymeLabel: string;
  size: 5 | 10 | 20;
  onExit: () => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  rhymeId,
  rhymeLabel,
  size,
  onExit,
}) => {
  const [phase, setPhase] = useState<Phase>('loading');
  const [queue, setQueue] = useState<QueueSlot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [dupeCount, setDupeCount] = useState(0);

  useEffect(() => {
    fetch('/api/trainer/drill/practice-queue', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rhyme_id: rhymeLabel, size }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.queue?.length > 0) {
          setQueue(d.queue);
          setPhase('active');
        }
      })
      .catch(() => {});
  }, [rhymeLabel, size]);

  const handleSlotComplete = useCallback((added: boolean) => {
    if (added) setNewCount(n => n + 1);
    else setDupeCount(n => n + 1);
    if (currentIndex + 1 >= queue.length) {
      setPhase('summary');
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex, queue.length]);

  const handleSlotWrong = useCallback(() => {
    if (currentIndex + 1 >= queue.length) {
      setPhase('summary');
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex, queue.length]);

  if (phase === 'loading') {
    return (
      <div className="pt-6 pb-24 text-center">
        <p className="text-creamDim text-sm">加载中…</p>
      </div>
    );
  }

  if (phase === 'active' && queue[currentIndex]) {
    return (
      <div className="pt-6 pb-24">
        <PracticeCard
          key={currentIndex}
          slot={queue[currentIndex]}
          rhymeLabel={rhymeLabel}
          progress={{ current: currentIndex + 1, total: queue.length }}
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
  slot: QueueSlot;
  rhymeLabel: string;
  progress: { current: number; total: number };
  onCorrect: (added: boolean) => void;
  onWrong: () => void;
}> = ({ slot, rhymeLabel, progress, onCorrect, onWrong }) => {
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; added: boolean; message?: string } | null>(null);
  const [hintIndex, setHintIndex] = useState(-1);
  const isComposing = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const revealHint = () => {
    if (hintIndex + 1 < slot.seed_examples.length) {
      setHintIndex(i => i + 1);
    }
  };

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
        setFeedback({ correct: false, added: false, message: `「${char}」不属于${rhymeLabel}韵部` });
        setTimeout(() => onWrong(), 1500);
      } else {
        setFeedback({ correct: false, added: false, message: '提交失败,请重试' });
      }
    } catch {
      setFeedback({ correct: false, added: false, message: '网络错误' });
    }
  }, [userInput, rhymeLabel, onCorrect, onWrong]);

  const tierLabel = TIER_LABELS[slot.tier_hint] ?? '';
  const hintExhausted = hintIndex + 1 >= slot.seed_examples.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs text-creamDim font-mono">{rhymeLabel}</span>
        <span className="text-xs text-creamDim">{progress.current} / {progress.total}</span>
      </div>

      <div className="text-center space-y-2">
        <p className="text-cream/80 text-sm font-serif">
          请写出一个属于 <span className="text-gold">{rhymeLabel}</span> 韵部的平声字
        </p>
        <p className="text-creamDim/60 text-xs">难度: {tierLabel}</p>
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
        <div className="space-y-3">
          <div className="flex justify-center gap-3">
            <button
              onClick={revealHint}
              disabled={hintExhausted}
              className="px-3 py-1.5 border border-ink-line rounded-full text-creamDim text-xs hover:text-cream hover:border-cream/40 transition-colors disabled:opacity-30"
            >
              {hintExhausted ? '已用完该难度示例' : '提示'}
            </button>
          </div>
          {hintIndex >= 0 && (
            <div className="flex justify-center gap-2">
              {slot.seed_examples.slice(0, hintIndex + 1).map(ch => (
                <span key={ch} className="font-serif text-gold text-xl">{ch}</span>
              ))}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className="w-full py-3 bg-gold text-ink-bg font-serif tracking-wider rounded hover:opacity-90 transition-opacity disabled:opacity-30"
          >
            提交
          </button>
        </div>
      )}

      {feedback && (
        <div className="space-y-3">
          <p className={`text-center text-xl font-serif font-bold ${feedback.correct ? 'text-emerald-500' : 'text-rose-500'}`}>
            {feedback.correct ? (feedback.added ? '✓ 新字收集!' : '✓ 已收录') : '✕'}
          </p>
          {feedback.message && (
            <p className="text-center text-cream/80 text-sm">{feedback.message}</p>
          )}
        </div>
      )}
    </div>
  );
};
