import React, { useEffect, useState } from 'react';
import type { TrainerStrings } from '../../i18n/trainer-strings';
import { PracticeSession } from './PracticeSession';

interface LibraryRhyme {
  rhyme_id: string;
  rhyme_label: string;
  total_chars: number;
  user_chars: string[];
}

interface Props {
  strings: TrainerStrings;
  onBack: () => void;
}

export const RhymeLibrary: React.FC<Props> = ({ strings, onBack }) => {
  const [rhymes, setRhymes] = useState<LibraryRhyme[]>([]);
  const [loading, setLoading] = useState(true);
  const [practiceRhymeLabel, setPracticeRhymeLabel] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const fetchLibrary = () => {
    fetch('/api/trainer/drill/library', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setRhymes(d.rhymes ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLibrary(); }, []);

  const totalChars = rhymes.reduce((n, r) => n + r.user_chars.length, 0);
  const activeRhymes = rhymes.filter(r => r.user_chars.length > 0).length;

  const toggleExpand = (rhymeId: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(rhymeId)) next.delete(rhymeId);
      else next.add(rhymeId);
      return next;
    });
  };

  if (practiceRhymeLabel) {
    return (
      <PracticeSession
        rhymeLabel={practiceRhymeLabel}
        size={5}
        onExit={() => { setPracticeRhymeLabel(null); fetchLibrary(); }}
      />
    );
  }

  return (
    <div className="pt-6 pb-24 space-y-6">
      <header>
        <button onClick={onBack} className="text-creamDim text-xs hover:text-cream transition-colors mb-4 flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M6 2 L3 5 L6 8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {strings.backToHome}
        </button>
        <h2 className="font-serif text-cream text-2xl tracking-wide">{strings.libraryNavLabel}</h2>
        {!loading && (
          <p className="text-creamDim text-sm mt-1">{strings.libraryTotalsFmt(totalChars, activeRhymes)}</p>
        )}
      </header>

      {loading && <div className="text-creamDim text-sm">…</div>}

      <div className="space-y-3">
        {rhymes.map(r => {
          const isExpanded = expanded.has(r.rhyme_id);
          const hasChars = r.user_chars.length > 0;
          const needsToggle = r.user_chars.length > 10;
          const visibleChars = isExpanded ? r.user_chars : r.user_chars.slice(0, 10);

          return (
            <div key={r.rhyme_id} className="border border-ink-line rounded-md p-4">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setPracticeRhymeLabel(r.rhyme_label)}
                  className="px-3 py-1 bg-gold text-ink-bg font-serif text-xs tracking-wider rounded hover:opacity-90 transition-opacity"
                >
                  温韵默考
                </button>
                <span className="font-serif text-gold text-base flex-1">{r.rhyme_label}</span>
                <span className="text-creamDim text-xs">{strings.libraryProgressFmt(r.user_chars.length, r.total_chars)}</span>
              </div>
              {hasChars && (
                <div className="flex flex-wrap gap-1 items-center">
                  {visibleChars.map(ch => (
                    <span key={ch} className="font-serif text-gold text-xl">{ch}</span>
                  ))}
                  {needsToggle && (
                    <button
                      onClick={() => toggleExpand(r.rhyme_id)}
                      className="text-creamDim text-xs hover:text-cream transition-colors ml-1"
                      aria-label={isExpanded ? '收起' : '展开'}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
