import React, { useCallback, useEffect, useState } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import { RHYMES_PINGSHENG } from '../../data/pingshui/trainer-curriculum';
import { useAudio } from '../../hooks/useAudio';
import { formatJyutping } from './FoundationModule';
import { HintTogglePill } from './HintTogglePill';

export interface DrillItem {
  type: string;
  text: string;
  rhymeId: string;
  pinyin: string;
  jyutping: string;
  options: string[];
}

interface DrillCardProps {
  item: DrillItem;
  onAnswer: (correct: boolean) => void;
  progress: { current: number; total: number };
  strings: TrainerStrings;
  hintEnabled: boolean;
  onToggleHint: () => void;
}

function rhymeLabel(rhymeId: string): string {
  const r = RHYMES_PINGSHENG.find((rh) => rh.id === rhymeId);
  return r?.label ?? rhymeId;
}

export const DrillCard: React.FC<DrillCardProps> = ({
  item,
  onAnswer,
  progress,
  strings,
  hintEnabled,
  onToggleHint,
}) => {
  const [phase, setPhase] = useState<'prompt' | 'revealed'>('prompt');
  const [selected, setSelected] = useState<string | null>(null);
  const [cardHint, setCardHint] = useState(hintEnabled);
  const audio = useAudio();
  const cantoneseAvailable = audio.available && audio.probed && audio.approvedCounts.cantonese > 0;

  useEffect(() => {
    setCardHint(hintEnabled);
  }, [hintEnabled]);

  const handleSelect = useCallback((optionId: string) => {
    if (phase !== 'prompt') return;
    setSelected(optionId);
    setPhase('revealed');
  }, [phase]);

  const handleContinue = useCallback(() => {
    const wasCorrect = selected === item.rhymeId;
    onAnswer(wasCorrect);
  }, [selected, item.rhymeId, onAnswer]);

  const isCorrect = selected === item.rhymeId;

  return (
    <div className="space-y-8">
      {/* Progress + hint toggle */}
      <div className="flex items-center justify-between">
        <HintTogglePill hintOn={cardHint} onToggle={() => { setCardHint(h => !h); onToggleHint(); }} strings={strings} />
        <span className="text-xs text-creamDim">
          {progress.current} / {progress.total}
        </span>
      </div>

      {/* Prompt */}
      <p className="text-cream/80 text-sm font-serif text-center">
        {strings.drillPromptCharToRhyme}
      </p>

      {/* Character */}
      <div className="text-center space-y-2">
        <span className="font-serif text-cream block" style={{ fontSize: '64px', lineHeight: 1 }}>
          {item.text}
        </span>
        {cardHint && (
          <span className="text-creamDim/60 text-xs font-mono">
            {item.pinyin} · {formatJyutping(item.jyutping)}
          </span>
        )}
        {cantoneseAvailable && (
          <div className="pt-1">
            <button
              onClick={() => audio.play(item.text, 'cantonese')}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-ink-line text-creamDim text-[10px] hover:text-cream hover:border-cream/40 transition-colors"
              aria-label={`Play ${item.text} in Cantonese`}
            >
              <svg width="7" height="7" viewBox="0 0 11 11" aria-hidden>
                <path d="M3 1.5 L3 9.5 L9.5 5.5 Z" fill="currentColor" />
              </svg>
              粤
            </button>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {item.options.map((optId) => {
          let style = 'border-ink-line text-cream hover:border-cream/40';
          if (phase === 'revealed') {
            if (optId === item.rhymeId) {
              style = 'border-green-500 bg-green-500/10 text-green-400';
            } else if (optId === selected) {
              style = 'border-rose-400 bg-rose-400/10 text-rose-400';
            } else {
              style = 'border-ink-line/50 text-creamDim/40';
            }
          }
          return (
            <button
              key={optId}
              onClick={() => handleSelect(optId)}
              disabled={phase === 'revealed'}
              className={`py-4 px-3 border rounded-lg font-serif text-lg tracking-wider transition-colors ${style}`}
            >
              {rhymeLabel(optId)}
            </button>
          );
        })}
      </div>

      {/* Reveal */}
      {phase === 'revealed' && (
        <div className="space-y-4">
          <p className={`text-center text-sm font-serif ${isCorrect ? 'text-green-400' : 'text-rose-400'}`}>
            {isCorrect ? strings.drillCorrect : strings.drillIncorrect}
          </p>
          <p className="text-center text-creamDim text-xs">
            {strings.drillExplanation(item.text, rhymeLabel(item.rhymeId))}
          </p>
          <button
            onClick={handleContinue}
            className="w-full py-3 bg-gold/10 border border-gold/40 text-gold font-serif tracking-wider rounded hover:bg-gold/20 transition-colors"
          >
            {strings.drillContinueNext}
          </button>
        </div>
      )}
    </div>
  );
};
