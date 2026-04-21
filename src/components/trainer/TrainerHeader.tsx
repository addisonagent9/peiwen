/**
 * TrainerHeader — persistent top bar for the trainer module.
 *
 * Minimal on purpose. Left: back chevron. Center: module title in serif.
 * Right: empty (reserved for future settings). Below: a thin brush-stroke
 * divider in gold (a single animated SVG line, low-key, fires once on mount).
 */

import React from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import type { SubView } from './PingshuiTrainer';

export interface TrainerHeaderProps {
  strings: TrainerStrings;
  subView: SubView;
  onBack?: () => void;
  showBack: boolean;
}

export const TrainerHeader: React.FC<TrainerHeaderProps> = ({
  strings,
  subView,
  onBack,
  showBack,
}) => {
  // Pick a subtitle based on the current sub-view
  const subtitle =
    subView === 'foundation' ? strings.foundationTitle
    : subView === 'tier' ? strings.navDrill
    : subView === 'drill' ? strings.navDrill
    : subView === 'dashboard' ? strings.navDashboard
    : '';

  return (
    <header className="sticky top-0 z-20 bg-ink-bg/95 backdrop-blur-sm">
      <div className="max-w-screen-sm mx-auto px-5 py-4 flex items-center">
        <div className="w-10">
          {showBack && (
            <button
              onClick={onBack}
              aria-label={strings.backToHome}
              className="w-10 h-10 -ml-2 flex items-center justify-center text-creamDim hover:text-cream transition-colors"
            >
              {/* A minimal back chevron — thin stroke, not bold */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M11.5 3.5 L5.5 9 L11.5 14.5"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 text-center">
          <h1 className="font-serif text-cream text-lg tracking-wide">
            {strings.navTitle}
          </h1>
          {subtitle && (
            <p className="text-creamDim text-xs tracking-wider mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="w-10" />
      </div>

      {/* Brush-stroke divider — animated once on mount */}
      <div className="max-w-screen-sm mx-auto px-5">
        <svg
          viewBox="0 0 320 4"
          preserveAspectRatio="none"
          className="w-full h-[3px] text-gold"
          aria-hidden
        >
          <path
            d="M 4 2 Q 160 0.5 316 2"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
            style={{
              strokeDasharray: 320,
              strokeDashoffset: 320,
              animation: 'pw-brushstroke 1.2s ease-out forwards',
            }}
          />
        </svg>
      </div>

      {/* Scoped keyframes — uses a prefixed name so it can't collide */}
      <style>{`
        @keyframes pw-brushstroke {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </header>
  );
};
