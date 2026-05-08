/**
 * PlayButton — small circular play/pause button for wenyan audio
 * (#26 stage D-2). Inline SVG icons (project convention; lucide-react
 * is not a dependency).
 *
 * Visual states:
 *   default  — border-cream/30, text-creamDim, hover lifts to cream
 *   playing  — border-cream, bg-cream/10, text-cream
 *   loading  — spinner SVG with animate-spin (briefly between click + play)
 *   error    — border-rose-400/40, text-rose-400 + tooltip "音频不可用"
 *              (audio not yet generated; click reverts to default on next
 *              play attempt because useWenyanAudio resets state on play())
 */

import React from 'react';
import { useWenyanAudio } from './useWenyanAudio';
import { wenyanStrings } from '../../i18n/wenyan-strings';
import { usePreferences } from '../../contexts/PreferencesContext';

interface PlayButtonProps {
  tag: string | null;
  ariaLabel?: string;
  size?: 'sm' | 'md';
}

function PlayIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <polygon points="6,4 20,12 6,20" />
    </svg>
  );
}

function PauseIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function SpinnerIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="animate-spin"
      aria-hidden
    >
      <path d="M12 3 a9 9 0 0 1 9 9" />
    </svg>
  );
}

export function PlayButton({ tag, ariaLabel, size = 'md' }: PlayButtonProps) {
  // #22: prefersSimplified-aware tooltip strings
  const { prefs } = usePreferences();
  const s = prefs.prefersSimplified ? wenyanStrings.cn : wenyanStrings.tw;
  const { isPlaying, isLoading, error, play } = useWenyanAudio(tag);

  const iconSize = size === 'sm' ? 12 : 16;
  const buttonSize = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';

  let icon: React.ReactNode;
  if (isLoading) icon = <SpinnerIcon size={iconSize} />;
  else if (isPlaying) icon = <PauseIcon size={iconSize} />;
  else icon = <PlayIcon size={iconSize} />;

  let colorClasses: string;
  if (error) {
    colorClasses = 'border-rose-400/40 text-rose-400';
  } else if (isPlaying) {
    colorClasses = 'border-cream bg-cream/10 text-cream';
  } else {
    colorClasses = 'border-cream/30 text-creamDim hover:border-cream/60 hover:text-cream';
  }

  const tooltip = error ? s.audioUnavailable : isPlaying ? s.audioPause : s.audioPlay;

  return (
    <button
      type="button"
      onClick={play}
      aria-label={ariaLabel ?? tooltip}
      title={tooltip}
      className={`shrink-0 inline-flex items-center justify-center ${buttonSize} rounded-full border transition-colors ${colorClasses}`}
    >
      {icon}
    </button>
  );
}
