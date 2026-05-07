/**
 * SequencePlayButton — section-level audio control button (#26 stage D-2.6
 * restyle).
 *
 * Visual: pill button with inline icon + Chinese section label, mirroring
 * the trainer's audio-button convention (DrillCard / FoundationModule
 * — `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border
 * border-ink-line ...`). State-based color overrides:
 *   default — border-ink-line text-creamDim, hover lifts to cream
 *   playing — border-gold/60 text-gold
 *   error   — border-rose-400/40 text-rose-400
 *
 * Now PRESENTATIONAL (D-2.6): hook lives in PoemReader so the parent can
 * subscribe to `currentIndex` for active-item highlighting. This component
 * receives `{ isPlaying, isLoading, error, onClick, label, size?, ariaLabel? }`
 * and just renders.
 */

import React from 'react';
import { wenyanStrings } from '../../i18n/wenyan-strings';

interface SequencePlayButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  onClick: () => void;
  /** Section label, typically a Chinese heading like '背景' / '原文' / '译文'. */
  label: string;
  size?: 'sm' | 'md';
  ariaLabel?: string;
}

function PlayIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 11 11" aria-hidden>
      <path d="M3 1.5 L3 9.5 L9.5 5.5 Z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 11 11" aria-hidden>
      <rect x="3" y="2" width="2" height="7" fill="currentColor" />
      <rect x="6.5" y="2" width="2" height="7" fill="currentColor" />
    </svg>
  );
}

function SpinnerIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 11 11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      className="animate-spin"
      aria-hidden
    >
      <path d="M5.5 1.5 a4 4 0 0 1 4 4" />
    </svg>
  );
}

export function SequencePlayButton({
  isPlaying,
  isLoading,
  error,
  onClick,
  label,
  size = 'sm',
  ariaLabel,
}: SequencePlayButtonProps) {
  const s = wenyanStrings.cn;

  const iconSize = size === 'sm' ? 9 : 11;
  const padding = size === 'sm' ? 'px-3 py-1.5 text-xs gap-1.5' : 'px-4 py-2 text-sm gap-2';

  let icon: React.ReactNode;
  if (isLoading) icon = <SpinnerIcon size={iconSize} />;
  else if (isPlaying) icon = <PauseIcon size={iconSize} />;
  else icon = <PlayIcon size={iconSize} />;

  let colorClasses: string;
  if (error) {
    colorClasses = 'border-rose-400/40 text-rose-400';
  } else if (isPlaying) {
    colorClasses = 'border-gold/60 text-gold';
  } else {
    colorClasses = 'border-ink-line text-creamDim hover:text-cream hover:border-cream/40';
  }

  // Tooltip + aria-label follow state: error > playing > default.
  const stateLabel = error ? s.audioUnavailable : isPlaying ? s.audioPause : s.audioPlay;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? `${stateLabel} — ${label}`}
      title={stateLabel}
      className={`inline-flex items-center ${padding} rounded-full border transition-colors ${colorClasses}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
