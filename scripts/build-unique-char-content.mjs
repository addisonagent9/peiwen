// #17 — Per-(char, rhyme) content builder for pingshui chars with no MOE
// entry AND no CEDICT 2-char compound. Cascade: zdic → Wiktionary → Haiku LLM
// → audit-batch. Per-phase invocation; resumable.
//
// Usage:
//   node scripts/build-unique-char-content.mjs --phase=一東
//   node scripts/build-unique-char-content.mjs --phase=一東 --dry-run
//   node scripts/build-unique-char-content.mjs --phase=一東 --max-chars=10
//   node scripts/build-unique-char-content.mjs --phase=一東 --throttle=750
//   node scripts/build-unique-char-content.mjs --phase=一東 --resume=false
//
// Requires ANTHROPIC_API_KEY in env for Haiku rescue (only invoked when
// zdic + Wiktionary both fail; cascade-late).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Converter } from 'opencc-js';
import { load as loadHtml } from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── CLI ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const argMap = {};
for (const a of args) {
  if (a.startsWith('--')) {
    const [k, v] = a.slice(2).split('=');
    argMap[k] = v ?? 'true';
  }
}
const PHASE = argMap.phase;
const RESUME = argMap.resume !== 'false';
const MAX_CHARS = argMap['max-chars'] ? parseInt(argMap['max-chars'], 10) : Infinity;
const THROTTLE_MS = argMap.throttle ? parseInt(argMap.throttle, 10) : 500;
const DRY_RUN = argMap['dry-run'] === 'true';

if (!PHASE) {
  console.error('ERROR: --phase=<rhyme-name> is required (e.g., --phase=一東)');
  process.exit(1);
}

// ── Paths ──────────────────────────────────────────────────────────────────
const PINGSHUI_PATH = path.join(ROOT, 'src/data/pingshui.json');
const MOE_PATH      = path.join(ROOT, 'src/data/moedict-map.json');
const CEDICT_PATH   = path.join(ROOT, 'src/data/cedict_ts.u8');
const OUT_PATH      = path.join(ROOT, 'src/data/unique-char-content.json');
const AUDIT_DIR     = path.join(ROOT, 'data/audit');
const AUDIT_BATCH   = path.join(AUDIT_DIR, `unique-char-audit-batch-${PHASE}.md`);
const META_PATH     = path.join(AUDIT_DIR, 'unique-char-content-meta.json');
const PARSE_FAILS   = path.join(AUDIT_DIR, 'parse-failures');

// ── Load inputs ────────────────────────────────────────────────────────────
console.log(`[setup] reading inputs...`);
const PINGSHUI = JSON.parse(fs.readFileSync(PINGSHUI_PATH, 'utf8'));
const MOE      = JSON.parse(fs.readFileSync(MOE_PATH, 'utf8'));
const CEDICT_RAW = fs.readFileSync(CEDICT_PATH, 'utf8').replace(/\r/g, '');

const s2t = Converter({ from: 'cn', to: 'tw' });

// CEDICT chars set (any char in a 2-char compound)
const lineRe = /^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/$/;
const cedictChars = new Set();
for (const line of CEDICT_RAW.split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const m = line.match(lineRe);
  if (!m) continue;
  const tradChars = Array.from(m[1]);
  const simpChars = Array.from(m[2]);
  if (tradChars.length !== 2) continue;
  for (const c of [...tradChars, ...simpChars]) cedictChars.add(c);
}
console.log(`[setup] CEDICT 2-char vocab indexed (${cedictChars.size} distinct chars)`);

const hasMoe = (char) => {
  if (MOE[char]?.length > 0) return true;
  const trad = s2t(char);
  if (trad !== char && MOE[trad]?.length > 0) return true;
  return false;
};
const hasCedictCompound = (char) => cedictChars.has(char);

// ── Phase scope ────────────────────────────────────────────────────────────
const phaseBucket = PINGSHUI.rhymes[PHASE];
if (!phaseBucket) {
  console.error(`ERROR: rhyme "${PHASE}" not in pingshui.json`);
  process.exit(1);
}

const phaseChars = phaseBucket.chars.filter(c => !hasMoe(c) && !hasCedictCompound(c));
const phaseUnique = [...new Set(phaseChars)];
console.log(`[setup] phase "${PHASE}" gap chars: ${phaseUnique.length}`);

// Resume state
fs.mkdirSync(AUDIT_DIR, { recursive: true });
fs.mkdirSync(PARSE_FAILS, { recursive: true });
let existing = [];
if (fs.existsSync(OUT_PATH) && RESUME) {
  existing = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
}
const existingKey = new Set(existing.map(e => `${e.char}::${e.rhyme}`));
const toProcess = phaseUnique
  .map(c => ({ char: c, rhyme: PHASE }))
  .filter(({ char, rhyme }) => !existingKey.has(`${char}::${rhyme}`))
  .slice(0, MAX_CHARS);

console.log(`[setup] already in unique-char-content.json: ${existing.length}`);
console.log(`[setup] to process this run: ${toProcess.length}`);

// ── Dry-run report ─────────────────────────────────────────────────────────
const estimateLLMCalls = Math.ceil(toProcess.length * 0.05); // 5% fallback rate per Part 0
const estimateLLMCostUSD = estimateLLMCalls * (500 / 1e6 * 0.80 + 150 / 1e6 * 4.00); // Haiku pricing
const estimateWallSec = toProcess.length * (THROTTLE_MS / 1000) + estimateLLMCalls * 1.0;

if (DRY_RUN) {
  console.log('');
  console.log('=== DRY-RUN PLAN ===');
  console.log(`  Phase:                  ${PHASE}`);
  console.log(`  Phase gap chars:        ${phaseUnique.length}`);
  console.log(`  Already extracted:      ${existing.length}`);
  console.log(`  To process this run:    ${toProcess.length}`);
  console.log(`  Throttle:               ${THROTTLE_MS} ms`);
  console.log(`  Est. zdic fetches:      ${toProcess.length}`);
  console.log(`  Est. Wiktionary fallback (~10%): ${Math.ceil(toProcess.length * 0.10)}`);
  console.log(`  Est. Haiku LLM calls (~5%):      ${estimateLLMCalls}`);
  console.log(`  Est. LLM cost:          $${estimateLLMCostUSD.toFixed(4)}`);
  console.log(`  Est. wall time:         ${(estimateWallSec / 60).toFixed(1)} min`);
  console.log('');
  console.log(`  First 10 chars to process:`);
  for (const { char, rhyme } of toProcess.slice(0, 10)) {
    const cp = char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    console.log(`    ${char} (U+${cp})  →  ${rhyme}`);
  }
  console.log('');
  console.log('(no HTTP fetches, no LLM calls performed — --dry-run)');
  process.exit(0);
}

// ── Extraction helpers ─────────────────────────────────────────────────────

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Cheerio-based zdic extractor. Returns { kxRaw, jbRaw } — raw cleaned text
// from the .nr-box-shiyi.kxzd (康熙字典) and .nr-box-shiyi.jbjs (基本解释)
// containers respectively. Returns nulls if the containers are absent.
const extractZdicContainers = (html) => {
  const $ = loadHtml(html);

  // Kangxi: target the <p> elements inside the kxzd container.
  // p[0] = main entry; p[1] = 又 continuation (we keep both for condensation
  // to decide whether to drop the latter).
  const kxBox = $('.nr-box-shiyi.kxzd').first();
  let kxRaw = null;
  if (kxBox.length) {
    const ps = kxBox.find('p');
    if (ps.length) {
      kxRaw = ps.map((_, el) => $(el).text().trim()).get().filter(Boolean).join('。');
      // Ensure ends with 。 if missing
      if (kxRaw && !/[。」]$/.test(kxRaw)) kxRaw += '。';
    }
  }

  // 基本解释 (modern gloss): full container text, then post-process.
  // The container also embeds 国语辞典 anchor links and 英语/法语 translations
  // which we'll strip in extractModernGloss.
  const jbBox = $('.nr-box-shiyi.jbjs').first();
  let jbRaw = null;
  if (jbBox.length) {
    // Remove navigation anchors that don't add meaning (e.g., 國語辭典 link)
    const clone = jbBox.clone();
    clone.find('h2').remove();
    clone.find('.div.copyright').remove();
    jbRaw = clone.text().replace(/\s+/g, ' ').trim();
  }

  return { kxRaw, jbRaw };
};

// Kangxi condensation — sentence-split-and-drop heuristic for the 反切
// phonological cluster, plus length capping. Designed for clean cheerio
// input (no dictionary-page metadata leakage to strip).
const condenseKangxi = (raw) => {
  if (!raw) return '';
  // Collapse all whitespace runs (Chinese text has no inter-word space)
  let s = raw.replace(/\s+/g, '');

  // Sentence-split-and-drop 反切 cluster.
  // The first sentence is a 反切 cluster iff:
  //   - it contains 音<char> (modern Mandarin tone-naming, e.g. 音松, 音同)
  //   - it contains 切 (the 反切 marker)
  //   - it does NOT contain a bracket with · (those are TEXT citations like 【爾雅·釋山】, not 韻書 cluster brackets)
  const parts = s.split('。');
  if (parts.length > 1) {
    const first = parts[0];
    const isFanqieCluster =
      /音[一-鿿]/u.test(first) &&
      /切/u.test(first) &&
      !/【[^】]+·[^】]+】/u.test(first);
    if (isFanqieCluster) parts.shift();
  }
  s = parts.join('。');

  // Strip leading commas/whitespace/separators
  s = s.replace(/^[，、；\s]+/u, '');

  // If still > 80 chars, try to truncate at 又 continuation boundary
  if (s.length > 80) {
    const youIdx = s.indexOf('又');
    if (youIdx > 0 && youIdx < 80) {
      const lastPeriod = s.lastIndexOf('。', youIdx);
      if (lastPeriod > 0) s = s.slice(0, lastPeriod + 1);
    }
  }

  // Hard cap 120 with sentence-boundary preservation
  if (s.length > 120) {
    const lastPeriod = s.slice(0, 120).lastIndexOf('。');
    if (lastPeriod > 60) s = s.slice(0, lastPeriod + 1);
    else s = s.slice(0, 120) + '…';
  }

  // Dedupe trailing periods (sentence-split + rejoin can produce 。。)
  s = s.replace(/。{2,}/gu, '。');
  return s.trim();
};

// Modern gloss extractor — strips zdic's jbjs preamble + trailing translations
// and joins multiple readings (split by ●) with ；.
const extractModernGloss = (raw, char) => {
  if (!raw) return '';
  let s = raw;

  // Strip leading "<char> 基本解释 " (zdic's section header)
  s = s.replace(new RegExp(`^${char}\\s*基本解释\\s*`, 'u'), '');

  // Strip trailing English/French translation rows (and anything after)
  s = s.replace(/\s*英语[\s\S]*$/u, '');
  s = s.replace(/\s*法语[\s\S]*$/u, '');
  s = s.replace(/\s*德语[\s\S]*$/u, '');
  s = s.replace(/\s*日语[\s\S]*$/u, '');

  // Strip 【漢典】 brand markers anywhere in the text
  s = s.replace(/【漢典】/gu, ' ');

  // Strip trailing 國語辭典 nav anchor
  s = s.replace(/\s*國語辭典.*$/u, '');

  // Strip char + 詳細解釋 nav
  s = s.replace(/\s*詳細解[釋释][\s\S]*$/u, '');

  // Split by ● (multi-reading bullet). Process each segment.
  const readings = s.split('●').map(r => r.trim()).filter(Boolean);
  const processed = readings.map(r => {
    // Strip leading "<char> <pinyin> <bopomofo>" prefix per reading.
    // pinyin: ASCII letters + tone-marks; bopomofo: ㄅㄆㄇㄈ-ㄦ range + tone markers ˇˊˋ˙ˉ
    // Allow optional (X) full-width parenthetical between char and pinyin
    // (e.g. 岽（崬）dōng — the variant indicator for simp-trad pairs).
    const prefixRe = new RegExp(
      `^${char}\\s*(?:（[^）]+）)?\\s*[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüṳü]+[1-5]?\\s*[ㄅ-ㄩ˙ˉˊˇˋ\\s]*`,
      'u'
    );
    return r.replace(prefixRe, '').trim();
  }).filter(r => r.length > 0);

  let out = processed.join('；');

  // Length cap (soft 80, hard 120)
  if (out.length > 120) {
    const lastSep = out.slice(0, 120).lastIndexOf('；');
    if (lastSep > 40) out = out.slice(0, lastSep);
    else out = out.slice(0, 120) + '…';
  }

  // Dedupe trailing periods
  out = out.replace(/。{2,}/gu, '。');
  return out.trim();
};

// Validation gate — reject extraction failures so they cascade to Wiktionary
// instead of pooling in audit-batch. Audit-batch is reserved for content
// uncertainty, not extraction bugs.
//
// 【 and 《 are permitted prefixes — they mark legitimate classical citations
// (【爾雅·釋山】, 【說文】, 《詩經》). Dictionary-metadata leakage is caught
// by the blacklist check on `康熙筆画 / 部外筆画 / 基本解释`.
//
// Tiered length rule: wenyan ≥ 6 chars stand-alone, OR wenyan ≥ 3 chars
// when modern carries substantive content (≥ 10 chars). Prevents recursive
// variant-only entries from shipping as the user-facing 文言 row.
const validateExtraction = (wenyan, modern, char) => {
  const blacklist = ['康熙筆画', '部外筆画', '基本解释', 'mw-parser'];
  const badStarts = ['●', '·', ' ', '\t', '\n'];

  const checkField = (field, name) => {
    if (!field) return null;
    if (badStarts.some(s => field.startsWith(s))) return `${name} starts with bad prefix: ${JSON.stringify(field.slice(0, 4))}`;
    if (blacklist.some(b => field.includes(b))) return `${name} contains metadata leak`;
    if (field === char) return `${name} equals char itself`;
    // Wikipedia chart-navigation patterns (defensive insurance after B1).
    if (/U\+[0-9A-F]{4,5}/i.test(field)) return `${name} contains Unicode codepoint notation`;
    if (/&#\d+;/.test(field)) return `${name} contains HTML entity escape`;
    if (/\[U\+[0-9A-F]+\]/i.test(field)) return `${name} contains bracket codepoint navigation`;
    return null;
  };

  const wenyanErr = checkField(wenyan, 'wenyan');
  if (wenyanErr) return { ok: false, reason: wenyanErr };

  const wenyanLen = wenyan?.length ?? 0;
  const modernLen = modern?.length ?? 0;
  if (wenyanLen < 3) {
    return { ok: false, reason: `wenyan too short (${wenyanLen})` };
  }
  if (wenyanLen < 6 && modernLen < 10) {
    return { ok: false, reason: `both fields thin (wenyan=${wenyanLen}, modern=${modernLen})` };
  }

  if (modern) {
    const modernErr = checkField(modern, 'modern');
    if (modernErr) return { ok: false, reason: modernErr };
    // Modern shouldn't start with char + pinyin (prefix not stripped)
    if (new RegExp(`^${char}\\s*[a-zāáǎàü]`, 'iu').test(modern)) {
      return { ok: false, reason: 'modern starts with char+pinyin (prefix not stripped)' };
    }
  }

  return { ok: true };
};

// ── Fetcher with retry + 429 handling ─────────────────────────────────────
let currentThrottle = THROTTLE_MS;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const fetchHtml = async (url) => {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': BROWSER_UA,
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
      });
      if (res.status === 429 || res.status === 503) {
        console.warn(`  [${res.status}] ${url} — backing off to 1500ms permanently`);
        currentThrottle = Math.max(currentThrottle, 1500);
        await sleep(2000);
        continue;
      }
      if (!res.ok) return { ok: false, status: res.status, html: null };
      const html = await res.text();
      return { ok: true, status: 200, html };
    } catch (err) {
      if (attempt === 0) {
        console.warn(`  fetch err on ${url}: ${err.message} — retry in 1s`);
        await sleep(1000);
        continue;
      }
      return { ok: false, status: 0, html: null, error: err.message };
    }
  }
  return { ok: false, status: 0, html: null };
};

// ── Haiku LLM ─────────────────────────────────────────────────────────────
const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
const apiKey = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `You are a classical Chinese lexicographer. Given a 平水韻 character and any raw source text we found, produce:
- wenyan: the 文言文 meaning in concise modern Chinese phrasing, ≤80 characters, with at least one classical citation in 《》 if the source has one
- modern: the 今義 (modern meaning), ≤80 characters, or empty string if archaic-only

Rules:
- 文言文 sense is primary; modern sense is secondary
- Cite a classical source (《詩經》, 《論語》, 《史記》, 《廣韻》, etc.) ONLY if you can name a specific work the character appears in
- DO NOT invent citations. If unsure, omit the citation rather than fabricate.
- If you cannot confidently identify the meaning, return: {"wenyan": "", "modern": "", "uncertain": true}
- DO NOT use simplified characters in wenyan. Traditional Chinese only.
- modern field may use simplified if the modern meaning is inherently simplified-coded.

Return strict JSON: {"wenyan": "...", "modern": "...", "uncertain": false, "citation": "..."}`;

const callHaiku = async (char, rhyme, zdicRaw, wiktionaryRaw) => {
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set; cannot LLM-rescue');
  const userMsg = `Character: ${char}
平水韻 rhyme: ${rhyme}
${zdicRaw ? `\nzdic raw text:\n${zdicRaw.slice(0, 800)}` : '\n(no zdic content)'}
${wiktionaryRaw ? `\nWiktionary raw text:\n${wiktionaryRaw.slice(0, 800)}` : '\n(no Wiktionary content)'}

Return JSON only.`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: HAIKU_MODEL,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMsg }],
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Haiku API ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data.content?.[0]?.text ?? '';
  const usage = data.usage ?? {};
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return { parsed: null, usage };
  try {
    return { parsed: JSON.parse(match[0]), usage };
  } catch {
    return { parsed: null, usage };
  }
};

// ── Audit-batch writer ────────────────────────────────────────────────────
const auditEntries = [];
const appendAudit = (char, rhyme, zdicRaw, wiktionaryRaw, llmResult, reason) => {
  auditEntries.push({ char, rhyme, zdicRaw, wiktionaryRaw, llmResult, reason });
};

// ── Main loop ──────────────────────────────────────────────────────────────
const out = [...existing];
const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
const bySource = { zdic: 0, wiktionary: 0, 'llm-grounded': 0, 'llm-only-audit': 0 };
let llmCalls = 0, llmTokensIn = 0, llmTokensOut = 0;
const startMs = Date.now();

const persistIntermediate = () => {
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n');
};

console.log(`\n[run] starting (${toProcess.length} chars, throttle ${THROTTLE_MS}ms)...`);

for (let i = 0; i < toProcess.length; i++) {
  const { char, rhyme } = toProcess[i];
  const url = `https://www.zdic.net/hans/${encodeURIComponent(char)}`;

  if (i > 0) await sleep(currentThrottle);

  // --- zdic
  const zdicRes = await fetchHtml(url);
  let kxRaw = null, jbRaw = null;
  if (zdicRes.ok && zdicRes.html) {
    try {
      const ext = extractZdicContainers(zdicRes.html);
      kxRaw = ext.kxRaw;
      jbRaw = ext.jbRaw;
    } catch (err) {
      console.warn(`  [${i+1}/${toProcess.length}] ${char}: zdic parse exception — ${err.message}`);
      fs.writeFileSync(path.join(PARSE_FAILS, `${char}.html`), zdicRes.html);
    }
  }

  const condensedWenyan = condenseKangxi(kxRaw);
  const cleanModern = extractModernGloss(jbRaw, char);
  const validation = validateExtraction(condensedWenyan, cleanModern, char);

  if (validation.ok) {
    out.push({
      char, rhyme,
      wenyan: condensedWenyan,
      modern: cleanModern,
      source: 'zdic',
      source_url: url,
      extracted_at: new Date().toISOString(),
    });
    counts.HIGH++;
    bySource.zdic++;
    console.log(`  [${i+1}/${toProcess.length}] ${char}: HIGH (zdic) — ${condensedWenyan.slice(0, 40)}${condensedWenyan.length > 40 ? '…' : ''}`);
    if ((i + 1) % 50 === 0) persistIntermediate();
    continue;
  }
  // Validation failed → cascade to Wiktionary
  console.log(`  [${i+1}/${toProcess.length}] ${char}: zdic validation FAIL (${validation.reason}) → wiktionary`);

  // --- Wiktionary fallback
  const wikiUrl = `https://zh.wiktionary.org/wiki/${encodeURIComponent(char)}`;
  await sleep(currentThrottle);
  const wikiRes = await fetchHtml(wikiUrl);
  let wikiText = '';
  if (wikiRes.ok && wikiRes.html) {
    // Target the 漢語 section's content (everything from the section
    // header until the next h2 boundary). Use .closest('h2') to get the
    // enclosing h2, then .nextUntil('h2') to collect content siblings.
    // Captures content semantically rather than via .parent() walk,
    // which surfaced page-chrome (Unicode chart navigation) in B1.
    //
    // No #mw-content-text fallback: when #漢語 is absent, the page has
    // no Chinese-language section worth scraping — cascade to LLM rescue.
    try {
      const $w = loadHtml(wikiRes.html);
      const hanyuHeading = $w('#漢語').closest('h2');
      if (hanyuHeading.length) {
        const sectionNodes = hanyuHeading.nextUntil('h2');
        wikiText = sectionNodes.map((_, el) => $w(el).text()).get()
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
      if (wikiText.length > 600) wikiText = wikiText.slice(0, 600);
    } catch (err) {
      // best-effort; treat as empty
      wikiText = '';
    }
  }

  // If wiki has substantive content AND zdic had nothing usable, use wiki
  if (wikiText && wikiText.length > 30 && !condensedWenyan) {
    // very basic: take first 80 chars (we don't have the structure to do better)
    const wikiWenyan = wikiText.slice(0, 80);
    out.push({
      char, rhyme,
      wenyan: wikiWenyan,
      modern: '',
      source: 'wiktionary',
      source_url: wikiUrl,
      extracted_at: new Date().toISOString(),
    });
    counts.HIGH++;
    bySource.wiktionary++;
    console.log(`  [${i+1}/${toProcess.length}] ${char}: HIGH (wiktionary) — ${wikiWenyan.slice(0, 40)}…`);
    if ((i + 1) % 50 === 0) persistIntermediate();
    continue;
  }

  // --- LLM rescue
  if (!apiKey) {
    appendAudit(char, rhyme, kxRaw, wikiText, null, 'no LLM key + scrapes empty');
    counts.LOW++;
    bySource['llm-only-audit']++;
    console.log(`  [${i+1}/${toProcess.length}] ${char}: LOW (no LLM key) → audit-batch`);
    continue;
  }

  try {
    llmCalls++;
    const { parsed, usage } = await callHaiku(char, rhyme, kxRaw, wikiText);
    llmTokensIn += usage.input_tokens ?? 0;
    llmTokensOut += usage.output_tokens ?? 0;
    if (!parsed || parsed.uncertain || !parsed.wenyan) {
      appendAudit(char, rhyme, kxRaw, wikiText, parsed, 'LLM uncertain or empty');
      counts.LOW++;
      bySource['llm-only-audit']++;
      console.log(`  [${i+1}/${toProcess.length}] ${char}: LOW (LLM uncertain) → audit-batch`);
      continue;
    }
    const hasCitation = !!parsed.citation && /《.+》/.test(parsed.citation);
    if (hasCitation) {
      out.push({
        char, rhyme,
        wenyan: parsed.wenyan,
        modern: parsed.modern || '',
        source: 'llm-grounded',
        source_url: `haiku:${HAIKU_MODEL}`,
        extracted_at: new Date().toISOString(),
        citation: parsed.citation,
      });
      counts.MEDIUM++;
      bySource['llm-grounded']++;
      console.log(`  [${i+1}/${toProcess.length}] ${char}: MEDIUM (llm-grounded) — ${parsed.wenyan.slice(0, 40)}…`);
    } else {
      appendAudit(char, rhyme, kxRaw, wikiText, parsed, 'LLM no citation');
      counts.LOW++;
      bySource['llm-only-audit']++;
      console.log(`  [${i+1}/${toProcess.length}] ${char}: LOW (LLM no citation) → audit-batch`);
    }
  } catch (err) {
    console.error(`  [${i+1}/${toProcess.length}] ${char}: LLM err — ${err.message}`);
    appendAudit(char, rhyme, kxRaw, wikiText, null, `LLM error: ${err.message}`);
    counts.LOW++;
    bySource['llm-only-audit']++;
  }

  if ((i + 1) % 50 === 0) persistIntermediate();
}

// ── Final persist ─────────────────────────────────────────────────────────
persistIntermediate();

// Audit batch markdown
const auditLines = [`# Unique-char audit batch — phase ${PHASE}`, '', `Generated ${new Date().toISOString()}`, ''];
for (const a of auditEntries) {
  auditLines.push(`## ${a.char} / ${a.rhyme}`, '');
  auditLines.push(`**Reason**: ${a.reason}`, '');
  auditLines.push(`**zdic raw**:`, '');
  auditLines.push('> ' + (a.zdicRaw ? a.zdicRaw.slice(0, 400) : '(no content)'), '');
  auditLines.push(`**Wiktionary raw**:`, '');
  auditLines.push('> ' + (a.wiktionaryRaw ? a.wiktionaryRaw.slice(0, 400) : '(no content)'), '');
  auditLines.push(`**LLM output**:`, '');
  auditLines.push('> ' + (a.llmResult ? JSON.stringify(a.llmResult) : 'n/a'), '');
  auditLines.push(`**Addison's verdict** (fill in):`, '');
  auditLines.push(`- [ ] accept zdic raw`, `- [ ] accept LLM output`, `- [ ] skip (no shipworthy content)`, `- [ ] override: ___________`, '', '---', '');
}
fs.writeFileSync(AUDIT_BATCH, auditLines.join('\n'));

// Meta
const wallMin = ((Date.now() - startMs) / 1000 / 60).toFixed(2);
const llmCostUSD = (llmTokensIn / 1e6 * 0.80 + llmTokensOut / 1e6 * 4.00).toFixed(4);
const meta = {
  phase: PHASE,
  ranAt: new Date().toISOString(),
  totalGapCount: phaseUnique.length,
  extracted: counts.HIGH + counts.MEDIUM,
  byConfidence: counts,
  bySource,
  llmCallCount: llmCalls,
  llmTokensIn,
  llmTokensOut,
  llmCostUSD: `$${llmCostUSD}`,
  wallTimeMinutes: parseFloat(wallMin),
  throttleMs: currentThrottle,
  model: HAIKU_MODEL,
};
// Merge prev + curr phase blocks for re-runs of the same --phase.
//   max:         totalGapCount (largest universe ever surveyed for this phase)
//   additive:    extracted, byConfidence.*, bySource.*, llmCallCount,
//                llmTokensIn, llmTokensOut, llmCostUSD, wallTimeMinutes
//   latest-wins: phase (identity), ranAt, throttleMs, model
// Missing prev fields fall through to curr's value (defensive against phase
// blocks predating any field).
function mergePhase(prev, curr) {
  const parseCostUSD = (s) => {
    if (s == null) return 0;
    const n = parseFloat(String(s).replace('$', ''));
    return Number.isFinite(n) ? n : 0;
  };
  const addCounts = (a, b) => {
    const out = {};
    const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    for (const k of keys) out[k] = (a?.[k] ?? 0) + (b?.[k] ?? 0);
    return out;
  };
  const sumNum = (a, b) => (a ?? 0) + (b ?? 0);
  const summedCostUSD = (parseCostUSD(prev.llmCostUSD) + parseCostUSD(curr.llmCostUSD)).toFixed(4);
  return {
    phase: curr.phase,
    ranAt: curr.ranAt,
    totalGapCount: Math.max(prev.totalGapCount ?? 0, curr.totalGapCount ?? 0),
    extracted: sumNum(prev.extracted, curr.extracted),
    byConfidence: addCounts(prev.byConfidence, curr.byConfidence),
    bySource: addCounts(prev.bySource, curr.bySource),
    llmCallCount: sumNum(prev.llmCallCount, curr.llmCallCount),
    llmTokensIn: sumNum(prev.llmTokensIn, curr.llmTokensIn),
    llmTokensOut: sumNum(prev.llmTokensOut, curr.llmTokensOut),
    llmCostUSD: `$${summedCostUSD}`,
    wallTimeMinutes: parseFloat(sumNum(prev.wallTimeMinutes, curr.wallTimeMinutes).toFixed(2)),
    throttleMs: curr.throttleMs,
    model: curr.model,
  };
}

let existingMeta = {};
if (fs.existsSync(META_PATH)) {
  try { existingMeta = JSON.parse(fs.readFileSync(META_PATH, 'utf8')); } catch {}
}
if (!existingMeta.phases) existingMeta.phases = {};
existingMeta.phases[PHASE] = existingMeta.phases[PHASE]
  ? mergePhase(existingMeta.phases[PHASE], meta)
  : meta;
fs.writeFileSync(META_PATH, JSON.stringify(existingMeta, null, 2));

console.log('');
console.log('=== Done ===');
console.log(`Phase:             ${PHASE}`);
console.log(`Gap chars:         ${phaseUnique.length}`);
console.log(`Extracted (HIGH+MED): ${counts.HIGH + counts.MEDIUM}`);
console.log(`  HIGH:            ${counts.HIGH}`);
console.log(`  MEDIUM:          ${counts.MEDIUM}`);
console.log(`  LOW (→audit):    ${counts.LOW}`);
console.log(`By source:         ${JSON.stringify(bySource)}`);
console.log(`LLM calls:         ${llmCalls} (cost ~$${llmCostUSD}, tokens ${llmTokensIn} in / ${llmTokensOut} out)`);
console.log(`Wall time:         ${wallMin} min`);
console.log(`Outputs:`);
console.log(`  ${OUT_PATH}`);
console.log(`  ${AUDIT_BATCH}`);
console.log(`  ${META_PATH}`);
