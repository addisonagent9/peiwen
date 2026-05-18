#!/usr/bin/env node
// #17 follow-up Part 2 — Audit-batch enrichment
//
// Modes:
//   --pilot  : 10 hardcoded sample chars → data/audit/triage-pilot-2026-05-17.md
//   --all    : all 104 LOW entries discovered from data/audit/unique-char-
//              audit-batch-*.md → data/audit/triage-batch-2026-05-17.md
//              AND mutates src/data/unique-char-content.json (appends ships
//              + migrates existing citations to drop 《》 brackets)
//   DRY_RUN=1: classify + estimate cost only; no API calls; no file writes.
//
// Char-fidelity rule: every char glyph is verified to appear verbatim in
// the source audit-batch file at runtime. Mismatches fail loudly.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ── Env loading ─────────────────────────────────────────────────────────
// Shell env wins over server/.env (which may contain placeholders).
const envPath = path.join(ROOT, 'server', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

// ── Constants & CLI ─────────────────────────────────────────────────────
const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
const apiKey = process.env.ANTHROPIC_API_KEY;
const AUDIT_DIR = path.join(ROOT, 'data', 'audit');
const UC_PATH = path.join(ROOT, 'src', 'data', 'unique-char-content.json');
const MOE_PATH = path.join(ROOT, 'src', 'data', 'moedict-map.json');
const SIDECAR_PILOT = path.join(AUDIT_DIR, 'triage-pilot-2026-05-17.md');
const SIDECAR_BATCH = path.join(AUDIT_DIR, 'triage-batch-2026-05-17.md');
const STATS_PATH = path.join(AUDIT_DIR, 'triage-batch-2026-05-17-stats.json');

const args = process.argv.slice(2);
const isPilot = args.includes('--pilot');
const isAll = args.includes('--all');
const DRY_RUN = process.env.DRY_RUN === '1';

if (!isPilot && !isAll) {
  console.error('Usage: node scripts/triage-audit-batch.mjs (--pilot|--all) [DRY_RUN=1]');
  process.exit(1);
}
if (isPilot && isAll) {
  console.error('--pilot and --all are mutually exclusive');
  process.exit(1);
}
if (!DRY_RUN && !apiKey) {
  console.error('ANTHROPIC_API_KEY required (set in server/.env or process env)');
  process.exit(1);
}

const MODE = isPilot ? 'pilot' : 'all';
const SIDECAR_PATH = isPilot ? SIDECAR_PILOT : SIDECAR_BATCH;

// ── Pilot sample (10 chars, hardcoded; same as Part 2a) ─────────────────
const PILOT_SAMPLE = [
  { char: '㯈', rhyme: '一屋', expectedSub: 'a' },
  { char: '㤛', rhyme: '二十六寢', expectedSub: 'a' },
  { char: '㑐', rhyme: '一屋', expectedSub: 'b' },
  { char: '媹', rhyme: '十一尤', expectedSub: 'b' },
  { char: '㰀', rhyme: '八齊', expectedSub: 'c' },
  { char: '鏣', rhyme: '六御', expectedSub: 'c' },
  { char: '嵭', rhyme: '十蒸', expectedSub: 'd' },
  { char: '橶', rhyme: '十一陌', expectedSub: 'e' },
  { char: '嚑', rhyme: '十二文', expectedSub: 'e' },
  { char: '哞', rhyme: '十一尤', expectedSub: 'f' },
];

// ── Audit-file parser ───────────────────────────────────────────────────
function loadAuditFile(rhyme) {
  const p = path.join(AUDIT_DIR, `unique-char-audit-batch-${rhyme}.md`);
  if (!fs.existsSync(p)) throw new Error(`Audit file not found: ${p}`);
  return fs.readFileSync(p, 'utf8');
}

function extractEntryBlock(auditContent, char, rhyme) {
  const header = `## ${char} / ${rhyme}`;
  const idx = auditContent.indexOf(header);
  if (idx < 0) return null;
  const rest = auditContent.slice(idx);
  const endIdx = rest.indexOf('\n---\n');
  if (endIdx < 0) {
    const altIdx = rest.indexOf('---');
    if (altIdx < 0) return null;
    return rest.slice(0, altIdx).trim();
  }
  return rest.slice(0, endIdx).trim();
}

function parseEntryFields(block) {
  const zdic = block.match(/\*\*zdic raw\*\*:\s*\n\n> (.*?)\n\n\*\*Wiktionary/s);
  const wiki = block.match(/\*\*Wiktionary raw\*\*:\s*\n\n> (.*?)\n\n\*\*LLM/s);
  const llm = block.match(/\*\*LLM output\*\*:\s*\n\n> (.+?)\n\n\*\*Addison/s);
  const reason = block.match(/\*\*Reason\*\*: (.+)/);
  return {
    reason: reason?.[1]?.trim() ?? '',
    zdicRaw: zdic?.[1]?.trim() ?? '',
    wikiRaw: wiki?.[1]?.trim() ?? '',
    llmRaw: llm?.[1]?.trim() ?? '',
  };
}

// Discover all 104 LOW entries by scanning audit-batch files
function discoverAllLowEntries() {
  const files = fs.readdirSync(AUDIT_DIR)
    .filter(f => f.startsWith('unique-char-audit-batch-') && f.endsWith('.md'))
    .sort();
  const entries = [];
  for (const f of files) {
    const rhyme = f.replace('unique-char-audit-batch-', '').replace('.md', '');
    const content = fs.readFileSync(path.join(AUDIT_DIR, f), 'utf8');
    const headerRe = /^## (.+?) \/ (.+?)$/gm;
    let m;
    while ((m = headerRe.exec(content)) !== null) {
      const char = m[1];
      const fileRhyme = m[2];
      if (fileRhyme !== rhyme) continue;
      if ([...char].length !== 1) continue;
      entries.push({ char, rhyme });
    }
  }
  return entries;
}

// ── Sub-case classifier ─────────────────────────────────────────────────
// Wiktionary empty-page markers: bare "[编辑]" OR prefixed forms like "漢語[编辑]"
const isEmptyWiki = (s) => {
  if (!s) return true;
  const t = s.trim();
  if (t === '' || t === '(no content)') return true;
  if (/^(漢語|汉语|文言文|文言|古漢語|古汉语)?\s*\[编辑\]$/.test(t)) return true;
  return false;
};

function classifySubCase(fields) {
  const zdic = fields.zdicRaw;
  const wiki = fields.wikiRaw;
  if (zdic === '(no content)' && isEmptyWiki(wiki)) return 'e';
  // (a) variant-reference family — same X-dereferencing pipeline
  if (/^同[^。\s]/.test(zdic)) return 'a';
  if (/^與[^。\s]+同/.test(zdic)) return 'a';
  if (/^俗[^。\s]+字/.test(zdic)) return 'a';
  if (/^註詳[^。\s]/.test(zdic)) return 'a';
  if (/^註見[^。\s]/.test(zdic)) return 'a';
  // (d) 義闕
  if (zdic.includes('義闕')) return 'd';
  // (b) name-use
  if (/(人名|女字|男字)。?/.test(zdic)) return 'b';
  // (c) bracket-bearing 字書 entry (designation-bearing OR generic 反切 entry).
  // Match if 【X】 appears anywhere (handles 〔古文〕prefix + 【X】 pattern).
  if (/【[^】]+】/.test(zdic)) return 'c';
  return 'unknown';
}

// Extract variant-reference X from any of 5 patterns. Returns { X, frame } or null.
function extractVariantX(zdic) {
  let m;
  if ((m = zdic.match(/^同([^。\s])/))) return { X: m[1], frame: 'variant' };
  if ((m = zdic.match(/^與([^。\s])同/))) return { X: m[1], frame: 'variant' };
  if ((m = zdic.match(/^俗([^。\s])字/))) return { X: m[1], frame: 'vulgar' };
  if ((m = zdic.match(/^註詳([^。\s])/))) return { X: m[1], frame: 'see' };
  if ((m = zdic.match(/^註見([^。\s])/))) return { X: m[1], frame: 'see' };
  return null;
}

function composeAPreamble(X, frame) {
  if (frame === 'vulgar') return `${X}之俗字`;
  if (frame === 'see') return `見${X}`;
  return `${X}之異體`;
}

// ── Citation helpers (P4 — no 《》 brackets, 、 separator) ──────────────
// Convert zdic's 【X】 bracket pattern → plain text with 、 separator.
function bracketsToCitations(text) {
  const matches = [...text.matchAll(/【([^】]+)】/g)];
  return matches.map(m => m[1]).join('、');
}

// Strip 《》 brackets from any citation string. Used for:
//   - Stripping brackets from Haiku-returned citations before assignment
//   - Migrating existing 803 entries' citation field (one-time pass)
// Returns plain-text comma-separated source list, or original if no brackets.
function stripBrackets(s) {
  if (!s) return s;
  const parts = [...s.matchAll(/《([^》]+)》/g)].map(m => m[1]);
  if (parts.length > 0) return parts.join('、');
  return s;
}

// Cross-reference pattern: MOE uses 參見「X」條 or 參見『X』條 instead of definitions
const CROSSREF_RE = /參見[「『][^」』]+[」』]/;

// ── Index loaders ───────────────────────────────────────────────────────
function loadUcIndex() {
  const arr = JSON.parse(fs.readFileSync(UC_PATH, 'utf8'));
  const byChar = new Map();
  const byCharRhyme = new Set();
  for (const e of arr) {
    if (!byChar.has(e.char)) byChar.set(e.char, []);
    byChar.get(e.char).push(e);
    byCharRhyme.add(`${e.char}::${e.rhyme}`);
  }
  return { arr, byChar, byCharRhyme };
}

function loadMoedictMap() {
  return JSON.parse(fs.readFileSync(MOE_PATH, 'utf8'));
}

// ── Haiku call ──────────────────────────────────────────────────────────
const tokenAcc = { in: 0, out: 0, searches: 0 };

async function callHaikuWebSearch(system, user, maxTokens = 2048) {
  if (DRY_RUN) {
    return { text: '{"found":false,"_dryrun":true}', usage: {}, searches: 0 };
  }
  const body = {
    model: HAIKU_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Haiku API ${res.status}: ${err.slice(0, 400)}`);
  }
  const data = await res.json();
  const textBlocks = (data.content || []).filter(c => c.type === 'text');
  const finalText = textBlocks.pop()?.text ?? '';
  const usage = data.usage ?? {};
  const searches = usage.server_tool_use?.web_search_requests ?? 0;
  tokenAcc.in += usage.input_tokens ?? 0;
  tokenAcc.out += usage.output_tokens ?? 0;
  tokenAcc.searches += searches;
  return { text: finalText, usage, searches };
}

function extractJson(text) {
  const matches = [...text.matchAll(/\{[\s\S]*?\}/g)];
  if (matches.length === 0) return null;
  const candidates = matches.map(m => m[0]).sort((a, b) => b.length - a.length);
  for (const c of candidates) {
    try { return JSON.parse(c); } catch {}
  }
  return null;
}

// Tracking: count Fix B firings (cross-ref or 2b miss → fell through to 2c)
const fixBStats = { triggered: 0, succeeded: 0 };
const p2Stats = { triggered: 0, succeeded: 0 };

// ── Pipelines ───────────────────────────────────────────────────────────
async function pipelineA(sample, fields, indices, moedict) {
  const { byChar } = indices;
  const sourcesTried = [];
  const pathTrace = [];
  const variant = extractVariantX(fields.zdicRaw);
  if (!variant) {
    return { skip: true, reason: 'Could not extract X from variant pattern', sourcesTried, pathTrace };
  }
  const { X, frame } = variant;
  const preamble = composeAPreamble(X, frame);
  pathTrace.push(`A1: extracted X=${X} (U+${X.codePointAt(0).toString(16)}) frame=${frame} → preamble="${preamble}"`);

  // 2a — Local JSON (char-only lookup, ignore rhyme)
  sourcesTried.push(`unique-char-content[${X}]`);
  if (byChar.has(X)) {
    const entries = byChar.get(X);
    const first = entries[0];
    pathTrace.push(`A2a: HIT in unique-char-content.json (${entries.length} rhyme entries; using first)`);
    const ret = {
      skip: false,
      proposed: {
        char: sample.char,
        rhyme: sample.rhyme,
        wenyan: `${preamble}。${first.wenyan}`,
        modern: first.modern || `同${X}`,
        source: 'audit-deref',
        source_url: `internal:char-${X}-uccontent`,
      },
      sourcesTried,
      pathTrace,
    };
    if (first.citation) ret.proposed.citation = stripBrackets(first.citation);
    return ret;
  }
  pathTrace.push('A2a: MISS in unique-char-content.json');

  // 2b — MOE (with Fix A dedup + Fix B cross-ref detection)
  sourcesTried.push(`moedict-map[${X}]`);
  let needsWeb = false;
  let fixBReason = null;
  if (moedict[X] && moedict[X].length > 0) {
    // Fix A: dedup by string equality before joining
    const uniqueDefs = [...new Set(moedict[X].map(s => s.trim()))];
    const moeMeaning = uniqueDefs.join('；');
    // Fix B: cross-reference fallthrough
    if (CROSSREF_RE.test(moeMeaning)) {
      pathTrace.push(`A2b: HIT but cross-ref ("${moeMeaning.slice(0, 40)}…") → falling through to web`);
      fixBStats.triggered++;
      needsWeb = true;
      fixBReason = 'crossref';
    } else {
      pathTrace.push(`A2b: HIT (${uniqueDefs.length} unique def${uniqueDefs.length === 1 ? '' : 's'})`);
      return {
        skip: false,
        proposed: {
          char: sample.char,
          rhyme: sample.rhyme,
          wenyan: `${preamble}。${moeMeaning}`,
          modern: `同${X}`,
          source: 'audit-deref',
          source_url: `internal:char-${X}-moedict`,
          citation: '重編國語辭典',
        },
        sourcesTried,
        pathTrace,
      };
    }
  } else {
    pathTrace.push('A2b: MISS in moedict-map');
    needsWeb = true;
    fixBReason = 'moe-miss';
  }

  // 2c — Haiku + web_search for X
  if (needsWeb) {
    sourcesTried.push('Haiku+web_search(漢語大詞典+教育部異體字字典)');
    pathTrace.push(`A2c: invoking Haiku+web_search for X (trigger=${fixBReason})`);
    const sys = `You are a classical Chinese lexicographer. Use Traditional Chinese in 文言文 output.`;
    const usr = `Search the classical meaning of character: ${X}

Search 漢語大詞典 and 教育部異體字字典 (dict.variants.moe.edu.tw) via web_search.

After searching, return strict JSON ONLY as the LAST thing in your reply (no other prose):
{
  "found": true|false,
  "meaning_classical": "...",
  "meaning_modern": "...",
  "citation": "...",
  "source_url": "..."
}

- meaning_classical ≤60 chars Traditional Chinese (文言文 phrasing)
- meaning_modern ≤60 chars modern Chinese gloss
- citation: name of source (e.g. "漢語大詞典"), no 《》 brackets, or "" if none
- No invented citations.`;
    const result = await callHaikuWebSearch(sys, usr);
    const json = extractJson(result.text);
    if (json && json.found) {
      fixBStats.succeeded++;
      pathTrace.push(`A2c: HIT via web_search (${result.searches} searches)`);
      const meaning = json.meaning_classical || json.meaning_modern || '';
      const cleanCite = stripBrackets(json.citation || '');
      return {
        skip: false,
        proposed: {
          char: sample.char,
          rhyme: sample.rhyme,
          wenyan: `${preamble}。${X}，${meaning}`,
          modern: json.meaning_modern || `同${X}`,
          source: 'audit-web',
          source_url: json.source_url || `internal:char-${X}-web`,
          citation: `网：${cleanCite || '未明'}`,
        },
        sourcesTried,
        pathTrace,
      };
    }
    pathTrace.push(`A2c: MISS (${result.searches} searches)`);
  }

  // A4: fall through to (e) for original char
  pathTrace.push('A4: falling through to (e) pipeline for original char');
  return await pipelineE(sample, fields, sourcesTried, pathTrace);
}

function pipelineB(sample, fields) {
  const sourcesTried = ['audit-zdic-raw'];
  const pathTrace = [];
  const labelMatch = fields.zdicRaw.match(/(人名|女字|男字)/);
  if (!labelMatch) {
    return { skip: true, reason: 'Could not extract name-use label', sourcesTried, pathTrace };
  }
  const label = labelMatch[1];
  pathTrace.push(`B1: name-use label=${label}`);
  const citation = bracketsToCitations(fields.zdicRaw);
  pathTrace.push(`B2: citation=${citation || '(none)'}`);
  const proposed = {
    char: sample.char,
    rhyme: sample.rhyme,
    wenyan: label,
    modern: label,
    source: 'audit-zdic-cite',
    source_url: `https://www.zdic.net/hans/${encodeURIComponent(sample.char)}`,
  };
  if (citation) proposed.citation = citation;
  return { skip: false, proposed, sourcesTried, pathTrace };
}

// (c) zdic-cite — bracket-prefixed 字書 entry. wenyan preserves 【】 brackets
// (matches existing #17 convention, see src/data/unique-char-content.json first
// entries). modern is designation-based when a recognized 名 designation appears,
// else empty. citation is the bracket-extract (plain text, 、 separator).
function pipelineC(sample, fields) {
  const sourcesTried = ['audit-zdic-raw'];
  const pathTrace = [];
  const citation = bracketsToCitations(fields.zdicRaw);
  pathTrace.push(`C1: citation=${citation || '(none)'}`);
  const desigRe = /(器名|木名|草名|蟲名|鳥名|魚名|魚屬|獸名|獸屬|山名|水名|地名|島名|港名|州名|關名|亭名)/;
  const desigMatch = fields.zdicRaw.match(desigRe);
  const modernMap = {
    '木名': '一種樹木',
    '器名': '一種器具',
    '草名': '一種草本植物',
    '蟲名': '一種昆蟲',
    '鳥名': '一種鳥類',
    '魚名': '一種魚類',
    '魚屬': '一種魚類',
    '獸名': '一種獸類',
    '獸屬': '一種獸類',
    '山名': '古地名（山）',
    '水名': '古地名（水）',
    '地名': '古地名',
    '島名': '古地名（島）',
    '港名': '古地名（港）',
    '州名': '古地名（州）',
    '關名': '古地名（關）',
    '亭名': '古地名（亭）',
  };
  const modern = desigMatch ? (modernMap[desigMatch[1]] || '') : '';
  pathTrace.push(`C2: designation=${desigMatch?.[1] || '(none)'}, modern="${modern}"`);
  // wenyan = raw zdic content, preserving 【】 (matches existing #17 entries)
  const proposed = {
    char: sample.char,
    rhyme: sample.rhyme,
    wenyan: fields.zdicRaw,
    modern,
    source: 'audit-zdic-cite',
    source_url: `https://www.zdic.net/hans/${encodeURIComponent(sample.char)}`,
  };
  if (citation) proposed.citation = citation;
  return { skip: false, proposed, sourcesTried, pathTrace };
}

// P2: (d) now has two-step formal→web fallback. Each step is a separate Haiku call.
async function pipelineD(sample, fields) {
  const sourcesTried = [];
  const pathTrace = ['D1: confirmed 義闕 in zdic'];

  // Step 1 — formal-tier search
  sourcesTried.push('Haiku+web_search(formal:漢語大詞典+教育部異體字字典+廣韻+集韻+康熙字典)');
  pathTrace.push('D2: formal-tier Haiku+web_search');
  const sysFormal = `You are a classical Chinese lexicographer. The zdic source shows "義闕" — semantics absent there. Search OTHER formal classical sources only. Use Traditional Chinese.`;
  const usrFormal = `Look up the classical meaning of character: ${sample.char}
平水韻 rhyme: ${sample.rhyme}

Search ONLY formal classical sources via web_search: 漢語大詞典, 教育部異體字字典 (dict.variants.moe.edu.tw), 廣韻 full text, 集韻 full text, 康熙字典 full text.

After searching, return strict JSON ONLY as the LAST thing in your reply:
{
  "found": true|false,
  "wenyan": "...",
  "modern": "...",
  "citation": "...",
  "source_url": "..."
}

- wenyan ≤80 chars Traditional Chinese
- modern ≤80 chars
- citation: name of source (e.g. "漢語大詞典"), no 《》 brackets, "" if none
- If nothing found in formal sources, set found:false
- No invented citations.`;
  const formalResult = await callHaikuWebSearch(sysFormal, usrFormal);
  const formalJson = extractJson(formalResult.text);
  if (formalJson && formalJson.found) {
    pathTrace.push(`D2: formal HIT (${formalResult.searches} searches)`);
    const proposed = {
      char: sample.char,
      rhyme: sample.rhyme,
      wenyan: formalJson.wenyan || '',
      modern: formalJson.modern || '',
      source: 'audit-external',
      source_url: formalJson.source_url || '',
    };
    const cite = stripBrackets(formalJson.citation || '');
    if (cite) proposed.citation = cite;
    return { skip: false, proposed, sourcesTried, pathTrace };
  }
  pathTrace.push(`D2: formal MISS (${formalResult.searches} searches)`);

  // Step 2 — web-tier fallback (SECOND Haiku call)
  p2Stats.triggered++;
  sourcesTried.push('Haiku+web_search(web:百度百科+Wiktionary EN+general)');
  pathTrace.push('D3: web-tier Haiku+web_search (P2 fallback)');
  const sysWeb = `You are a lexicographer. Formal classical sources had no entry for this character. Search NON-OFFICIAL web sources only. Use Traditional Chinese in wenyan.`;
  const usrWeb = `Look up any documented meaning for character: ${sample.char}
平水韻 rhyme: ${sample.rhyme}

Formal sources (漢語大詞典 etc.) returned nothing. Now search web_search: 百度百科 (baike.baidu.com), Wiktionary EN (en.wiktionary.org), and general web.

After searching, return strict JSON ONLY as the LAST thing in your reply:
{
  "found": true|false,
  "wenyan": "...",
  "modern": "...",
  "citation": "...",
  "source_url": "..."
}

- wenyan ≤80 chars Traditional Chinese
- modern ≤80 chars
- citation: name of source (e.g. "百度百科"), no 《》 brackets, "" if none
- If nothing found anywhere, set found:false
- No invented citations.`;
  const webResult = await callHaikuWebSearch(sysWeb, usrWeb);
  const webJson = extractJson(webResult.text);
  if (webJson && webJson.found) {
    p2Stats.succeeded++;
    pathTrace.push(`D3: web HIT (${webResult.searches} searches)`);
    const proposed = {
      char: sample.char,
      rhyme: sample.rhyme,
      wenyan: webJson.wenyan || '',
      modern: webJson.modern || '',
      source: 'audit-web',
      source_url: webJson.source_url || '',
    };
    const cite = stripBrackets(webJson.citation || '');
    proposed.citation = `网：${cite || '未明'}`;
    return { skip: false, proposed, sourcesTried, pathTrace };
  }
  pathTrace.push(`D3: web MISS (${webResult.searches} searches)`);
  return { skip: true, reason: 'No formal nor web source found content', sourcesTried, pathTrace };
}

async function pipelineE(sample, fields, sourcesTriedIn = [], pathTraceIn = []) {
  const sourcesTried = [...sourcesTriedIn];
  const pathTrace = [...pathTraceIn];
  pathTrace.push('E1: confirmed both zdic and Wiktionary empty');
  sourcesTried.push('Haiku+web_search(formal + non-official fallback)');
  pathTrace.push('E2: invoking Haiku+web_search with two-tier fallback');
  const sys = `You are a classical Chinese lexicographer searching for information on a rare 平水韻 character. Use Traditional Chinese in 文言文 output.`;
  const usr = `Character: ${sample.char}
平水韻 rhyme: ${sample.rhyme}
Context: Both zdic and Wiktionary returned no content. Search the web.

Two-tier search (try Tier A first; only fall back to Tier B if Tier A is empty):
- Tier A (formal): 漢語大詞典, 教育部異體字字典 (dict.variants.moe.edu.tw), 廣韻, 集韻, 康熙字典
- Tier B (non-official fallback): 百度百科, Wiktionary EN, general web

If this char is primarily a modern 擬聲詞/象聲詞 (onomatopoeia), set is_onomatopoeia:true and:
- DO NOT name the producer of the sound (FORBIDDEN: 牛叫, 狗叫, animal+叫聲 patterns, English "the sound a X makes")
- DESCRIBE the acoustic character only using descriptors: 低沉/高亢 (low/high), 拖長/短促 (sustained/abrupt), 沉鈍/清脆 (dull/sharp), 粗厲/柔和 (rough/smooth)
- Example pattern: wenyan="擬聲詞。狀低沉拖長之聲。", modern="象聲詞，模擬低沉悠長之鳴聲。"

After searching, return strict JSON ONLY as the LAST thing in your reply:
{
  "found": true|false,
  "source_tier": "formal" | "web" | "none",
  "wenyan": "...",
  "modern": "...",
  "citation": "...",
  "source_url": "...",
  "is_onomatopoeia": true|false
}

- wenyan ≤80 chars Traditional Chinese
- modern ≤80 chars
- citation: source name (e.g. "漢語大詞典", "百度百科"), no 《》 brackets, "" if none
- No invented citations.`;
  const result = await callHaikuWebSearch(sys, usr);
  const json = extractJson(result.text);
  if (!json || !json.found || json.source_tier === 'none') {
    pathTrace.push(`E2: MISS in both tiers (${result?.searches ?? 0} searches)`);
    return { skip: true, reason: 'No source found in formal or non-official', sourcesTried, pathTrace };
  }
  const source = json.source_tier === 'formal' ? 'audit-external' : 'audit-web';
  pathTrace.push(`E2: HIT tier=${json.source_tier} (${result.searches} searches)`);
  if (json.is_onomatopoeia) pathTrace.push('F: onomatopoeia overlay applied (acoustic-character framing)');
  const proposed = {
    char: sample.char,
    rhyme: sample.rhyme,
    wenyan: json.wenyan || '',
    modern: json.modern || '',
    source,
    source_url: json.source_url || '',
  };
  const cite = stripBrackets(json.citation || '');
  if (cite) {
    proposed.citation = source === 'audit-web' ? `网：${cite}` : cite;
  } else if (source === 'audit-web') {
    proposed.citation = '网：未明';
  }
  return { skip: false, proposed, isOnomatopoeia: json.is_onomatopoeia === true, sourcesTried, pathTrace };
}

// ── Dispatcher ──────────────────────────────────────────────────────────
async function processOne(sample, indices, moedict) {
  const audit = loadAuditFile(sample.rhyme);
  if (!audit.includes(sample.char)) {
    throw new Error(`CHAR FIDELITY FAIL: ${sample.char} (U+${sample.char.codePointAt(0).toString(16)}) not in audit file for ${sample.rhyme}`);
  }
  const block = extractEntryBlock(audit, sample.char, sample.rhyme);
  if (!block) throw new Error(`Entry block not found for ${sample.char} / ${sample.rhyme}`);
  const fields = parseEntryFields(block);
  const actualSub = classifySubCase(fields);

  let result;
  try {
    if (actualSub === 'a') result = await pipelineA(sample, fields, indices, moedict);
    else if (actualSub === 'b') result = pipelineB(sample, fields);
    else if (actualSub === 'c') result = pipelineC(sample, fields);
    else if (actualSub === 'd') result = await pipelineD(sample, fields);
    else if (actualSub === 'e') result = await pipelineE(sample, fields);
    else result = { skip: true, reason: 'Sub-case unclassified', sourcesTried: [], pathTrace: [] };
  } catch (e) {
    result = { skip: true, reason: `Pipeline error: ${e.message}`, sourcesTried: [], pathTrace: [] };
  }

  return {
    sample,
    block,
    fields,
    actualSub,
    effectiveSub: result.isOnomatopoeia ? 'f' : actualSub,
    ...result,
  };
}

// ── Migration: strip 《》 from existing entries' citation field ────────
function migrateExistingCitations(arr) {
  let migrated = 0;
  for (const entry of arr) {
    if (entry.citation) {
      const original = entry.citation;
      const newCit = stripBrackets(original);
      if (newCit !== original) {
        entry.citation = newCit;
        migrated++;
      }
    }
  }
  return migrated;
}

// ── Verification gates ──────────────────────────────────────────────────
function runVerificationGates(results, finalJsonArr, newShipsCount) {
  const fails = [];
  const passes = [];

  // Gate 1 — char-fidelity (already enforced at processOne; reconfirm)
  let g1ok = true;
  for (const r of results) {
    try {
      const audit = loadAuditFile(r.sample.rhyme);
      if (!audit.includes(r.sample.char)) {
        fails.push(`Gate 1 (char-fidelity): ${r.sample.char} not in ${r.sample.rhyme} audit file`);
        g1ok = false;
      }
    } catch (e) {
      fails.push(`Gate 1 (char-fidelity): ${e.message}`);
      g1ok = false;
    }
  }
  if (g1ok) passes.push(`Gate 1 (char-fidelity): PASS — all ${results.length} chars verbatim in source files`);

  // Gate 2 — onomatopoeia guard on proposed (f) JSON
  const fEntries = results.filter(r => !r.skip && r.effectiveSub === 'f');
  let g2ok = true;
  for (const f of fEntries) {
    const blob = JSON.stringify(f.proposed);
    if (/牛|cow|叫聲/.test(blob)) {
      fails.push(`Gate 2 (onomatopoeia): ${f.sample.char}/${f.sample.rhyme} proposed contains forbidden producer-framing: "${blob.slice(0, 100)}"`);
      g2ok = false;
    }
  }
  if (g2ok) passes.push(`Gate 2 (onomatopoeia guard): PASS — ${fEntries.length} (f) entries clean`);

  // Gate 3 — schema shape (all proposed + all new entries in JSON)
  const REQUIRED = ['char', 'rhyme', 'wenyan', 'source', 'source_url', 'extracted_at'];
  let g3ok = true;
  let g3Total = 0;
  for (const r of results) {
    if (r.skip) continue;
    g3Total++;
    const e = r.proposed;
    for (const k of REQUIRED) {
      if (!(k in e) || e[k] == null) {
        fails.push(`Gate 3 (schema): ${e.char || '?'}/${e.rhyme || '?'} missing field '${k}'`);
        g3ok = false;
      }
    }
    if (!('modern' in e)) {
      fails.push(`Gate 3 (schema): ${e.char || '?'}/${e.rhyme || '?'} missing 'modern' (may be empty string but must exist)`);
      g3ok = false;
    }
  }
  if (g3ok) passes.push(`Gate 3 (schema): PASS — ${g3Total} proposed entries valid`);

  // Gate 4 — bracket migration: zero 《》 in citation values across whole file
  let g4ok = true;
  let g4Hits = 0;
  for (const e of finalJsonArr) {
    if (e.citation && (e.citation.includes('《') || e.citation.includes('》'))) {
      g4Hits++;
      if (g4Hits <= 3) fails.push(`Gate 4 (bracket-migration): ${e.char}/${e.rhyme} citation still has 《》: "${e.citation}"`);
    }
  }
  if (g4Hits > 0) {
    fails.push(`Gate 4 (bracket-migration): ${g4Hits} entries still have 《》 in citation`);
    g4ok = false;
  } else {
    passes.push(`Gate 4 (bracket-migration): PASS — zero 《》 in any citation across ${finalJsonArr.length} entries`);
  }

  // Gate 5 — 网：prefix audit
  let g5ok = true;
  let g5WebMissingPrefix = 0;
  let g5NonWebHasPrefix = 0;
  for (const e of finalJsonArr) {
    if (!e.citation) continue;
    const hasPrefix = e.citation.startsWith('网：');
    if (e.source === 'audit-web' && !hasPrefix) {
      g5WebMissingPrefix++;
      if (g5WebMissingPrefix <= 3) fails.push(`Gate 5 (网：): ${e.char}/${e.rhyme} source=audit-web but citation="${e.citation}" lacks 网： prefix`);
    } else if (e.source !== 'audit-web' && hasPrefix) {
      g5NonWebHasPrefix++;
      if (g5NonWebHasPrefix <= 3) fails.push(`Gate 5 (网：): ${e.char}/${e.rhyme} source=${e.source} but citation="${e.citation}" has 网： prefix`);
    }
  }
  if (g5WebMissingPrefix > 0 || g5NonWebHasPrefix > 0) {
    g5ok = false;
    fails.push(`Gate 5 (网：): ${g5WebMissingPrefix} audit-web missing prefix, ${g5NonWebHasPrefix} non-web with prefix`);
  } else {
    const webCount = finalJsonArr.filter(e => e.source === 'audit-web' && e.citation).length;
    passes.push(`Gate 5 (网：prefix): PASS — ${webCount} audit-web entries prefixed; non-web entries unprefixed`);
  }

  // Gate 6 — no-duplicate audit (proposed new ships vs existing)
  // Already enforced during append; verify post-hoc by counting unique pairs.
  const seen = new Set();
  let g6dupes = 0;
  for (const e of finalJsonArr) {
    const k = `${e.char}::${e.rhyme}`;
    if (seen.has(k)) {
      g6dupes++;
      if (g6dupes <= 3) fails.push(`Gate 6 (no-dup): duplicate ${e.char}/${e.rhyme}`);
    }
    seen.add(k);
  }
  let g6ok = true;
  if (g6dupes > 0) {
    g6ok = false;
    fails.push(`Gate 6 (no-dup): ${g6dupes} (char, rhyme) duplicates in final JSON`);
  } else {
    passes.push(`Gate 6 (no-duplicates): PASS — ${seen.size} unique (char,rhyme) pairs`);
  }

  return { passes, fails, allOk: g1ok && g2ok && g3ok && g4ok && g5ok && g6ok };
}

// ── Sidecar writer ──────────────────────────────────────────────────────
function writeSidecar(results, meta, supersededNote = null) {
  const distrib = results.reduce((acc, r) => {
    acc[r.effectiveSub] = (acc[r.effectiveSub] || 0) + 1;
    return acc;
  }, {});
  const distribStr = ['a','b','c','d','e','f','unknown']
    .filter(k => distrib[k])
    .map(k => `(${k}) ${distrib[k]}`)
    .join(' / ');
  const shipCount = results.filter(r => !r.skip).length;
  const skipCount = results.filter(r => r.skip).length;

  const lines = [];
  lines.push(`# Triage ${MODE === 'all' ? 'batch' : 'pilot'} — ${MODE === 'all' ? 'all 104 LOW entries' : '10-char sample'} from #17 LOW audit batch`);
  lines.push('');
  lines.push(`Generated ${new Date().toISOString()}.`);
  if (supersededNote) {
    lines.push('');
    lines.push(supersededNote);
  }
  lines.push('');
  lines.push(`## Summary`);
  lines.push(`- Total processed: ${results.length}`);
  lines.push(`- Distribution: ${distribStr}`);
  lines.push(`- Ship: ${shipCount}`);
  lines.push(`- Skip: ${skipCount}`);
  lines.push(`- Estimated cost: $${meta.totalCostUSD}  (haiku=$${meta.haikuCostUSD}, web_search=$${meta.searchCostUSD})`);
  lines.push(`- Tokens: in=${meta.tokensIn} out=${meta.tokensOut}; web_searches=${meta.searches}`);
  lines.push(`- Wall time: ${meta.wallSec}s`);
  if (MODE === 'all') {
    lines.push(`- Fix B firings: ${fixBStats.triggered} triggered, ${fixBStats.succeeded} succeeded`);
    lines.push(`- P2 (d-web-fallback) firings: ${p2Stats.triggered} triggered, ${p2Stats.succeeded} succeeded`);
    if (meta.migratedCount != null) {
      lines.push(`- Existing-entry citation migration: ${meta.migratedCount} entries had 《》 stripped`);
    }
  }
  lines.push('');

  results.forEach((r, i) => {
    lines.push(`## Entry ${i+1} — ${r.sample.char} / ${r.sample.rhyme} — sub-case (${r.effectiveSub})`);
    lines.push('');
    lines.push(`### Original audit-batch entry (verbatim)`);
    lines.push('');
    lines.push('```');
    lines.push(r.block);
    lines.push('```');
    lines.push('');
    lines.push(`### Enrichment process`);
    lines.push('');
    lines.push(`- Sub-case classified: (${r.actualSub})${r.effectiveSub !== r.actualSub ? ` → (${r.effectiveSub}) overlay` : ''}`);
    lines.push(`- Sources tried: ${r.sourcesTried.join(' → ') || '(none)'}`);
    lines.push(`- Pipeline path:`);
    for (const step of r.pathTrace) lines.push(`  - ${step}`);
    lines.push('');
    if (r.skip) {
      lines.push(`### SKIPPED`);
      lines.push('');
      lines.push(`Reason: ${r.reason}`);
      lines.push('');
    } else {
      lines.push(`### Proposed entry`);
      lines.push('');
      lines.push('```json');
      lines.push(JSON.stringify(r.proposed, null, 2));
      lines.push('```');
      lines.push('');
    }
    lines.push(`### Verdict (auto-applied by script)`);
    lines.push('');
    if (r.skip) {
      lines.push(`- [ ] Ship`);
      lines.push(`- [x] Skip (auto-skipped — no source found)`);
      lines.push(`- [ ] Override / discussion needed: ___________`);
    } else {
      lines.push(`- [x] Ship (auto-applied to unique-char-content.json)`);
      lines.push(`- [ ] Skip`);
      lines.push(`- [ ] Override / discussion needed: ___________`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  lines.push(`## Pipeline edge cases observed`);
  lines.push('');
  const edgeNotes = [];
  for (const r of results) {
    if (r.actualSub === 'unknown') {
      edgeNotes.push(`- ${r.sample.char} / ${r.sample.rhyme}: classifier returned 'unknown' for zdic="${r.fields?.zdicRaw?.slice(0, 60) || '?'}…"`);
    }
  }
  if (fixBStats.triggered > 0) {
    edgeNotes.push(`- Fix B (Cross-ref/MOE-miss → web_search) fired ${fixBStats.triggered} times; ${fixBStats.succeeded} produced ship-worthy content via web`);
  }
  if (p2Stats.triggered > 0) {
    edgeNotes.push(`- P2 (d formal-miss → web fallback) fired ${p2Stats.triggered} times; ${p2Stats.succeeded} produced ship-worthy content via web`);
  }
  if (edgeNotes.length === 0) {
    lines.push(`No edge cases.`);
  } else {
    lines.push(...edgeNotes);
  }
  lines.push('');

  fs.writeFileSync(SIDECAR_PATH, lines.join('\n'));
}

// ── Main ────────────────────────────────────────────────────────────────
async function main() {
  console.log(`triage-audit-batch.mjs — mode=${MODE}${DRY_RUN ? ' [DRY_RUN]' : ''}`);

  const indices = loadUcIndex();
  const moedict = loadMoedictMap();
  console.log(`Loaded ${indices.byChar.size} unique chars from unique-char-content.json (${indices.arr.length} entries)`);
  console.log(`Loaded ${Object.keys(moedict).length} moedict entries`);

  const work = MODE === 'pilot' ? PILOT_SAMPLE : discoverAllLowEntries();
  console.log(`Processing ${work.length} entries`);

  if (DRY_RUN) {
    // Classify all and report distribution + estimated cost
    const distrib = {};
    for (const sample of work) {
      try {
        const audit = loadAuditFile(sample.rhyme);
        const block = extractEntryBlock(audit, sample.char, sample.rhyme);
        const fields = parseEntryFields(block);
        const sub = classifySubCase(fields);
        distrib[sub] = (distrib[sub] || 0) + 1;
      } catch (e) {
        distrib.error = (distrib.error || 0) + 1;
      }
    }
    console.log(`\nDRY_RUN classification:`);
    for (const k of Object.keys(distrib).sort()) console.log(`  (${k}): ${distrib[k]}`);
    // Cost estimate: (a)+(b)+(c) ~ no API; (d) ~1-2 calls; (e) ~1 call
    const webCalls = (distrib.d || 0) * 1.5 + (distrib.e || 0) * 1 + (distrib.a || 0) * 0.3 /* Fix B firings */;
    const estSearches = webCalls * 3;
    const estCostHaiku = webCalls * (1500 * 0.80 + 250 * 4.00) / 1e6;
    const estCostSearch = estSearches * 0.01;
    console.log(`\nEstimated API calls: ~${webCalls.toFixed(1)}`);
    console.log(`Estimated searches: ~${estSearches.toFixed(0)}`);
    console.log(`Estimated cost: ~$${(estCostHaiku + estCostSearch).toFixed(2)} (haiku ~$${estCostHaiku.toFixed(2)}, search ~$${estCostSearch.toFixed(2)})`);
    return;
  }

  const start = Date.now();
  const results = [];

  for (let i = 0; i < work.length; i++) {
    const sample = work[i];
    console.log(`\n[${i+1}/${work.length}] ${sample.char} (U+${sample.char.codePointAt(0).toString(16)}) / ${sample.rhyme}`);
    const r = await processOne(sample, indices, moedict);
    if (r.skip) console.log(`  → SKIP (${r.reason})`);
    else if (r.proposed) {
      r.proposed.extracted_at = new Date().toISOString();
      const w = r.proposed.wenyan || '';
      console.log(`  → SHIP source=${r.proposed.source} wenyan="${w.slice(0, 40)}${w.length > 40 ? '…' : ''}"`);
    }
    results.push(r);
  }

  const wallSec = ((Date.now() - start) / 1000).toFixed(1);
  const haikuCostUSD = (tokenAcc.in / 1e6 * 0.80 + tokenAcc.out / 1e6 * 4.00);
  const searchCostUSD = (tokenAcc.searches / 1000 * 10);
  const totalCostUSD = (haikuCostUSD + searchCostUSD);

  // ── Apply ships to unique-char-content.json + migrate existing ──
  let migratedCount = null;
  let appliedCount = 0;
  let duplicatesSkipped = 0;
  if (MODE === 'all') {
    console.log(`\n─── Applying ships + migrating existing citations ───`);
    const existing = indices.arr; // shared array
    for (const r of results) {
      if (r.skip || !r.proposed) continue;
      const key = `${r.proposed.char}::${r.proposed.rhyme}`;
      if (indices.byCharRhyme.has(key)) {
        console.warn(`  DUPLICATE: ${key} already exists; skipping`);
        duplicatesSkipped++;
        continue;
      }
      existing.push(r.proposed);
      indices.byCharRhyme.add(key);
      appliedCount++;
    }
    migratedCount = migrateExistingCitations(existing);
    console.log(`Ships appended: ${appliedCount} (duplicates skipped: ${duplicatesSkipped})`);
    console.log(`Existing citations migrated (《》 stripped): ${migratedCount}`);
  }

  // ── Sidecar ──
  writeSidecar(results, {
    wallSec,
    haikuCostUSD: haikuCostUSD.toFixed(4),
    searchCostUSD: searchCostUSD.toFixed(4),
    totalCostUSD: totalCostUSD.toFixed(4),
    tokensIn: tokenAcc.in,
    tokensOut: tokenAcc.out,
    searches: tokenAcc.searches,
    migratedCount,
  }, MODE === 'all' ? `Supersedes pilot sidecar at \`data/audit/triage-pilot-2026-05-17.md\` (kept on disk as audit history).` : null);

  // ── Verification gates ──
  const gateResult = runVerificationGates(results, indices.arr, appliedCount);
  console.log(`\n─── Verification gates ───`);
  for (const p of gateResult.passes) console.log(`  ✓ ${p}`);
  for (const f of gateResult.fails) console.log(`  ✗ ${f}`);

  // ── JSON write (only if gates pass) ──
  if (MODE === 'all') {
    if (!gateResult.allOk) {
      console.error(`\nVERIFICATION FAILED — aborting JSON write. unique-char-content.json NOT modified.`);
      process.exit(2);
    }
    fs.writeFileSync(UC_PATH, JSON.stringify(indices.arr, null, 2));
    const size = fs.statSync(UC_PATH).size;
    console.log(`\nWrote ${UC_PATH} (${size} bytes, ${indices.arr.length} entries)`);

    // Optional stats file
    const stats = {
      generated_at: new Date().toISOString(),
      total_processed: results.length,
      distribution: results.reduce((acc, r) => { acc[r.effectiveSub] = (acc[r.effectiveSub] || 0) + 1; return acc; }, {}),
      ship: results.filter(r => !r.skip).length,
      skip: results.filter(r => r.skip).length,
      ships_applied: appliedCount,
      duplicates_skipped: duplicatesSkipped,
      migrated_existing_citations: migratedCount,
      cost: {
        haiku_usd: parseFloat(haikuCostUSD.toFixed(4)),
        web_search_usd: parseFloat(searchCostUSD.toFixed(4)),
        total_usd: parseFloat(totalCostUSD.toFixed(4)),
      },
      tokens: { in: tokenAcc.in, out: tokenAcc.out, web_searches: tokenAcc.searches },
      wall_sec: parseFloat(wallSec),
      fix_b: fixBStats,
      p2_d_web_fallback: p2Stats,
      verification_gates: { all_passed: gateResult.allOk, passes: gateResult.passes.length, fails: gateResult.fails.length },
    };
    fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2));
    console.log(`Wrote ${STATS_PATH}`);
  }

  const shipCount = results.filter(r => !r.skip).length;
  const skipCount = results.filter(r => r.skip).length;
  console.log(`\n─────────────────────────────────────────────────────`);
  console.log(`Sidecar: ${SIDECAR_PATH}`);
  console.log(`Wall time: ${wallSec}s`);
  console.log(`Tokens: in=${tokenAcc.in} out=${tokenAcc.out}; searches=${tokenAcc.searches}`);
  console.log(`Cost: $${totalCostUSD.toFixed(4)} (haiku=$${haikuCostUSD.toFixed(4)}, web_search=$${searchCostUSD.toFixed(4)})`);
  console.log(`Ship: ${shipCount}, Skip: ${skipCount}`);
  if (MODE === 'all') {
    console.log(`Fix B firings: ${fixBStats.triggered} (${fixBStats.succeeded} succeeded)`);
    console.log(`P2 firings: ${p2Stats.triggered} (${p2Stats.succeeded} succeeded)`);
    console.log(`Existing citations migrated: ${migratedCount}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
