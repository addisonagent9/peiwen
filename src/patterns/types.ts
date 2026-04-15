// Slot codes inside a line template.
// "P" = fixed 平, "Z" = fixed 仄
// "f" = ◎ fully free (⊕)
// "c" = ◉ constrained free (must avoid 孤平/三平尾 at line level)
export type Slot = "P" | "Z" | "f" | "c";

export type LineType = "A" | "B" | "C" | "D";
// A: 平平仄仄平平仄 (non-rhy, 平韻)   / rhy in 仄韻
// B: 仄仄平平仄仄平 (rhy in 平韻)      / non-rhy in 仄韻
// C: 仄仄平平平仄仄 (non-rhy in 平韻)  / rhy in 仄韻
// D: 平平仄仄仄平平 (rhy in 平韻)      / non-rhy in 仄韻

export type Tone = "平" | "仄"; // 入 collapses to 仄 for tonal validation

export interface LineTemplate {
  slots: Slot[];       // 5 or 7 entries
  rhymes: boolean;     // does this line rhyme?
}

export type FormId = "七絕" | "七律" | "五絕" | "五律";
export type RhymeKind = "平韻" | "仄韻";

export interface PoemPattern {
  form: FormId;
  kind: RhymeKind;
  name: string;        // e.g. "平起首句入韻"
  lines: LineTemplate[];
}
