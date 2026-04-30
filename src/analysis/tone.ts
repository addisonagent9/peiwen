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
  pinned?: boolean;            // true when chosen was set by user pin
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

// Resolution hierarchy: pin > auto-rhyme-match > first-tone-match.
// Pin searches ALL entries (user can declare a tone violation by pinning
// a reading whose tone doesn't match the slot). Falls back to auto-rhyme-match
// if pin doesn't match any reading (invalid/stale pin).
export function lookupExpecting(
  char: string,
  expected: Tone | null,
  requiredRhyme?: string | null,
  isRhymePosition?: boolean,
  pin?: { tone: string; rhyme: string } | null,
): ToneInfo {
  const base = lookup(char);
  if (base.unknown || !expected) return base;

  if (pin) {
    const pinMatch = base.entries.find(e => e.tone === pin.tone && e.rhyme === pin.rhyme);
    if (pinMatch) return { ...withChosen(char, base.entries, pinMatch), pinned: true };
  }

  const toneMatching = base.entries.filter(e => (e.tone === "平" ? "平" : "仄") === expected);
  if (toneMatching.length === 0) return base;
  if (isRhymePosition && requiredRhyme && toneMatching.length > 1) {
    const rhymeMatch = toneMatching.find(e => e.rhyme === requiredRhyme);
    if (rhymeMatch) return withChosen(char, base.entries, rhymeMatch);
  }
  const fit = toneMatching[0];
  if (fit !== base.chosen) return withChosen(char, base.entries, fit);
  return base;
}

export function computeRequiredRhyme(lines: string[][]): string | null {
  if (lines.length < 2) return null;
  const line2 = lines[1];
  if (!line2 || line2.length === 0) return null;
  const line2Last = line2[line2.length - 1];
  if (!line2Last) return null;
  const line2Readings = lookup(line2Last).entries.filter(e => e.tone === '平');
  if (line2Readings.length === 0) return null;
  if (line2Readings.length === 1) return line2Readings[0].rhyme;
  const distinctRhymes = new Set(line2Readings.map(e => e.rhyme));
  if (distinctRhymes.size === 1) return line2Readings[0].rhyme;
  const line1 = lines[0];
  if (line1 && line1.length > 0) {
    const line1Last = line1[line1.length - 1];
    if (line1Last) {
      const line1PingRhymes = new Set(
        lookup(line1Last).entries.filter(e => e.tone === '平').map(e => e.rhyme)
      );
      for (const lr of line2Readings) {
        if (line1PingRhymes.has(lr.rhyme)) return lr.rhyme;
      }
    }
  }
  return line2Readings[0].rhyme;
}

export function toneOf(char: string): Tone | null {
  return lookup(char).tone;
}
