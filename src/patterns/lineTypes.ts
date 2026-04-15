import type { LineType, Slot, LineTemplate } from "./types";

// Seven-char line templates by (type, rhyming).
// Source of truth: /Users/addisonkang/pw/七绝格律模型.md §3 and §8.1.

// D-type, rhymes (ends 平):  ◎平◉仄仄平平
const D_R: Slot[] = ["f", "P", "c", "Z", "Z", "P", "P"];
// D-type, non-rhyming (仄韻 context, ends 平): same slots; the line appears as non-rhyme line inside 仄韻 poems.
const D_N = D_R;

// A-type, non-rhy (ends 仄): ◎平◉仄平平仄
const A_N: Slot[] = ["f", "P", "c", "Z", "P", "P", "Z"];
// A-type, rhymes (仄韻, ends 仄): same template.
const A_R = A_N;

// B-type, rhymes (ends 平): ◉仄平平◉仄平
const B_R: Slot[] = ["c", "Z", "P", "P", "c", "Z", "P"];
// B-type, non-rhy (仄韻, ends 平): same.
const B_N = B_R;

// C-type, non-rhy (ends 仄): ◉仄◎平平仄仄
const C_N: Slot[] = ["c", "Z", "f", "P", "P", "Z", "Z"];
// C-type, rhymes (仄韻, ends 仄): same.
const C_R = C_N;

export function lineTemplate7(t: LineType, rhymes: boolean): LineTemplate {
  const slots =
    t === "A" ? (rhymes ? A_R : A_N) :
    t === "B" ? (rhymes ? B_R : B_N) :
    t === "C" ? (rhymes ? C_R : C_N) :
    (rhymes ? D_R : D_N);
  return { slots: slots.slice(), rhymes };
}

// Five-char templates are the seven-char templates with first two slots dropped.
export function lineTemplate5(t: LineType, rhymes: boolean): LineTemplate {
  const full = lineTemplate7(t, rhymes);
  return { slots: full.slots.slice(2), rhymes };
}

// What tone does the base (unmarked) form of each line type require at a given position?
// Returns "平" | "仄" | null for free slots. This is only used to resolve ambiguous LineType
// detection — the authoritative data is still the LineTemplate.
export function baseTone(t: LineType, pos: number /* 1..7 */): "平" | "仄" {
  const base: Record<LineType, ("平"|"仄")[]> = {
    A: ["平","平","仄","仄","平","平","仄"],
    B: ["仄","仄","平","平","仄","仄","平"],
    C: ["仄","仄","平","平","平","仄","仄"],
    D: ["平","平","仄","仄","仄","平","平"]
  };
  return base[t][pos - 1];
}
