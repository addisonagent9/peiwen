/**
 * Normalize poem text for slot assignment (#20).
 *
 * - Splits on Chinese/western comma (，,), full stop (。.), and newlines
 *   (\n / \r) — each starts a new line in the output.
 * - Strips all other punctuation silently within each line:
 *   Chinese: 、；：「」『』（）【】〔〕｛｝〈〉《》！？·…— curly-quote variants
 *   ASCII:   ()[]{};:!?"'-–—…
 * - Strips ASCII whitespace (\s) and full-width spaces (　) from line content.
 * - Filters out empty lines (handles trailing/adjacent punctuation cleanly).
 *
 * Returns an array of strings; each is one line of chars only (no punctuation,
 * no whitespace).
 *
 * Note: the private-use char  (used by App.tsx's updateChar as an
 * empty-slot placeholder mid-line) is NOT stripped here — it's in the
 * Unicode Private Use Area, outside any of the strip ranges. Callers can
 * Array.from + map to handle it after this function returns.
 */
export function normalizePoemInput(rawText: string): string[] {
  // Step 1: split on comma / period / newline. Both Chinese and ASCII forms
  // of comma and period start a new line.
  const lines = rawText.split(/[，,。.\n\r]+/);

  // Step 2: strip remaining punctuation + whitespace from each line. Anything
  // not in this class survives: CJK chars, alphanumerics,  placeholder.
  const stripPunctRe =
    /[、；：「」『』（）【】〔〕｛｝〈〉《》！？·…—“”‘’()[\]{};:!?"'\-–—…\s　]/g;
  const cleaned = lines
    .map(line => line.replace(stripPunctRe, ''))
    .filter(line => line.length > 0);

  return cleaned;
}
