import React from "react";
import type { CharAnalysis } from "../analysis/validate";
import type { LineTemplate } from "../patterns/types";
import { CharCell } from "./CharCell";

interface Props {
  chars: CharAnalysis[][];
  lineTemplates: LineTemplate[];
  cols: number; // characters per line (rows in the visual grid)
  onPick: (lineIdx: number, pos: number) => void;
  onRhymeClick: (rhyme: string) => void;
}

/** Vertical RTL grid via CSS grid: each poem line is a column placed
 *  right-to-left (line 1 in the rightmost column). Cells are positioned
 *  explicitly via gridColumn/gridRow so they never overlap on narrow screens. */
export function Grid({ chars, lineTemplates, cols, onPick, onRhymeClick }: Props) {
  const L = chars.length;          // number of poem lines = grid columns
  const M = cols;                  // chars per line = grid rows (after the label row)

  return (
    <div className="w-full px-2 sm:px-0 box-border overflow-hidden">
      <div
        className="mx-auto grid gap-1 sm:gap-2 w-full max-w-[42rem] box-border"
        style={{
          gridTemplateColumns: `repeat(${L}, minmax(0, 1fr))`,
          gridTemplateRows: `auto repeat(${M}, auto)`
        }}
      >
        {chars.map((row, li) => {
          const col = L - li; // li=0 → rightmost column
          return (
            <React.Fragment key={li}>
              <div
                className="text-[10px] sm:text-xs text-creamDim font-sans text-center"
                style={{ gridColumn: col, gridRow: 1 }}
              >
                第{li + 1}句{lineTemplates[li].rhymes ? "（韻）" : ""}
              </div>
              {row.map((c, i) => (
                <div
                  key={i}
                  style={{ gridColumn: col, gridRow: i + 2 }}
                  className="min-w-0"
                >
                  <CharCell
                    c={c}
                    isRhyme={lineTemplates[li].rhymes && i === row.length - 1}
                    onClickChar={() => onPick(li, i)}
                    onClickRhyme={onRhymeClick}
                  />
                </div>
              ))}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
