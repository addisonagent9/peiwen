import React from "react";
import type { PoemPattern, Slot } from "../patterns/types";
import type { Translations } from "../i18n";

interface Props {
  pattern: PoemPattern;
  t: Translations;
}

function slotLabel(s: Slot): string {
  if (s === "P") return "平";
  if (s === "Z") return "仄";
  return "⊙";
}

function slotColor(s: Slot): string {
  if (s === "P") return "text-teal";
  if (s === "Z") return "text-rose";
  return "text-creamDim";
}

export function PatternPreview({ pattern, t }: Props) {
  return (
    <div className="ink-card rounded p-3 text-xs font-sans space-y-1">
      <div className="text-creamDim text-[10px] mb-1">{pattern.form}·{pattern.kind}·{pattern.name}</div>
      {pattern.lines.map((line, li) => (
        <div key={li} className="flex items-center gap-2">
          <span className="text-creamDim w-10 text-right shrink-0">{t.lineLabel(li + 1)}</span>
          <div className="flex gap-0.5">
            {line.slots.map((s, si) => {
              const isRhymePos = line.rhymes && si === line.slots.length - 1;
              return (
                <div key={si} className="flex flex-col items-center w-5">
                  {isRhymePos ? (
                    <span className="text-[8px] text-gold leading-none">◎</span>
                  ) : (
                    <span className="text-[8px] leading-none">&nbsp;</span>
                  )}
                  <span className={`${slotColor(s)} font-medium`}>{slotLabel(s)}</span>
                </div>
              );
            })}
          </div>
          {line.rhymes && <span className="text-gold text-[10px]">韻</span>}
        </div>
      ))}
    </div>
  );
}
