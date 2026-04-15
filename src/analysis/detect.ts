import { ALL_PATTERNS, patternsForForm } from "../patterns/patterns";
import type { FormId, PoemPattern, RhymeKind } from "../patterns/types";
import { analyzeAgainst, type PatternMatchResult } from "./validate";

export interface DetectOptions {
  form?: FormId;
  kind?: RhymeKind;
  allowZeYun?: boolean; // whether to include 仄韻 candidates
}

export function detectBest(lines: string[][], opts: DetectOptions = {}): {
  best: PatternMatchResult;
  ranked: PatternMatchResult[];
} {
  const L = lines.length;
  const N = lines[0]?.length ?? 0;
  const filterByDims = (pool: PoemPattern[]) => pool.filter(p => {
    if (p.lines.length !== L) return false;
    if (p.lines[0].slots.length !== N) return false;
    if (!opts.allowZeYun && p.kind === "仄韻") return false;
    return true;
  });
  let candidates = filterByDims(opts.form
    ? patternsForForm(opts.form, opts.kind ?? "平韻")
    : ALL_PATTERNS);
  // If a user-forced form doesn't match the poem dimensions, retry across all
  // patterns so scoring reflects the poem's actual shape rather than falling
  // back to a wrongly-shaped template.
  if (!candidates.length && opts.form) {
    candidates = filterByDims(ALL_PATTERNS);
  }
  if (!candidates.length) {
    // No structural match even across all patterns: still run against first
    // available pattern for display.
    const fallback = (opts.form ? patternsForForm(opts.form, opts.kind ?? "平韻") : ALL_PATTERNS)[0];
    const r = analyzeAgainst(lines, fallback);
    return { best: r, ranked: [r] };
  }
  const ranked = candidates
    .map(p => analyzeAgainst(lines, p))
    .sort((a, b) => b.combined - a.combined);
  return { best: ranked[0], ranked };
}

export function formFromDims(L: number, N: number): FormId | null {
  if (L === 4 && N === 7) return "七絕";
  if (L === 8 && N === 7) return "七律";
  if (L === 4 && N === 5) return "五絕";
  if (L === 8 && N === 5) return "五律";
  return null;
}
