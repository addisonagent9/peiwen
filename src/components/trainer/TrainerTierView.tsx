/**
 * TrainerTierView — browse all rhymes within a single tier.
 *
 * For Tier 2 especially, rhymes are shown grouped by family (e.g. the
 * -en triple: 真/文/元). This is a deliberate pedagogical choice: grouping
 * confusables visually teaches the learner to expect the confusion.
 *
 * Family groups are rendered as a subtle vertical rule on the left with a
 * family label above. Non-grouped tier 1 rhymes render as a simple list.
 */

import React, { useMemo } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import type { Rhyme, RhymeTier } from '../../types/pingshui-trainer';
import {
  FAMILIES,
  rhymesByTier,
} from '../../data/pingshui/trainer-curriculum';

export interface TrainerTierViewProps {
  strings: TrainerStrings;
  tier: RhymeTier;
  unlockedTier: RhymeTier;
  onSelectRhyme: (rhymeId: string) => void;
}

export const TrainerTierView: React.FC<TrainerTierViewProps> = ({
  strings,
  tier,
  unlockedTier,
  onSelectRhyme,
}) => {
  // Group rhymes in this tier by family. Preserve family insertion order
  // so 寒/删/先, 真/文/元 etc. appear together as curated.
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
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// One rhyme row
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
      {/* The big 韵目 character */}
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

      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="shrink-0 text-creamDim group-hover:text-cream transition-colors"
        aria-hidden
      >
        <path
          d="M4 2 L8 6 L4 10"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </button>
);
