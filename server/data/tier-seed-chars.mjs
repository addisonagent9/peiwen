/**
 * Tier seed characters — multi-tier seed pool for drill queue generation.
 *
 * Source of truth: src/data/pingshui/trainer-curriculum.ts. Parsed once
 * at module load via the same regex shape used by scripts/check-curriculum.mjs.
 * Avoids divergence between server data and curriculum data, and removes
 * the need for hand-curated parallel mirrors per tier.
 *
 * Replaces the legacy server/data/tier1-seed-chars.mjs (Tier 1 only). Old
 * named exports `TIER1_SEED_CHARS` and `TIER1_RHYME_IDS` are preserved for
 * backwards compat.
 *
 * Schema (matches legacy TIER1_SEED_CHARS shape):
 *   { char, rhymeId, pinyin, jyutping, set }
 *
 * Bare-string seedCharacters in the curriculum (legacy entries that haven't
 * been upgraded to object form) get `pinyin: ''`, `jyutping: ''`, `set: 1`
 * synthesized — they're not common since Tier 1/2/3 batches all expanded to
 * object form, but the parser tolerates them.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CURRICULUM_PATH = path.resolve(
  __dirname,
  '../../src/data/pingshui/trainer-curriculum.ts',
);

function loadCurriculumText() {
  return fs.readFileSync(CURRICULUM_PATH, 'utf8');
}

// Same regex shape as scripts/check-curriculum.mjs — kept in sync intentionally.
const RHYME_BLOCK_RE =
  /\{\s*id:\s*'([^']+)',\s*ordinal:\s*\d+,\s*label:\s*'([^']+)',[\s\S]*?tier:\s*(\d+),[\s\S]*?seedCharacters:\s*(\[[\s\S]*?\])(?:\s*,\s*(?:mnemonic|foundation|anchorPoem))/g;

// Object-form entry: { char: '…', pinyin: '…', jyutping: '…', set: N }
// Captured in the order they appear in source.
const OBJ_ENTRY_RE =
  /\{\s*char:\s*'([^']+)',\s*pinyin:\s*'([^']*)',\s*jyutping:\s*'([^']*)',\s*set:\s*(\d+)(?:,\s*showMandarinAudio:\s*true)?\s*\}/g;

// Bare-string fallback: '…' inside the seedCharacters array.
const BARE_STR_RE = /'([^']+)'/g;

function parseSeedEntries(seedRaw, rhymeId) {
  const out = [];
  let m;
  OBJ_ENTRY_RE.lastIndex = 0;
  while ((m = OBJ_ENTRY_RE.exec(seedRaw)) !== null) {
    const [, char, pinyin, jyutping, set] = m;
    out.push({ char, rhymeId, pinyin, jyutping, set: Number(set) });
  }
  if (out.length === 0) {
    BARE_STR_RE.lastIndex = 0;
    while ((m = BARE_STR_RE.exec(seedRaw)) !== null) {
      out.push({ char: m[1], rhymeId, pinyin: '', jyutping: '', set: 1 });
    }
  }
  return out;
}

function buildTierSeedChars() {
  const src = loadCurriculumText();
  const tierMap = { 1: [], 2: [], 3: [] };
  const tierRhymeIds = { 1: [], 2: [], 3: [] };
  let m;
  RHYME_BLOCK_RE.lastIndex = 0;
  while ((m = RHYME_BLOCK_RE.exec(src)) !== null) {
    const [, id, , tierStr, seedRaw] = m;
    const tier = Number(tierStr);
    if (!tierMap[tier]) continue;
    const entries = parseSeedEntries(seedRaw, id);
    tierMap[tier].push(...entries);
    if (!tierRhymeIds[tier].includes(id)) tierRhymeIds[tier].push(id);
  }
  return { tierMap, tierRhymeIds };
}

const { tierMap, tierRhymeIds } = buildTierSeedChars();

/** Per-tier seed-char pool. Each entry: { char, rhymeId, pinyin, jyutping, set }. */
export const TIER_SEED_CHARS = tierMap;

/** Per-tier rhyme-id list (insertion order from curriculum). */
export const TIER_RHYME_IDS = tierRhymeIds;

/** Legacy alias — Tier 1 pool. */
export const TIER1_SEED_CHARS = tierMap[1];

/** Legacy alias — Tier 1 rhyme-id list. */
export const TIER1_RHYME_IDS = tierRhymeIds[1];

const VALID_SCOPES = new Set(['tier1', 'tier2', 'tier3', 'all']);

/** True iff `scope` is a recognized scope value. */
export function isValidScope(scope) {
  return typeof scope === 'string' && VALID_SCOPES.has(scope);
}

/** Tier number (1|2|3) for `tierN` scope, or null for `all` / invalid. */
export function tierFromScope(scope) {
  if (scope === 'all' || !isValidScope(scope)) return null;
  return Number(scope.replace('tier', ''));
}

/** Seed-char pool for a scope. `'all'` returns union of all tiers. */
export function getSeedPool(scope) {
  if (scope === 'all') return [...tierMap[1], ...tierMap[2], ...tierMap[3]];
  const tier = tierFromScope(scope);
  return tier ? tierMap[tier] : tierMap[1];
}

/** Rhyme-id list for a scope. `'all'` returns union of all tiers. */
export function getRhymeIds(scope) {
  if (scope === 'all') {
    return [...tierRhymeIds[1], ...tierRhymeIds[2], ...tierRhymeIds[3]];
  }
  const tier = tierFromScope(scope);
  return tier ? tierRhymeIds[tier] : tierRhymeIds[1];
}
