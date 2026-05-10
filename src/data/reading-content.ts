// #16 Part 2C — Per-reading content lookup for the rhyme reference card.
//
// Lazy-fetches src/data/reading-content.json (built by
// scripts/build-reading-content.mjs) and exposes a per-(char, rhyme)
// lookup. Curriculum-scoped: only the 151 multi-tone curriculum chars
// have entries; consumers fall back to moedictLookup + cedictCompounds
// for everything else.

export interface ReadingCompound {
  word: string;
  pinyin: string;       // tone-mark NFC, full compound ("zhōng gǔ")
  gloss: string;
}

export interface ReadingEntry {
  tone: "平" | "仄" | "入";
  pinyin: string;       // tone-mark NFC ("zhōng")
  bopomofo?: string;
  definitions: string[];
  compounds: ReadingCompound[];
  redirect_from?: string;
  merged_tone?: true;
}

type ReadingContent = Record<string, Record<string, ReadingEntry>>;

let DATA: ReadingContent | null = null;
let loadPromise: Promise<void> | null = null;

export function loadReadingContent(): Promise<void> {
  if (DATA) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = fetch("./reading-content.json")
    .then(r => {
      if (!r.ok) throw new Error(`reading-content fetch ${r.status}`);
      return r.json();
    })
    .then((j: ReadingContent) => { DATA = j; })
    .catch(e => { console.error("reading-content load failed:", e); DATA = {}; });
  return loadPromise;
}

export function isReadingContentLoaded(): boolean {
  return DATA !== null;
}

export function readingContentLookup(char: string, rhyme: string): ReadingEntry | null {
  if (!DATA) return null;
  return DATA[char]?.[rhyme] ?? null;
}
