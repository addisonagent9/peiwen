import React from "react";
import type { CharAnalysis } from "../analysis/validate";
import type { LineTemplate } from "../patterns/types";
import type { Locale, Translations } from "../i18n";
import { AMBIGUOUS_READINGS } from "../data/ambiguous-readings";
import { CharCell } from "./CharCell";

interface Props {
  chars: CharAnalysis[][];
  lineTemplates: LineTemplate[];
  cols: number;
  offendingLines?: Set<number>;
  locale: Locale;
  t: Translations;
  onPick: (lineIdx: number, pos: number) => void;
  onRhymeClick: (rhyme: string) => void;
}

export function Grid({ chars, lineTemplates, cols, offendingLines, locale, t, onPick, onRhymeClick }: Props) {
  const L = chars.length;
  const M = cols;

  return (
    <div
      className="w-full px-2 sm:px-0 overflow-x-auto"
      style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
    >
      <div
        className="grid gap-1 sm:gap-2 mx-auto box-border"
        style={{
          gridTemplateColumns: `repeat(${L}, minmax(3rem, 5rem))`,
          gridTemplateRows: `auto repeat(${M}, auto)`,
          width: "max-content"
        }}
      >
        {chars.map((row, li) => {
          const col = L - li;
          return (
            <React.Fragment key={li}>
              <div
                className="text-[10px] sm:text-xs text-creamDim font-sans text-center"
                style={{ gridColumn: col, gridRow: 1 }}
              >
                {lineTemplates[li].rhymes ? t.rhymeLabel(li + 1) : t.lineLabel(li + 1)}
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
                    isRhymeMismatch={!!(lineTemplates[li].rhymes && i === row.length - 1 && offendingLines?.has(li))}
                    ambiguousNote={c.char && AMBIGUOUS_READINGS[c.char]
                      ? (locale === "繁" ? AMBIGUOUS_READINGS[c.char].note_zh_tw : AMBIGUOUS_READINGS[c.char].note_zh_cn)
                      : undefined}
                    ambiguousReadingNotes={c.char && AMBIGUOUS_READINGS[c.char]?.per_reading_notes
                      ? AMBIGUOUS_READINGS[c.char].per_reading_notes!.map(rn => ({
                          rhyme: rn.rhyme,
                          status: rn.status,
                          note: locale === "繁" ? rn.note_zh_tw : rn.note_zh_cn
                        }))
                      : undefined}
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
