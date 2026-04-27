/**
 * TrainerTierView — browse all rhymes within a single tier.
 *
 * Shows rhymes grouped by family, a tier-scoped drill button, and
 * 4 drill cards with lock/check states based on unlock status.
 */

import React, { useMemo } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import type { Rhyme, RhymeTier } from '../../types/pingshui-trainer';
import {
  FAMILIES,
  rhymesByTier,
} from '../../data/pingshui/trainer-curriculum';

export interface DrillUnlockInfo {
  tier: number;
  drillNumber: number;
}

export interface TrainerTierViewProps {
  strings: TrainerStrings;
  tier: RhymeTier;
  unlockedTier: RhymeTier;
  onSelectRhyme: (rhymeId: string) => void;
  onStartDrill?: (drillNumber?: number) => void;
  unlockedDrills?: DrillUnlockInfo[];
  sessionCounts?: Record<string, number>;
}

export const TrainerTierView: React.FC<TrainerTierViewProps> = ({
  strings,
  tier,
  unlockedTier,
  onSelectRhyme,
  onStartDrill,
  unlockedDrills = [],
  sessionCounts = {},
}) => {
  const grouped = useMemo(() => {
    const rhymes = rhymesByTier(tier);
    const byFamily = new Map<string, Rhyme[]>();
    for (const r of rhymes) {
      const list = byFamily.get(r.family) ?? [];
      list.push(r);
      byFamily.set(r.family, list);
    }
    return Array.from(byFamily.entries());
  }, [tier]);

  const isUnlocked = tier <= unlockedTier;

  const isDrillUnlocked = (drillNum: number) =>
    (tier === 1 && drillNum === 1) ||
    unlockedDrills.some(d => d.tier === tier && d.drillNumber === drillNum);

  const hasDrillSession = (drillNum: number) =>
    (sessionCounts[`${tier}-${drillNum}`] ?? 0) > 0;

  const drillCards = [
    { num: 1, title: strings.drillCard1Title },
    { num: 2, title: strings.drillCard2Title },
    { num: 3, title: strings.drillCard3Title },
    { num: 4, title: strings.drillCard4Title },
  ];

  return (
    <div className="space-y-8 pt-6">
      {/* Tier title */}
      <header>
        <h2 className="font-serif text-2xl text-cream tracking-wide">
          {tier === 1
            ? strings.tier1Title
            : tier === 2
            ? strings.tier2Title
            : strings.tier3Title}
        </h2>
        <p className="text-creamDim text-sm mt-2 leading-relaxed">
          {tier === 1
            ? strings.tier1Description
            : tier === 2
            ? strings.tier2Description
            : strings.tier3Description}
        </p>
      </header>

      {/* Locked state */}
      {!isUnlocked && (
        <div className="p-6 border border-ink-line/50 rounded-md text-center">
          <p className="text-creamDim font-serif">{strings.tierLocked}</p>
          <p className="text-creamDim/60 text-xs mt-2">
            {strings.tierUnlockHint}
          </p>
        </div>
      )}

      {/* Grouped rhymes */}
      {isUnlocked && (
        <div className="space-y-8">
          {grouped.map(([familyId, rhymes]) => {
            const family = FAMILIES[familyId];
            const showFamilyHeader = rhymes.length > 1;
            return (
              <section key={familyId}>
                {showFamilyHeader && family && (
                  <div className="mb-3">
                    <h3 className="font-serif text-cream text-sm tracking-wider">
                      {family.label}
                    </h3>
                    <p className="text-creamDim/70 text-xs mt-1 leading-relaxed">
                      {family.teachingNote}
                    </p>
                  </div>
                )}
                <div
                  className={
                    showFamilyHeader
                      ? 'space-y-2 border-l border-gold/30 pl-3'
                      : 'space-y-2'
                  }
                >
                  {rhymes.map((r) => (
                    <RhymeRow
                      key={r.id}
                      rhyme={r}
                      onClick={() => onSelectRhyme(r.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Drill cards */}
          <div className="space-y-2">
            {drillCards.map(({ num, title }) => {
              const unlocked = isDrillUnlocked(num);
              const completed = hasDrillSession(num);
              return (
                <button
                  key={num}
                  onClick={unlocked && num <= 4 && onStartDrill ? () => onStartDrill(num) : undefined}
                  disabled={!unlocked || num > 4}
                  className={`w-full text-left py-3 px-4 border rounded-md transition-colors ${
                    unlocked
                      ? num <= 4
                        ? 'border-emerald-600/40 bg-emerald-600/10 text-cream hover:bg-emerald-600/20 cursor-pointer'
                        : 'border-emerald-600/20 bg-emerald-600/5 text-cream/70 cursor-default'
                      : 'border-ink-line/50 text-creamDim/40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {completed && (
                        <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden className="text-gold shrink-0">
                          <path d="M3 7 L6 10 L11 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      <span className="text-sm font-serif">{title}</span>
                    </div>
                    {!unlocked && <LockIcon />}
                    {unlocked && num > 4 && (
                      <span className="text-xs text-creamDim/50">{strings.drillComingSoon}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const RhymeRow: React.FC<{ rhyme: Rhyme; onClick: () => void }> = ({
  rhyme,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="w-full text-left py-3 px-4 border border-ink-line rounded-md hover:bg-cream/5 transition-colors group"
  >
    <div className="flex items-center gap-4">
      <div className="shrink-0 w-12 h-12 flex items-center justify-center border border-ink-line rounded bg-ink-bg font-serif text-2xl text-cream group-hover:border-gold/50 transition-colors">
        {rhyme.rhymeCharacter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-serif text-cream text-base">
          {rhyme.label}
          <span className="text-creamDim/70 ml-2 text-xs font-sans tracking-wide">
            {rhyme.modernRime}
          </span>
        </div>
        <p className="text-creamDim text-xs mt-1 truncate">
          {rhyme.seedCharacters.slice(0, 6).map(sc => typeof sc === 'string' ? sc : sc.char).join('·')}
        </p>
      </div>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-creamDim group-hover:text-cream transition-colors" aria-hidden>
        <path d="M4 2 L8 6 L4 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </button>
);

const LockIcon: React.FC = () => (
  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden className="text-creamDim/40">
    <rect x="2" y="6" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1" />
    <path d="M4 6 V4 Q4 2 6 2 Q8 2 8 4 V6" stroke="currentColor" strokeWidth="1" fill="none" />
  </svg>
);
