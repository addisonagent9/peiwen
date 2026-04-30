import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── 1. Load data ──────────────────────────────────────────────────────────────

const pingshuiPath = path.resolve(__dirname, '../src/data/pingshui.json');
const cedictPath = path.resolve(__dirname, '../src/data/cedict_ts.u8');
const outPath = path.resolve(__dirname, '../src/data/pingshui/drill4-corpus.json');

const data = JSON.parse(fs.readFileSync(pingshuiPath, 'utf8'));
const cedictRaw = fs.readFileSync(cedictPath, 'utf8').replace(/\r/g, '');
const seedCharsPath = path.resolve(__dirname, '../server/data/tier1-seed-chars.mjs');
const seedCharsText = fs.readFileSync(seedCharsPath, 'utf8');

const TIER1_RHYMES = ['一東', '七陽', '十一尤', '六麻', '五歌'];

const moedictPath = path.resolve(__dirname, '../src/data/moedict-map.json');
const moedict = JSON.parse(fs.readFileSync(moedictPath, 'utf8'));
console.log(`Loaded moedict-map: ${Object.keys(moedict).length} entries`);

const RHYMEID_TO_LABEL = {
  'shangping-01-dong': '一東',
  'xiaping-07-yang': '七陽',
  'xiaping-11-you': '十一尤',
  'xiaping-06-ma': '六麻',
  'xiaping-05-ge': '五歌',
};

// Build jyutping + curriculum set lookup from tier1 seed chars
const jyutpingMap = new Map();
const seedCharSet = new Set();
const curriculumSetLookup = {};
for (const label of TIER1_RHYMES) curriculumSetLookup[label] = {};
const seedRe = /char:\s*'([^']+)',\s*rhymeId:\s*'([^']+)',\s*pinyin:\s*'[^']+',\s*jyutping:\s*'([^']+)',\s*set:\s*([1-4])/g;
let seedMatch;
while ((seedMatch = seedRe.exec(seedCharsText)) !== null) {
  const [, char, rhymeId, jyutping, setStr] = seedMatch;
  jyutpingMap.set(char, jyutping);
  seedCharSet.add(char);
  const label = RHYMEID_TO_LABEL[rhymeId];
  if (label) curriculumSetLookup[label][char] = parseInt(setStr);
}
console.log(`Loaded ${seedCharSet.size} seed chars with jyutping`);

const tier1Sets = {};
for (const name of TIER1_RHYMES) {
  const rhyme = data.rhymes[name];
  if (!rhyme) {
    console.error(`Rhyme "${name}" not found in pingshui.json`);
    process.exit(1);
  }
  tier1Sets[name] = new Set(rhyme.chars);
}

// All chars known to pingshui
const allPingshuiChars = new Set(Object.keys(data.chars));

// ── 2–3. Parse CC-CEDICT and filter ───────────────────────────────────────────

const lineRe = /^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/$/;
const junkLatinDigitPunct = /[a-zA-Z0-9\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]/;

const modernJunkEn = /\b(internet|computer|TV|phone|app|email|website|online|company|corp|Inc|Ltd|Co|software|hardware|database|server|browser|download|upload)\b/i;
const modernJunkZh = /互联网|网络|软件|手机|电脑|公司|科技|服务器|系统|信息|数据/;

const scienceJunkEn = /\b(acid|chloride|oxide|protein|enzyme|gene|DNA|virus|cancer|surgery|disease|molecule|chemical)\b/i;
const scienceJunkZh = /酸|酶|蛋白|基因|病毒/;

const classicalEn = /\b(ancient|classical|literary|poetic|emperor|dynasty|Tang|Song|Han|imperial|sage|verse|poem|archaic)\b/i;
const classicalZh = /詩|詞|古|雅|儒/;

function classify(gloss, trad) {
  if (classicalEn.test(gloss) || classicalZh.test(trad)) return 'classical';
  return 'neutral';
}

function computeRareSet(char, rhymeName) {
  return curriculumSetLookup[rhymeName]?.[char] ?? 1;
}

const entries = []; // all candidate entries

for (const line of cedictRaw.split('\n')) {
  if (!line || line.startsWith('#')) continue;

  const m = line.match(lineRe);
  if (!m) continue;

  const [, trad, , pinyin, glossRaw] = m;
  const chars = Array.from(trad);

  // Only 2-char traditional entries
  if (chars.length !== 2) continue;

  // Skip if contains digits, latin, or punctuation
  if (junkLatinDigitPunct.test(trad)) continue;

  // Skip if any char not in pingshui chars map
  if (!chars.every(c => allPingshuiChars.has(c))) continue;

  // Skip if pinyin first word starts with uppercase (proper noun)
  const pinyinFirst = pinyin.split(/\s+/)[0];
  if (pinyinFirst && /^[A-Z]/.test(pinyinFirst)) continue;

  const firstGloss = glossRaw.split('/')[0].trim();

  // Skip modern junk
  if (modernJunkEn.test(firstGloss) || modernJunkZh.test(firstGloss)) continue;

  // Skip science junk
  if (scienceJunkEn.test(firstGloss) || scienceJunkZh.test(firstGloss)) continue;

  const moeDefs = moedict[trad];
  const chineseGloss = moeDefs && moeDefs.length > 0 ? moeDefs[0] : null;
  const rawGloss = chineseGloss || firstGloss;
  const gloss = rawGloss.length > 80 ? rawGloss.slice(0, 80) : rawGloss;
  const tier = classify(firstGloss, trad);

  // ── 4. Check which char(s) are in a Tier 1 rhyme ───────────────────────────

  // For each Tier 1 rhyme, record which positions (0 and/or 1) match
  const matches = []; // { rhyme, pos }
  for (const rhymeName of TIER1_RHYMES) {
    const rSet = tier1Sets[rhymeName];
    const pos0 = rSet.has(chars[0]);
    const pos1 = rSet.has(chars[1]);
    if (pos0) matches.push({ rhyme: rhymeName, pos: 0 });
    if (pos1) matches.push({ rhyme: rhymeName, pos: 1 });
  }

  if (matches.length === 0) continue;

  // Check if both chars are in the SAME rhyme → skip (ambiguous)
  const rhymesWithBoth = new Set();
  for (const rhymeName of TIER1_RHYMES) {
    const rSet = tier1Sets[rhymeName];
    if (rSet.has(chars[0]) && rSet.has(chars[1])) {
      rhymesWithBoth.add(rhymeName);
    }
  }

  const pinyinParts = pinyin.split(/\s+/);

  for (const { rhyme, pos } of matches) {
    // Skip if both chars are in the same rhyme
    if (rhymesWithBoth.has(rhyme)) continue;

    // Skip if answer char has multiple 平 readings across distinct rhymes
    const answerCharEntries = data.chars[chars[pos]] ?? [];
    const answerPingRhymes = new Set(answerCharEntries.filter(e => e.tone === '平').map(e => e.rhyme));
    if (answerPingRhymes.size > 1) continue;

    // Skip if answer char not in curriculum seed chars
    if (!seedCharSet.has(chars[pos])) continue;

    entries.push({
      word: trad,
      blank_pos: pos,
      answer: chars[pos],
      answer_pinyin: pinyinParts[pos] ?? '',
      answer_jyutping: jyutpingMap.get(chars[pos]) ?? null,
      hint_char: chars[1 - pos],
      hint_pinyin: pinyinParts[1 - pos] ?? '',
      hint_jyutping: jyutpingMap.get(chars[1 - pos]) ?? null,
      rhyme,
      pinyin,
      gloss,
      tier,
      rare_set: computeRareSet(chars[pos], rhyme),
    });
  }
}

// ── 7. Group by rhyme, cap at 500, prefer classical first ─────────────────────

const grouped = {};
for (const rhymeName of TIER1_RHYMES) {
  grouped[rhymeName] = [];
}

for (const entry of entries) {
  grouped[entry.rhyme].push(entry);
}

const output = {};
for (const rhymeName of TIER1_RHYMES) {
  const all = grouped[rhymeName];
  // Sort: classical first, then neutral
  all.sort((a, b) => {
    if (a.tier === b.tier) return 0;
    if (a.tier === 'classical') return -1;
    return 1;
  });
  output[rhymeName] = all.slice(0, 500);
}

// ── 8. Write output and print summary ─────────────────────────────────────────

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`Wrote ${outPath}\n`);

console.log('Per-rhyme summary:');
for (const rhymeName of TIER1_RHYMES) {
  const items = output[rhymeName];
  const classical = items.filter(e => e.tier === 'classical').length;
  const neutral = items.filter(e => e.tier === 'neutral').length;
  console.log(`  ${rhymeName}: ${items.length} total (${classical} classical, ${neutral} neutral)`);
}
