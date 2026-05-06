import React from 'react';
import { wenyanStrings } from '../../i18n/wenyan-strings';

interface WenyanModuleProps {
  onExit: () => void;
  userName?: string | null;
}

export function WenyanModule({ onExit, userName }: WenyanModuleProps) {
  const s = wenyanStrings.cn;
  return (
    <div className="min-h-screen bg-ink-bg text-cream font-sans antialiased">
      <header className="flex items-center justify-between px-6 py-4 border-b border-ink-line">
        <div>
          <h1 className="font-serif text-2xl tracking-wide">{s.moduleTitle}</h1>
          <p className="text-creamDim text-xs mt-1">{s.moduleSubtitle}</p>
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 border border-ink-line rounded text-creamDim hover:text-cream hover:border-cream/40 transition-colors text-sm"
        >
          {s.backToHome}
        </button>
      </header>
      <main className="px-6 py-12 text-center">
        <p className="font-serif text-creamDim text-base">{s.stagePlaceholder}</p>
        {userName && (
          <p className="mt-3 text-creamDim/60 text-xs">Signed in as {userName}</p>
        )}
      </main>
    </div>
  );
}
