import { PINGSHUI_CHAR, PINGSHUI_RHYME } from "../data/pingshui";
import { toTraditional } from "./s2t";

// 鄰韻 groups from §7.2 (孤雁出群格). Names use the canonical 平水韻 labels.
// Upper 平 = 上平, Lower 平 = 下平. All department names are prefixed with 上平/下平 in the CSV
// (verified: file has "一東" rhyme in pingshui_上平.csv — so the CSV rhyme field is "一東" without
// the 上/下 prefix). We'll key groups by the bare rhyme label since CSV entries are bare.
export const NEIGHBOR_GROUPS: string[][] = [
  ["一東", "二冬"],
  ["四支", "五微", "八齊"],
  ["六魚", "七虞"],
  ["九佳", "十灰"],
  ["十一真", "十二文", "十三元"],
  ["十四寒", "十五刪", "一先"],
  ["二蕭", "三肴", "四豪"],
  ["八庚", "九青", "十蒸"],
  ["十三覃", "十四鹽", "十五咸"]
];

const NEIGHBOR_INDEX = new Map<string, Set<string>>();
for (const grp of NEIGHBOR_GROUPS) {
  const s = new Set(grp);
  for (const r of grp) NEIGHBOR_INDEX.set(r, s);
}

export function charsInRhyme(rhyme: string): string[] {
  const bucket = PINGSHUI_RHYME[rhyme];
  if (!bucket || bucket.tone !== "平") return [];
  return bucket.chars;
}

export function areNeighbors(a: string, b: string): boolean {
  if (a === b) return true;
  const g = NEIGHBOR_INDEX.get(a);
  return !!g && g.has(b);
}

export interface CharRhymes {
  rhymes: string[]; // all rhyme labels this char appears in (any tone)
}
export function rhymesOf(char: string): string[] {
  let entries = PINGSHUI_CHAR[char] ?? [];
  if (entries.length === 0) {
    const trad = toTraditional(char);
    if (trad !== char) entries = PINGSHUI_CHAR[trad] ?? [];
  }
  return Array.from(new Set(entries.map(e => e.rhyme)));
}

export interface RhymeCheckResult {
  ok: boolean;
  baseRhyme: string | null;      // the rhyme department shared by end chars
  firstLineNeighbor: boolean;    // L1 used 孤雁出群格
  offending: { lineIdx: number; char: string; reason: string }[];
  duplicates: { lineIdx: number; char: string }[];  // 重韻
}

// Compare each rhyme-position cell's chosen reading against requiredRhyme.
// Line 1 gets 孤雁出群格 neighbor tolerance. 重韻 detection preserved.
export function checkRhymes(
  endChars: Array<{ char: string; chosenRhyme: string | null; lineIdx: number; isFirst: boolean }>,
  requiredRhyme: string | null,
): RhymeCheckResult {
  const offending: RhymeCheckResult["offending"] = [];
  const duplicates: RhymeCheckResult["duplicates"] = [];

  if (!requiredRhyme) {
    return { ok: true, baseRhyme: null, firstLineNeighbor: false, offending, duplicates };
  }

  let firstLineNeighbor = false;
  const seenChars = new Map<string, number>();
  for (const e of endChars) {
    if (e.chosenRhyme === requiredRhyme) {
      // passes
    } else if (e.isFirst && e.chosenRhyme && areNeighbors(e.chosenRhyme, requiredRhyme)) {
      firstLineNeighbor = true;
    } else {
      offending.push({
        lineIdx: e.lineIdx,
        char: e.char,
        reason: e.chosenRhyme
          ? `韻部 ${e.chosenRhyme}，與主韻 ${requiredRhyme} 不合`
          : `「${e.char}」無對應讀音`
      });
    }
    if (!e.isFirst) {
      if (seenChars.has(e.char)) duplicates.push({ lineIdx: e.lineIdx, char: e.char });
      seenChars.set(e.char, e.lineIdx);
    }
  }

  return { ok: offending.length === 0, baseRhyme: requiredRhyme, firstLineNeighbor, offending, duplicates };
}
