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

  if (practiceRhymeLabel) {
    return (
      <PracticeSession
        rhymeId={practiceRhymeLabel}
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
        {rhymes.map(r => (
          <div key={r.rhyme_id} className="border border-ink-line rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-serif text-gold text-base">{r.rhyme_label}</span>
              <span className="text-creamDim text-xs">{strings.libraryProgressFmt(r.user_chars.length, r.total_chars)}</span>
            </div>
            <div className="w-full h-1 bg-ink-line/30 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gold" style={{ width: `${Math.min(100, (r.user_chars.length / Math.max(1, r.total_chars)) * 100)}%` }} />
            </div>
            <button
              onClick={() => setPracticeRhymeLabel(r.rhyme_label)}
              className="mb-3 px-4 py-1.5 bg-gold text-ink-bg font-serif text-sm tracking-wider rounded hover:opacity-90 transition-opacity"
            >
              练习
            </button>
            {r.user_chars.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {r.user_chars.map(ch => (
                  <span key={ch} className="font-serif text-gold text-xl">{ch}</span>
                ))}
              </div>
            ) : (
              <p className="text-creamDim/50 text-xs">{strings.libraryEmpty}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
