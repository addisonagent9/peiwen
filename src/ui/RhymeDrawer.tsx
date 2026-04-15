import React from "react";
import { PINGSHUI_RHYME } from "../data/pingshui";

interface Props {
  rhyme: string | null;
  onClose: () => void;
}

export function RhymeDrawer({ rhyme, onClose }: Props) {
  if (!rhyme) return null;
  const bucket = PINGSHUI_RHYME[rhyme];
  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-[min(28rem,90vw)] h-full ink-card border-l overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 ink-card border-b px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-creamDim font-sans">{bucket?.group} · {bucket?.tone}聲</div>
            <div className="text-2xl font-serif text-gold">{rhyme}</div>
          </div>
          <button onClick={onClose} className="text-creamDim hover:text-cream text-xl">✕</button>
        </div>
        <div className="px-5 py-4 text-xs text-creamDim font-sans">
          共 {bucket?.chars.length ?? 0} 字
        </div>
        <div className="px-5 pb-8 grid grid-cols-8 gap-2 font-serif text-xl">
          {bucket?.chars.map((ch, i) => (
            <div key={i} className="w-8 h-8 flex items-center justify-center rounded bg-ink-bg/70 text-cream">
              {ch}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
