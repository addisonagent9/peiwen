import { PINGSHUI_CHAR, type PSEntry } from "../data/pingshui";
import type { Tone } from "../patterns/types";
import { toTraditional } from "./s2t";

export interface ToneInfo {
  char: string;
  entries: PSEntry[];          // all (tone, rhyme) pairs — 多音字 may have >1
  chosen: PSEntry | null;      // preferred entry (see chooseTone)
  tone: Tone | null;           // "平" | "仄" (入 → 仄)
  isRu: boolean;               // 入聲 flag for UI (even though it validates as 仄)
  ambiguous: boolean;          // multi-tone 多音字
  unknown: boolean;            // not in data
}

export function lookup(char: string): ToneInfo {
  const trad = toTraditional(char);
  let entries = PINGSHUI_CHAR[char] ?? [];
  if (entries.length === 0 && trad !== char) {
    entries = PINGSHUI_CHAR[trad] ?? [];
  }
  if (entries.length === 0) {
    return { char, entries, chosen: null, tone: null, isRu: false, ambiguous: false, unknown: true };
  }
  return withChosen(char, entries, entries[0]);
}

function withChosen(char: string, entries: PSEntry[], chosen: PSEntry): ToneInfo {
  const chosenTone: Tone = chosen.tone === "平" ? "平" : "仄";
  return {
    char, entries, chosen,
    tone: chosenTone,
    isRu: chosen.tone === "入",
    ambiguous: entries.length > 1,
    unknown: false
  };
}

// Pick a preferred entry given a position's expected tone, so 多音字 snap to
// whichever reading makes the line legal. If no preference or no fit, keep first entry.
export function lookupExpecting(char: string, expected: Tone | null): ToneInfo {
  const base = lookup(char);
  if (base.unknown || !expected) return base;
  const fit = base.entries.find(e => (e.tone === "平" ? "平" : "仄") === expected);
  if (fit && fit !== base.chosen) return withChosen(char, base.entries, fit);
  return base;
}

export function toneOf(char: string): Tone | null {
  return lookup(char).tone;
}
