/**
 * TrainerPlaceholder — used by sub-views not yet implemented in M3.1.
 *
 * This intentionally communicates "not ready yet" rather than showing a
 * half-built drill. Replaced entirely by real components in later milestones.
 */

import React from 'react';

export interface TrainerPlaceholderProps {
  title: string;
  subtitle?: string;
  body: string;
  continueLabel?: string;
  onContinue?: () => void;
}

export const TrainerPlaceholder: React.FC<TrainerPlaceholderProps> = ({
  title,
  subtitle,
  body,
  continueLabel,
  onContinue,
}) => (
  <div className="pt-8 space-y-6">
    <header>
      <h2 className="font-serif text-2xl text-cream tracking-wide">{title}</h2>
      {subtitle && (
        <p className="text-creamDim text-sm mt-2">{subtitle}</p>
      )}
    </header>

    <div className="p-5 border border-dashed border-ink-line rounded-md">
      <p className="text-creamDim text-sm leading-relaxed">{body}</p>
    </div>

    {onContinue && continueLabel && (
      <button
        onClick={onContinue}
        className="w-full py-3 bg-gold/10 border border-gold/40 text-gold font-serif tracking-wider rounded hover:bg-gold/20 transition-colors"
      >
        {continueLabel}
      </button>
    )}
  </div>
);
