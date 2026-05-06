/**
 * SequencePlayButton — section-header play button for sequential
 * tag-array playback (#26 stage D-2.5).
 *
 * Visual mirror of PlayButton (per-clip): same default/playing/error
 * color tokens, same inline SVG icons, same sm/md sizes. Wraps
 * useWenyanAudioSequence instead of useWenyanAudio.
 *
 * Disabled (opacity-30) when tags array is empty (defensive — current
 * data always supplies non-empty arrays).
 */

import React from 'react';
import { useWenyanAudioSequence } from './useWenyanAudioSequence';
import { wenyanStrings } from '../../i18n/wenyan-strings';

interface SequencePlayButtonProps {
  tags: string[];
  ariaLabel?: string;
  size?: 'sm' | 'md';
  autoPlay?: boolean;
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

export function SequencePlayButton({
  tags,
  ariaLabel,
  size = 'md',
  autoPlay = false,
}: SequencePlayButtonProps) {
  const s = wenyanStrings.cn;
  const { isPlaying, isLoading, error, play } = useWenyanAudioSequence(tags, { autoPlay });

  const iconSize = size === 'sm' ? 12 : 16;
  const buttonSize = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const disabled = tags.length === 0;

  let icon: React.ReactNode;
  if (isLoading) icon = <SpinnerIcon size={iconSize} />;
  else if (isPlaying) icon = <PauseIcon size={iconSize} />;
  else icon = <PlayIcon size={iconSize} />;

  let colorClasses: string;
  if (disabled) {
    colorClasses = 'border-cream/30 text-creamDim opacity-30 cursor-not-allowed';
  } else if (error) {
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
      disabled={disabled}
      aria-label={ariaLabel ?? tooltip}
      title={tooltip}
      className={`shrink-0 inline-flex items-center justify-center ${buttonSize} rounded-full border transition-colors ${colorClasses}`}
    >
      {icon}
    </button>
  );
}
