import { Converter } from "opencc-js";

const s2tConverter = Converter({ from: "cn", to: "tw" });
const t2sConverter = Converter({ from: "tw", to: "cn" });

export function toTraditional(char: string): string {
  if (!char) return char;
  return s2tConverter(char);
}

export function toSimplified(char: string): string {
  if (!char) return char;
  return t2sConverter(char);
}

/**
 * Whole-string conversion. Used by display surfaces (trainer, wenyan,
 * analyzer) to render content per the user's `prefersSimplified` preference.
 *
 * `prefersSimplified=true`  → tw → cn (traditional → simplified)
 * `prefersSimplified=false` → cn → tw (simplified → traditional, the default UX)
 *
 * Storage canon is mixed (pingshui.json is 繁, wenyan/poems.json is mostly 简);
 * opencc converts both directions cleanly so the toggle works regardless of source.
 */
export function convertString(s: string, prefersSimplified: boolean): string {
  if (!s) return s;
  return prefersSimplified ? t2sConverter(s) : s2tConverter(s);
}

/**
 * Analyzer pre-pingshui-lookup helper. Always returns the traditional form
 * regardless of user preference — pingshui.json is keyed on traditional chars,
 * so simp input must be normalized for lookup.
 *
 * Note: `rhymesOf()` in src/analysis/rhyme.ts already does a fallback s2t
 * inline. This helper is for clarity / potential future call sites.
 */
export function s2tForLookup(s: string): string {
  if (!s) return s;
  return s2tConverter(s);
}
