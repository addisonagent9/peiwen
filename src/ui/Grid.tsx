import React from "react";
import type { CharAnalysis } from "../analysis/validate";
import type { LineTemplate } from "../patterns/types";
import { CharCell } from "./CharCell";

interface Props {
  chars: CharAnalysis[][];
  lineTemplates: LineTemplate[];
  cols: number;
  onPick: (lineIdx: number, pos: number) => void;
  onRhymeClick: (rhyme: string) => void;
}

/** Vertical RTL grid: each poem line renders as a column (top → bottom),
 *  columns laid out right → left. Rightmost column = line 1. */
export function Grid({ chars, lineTemplates, cols, onPick, onRhymeClick }: Props) {
  return (
    <div className="flex flex-row-reverse gap-3 justify-center py-4" dir="ltr">
      {chars.map((row, li) => (
        <div
          key={li}
          className="flex flex-col gap-2 items-center"
          style={{ width: `min(6rem, calc((100vw - 4rem) / ${cols + 1}))` }}
        >
          <div className="text-xs text-creamDim font-sans">
            第{li + 1}句{lineTemplates[li].rhymes ? "（韻）" : ""}
          </div>
          <div className="flex flex-col gap-2 w-full">
            {row.map((c, i) => (
              <CharCell
                key={i}
                c={c}
                isRhyme={lineTemplates[li].rhymes && i === row.length - 1}
                onClickChar={() => onPick(li, i)}
                onClickRhyme={onRhymeClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
