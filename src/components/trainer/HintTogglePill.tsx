import React from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';

interface Props {
  hintOn: boolean;
  onToggle: () => void;
  strings: TrainerStrings;
}

export function HintTogglePill({ hintOn, onToggle, strings }: Props) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-creamDim text-sm">{strings.drillHintLabel}</span>
      <button
        onClick={onToggle}
        className={`px-3 py-1 rounded border text-xs transition-colors ${
          hintOn
            ? 'border-gold/60 bg-gold/10 text-gold'
            : 'border-ink-line text-creamDim hover:text-cream'
        }`}
      >
        {hintOn ? strings.drillHintOn : strings.drillHintOff}
      </button>
    </div>
  );
}
