import { toTraditional } from "./s2t";

let MOEDICT: Record<string, string[]> | null = null;
let loadPromise: Promise<void> | null = null;

export function loadMoedict(): Promise<void> {
  if (MOEDICT) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = fetch("./moedict-map.json")
    .then(r => {
      if (!r.ok) throw new Error(`moedict fetch ${r.status}`);
      return r.json();
    })
    .then((data: Record<string, string[]>) => { MOEDICT = data; });
  return loadPromise;
}

export function isMoedictLoaded(): boolean {
  return MOEDICT !== null;
}

export function moedictLookup(char: string): string[] {
  if (!char || !MOEDICT) return [];
  const direct = MOEDICT[char];
  if (direct && direct.length) return direct.slice(0, 2);
  const trad = toTraditional(char);
  if (trad !== char) {
    const t = MOEDICT[trad];
    if (t && t.length) return t.slice(0, 2);
  }
  return [];
}
