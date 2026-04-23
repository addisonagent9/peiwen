/**
 * TrainerHome — the landing screen of the trainer.
 *
 * Layout (mobile-first, single column):
 *
 *   ┌───────────────────────────────┐
 *   │  Welcome                      │   ← greeting
 *   │  3-day streak · 7 due         │
 *   │                               │
 *   │  ┌─────────────────────────┐  │
 *   │  │ Foundation (✓ if done)   │  │  ← always shown; adapts style
 *   │  │ [Start foundation]      │  │
 *   │  └─────────────────────────┘  │
 *   │                               │
 *   │  ── 韵部层级 ──                │
 *   │  [Tier 1 — 五韵入门]   ▶     │
 *   │  [Tier 2 — 易混辨析]  🔒      │
 *   │  [Tier 3 — 闭口冷僻]  🔒      │
 *   │                               │
 *   │  ── 其他 ──                    │
 *   │  [进度仪表盘]  ▶              │
 *   │                               │
 *   │  [开始练习]     ← primary CTA │
 *   └───────────────────────────────┘
 */

import React from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import type { UserTrainerState, RhymeTier } from '../../types/pingshui-trainer';
import { rhymesByTier } from '../../data/pingshui/trainer-curriculum';

export interface TrainerHomeProps {
  strings: TrainerStrings;
  state: UserTrainerState;
  dueCount: number;
  userName?: string;
  onStartFoundation: () => void;
  onOpenTier: (tier: RhymeTier) => void;
  onOpenDashboard: () => void;
  onStartDrill?: () => void;
}

export const TrainerHome: React.FC<TrainerHomeProps> = ({
  strings,
  state,
  dueCount,
  userName,
  onStartFoundation,
  onOpenTier,
  onOpenDashboard,
  onStartDrill,
}) => {
  const tiers: Array<{
    tier: RhymeTier;
    title: string;
    description: string;
    count: number;
  }> = [
    {
      tier: 1,
      title: strings.tier1Title,
      description: strings.tier1Description,
      count: rhymesByTier(1).length,
    },
    {
      tier: 2,
      title: strings.tier2Title,
      description: strings.tier2Description,
      count: rhymesByTier(2).length,
    },
    {
      tier: 3,
      title: strings.tier3Title,
      description: strings.tier3Description,
      count: rhymesByTier(3).length,
    },
  ];

  return (
    <div className="space-y-10 pt-6">
      {/* Greeting + stats */}
      <section>
        <h2 className="font-serif text-3xl text-cream tracking-wide">
          {strings.welcomeGreeting(userName)}
        </h2>
        <div className="mt-3 flex items-center gap-4 text-sm text-creamDim">
          {state.streakDays > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-gold" />
              {strings.streakDays(state.streakDays)}
            </span>
          )}
          <span className={dueCount > 0 ? 'text-teal' : ''}>
            {strings.cardsDueToday(dueCount)}
          </span>
        </div>
      </section>

      {/* Foundation prompt */}
      <section className="border border-ink-line rounded-md p-4 bg-cream/5">
        <div className="flex items-center gap-2">
          {state.foundationCompleted && (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="text-gold shrink-0">
              <path d="M3 7 L6 10 L11 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <h3 className="font-serif text-cream text-base">
            {strings.foundationTitle}
          </h3>
        </div>
        <p className="text-creamDim text-sm mt-1 leading-relaxed">
          {strings.foundationSubtitle}
        </p>
        <button
          onClick={onStartFoundation}
          className={
            state.foundationCompleted
              ? "mt-4 w-full py-3 border border-ink-line text-creamDim font-serif tracking-wider rounded hover:text-cream hover:border-cream/40 transition-colors"
              : "mt-4 w-full py-3 bg-gold/10 border border-gold/40 text-gold font-serif tracking-wider rounded hover:bg-gold/20 transition-colors"
          }
        >
          {state.foundationCompleted ? strings.reviewFoundation : strings.startFoundation}
        </button>
      </section>

      {/* Tier selector */}
      <section>
        <SectionLabel>韵部层级</SectionLabel>
        <div className="space-y-2">
          {tiers.map(({ tier, title, description, count }) => {
            const unlocked = tier <= state.currentTier && state.foundationCompleted;
            return (
              <TierRow
                key={tier}
                title={title}
                description={description}
                count={count}
                unlocked={unlocked}
                lockedLabel={
                  !state.foundationCompleted && tier === 1
                    ? strings.foundationLocked
                    : strings.tierUnlockHint
                }
                onClick={unlocked ? () => onOpenTier(tier) : undefined}
              />
            );
          })}
        </div>
      </section>

      {/* Secondary navigation */}
      <section>
        <SectionLabel>其他</SectionLabel>
        <button
          onClick={onOpenDashboard}
          className="w-full flex items-center justify-between py-3 px-4 border border-ink-line rounded-md text-cream hover:bg-cream/5 transition-colors"
        >
          <span className="font-serif">{strings.dashboardTitle}</span>
          <Chevron />
        </button>
      </section>

      {/* Primary CTA — start drill */}
      {onStartDrill && (
        <section className="pt-2">
          <button
            onClick={onStartDrill}
            className="w-full py-4 bg-teal text-ink-bg font-serif text-lg tracking-wider rounded hover:opacity-90 transition-opacity"
          >
            {strings.startDrill}
          </button>
        </section>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Small inline sub-components
// ---------------------------------------------------------------------------

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-3 mb-3">
    <span className="h-px flex-1 bg-ink-line" />
    <span className="text-creamDim text-xs tracking-[0.2em] uppercase">
      {children}
    </span>
    <span className="h-px flex-1 bg-ink-line" />
  </div>
);

interface TierRowProps {
  title: string;
  description: string;
  count: number;
  unlocked: boolean;
  lockedLabel: string;
  onClick?: () => void;
}

const TierRow: React.FC<TierRowProps> = ({
  title,
  description,
  count,
  unlocked,
  lockedLabel,
  onClick,
}) => {
  const base =
    'w-full text-left py-4 px-4 border rounded-md transition-colors';
  const active =
    'border-ink-line text-cream hover:bg-cream/5 cursor-pointer';
  const locked =
    'border-ink-line/50 text-creamDim/60 cursor-not-allowed';

  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className={`${base} ${unlocked ? active : locked}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-serif text-base">
            {title}
            <span className="text-creamDim/70 ml-2 text-xs font-sans">
              · {count}
            </span>
          </h4>
          <p className="text-xs mt-1 leading-relaxed">
            {unlocked ? description : lockedLabel}
          </p>
        </div>
        {unlocked ? <Chevron /> : <LockIcon />}
      </div>
    </button>
  );
};

const Chevron: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path
      d="M5 3 L9 7 L5 11"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon: React.FC = () => (
  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden>
    <rect
      x="2"
      y="6"
      width="8"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="1"
    />
    <path
      d="M4 6 V4 Q4 2 6 2 Q8 2 8 4 V6"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
  </svg>
);
