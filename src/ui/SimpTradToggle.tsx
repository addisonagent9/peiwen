/**
 * SimpTradToggle — global 繁/簡 toggle (#22).
 *
 * Visual extracted verbatim from App.tsx's prior inline LocaleToggle.
 * Active char highlighted with `bg-gold text-ink-bg font-medium`. Lifted
 * to a shared component so it can be placed in 5 sticky headers (App,
 * Trainer, Wenyan list, Wenyan reader, Admin) without duplicating JSX.
 *
 * Reads/writes the global PreferencesContext. Click → optimistic update
 * + PUT /api/user/preferences (server side syncs ui_language).
 */

import React from 'react';
import { usePreferences } from '../contexts/PreferencesContext';

export function SimpTradToggle() {
  const { prefs, setPrefersSimplified } = usePreferences();
  const simp = prefs.prefersSimplified;
  return (
    <div
      role="group"
      aria-label="Chinese form: traditional or simplified"
      className="flex items-center rounded border border-ink-line overflow-hidden text-xs font-sans"
    >
      <button
        type="button"
        aria-pressed={!simp}
        onClick={simp ? () => setPrefersSimplified(false) : undefined}
        className={`px-2 py-1 ${!simp ? 'bg-gold text-ink-bg font-medium' : 'text-creamDim'}`}
      >
        繁
      </button>
      <button
        type="button"
        aria-pressed={simp}
        onClick={!simp ? () => setPrefersSimplified(true) : undefined}
        className={`px-2 py-1 ${simp ? 'bg-gold text-ink-bg font-medium' : 'text-creamDim'}`}
      >
        簡
      </button>
    </div>
  );
}
