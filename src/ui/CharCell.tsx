import React from "react";
import type { CharAnalysis } from "../analysis/validate";

interface Props {
  c: CharAnalysis;
  isRhyme: boolean;
  onClickChar: () => void;
  onClickRhyme: (rhyme: string) => void;
}

export function CharCell({ c, isRhyme, onClickChar, onClickRhyme }: Props) {
  const toneColor =
    c.isRu ? "text-amber" :
    c.tone === "平" ? "text-teal" :
    c.tone === "仄" ? "text-rose" :
    "text-creamDim";

  const slotGlyph =
    c.slotKind === "free" ? "◎" :
    c.slotKind === "constrained" ? "◉" :
    c.expected ?? "";

  const slotTooltip =
    isRhyme && c.tone === "平" ? "○ 平聲韻腳" :
    isRhyme ? "◎ 韻腳（此句押韻字）" :
    c.isRu ? "● 入聲字（古入聲，現已消失）" :
    c.slotKind === "free" ? "◎ 可平可仄" :
    c.slotKind === "constrained" ? "◉ 可平可仄但有偏好" :
    c.expected === "平" ? "此位應為平聲" :
    c.expected === "仄" ? "此位應為仄聲" : "";

  const borderClass = c.mismatch
    ? "border-rose"
    : c.slotKind === "fixed"
      ? "border-ink-line"
      : "border-teal/30";

  const charColor = isRhyme ? "text-gold" : "text-cream";
  const rhymeLabel = c.entries[0]?.rhyme ?? null;

  return (
    <div className={`relative aspect-square flex flex-col items-center justify-between gap-0.5 px-1 py-1.5 rounded-md border ${borderClass} bg-ink-card/60`}>
      <div className="group relative text-[10px] leading-none text-creamDim font-sans select-none cursor-help">
        {slotGlyph}
        {slotTooltip && (
          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50 whitespace-nowrap rounded border border-ink-line bg-ink-bg px-2 py-1 text-[10px] text-cream shadow">
            {slotTooltip}
          </div>
        )}
      </div>
      <button
        onClick={onClickChar}
        className={`text-2xl leading-[1.1] font-serif ${charColor} hover:opacity-70 transition`}
        title={c.ambiguous ? "多音字" : ""}
      >
        {c.char || "　"}
      </button>
      <div className="flex flex-row items-center justify-center gap-1.5 w-full">
        <div className={`text-[10px] leading-none font-sans ${toneColor} select-none`}>
          {c.isRu ? "入" : c.tone ?? (c.unknown ? "？" : "")}
        </div>
        {rhymeLabel ? (
          <button
            onClick={() => onClickRhyme(rhymeLabel)}
            className="text-[10px] leading-none font-sans text-creamDim hover:text-gold transition"
          >
            {rhymeLabel}
          </button>
        ) : null}
      </div>
      {c.ambiguous && (
        <div className="group absolute top-1 right-1 cursor-help">
          <div className="w-1.5 h-1.5 rounded-full bg-amber" />
          <div className="pointer-events-none absolute bottom-full right-0 mb-1 hidden group-hover:block z-50 whitespace-nowrap rounded border border-ink-line bg-ink-bg px-2 py-1 text-[10px] text-cream shadow">
            「多音字」— 此字有多個讀音，平仄視語義而定
          </div>
        </div>
      )}
    </div>
  );
}
