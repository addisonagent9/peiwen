// #17 Part 5 — Per-(char, rhyme) 文言/今義 lookup for the unique-char
// content corpus (11,727 entries across all 106 pingshui rhyme groups,
// built by scripts/build-unique-char-content.mjs in Parts 1-4).
//
// Sits as tier 3 in EditModal's lookup cascade and as the moedict-
// fallback tier in RhymeCharCard:
//   1. readingContentLookup(char, rhyme) — curriculum 151 chars
//   2. moedictLookup(char)                — general per-char
//   3. uniqueCharContentLookup(char, rhyme) — this module
//   4. (EditModal only) ancientMeaning runtime call — admin
//
// Per-(char, rhyme) keyed, with simp-form fallback mirroring
// readingContentLookup's behavior (callers that pass a trad form not
// in the index fall through to its simp form).

import { toSimplified } from "../analysis/s2t";

export interface UniqueCharEntry {
  char: string;
  rhyme: string;
  wenyan: string;
  modern: string;
  source: "zdic" | "llm-grounded";
  source_url: string;
  extracted_at: string;
  citation?: string;
}

type UniqueCharIndex = Record<string, Record<string, UniqueCharEntry>>;

let DATA: UniqueCharIndex | null = null;
let loadPromise: Promise<void> | null = null;

export function loadUniqueCharContent(): Promise<void> {
  if (DATA) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = fetch("./unique-char-content.json")
    .then(r => {
      if (!r.ok) throw new Error(`unique-char-content fetch ${r.status}`);
      return r.json();
    })
    .then((raw: UniqueCharEntry[]) => {
      const idx: UniqueCharIndex = {};
      for (const entry of raw) {
        if (!idx[entry.char]) idx[entry.char] = {};
        idx[entry.char][entry.rhyme] = entry;
      }
      DATA = idx;
    })
    .catch(e => { console.error("unique-char-content load failed:", e); DATA = {}; });
  return loadPromise;
}

export function isUniqueCharContentLoaded(): boolean {
  return DATA !== null;
}

export function uniqueCharContentLookup(char: string, rhyme: string): UniqueCharEntry | null {
  if (!DATA) return null;
  const direct = DATA[char]?.[rhyme];
  if (direct) return direct;
  const simp = toSimplified(char);
  if (simp !== char) return DATA[simp]?.[rhyme] ?? null;
  return null;
}
