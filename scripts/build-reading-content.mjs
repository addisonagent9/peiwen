// #16 Part 2B — Per-reading content builder for the 151 multi-tone curriculum chars.
//
// Reads pingshui.json (post-patch), moedict.json (upstream w/ full heteronyms),
// cedict_ts.u8, and curriculum sources. Emits src/data/reading-content.json
// keyed by (char, rhyme) → ReadingEntry per #16 Part 2A schema.
//
// Resolution chain (#16 Part 1C): direct → yiti regex → opencc cn-to-tw.
// Heteronym matching (#16 Part 2A.5): tone filter + empirical rhyme-final
// heuristic + codepoint tie-break; Rule Z for 入 readings (claim-then-fallback).
// Type A merged-tone case (single het, multiple pingshui readings) flagged.
//
// Pinyin canonical: tone-mark NFC. CEDICT tone-number → tone-mark via pinyin-pro.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pinyin, convert } from 'pinyin-pro';
import { Converter } from 'opencc-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PINGSHUI_PATH = path.resolve(ROOT, 'src/data/pingshui.json');
const MOEDICT_PATH  = path.resolve(ROOT, 'src/data/moedict.json');
const CEDICT_PATH   = path.resolve(ROOT, 'src/data/cedict_ts.u8');
const OUT_PATH      = path.resolve(ROOT, 'src/data/reading-content.json');

const s2t = Converter({ from: 'cn', to: 'tw' });

// ── Load inputs ────────────────────────────────────────────────────────────
console.log('reading pingshui.json...');
const pingshui = JSON.parse(fs.readFileSync(PINGSHUI_PATH, 'utf8'));

console.log('reading moedict.json (~142 MB)...');
const moedictRaw = JSON.parse(fs.readFileSync(MOEDICT_PATH, 'utf8'));
const moeMap = new Map();
for (const e of moedictRaw) if (e.title) moeMap.set(e.title, e);
console.log(`  ${moeMap.size} MOE titles indexed`);

console.log('reading cedict_ts.u8...');
const cedictRaw = fs.readFileSync(CEDICT_PATH, 'utf8').replace(/\r/g, '');

const curriculum = await import(path.resolve(ROOT, 'server/data/tier-seed-chars.mjs'));
const curriculumChars = new Set();
for (const tier of [1, 2, 3]) {
  for (const sc of curriculum.TIER_SEED_CHARS[tier]) curriculumChars.add(sc.char);
}
console.log(`  ${curriculumChars.size} curriculum chars`);

// ── Identify the 151 multi-tone-and-rhyme curriculum chars ─────────────────
const isMultiToneAndRhyme = (entries) => {
  if (!entries || entries.length < 2) return false;
  const tones  = new Set(entries.map(e => (e.tone === '入' ? '仄' : e.tone)));
  const rhymes = new Set(entries.map(e => e.rhyme));
  return tones.size >= 2 && rhymes.size >= 2;
};

const targetChars = [...curriculumChars]
  .filter(c => isMultiToneAndRhyme(pingshui.chars[c]))
  .sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
console.log(`multi-tone curriculum chars: ${targetChars.length}`);

// ── Pinyin tone-mark helpers ──────────────────────────────────────────────
const TONE_MARKS = new Map();
for (const [n, marks] of [
  [1, 'āēīōūǖ'],
  [2, 'áéíóúǘ'],
  [3, 'ǎěǐǒǔǚ'],
  [4, 'àèìòùǜ'],
]) for (const ch of marks) TONE_MARKS.set(ch, n);

const VOWEL_BASE = new Map([
  ['ā','a'],['á','a'],['ǎ','a'],['à','a'],
  ['ē','e'],['é','e'],['ě','e'],['è','e'],
  ['ī','i'],['í','i'],['ǐ','i'],['ì','i'],
  ['ō','o'],['ó','o'],['ǒ','o'],['ò','o'],
  ['ū','u'],['ú','u'],['ǔ','u'],['ù','u'],
  ['ǖ','ü'],['ǘ','ü'],['ǚ','ü'],['ǜ','ü'],
]);

const toneOf = (py) => {
  for (const ch of py) {
    const t = TONE_MARKS.get(ch);
    if (t) return t;
  }
  return 5;
};

const stripTone = (py) => {
  let out = '';
  for (const ch of py) out += VOWEL_BASE.get(ch) ?? ch;
  return out;
};

const INITIALS = ['zh','ch','sh','b','p','m','f','d','t','n','l','g','k','h','j','q','x','r','z','c','s','y','w'];
const finalOf = (py) => {
  const s = stripTone(py.toLowerCase());
  for (const i of INITIALS) if (s.startsWith(i)) return s.slice(i.length);
  return s;
};

// ── Empirical rhyme → expected finals map (single-reading chars only) ─────
console.log('building rhyme→finals map empirically...');
const rhymeFinalsMap = new Map();
for (const [rhymeName, bucket] of Object.entries(pingshui.rhymes)) {
  const counts = new Map();
  for (const c of bucket.chars) {
    const psEntries = pingshui.chars[c];
    if (!psEntries || psEntries.length !== 1) continue; // unambiguous chars only
    try {
      const py = pinyin(c, { toneType: 'symbol', type: 'string', multiple: false }).split(' ')[0];
      if (!py) continue;
      const f = finalOf(py);
      counts.set(f, (counts.get(f) ?? 0) + 1);
    } catch { /* skip */ }
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  rhymeFinalsMap.set(rhymeName, new Set(sorted.slice(0, 5).map(([f]) => f)));
}

// ── Heteronym helpers ─────────────────────────────────────────────────────
const hasUsableHet = (entry) =>
  (entry?.heteronyms ?? []).some(h => (h.pinyin || h.bopomofo) && (h.definitions || []).length > 0);

const usableHeteronyms = (entry) => {
  const hets = (entry.heteronyms ?? []).filter(h =>
    (h.pinyin || h.bopomofo) && (h.definitions || []).length > 0
  );
  // Dedup by (pinyin, first-def signature) — upstream MOE often duplicates each heteronym
  const seen = new Set();
  const out = [];
  for (const h of hets) {
    const sig = `${h.pinyin ?? '?'}::${(h.definitions[0]?.def ?? '').slice(0, 30)}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push(h);
  }
  return out;
};

// ── Resolve target glyph: direct → yiti regex → opencc ────────────────────
const resolveTarget = (char) => {
  let entry = moeMap.get(char);
  if (entry && hasUsableHet(entry)) return { target: char, entry };

  if (entry) {
    for (const h of entry.heteronyms ?? []) {
      for (const d of h.definitions ?? []) {
        const m = (d.def || '').match(/「([一-鿿])」的異體字/);
        if (m && moeMap.has(m[1])) {
          const tEntry = moeMap.get(m[1]);
          if (hasUsableHet(tEntry)) return { target: m[1], entry: tEntry };
        }
      }
    }
  }

  const trad = s2t(char);
  if (trad !== char && moeMap.has(trad)) {
    const tEntry = moeMap.get(trad);
    if (hasUsableHet(tEntry)) return { target: trad, entry: tEntry };
  }

  throw new Error(`unresolvable target for char: ${char}`);
};

// ── Heteronym matching per pingshui reading ───────────────────────────────
const matchHeteronym = (psr, hets, claimedHets, ps仄Pinyin) => {
  const tone = psr.tone;
  const expectedFinals = rhymeFinalsMap.get(psr.rhyme) ?? new Set();

  if (tone === '入') {
    const unclaimed = hets.filter(h => !claimedHets.has(h.pinyin));
    if (unclaimed.length > 0) {
      const pref = [3, 4, 2, 1, 5];
      const sorted = [...unclaimed].sort((a, b) => {
        const pa = pref.indexOf(toneOf(a.pinyin));
        const pb = pref.indexOf(toneOf(b.pinyin));
        if (pa !== pb) return pa - pb;
        return a.pinyin.localeCompare(b.pinyin);
      });
      return { het: sorted[0], mergedTone: false };
    }
    if (ps仄Pinyin) {
      const reuse = hets.find(h => h.pinyin === ps仄Pinyin);
      if (reuse) return { het: reuse, mergedTone: true };
    }
    const sorted = [...hets].sort((a, b) => a.pinyin.localeCompare(b.pinyin));
    return { het: sorted[0], mergedTone: true };
  }

  // 平 or 仄
  const targetTones = tone === '平' ? [1, 2] : [3, 4];
  let candidates = hets.filter(h => targetTones.includes(toneOf(h.pinyin)));
  if (candidates.length === 0) {
    const sorted = [...hets].sort((a, b) => a.pinyin.localeCompare(b.pinyin));
    return { het: sorted[0], mergedTone: true };
  }
  if (candidates.length === 1) return { het: candidates[0], mergedTone: false };

  const finalMatched = candidates.filter(h => expectedFinals.has(finalOf(h.pinyin)));
  let pool = finalMatched.length > 0 ? finalMatched : candidates;

  const unclaimedPool = pool.filter(h => !claimedHets.has(h.pinyin));
  if (unclaimedPool.length > 0) pool = unclaimedPool;

  pool = [...pool].sort((a, b) => a.pinyin.localeCompare(b.pinyin));
  return { het: pool[0], mergedTone: false };
};

// ── CEDICT compound index (2-char compounds, both trad and simp keys) ────
console.log('indexing CEDICT 2-char compounds...');
const lineRe = /^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/$/;
const cedictByChar = new Map();
let cedictTotal = 0;
for (const line of cedictRaw.split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const m = line.match(lineRe);
  if (!m) continue;
  const [, trad, simp, pyRaw, glossRaw] = m;
  const tradChars = Array.from(trad);
  if (tradChars.length !== 2) continue;
  const pyClean = pyRaw.replace(/u:/g, 'ü').replace(/([a-zü])5/g, '$1').toLowerCase();
  const pyMark = convert(pyClean).normalize('NFC');
  const gloss = glossRaw.split('/')[0];
  const entry = { trad, simp, pyParts: pyMark.split(/\s+/), gloss, idx: cedictTotal };
  for (const c of new Set([...tradChars, ...Array.from(simp)])) {
    if (!cedictByChar.has(c)) cedictByChar.set(c, []);
    cedictByChar.get(c).push(entry);
  }
  cedictTotal++;
}
console.log(`  ${cedictTotal} 2-char CEDICT compounds indexed`);

const getCompounds = (char, target, hetPinyin) => {
  const candidates = cedictByChar.get(char) ?? cedictByChar.get(target) ?? [];
  const targetPy = hetPinyin.normalize('NFC');
  const out = [];
  for (const e of candidates) {
    const tradChars = Array.from(e.trad);
    const simpChars = Array.from(e.simp);
    let pos = tradChars.indexOf(char);
    if (pos < 0) pos = simpChars.indexOf(char);
    if (pos < 0) pos = tradChars.indexOf(target);
    if (pos < 0) pos = simpChars.indexOf(target);
    if (pos < 0) continue;
    const charPy = e.pyParts[pos];
    if (!charPy) continue;
    if (charPy.normalize('NFC') !== targetPy) continue;
    out.push({
      word: e.trad,
      pinyin: e.pyParts.join(' ').normalize('NFC'),
      gloss: e.gloss,
    });
    if (out.length >= 5) break;
  }
  return out;
};

const extractDefStrings = (het) =>
  (het.definitions ?? [])
    .map(d => {
      const primary = d.def || d.definition || '';
      if (primary) return primary;
      // Some MOE heteronyms carry only a `link` cross-reference (e.g. {"def":"","link":["同「仨」。"]}).
      // Surface the link text as the gloss so the consumer never sees an empty defs array.
      const link = d.link;
      if (Array.isArray(link)) return link.join('');
      if (typeof link === 'string') return link;
      return '';
    })
    .filter(Boolean);

// ── Main loop ──────────────────────────────────────────────────────────────
console.log('building per-(char, rhyme) entries...');
const out = {};
const tonePri = (t) => (t === '平' ? 0 : t === '仄' ? 1 : 2);

for (const char of targetChars) {
  const psReadings = (pingshui.chars[char] ?? []).slice();
  const { target, entry } = resolveTarget(char);
  const hets = usableHeteronyms(entry);

  psReadings.sort((a, b) => {
    if (tonePri(a.tone) !== tonePri(b.tone)) return tonePri(a.tone) - tonePri(b.tone);
    return a.rhyme.localeCompare(b.rhyme);
  });

  const claimedHets = new Set();
  const charEntries = {}; // rhyme → {het, psr, mergedTone}
  let ps仄Pinyin = null;

  for (const psr of psReadings) {
    const { het, mergedTone } = matchHeteronym(psr, hets, claimedHets, ps仄Pinyin);
    if (!claimedHets.has(het.pinyin)) claimedHets.add(het.pinyin);
    if (psr.tone === '仄' && !ps仄Pinyin) ps仄Pinyin = het.pinyin;
    charEntries[psr.rhyme] = { het, psr, mergedTone };
  }

  // Type A: single distinct heteronym used across multiple pingshui readings
  const charLevelMerged = (claimedHets.size === 1 && psReadings.length > 1);

  // Output entries sorted by rhyme codepoint
  const charOut = {};
  for (const rhyme of Object.keys(charEntries).sort()) {
    const { het, psr, mergedTone } = charEntries[rhyme];
    const compounds = getCompounds(char, target, het.pinyin.normalize('NFC'));
    const e = {
      tone: psr.tone,
      pinyin: het.pinyin.normalize('NFC'),
      definitions: extractDefStrings(het),
      compounds,
    };
    if (het.bopomofo) e.bopomofo = het.bopomofo;
    if (target !== char) e.redirect_from = target;
    if (mergedTone || charLevelMerged) e.merged_tone = true;
    charOut[rhyme] = e;
  }
  out[char] = charOut;
}

// Top-level codepoint sort for determinism
const sortedOut = {};
for (const c of [...Object.keys(out)].sort((a, b) => a.codePointAt(0) - b.codePointAt(0))) {
  sortedOut[c] = out[c];
}

fs.writeFileSync(OUT_PATH, JSON.stringify(sortedOut) + '\n');
const stat = fs.statSync(OUT_PATH);
console.log(`wrote ${OUT_PATH}: ${Object.keys(sortedOut).length} chars, ${stat.size} bytes`);
