#!/usr/bin/env node
// Wenyan pairing — 2-char classical hint generation (batched).
//
// Reads src/data/wenyan/poems.json, sends a batch of vocab entries to Haiku
// for 2-char classical-register hint generation, appends results to
// src/data/wenyan/pairing-hints.json (sidecar — NOT a canonical merge).
//
// Source field for hint derivation: ancientMeaning (NOT modernMeaning).
// modernMeaning + notes shown as supplementary context only.
//
// Usage:
//   node scripts/wenyan-batch-hints.mjs --batch=1
//   node scripts/wenyan-batch-hints.mjs --batch=2
//   ...
//   node scripts/wenyan-batch-hints.mjs --batch=5
//   DRY_RUN=1 node scripts/wenyan-batch-hints.mjs --batch=1   # preview only, no API call
//
// Batch → poems mapping:
//   Batch 1: poems[0..2]   (zhang-jiuling-ganyu-1 / -2 / -3)
//   Batch 2: poems[3..5]
//   Batch 3: poems[6..8]
//   Batch 4: poems[9..11]
//   Batch 5: poems[12..14]
//
// Per-entry corrections delivered post-batch via chat are applied by
// re-running the script with --correct=<json-string> OR manually
// editing the sidecar.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ── Env loading (shell wins over server/.env placeholder) ───────────────
const envPath = path.join(ROOT, 'server', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

// ── Constants ───────────────────────────────────────────────────────────
const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
const apiKey = process.env.ANTHROPIC_API_KEY;
const POEMS_PATH = path.join(ROOT, 'src/data/wenyan/poems.json');
const SIDECAR_PATH = path.join(ROOT, 'src/data/wenyan/pairing-hints.json');

const args = process.argv.slice(2);
const argMap = {};
for (const a of args) {
  const m = a.match(/^--([^=]+)=(.+)$/);
  if (m) argMap[m[1]] = m[2];
}
const BATCH = parseInt(argMap.batch, 10);
const DRY_RUN = process.env.DRY_RUN === '1';
if (!BATCH || BATCH < 1 || BATCH > 5) {
  console.error('Usage: node scripts/wenyan-batch-hints.mjs --batch=<1-5> [DRY_RUN=1]');
  process.exit(1);
}
if (!DRY_RUN && !apiKey) {
  console.error('ANTHROPIC_API_KEY required (set in server/.env or process env)');
  process.exit(1);
}

const BATCH_RANGES = {
  1: [0, 2],
  2: [3, 5],
  3: [6, 8],
  4: [9, 11],
  5: [12, 14],
};
const [poemStart, poemEnd] = BATCH_RANGES[BATCH];

// ── Load poems + extract batch entries ─────────────────────────────────
const poemsData = JSON.parse(fs.readFileSync(POEMS_PATH, 'utf8'));
const batchPoems = poemsData.poems.slice(poemStart, poemEnd + 1);

const batchEntries = [];
for (const p of batchPoems) {
  for (const v of (p.vocabulary || [])) {
    batchEntries.push({
      poemId: p.id,
      word: v.word,
      pinyin: v.pinyin,
      senseSlug: v.senseSlug,
      ancientMeaning: v.ancientMeaning,
      modernMeaning: v.modernMeaning,
      notes: v.notes,
    });
  }
}

console.log(`Batch ${BATCH}: poems ${poemStart+1}-${poemEnd+1} (${batchPoems.map(p => p.id).join(', ')})`);
console.log(`Entries: ${batchEntries.length}`);

// ── Haiku prompt ────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a Chinese vocabulary lexicographer. For each 文言 (classical) word, produce a 2-character pairing in literary modern Mandarin — a word a contemporary writer would use in formal/classical-flavored prose, NOT vernacular speech.

Hard rules:
- Output exactly 2 Chinese characters.
- Register target: literary modern Mandarin. Slightly classical flavor preferred. Examples of the target register: 逸士 (not 隐居者), 几何 (not 多少), 蓬门 (not 草屋), 至诚 (not 真心), 黎明 (not 早上).
- AVOID modern colloquial / spoken vocabulary in the output.
- AVOID excessive 文言 words that no contemporary reader uses. The pairing should still read as modern Chinese, just elevated.
- Preserve the semantic core of the 文言 word's classical meaning.
- If multiple senses exist, pick the one most central to classical poetry usage.

Proper-noun rule (typonyms / 典故 / place names / historical figures): for entries where no literal modern equivalent exists, produce an ADJACENT CLASSICAL DESCRIPTOR that captures the entity's category or function. Avoid bare same-word echoes (e.g. 龙城 → 龙城 is WRONG). Avoid vague generic terms (e.g. 阴山 → 山脉 is too generic). The pairing should be specific enough that a learner can match it back to the source.

The primary source for the classical sense is ancientMeaning. modernMeaning is supplementary context — often it explicitly says "现代汉语不使用此词" or describes a divergent modern sense; in those cases derive the pairing from ancientMeaning alone. notes is contextual annotation; use it for disambiguation but never as the primary source.

Concrete reference points (文言 word → literary-modern 2-char pairing). These are user-confirmed pairings from Batches 1-3 and define the register target for all subsequent batches:
- 林栖者 (山林隐士) → 隐者
- 美人 (德高位重的人) → 贤人
- 忘机 (忘却机心) → 恬淡
- 坐 (副词，表示原因) → 所以
- 华 (同「花」) → 鲜花
- 幽人 (真正的隐士) → 逸士
- 知多少 (不知有多少) → 几何
- 荆扉 (荆条编门，比喻农家) → 蓬门
- 至精 (至极的精诚) → 至诚
- 晓 (早晨；天刚亮) → 黎明
- 持此 (持守这种心境) → 恪守
- 谢 (辞别) → 作别
- 闻 (听见) → 听闻
- 啼鸟 (鸟啼) → 鸟啼
- 教 (causative 使/让 sense, not 教导) → 任凭

Proper-noun pattern (典故 / place names — adjacent descriptors, not bare echoes):
- 龙城 (匈奴祭祀龙神的城池) → 王庭
- 飞将 (汉代名将李广) → 将领
- 阴山 (阴山山脉) → 北岭
- 香炉 (庐山香炉峰) → 香鼎

Literary-register reinforcement (Batch 3 highlights):
- 千里目 (目力可达千里) → 眺望
- 飞流直下 (瀑布似飞落) → 飞瀑
- 九天 (九重天) → 九霄
- 万里长征 (远征边塞) → 征伐
- 紫烟 (光照水汽折射) → 云霞

Literary-register reinforcement (Batch 4 highlights):
- 异客 (人在异乡做客) → 旅客
- 故人 (老朋友) → 故交
- 烟花 (春日柳絮繁花) → 春色
- 孤帆 (孤独的帆船) → 扁舟
- 之 (动词，往；去) → 前去

Return strict JSON ONLY as the LAST thing in your reply (no other prose):
{
  "hints": [
    { "poemId": "...", "senseSlug": "...", "word": "...", "hint": "..", "confidence": "high"|"medium"|"low", "note": "..." },
    ...
  ]
}
- confidence: "high" if pairing is unambiguous; "medium" if there's an interpretive choice (multi-sense, context-dependent); "low" if the 文言 word resists 2-char modern pairing and the hint is a best-effort approximation.
- note: short reason (max 30 chars) ONLY for medium / low entries. Skip / omit for high entries.
- Echo back poemId and senseSlug exactly as given (they are the join keys).`;

const formatEntry = (e) => {
  const parts = [
    `- poemId: ${e.poemId}`,
    `  senseSlug: ${e.senseSlug}`,
    `  word: ${e.word}`,
    `  pinyin: ${e.pinyin}`,
    `  ancientMeaning (PRIMARY SOURCE): ${e.ancientMeaning}`,
  ];
  if (e.modernMeaning) parts.push(`  modernMeaning (context): ${e.modernMeaning}`);
  if (e.notes) parts.push(`  notes (context): ${e.notes}`);
  return parts.join('\n');
};

const USER_PROMPT = `Convert these ${batchEntries.length} vocab entries to 2-char classical hints.\n\n${batchEntries.map(formatEntry).join('\n\n')}`;

// ── Haiku call ──────────────────────────────────────────────────────────
async function callHaiku() {
  if (DRY_RUN) {
    console.log('\n── DRY_RUN: prompt preview ──');
    console.log('SYSTEM:', SYSTEM_PROMPT.slice(0, 200) + '...');
    console.log('USER:', USER_PROMPT.slice(0, 600) + '\n...\n[total user prompt: ' + USER_PROMPT.length + ' chars]');
    return null;
  }
  const body = {
    model: HAIKU_MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: USER_PROMPT }],
  };
  const startMs = Date.now();
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
  const text = (data.content || []).filter(c => c.type === 'text').pop()?.text ?? '';
  const usage = data.usage ?? {};
  const wallMs = Date.now() - startMs;
  return { text, usage, wallMs };
}

function extractJson(text) {
  // Prefer the LAST top-level JSON object (handles models that emit reasoning prose then JSON).
  const matches = [...text.matchAll(/\{[\s\S]*?\}/g)];
  if (matches.length === 0) return null;
  // Look specifically for object containing "hints" key
  for (let i = matches.length - 1; i >= 0; i--) {
    if (matches[i][0].includes('"hints"')) {
      // Find the full extent by expanding to a balanced object
      const startIdx = text.indexOf(matches[i][0]);
      // Walk forward counting braces
      let depth = 0;
      for (let j = startIdx; j < text.length; j++) {
        if (text[j] === '{') depth++;
        else if (text[j] === '}') {
          depth--;
          if (depth === 0) {
            const candidate = text.slice(startIdx, j + 1);
            try { return JSON.parse(candidate); } catch {}
          }
        }
      }
    }
  }
  // Fallback: try each match
  const candidates = matches.map(m => m[0]).sort((a, b) => b.length - a.length);
  for (const c of candidates) {
    try { return JSON.parse(c); } catch {}
  }
  return null;
}

// ── Sidecar I/O ─────────────────────────────────────────────────────────
function loadSidecar() {
  if (!fs.existsSync(SIDECAR_PATH)) {
    return { generated_at: null, model: HAIKU_MODEL, hints: [] };
  }
  return JSON.parse(fs.readFileSync(SIDECAR_PATH, 'utf8'));
}

function writeSidecar(sidecar) {
  fs.writeFileSync(SIDECAR_PATH, JSON.stringify(sidecar, null, 2));
}

// ── Main ────────────────────────────────────────────────────────────────
async function main() {
  const result = await callHaiku();
  if (!result) return; // DRY_RUN

  const json = extractJson(result.text);
  if (!json || !Array.isArray(json.hints)) {
    console.error('Failed to parse Haiku JSON response.');
    console.error('Raw text (last 1500 chars):', result.text.slice(-1500));
    process.exit(2);
  }

  // Validate each hint
  const valid = [];
  const invalid = [];
  for (const h of json.hints) {
    if (!h.poemId || !h.senseSlug || !h.word || !h.hint) {
      invalid.push({ ...h, reason: 'missing required field' });
      continue;
    }
    if ([...h.hint].length !== 2) {
      invalid.push({ ...h, reason: `hint not 2 chars (got ${[...h.hint].length}: "${h.hint}")` });
      continue;
    }
    const expected = batchEntries.find(e => e.senseSlug === h.senseSlug);
    if (!expected) {
      invalid.push({ ...h, reason: 'senseSlug not in batch' });
      continue;
    }
    valid.push({
      poemId: h.poemId,
      senseSlug: h.senseSlug,
      word: h.word,
      hint: h.hint,
      confidence: h.confidence || 'medium',
      ...(h.note ? { note: h.note } : {}),
    });
  }

  // Check coverage
  const seenSlugs = new Set(valid.map(h => h.senseSlug));
  const missing = batchEntries.filter(e => !seenSlugs.has(e.senseSlug));

  // Sidecar merge: replace existing entries for same senseSlug, preserve corrected_by entries
  const sidecar = loadSidecar();
  const existingBySlug = new Map(sidecar.hints.map(h => [h.senseSlug, h]));
  for (const v of valid) {
    const existing = existingBySlug.get(v.senseSlug);
    if (existing && existing.corrected_by === 'user') {
      // Don't overwrite user-corrected entries from a re-run
      console.log(`  Preserving user correction for ${v.senseSlug}: ${existing.hint} (vs new LLM: ${v.hint})`);
      continue;
    }
    existingBySlug.set(v.senseSlug, v);
  }
  sidecar.hints = [...existingBySlug.values()];
  sidecar.generated_at = new Date().toISOString();
  sidecar.model = HAIKU_MODEL;
  writeSidecar(sidecar);

  // Cost summary
  const ti = result.usage.input_tokens ?? 0;
  const to = result.usage.output_tokens ?? 0;
  const cost = (ti / 1e6 * 0.80 + to / 1e6 * 4.00);
  const wallSec = (result.wallMs / 1000).toFixed(1);

  // ── Report (sorted low → medium → high) ──
  const orderRank = { low: 0, medium: 1, high: 2 };
  const sorted = [...valid].sort((a, b) => (orderRank[a.confidence] ?? 1) - (orderRank[b.confidence] ?? 1));

  console.log(`\n## Batch ${BATCH} — hints generated for poems ${batchPoems.map(p => p.id).join(', ')}\n`);
  console.log(`| senseSlug | word | ancientMeaning (truncated) | hint | conf | note |`);
  console.log(`|-----------|------|---------------------------|------|------|------|`);
  for (const h of sorted) {
    const src = batchEntries.find(e => e.senseSlug === h.senseSlug);
    const am = (src?.ancientMeaning ?? '').slice(0, 36);
    const am_trunc = (src?.ancientMeaning ?? '').length > 36 ? am + '…' : am;
    console.log(`| ${h.senseSlug} | ${h.word} | ${am_trunc} | **${h.hint}** | ${h.confidence} | ${h.note ?? ''} |`);
  }

  console.log(`\nValid: ${valid.length} / ${batchEntries.length}`);
  if (invalid.length > 0) {
    console.log(`\nInvalid (${invalid.length}):`);
    for (const i of invalid) console.log(`  - ${i.senseSlug || '?'}: ${i.reason}`);
  }
  if (missing.length > 0) {
    console.log(`\nMissing (${missing.length}):`);
    for (const m of missing) console.log(`  - ${m.senseSlug} (${m.word})`);
  }

  console.log(`\nCost: $${cost.toFixed(4)} (in=${ti} out=${to} tokens)`);
  console.log(`Wall: ${wallSec}s`);
  console.log(`Sidecar updated: ${SIDECAR_PATH}`);
  console.log(`Total hints in sidecar now: ${sidecar.hints.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
