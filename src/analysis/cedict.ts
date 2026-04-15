export interface CedictEntry {
  simplified: string;
  pinyin: string;
  definitions: string[];
}

let CEDICT: Record<string, CedictEntry> | null = null;
let BY_SIMPLIFIED: Record<string, string> | null = null;
let loadPromise: Promise<void> | null = null;

export function loadCedict(): Promise<void> {
  if (CEDICT) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = fetch("./cedict.json")
    .then(r => {
      if (!r.ok) throw new Error(`cedict fetch ${r.status}`);
      return r.json();
    })
    .then((data: Record<string, CedictEntry>) => {
      CEDICT = data;
      const m: Record<string, string> = {};
      for (const trad in data) {
        const simp = data[trad].simplified;
        if (simp && !(simp in m)) m[simp] = trad;
      }
      BY_SIMPLIFIED = m;
    });
  return loadPromise;
}

export function isCedictLoaded(): boolean {
  return CEDICT !== null;
}

export function cedictLookup(char: string): CedictEntry | null {
  if (!char || !CEDICT || !BY_SIMPLIFIED) return null;
  if (CEDICT[char]) return CEDICT[char];
  const trad = BY_SIMPLIFIED[char];
  if (trad) return CEDICT[trad];
  return null;
}

export function cedictContext(prev: string, char: string, next: string): { word: string; entry: CedictEntry } | null {
  const candidates: string[] = [];
  if (prev) candidates.push(prev + char);
  if (next) candidates.push(char + next);
  for (const w of candidates) {
    const e = cedictLookup(w);
    if (e) return { word: w, entry: e };
  }
  return null;
}
