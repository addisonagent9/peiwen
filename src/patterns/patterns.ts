import type { FormId, PoemPattern, RhymeKind, LineType } from "./types";
import { lineTemplate5, lineTemplate7 } from "./lineTypes";

// Sequence helper: given a list of (LineType, rhymes) pairs, build templates.
function buildLines(
  charsPerLine: 5 | 7,
  seq: Array<[LineType, boolean]>
) {
  const fn = charsPerLine === 7 ? lineTemplate7 : lineTemplate5;
  return seq.map(([t, r]) => fn(t, r));
}

// 七絕 平韻 — spec §3.
// 1. 首句平起入韻 (D B C D, L1/L2/L4 rhyme)
// 2. 首句平起不入韻 (A B C D, L2/L4)
// 3. 首句仄起入韻 (B D A B, L1/L2/L4)
// 4. 首句仄起不入韻 (C D A B, L2/L4)
const QIJUE_P: PoemPattern[] = [
  { form: "七絕", kind: "平韻", name: "平起首句入韻",
    lines: buildLines(7, [["D",true],["B",true],["C",false],["D",true]]) },
  { form: "七絕", kind: "平韻", name: "平起首句不入韻",
    lines: buildLines(7, [["A",false],["B",true],["C",false],["D",true]]) },
  { form: "七絕", kind: "平韻", name: "仄起首句入韻",
    lines: buildLines(7, [["B",true],["D",true],["A",false],["B",true]]) },
  { form: "七絕", kind: "平韻", name: "仄起首句不入韻",
    lines: buildLines(7, [["C",false],["D",true],["A",false],["B",true]]) }
];

// 七絕 仄韻 — spec §8.1. (Rhyming lines end 仄.)
// 1. 平起入韻: A C B A (L1/L2/L4)
// 2. 平起不入韻: D C B A (L2/L4)
// 3. 仄起入韻: C A D C (L1/L2/L4)
// 4. 仄起不入韻: B A D C (L2/L4)
const QIJUE_Z: PoemPattern[] = [
  { form: "七絕", kind: "仄韻", name: "平起首句入韻",
    lines: buildLines(7, [["A",true],["C",true],["B",false],["A",true]]) },
  { form: "七絕", kind: "仄韻", name: "平起首句不入韻",
    lines: buildLines(7, [["D",false],["C",true],["B",false],["A",true]]) },
  { form: "七絕", kind: "仄韻", name: "仄起首句入韻",
    lines: buildLines(7, [["C",true],["A",true],["D",false],["C",true]]) },
  { form: "七絕", kind: "仄韻", name: "仄起首句不入韻",
    lines: buildLines(7, [["B",false],["A",true],["D",false],["C",true]]) }
];

// 七律 平韻: extend each 七絕 pattern to 8 lines by continuing the 粘/對 cycle.
// Rule: Ln+4 has the same LineType sequence pattern continuing:
//  after D B C D: next is A B C D (L5 粘 L4=D → same 2/4/6 = 平仄平, odd line non-rhy → A)
//  after A B C D: next is A B C D
//  after B D A B: next is C D A B
//  after C D A B: next is C D A B
function extendToEight(seq: Array<[LineType, boolean]>): Array<[LineType, boolean]> {
  // L5 粘 L4: same 2/4/6. L4 type is seq[3][0].
  // Non-rhyme (odd). Determine L5 type by pairing: {A,D} share 2/4/6; {B,C} share 2/4/6.
  const pair: Record<LineType, { sameAC: LineType; rhy: LineType; nonRhy: LineType }> = {
    A: { sameAC: "D", rhy: "D", nonRhy: "A" },
    D: { sameAC: "A", rhy: "D", nonRhy: "A" },
    B: { sameAC: "C", rhy: "B", nonRhy: "C" },
    C: { sameAC: "B", rhy: "B", nonRhy: "C" }
  };
  const opp: Record<LineType, { rhy: LineType; nonRhy: LineType }> = {
    A: { rhy: "B", nonRhy: "C" },
    D: { rhy: "B", nonRhy: "C" },
    B: { rhy: "D", nonRhy: "A" },
    C: { rhy: "D", nonRhy: "A" }
  };
  const l4 = seq[3][0];
  const l5: LineType = pair[l4].nonRhy;           // 粘 L4, odd non-rhyme
  const l6: LineType = opp[l5].rhy;               // 對 L5, even rhymes
  const l7: LineType = pair[l6].nonRhy;           // 粘 L6, odd non-rhyme
  const l8: LineType = opp[l7].rhy;               // 對 L7, even rhymes
  return [...seq, [l5, false], [l6, true], [l7, false], [l8, true]];
}

function qilu(name: string, seq: Array<[LineType, boolean]>): PoemPattern {
  return { form: "七律", kind: "平韻", name, lines: buildLines(7, extendToEight(seq)) };
}
const QILU_P: PoemPattern[] = [
  qilu("平起首句入韻",   [["D",true],["B",true],["C",false],["D",true]]),
  qilu("平起首句不入韻", [["A",false],["B",true],["C",false],["D",true]]),
  qilu("仄起首句入韻",   [["B",true],["D",true],["A",false],["B",true]]),
  qilu("仄起首句不入韻", [["C",false],["D",true],["A",false],["B",true]])
];

// 五絕 平韻: drop first 2 chars of each 七絕 平韻 line.
function wujueFromSeq(name: string, seq: Array<[LineType, boolean]>): PoemPattern {
  return { form: "五絕", kind: "平韻", name, lines: buildLines(5, seq) };
}
// In 五言 convention the "起式" names flip because dropping 2 chars flips pos 1↔3 effectively.
// But for simplicity we keep the same starting-type taxonomy tied to the underlying LineType.
const WUJUE_P: PoemPattern[] = [
  wujueFromSeq("仄起首句入韻",   [["D",true],["B",true],["C",false],["D",true]]),   // 五絕 L1 starts 仄 (D's pos3=仄)
  wujueFromSeq("仄起首句不入韻", [["A",false],["B",true],["C",false],["D",true]]),
  wujueFromSeq("平起首句入韻",   [["B",true],["D",true],["A",false],["B",true]]),
  wujueFromSeq("平起首句不入韻", [["C",false],["D",true],["A",false],["B",true]])
];

function wulu(name: string, seq: Array<[LineType, boolean]>): PoemPattern {
  return { form: "五律", kind: "平韻", name, lines: buildLines(5, extendToEight(seq)) };
}
const WULU_P: PoemPattern[] = [
  wulu("仄起首句入韻",   [["D",true],["B",true],["C",false],["D",true]]),
  wulu("仄起首句不入韻", [["A",false],["B",true],["C",false],["D",true]]),
  wulu("平起首句入韻",   [["B",true],["D",true],["A",false],["B",true]]),
  wulu("平起首句不入韻", [["C",false],["D",true],["A",false],["B",true]])
];

export const ALL_PATTERNS: PoemPattern[] = [
  ...QIJUE_P, ...QIJUE_Z, ...QILU_P, ...WUJUE_P, ...WULU_P
];

export function patternsForForm(form: FormId, kind: RhymeKind = "平韻"): PoemPattern[] {
  return ALL_PATTERNS.filter(p => p.form === form && p.kind === kind);
}
