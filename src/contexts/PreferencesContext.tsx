/**
 * PreferencesContext — global user-preference state (#22).
 *
 * Currently exposes a single preference: `prefersSimplified` (繁 = false /
 * 簡 = true). Wired at the app root in `src/index.tsx`. Initial value is
 * hydrated synchronously from localStorage to avoid first-paint flashes;
 * after `/api/auth/me` resolves, App.tsx pushes the server-authoritative
 * value via `hydrateFromAuth()`.
 *
 * Toggle path: the user clicks <SimpTradToggle/> → `setPrefersSimplified(v)`
 * fires, which (1) updates local state optimistically, (2) updates
 * localStorage, and (3) PUTs `/api/user/preferences`. On server failure
 * the local state rolls back to the prior value.
 *
 * Server side syncs `user_trainer_state.ui_language` to keep trainer UI
 * strings aligned with the toggle (preserves 'en-bilingual' values).
 */

import React, { createContext, useCallback, useContext, useState } from 'react';

const STORAGE_KEY = 'peiwen.prefers_simplified';

export interface Preferences {
  prefersSimplified: boolean;
}

interface PreferencesContextValue {
  prefs: Preferences;
  setPrefersSimplified: (v: boolean) => Promise<void>;
  /** Push the server-authoritative value into context after auth/me resolves. */
  hydrateFromAuth: (v: boolean) => void;
}

const defaultValue: PreferencesContextValue = {
  prefs: { prefersSimplified: false },
  setPrefersSimplified: async () => {},
  hydrateFromAuth: () => {},
};

export const PreferencesContext = createContext<PreferencesContextValue>(defaultValue);

function readInitialFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeStorage(v: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
  } catch {
    /* ignored */
  }
}

interface ProviderProps {
  children: React.ReactNode;
}

export function PreferencesProvider({ children }: ProviderProps) {
  const [prefs, setPrefs] = useState<Preferences>(() => ({
    prefersSimplified: readInitialFromStorage(),
  }));

  const hydrateFromAuth = useCallback((v: boolean) => {
    setPrefs({ prefersSimplified: v });
    writeStorage(v);
  }, []);

  const setPrefersSimplified = useCallback(
    async (v: boolean) => {
      // Optimistic update + localStorage write.
      const prev = prefs.prefersSimplified;
      setPrefs({ prefersSimplified: v });
      writeStorage(v);

      try {
        const r = await fetch('/api/user/preferences', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prefers_simplified: v ? 1 : 0 }),
        });
        if (!r.ok) throw new Error('server reject');
      } catch {
        // Rollback on failure (e.g., user not logged in, server error).
        setPrefs({ prefersSimplified: prev });
        writeStorage(prev);
      }
    },
    [prefs.prefersSimplified],
  );

  return (
    <PreferencesContext.Provider value={{ prefs, setPrefersSimplified, hydrateFromAuth }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  return useContext(PreferencesContext);
}
