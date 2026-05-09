// #14 — Fill MOE coverage gap via LLM (Path C).
// Generates Traditional Chinese glosses for the ~3,541 CC-CEDICT English entries
// in drill4-corpus.json using claude-haiku-4-5-20251001.
//
// Usage:
//   node scripts/llm-gen-drill4-glosses.mjs            # generate all glosses
//   node scripts/llm-gen-drill4-glosses.mjs --merge    # merge progress into corpus
//   node scripts/llm-gen-drill4-glosses.mjs --sample   # print 30 random samples
//   node scripts/llm-gen-drill4-glosses.mjs --dry-run  # generate first 10 only (test)
//
// Requires: ANTHROPIC_API_KEY in env
// Progress: /tmp/llm-gen-progress.jsonl (resumable — already-done entries skipped)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CORPUS_PATH   = path.resolve(__dirname, '../src/data/pingshui/drill4-corpus.json');
const META_PATH     = path.resolve(__dirname, '../src/data/pingshui/drill4-corpus-meta.json');
const PROGRESS_PATH = '/tmp/llm-gen-progress.jsonl';
const PROMPT_VERSION = 'v3';
const MODEL = 'claude-haiku-4-5-20251001';
const DELAY_MS = 250;

const SYSTEM_PROMPT = `You are a Chinese lexicographer translating CC-CEDICT English glosses into Taiwan MOE-style Traditional Chinese definitions for compound words used in 平水韻 trainer drills. Output ONLY a JSON object: {"gloss": "..."}.

Your job is to translate the provided English gloss into Traditional Chinese — not to recall meanings from your own knowledge. Faithfully render the English meaning. If the English describes a modern term, give a modern Traditional Chinese gloss. If the English describes a classical sense, give a classical gloss. The English gloss is your source of truth for the compound's meaning.

Rules for the gloss field:
- Traditional Chinese characters ONLY (繁體中文). Never use simplified characters (e.g. write 眾 not 众, 譏 not 讥, 國 not 国, 學 not 学). Mixed simplified/traditional output will be rejected.
- 5–25 characters total. End with 。 if more than 8 characters; brief noun glosses can omit period.
- Match Taiwan MOE 教育部國語辭典 brevity and tone — terse, definition-first, no commentary.
- No pinyin, no English, no parenthetical notes, no Western quotation marks (use 「」 if you absolutely need quotes inside, but prefer to avoid).

If the English gloss is itself unclear, contradictory, or marks the term as obscure (e.g. "see also...", "old variant of..."), output {"gloss": "罕用"} or a minimal redirection ("即…的別稱") rather than fabricating a definition.

Examples:
- compound: 蒼海, English: "dark blue sea"
  → {"gloss": "蒼茫的大海。"}
- compound: 中徑, English: "diameter"
  → {"gloss": "直徑。"}
- compound: 先公, English: "(literary) my late father"
  → {"gloss": "稱已故的父親。"}
- compound: 得中, English: "to pass the imperial exam"
  → {"gloss": "科舉考試中第。"}
- compound: 管胞, English: "tracheid (botany)"
  → {"gloss": "植物導管細胞。"}`;

// ── CLI flags ─────────────────────────────────────────────────────────────────

const args = new Set(process.argv.slice(2));
const MERGE   = args.has('--merge');
const SAMPLE  = args.has('--sample');
const DRY_RUN = args.has('--dry-run');

// ── Helpers ───────────────────────────────────────────────────────────────────

function isEnglishGloss(gloss) {
  if (!gloss || gloss.trim() === '') return true;
  return /^[^一-鿿㐀-䶿]+$/.test(gloss.trim());
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function loadProgress() {
  const done = new Map(); // key → {compound, gloss, generated_at}
  if (!fs.existsSync(PROGRESS_PATH)) return done;
  const lines = fs.readFileSync(PROGRESS_PATH, 'utf8').trim().split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      const e = JSON.parse(line);
      done.set(e.compound, e);
    } catch { /* skip malformed */ }
  }
  return done;
}

// ── Load corpus ───────────────────────────────────────────────────────────────

const corpus = JSON.parse(fs.readFileSync(CORPUS_PATH, 'utf8'));

// Flatten all entries for processing, keeping track of rhyme
function allEntries() {
  const out = [];
  for (const [rhyme, entries] of Object.entries(corpus)) {
    for (const entry of entries) {
      out.push({ rhyme, entry });
    }
  }
  return out;
}

// ── --sample mode ─────────────────────────────────────────────────────────────

if (SAMPLE) {
  const done = loadProgress();
  if (done.size === 0) {
    console.error('No progress entries found at', PROGRESS_PATH);
    process.exit(1);
  }
  const lines = [...done.values()];
  // Shuffle and take 30
  for (let i = lines.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lines[i], lines[j]] = [lines[j], lines[i]];
  }
  const sample = lines.slice(0, 30);
  console.log(`\n=== 30 RANDOM SAMPLES FROM ${done.size} GENERATED GLOSSES ===\n`);
  for (let i = 0; i < sample.length; i++) {
    const e = sample[i];
    console.log(`[${String(i + 1).padStart(2, '0')}] compound: ${e.compound}, char: ${e.char ?? '?'}, rhyme: ${e.rhyme ?? '?'}`);
    console.log(`     orig:  ${e.orig_gloss}`);
    console.log(`     gloss: ${e.gloss}`);
    console.log();
  }
  process.exit(0);
}

// ── --merge mode ──────────────────────────────────────────────────────────────

if (MERGE) {
  const done = loadProgress();
  if (done.size === 0) {
    console.error('No progress entries found at', PROGRESS_PATH);
    process.exit(1);
  }

  let moeCount = 0;
  let llmCount = 0;
  let failCount = 0;
  let generatedAt = '';

  for (const [, entries] of Object.entries(corpus)) {
    for (const entry of entries) {
      if (!isEnglishGloss(entry.gloss)) {
        moeCount++;
        continue;
      }
      const prog = done.get(entry.word);
      if (!prog || !prog.gloss) {
        failCount++;
        continue;
      }
      entry.gloss = prog.gloss;
      entry.source = 'llm-v1';
      llmCount++;
      if (!generatedAt) generatedAt = prog.generated_at ?? '';
    }
  }

  fs.writeFileSync(CORPUS_PATH, JSON.stringify(corpus, null, 2) + '\n', 'utf8');
  console.log(`Merged: ${moeCount} MOE + ${llmCount} LLM-v1 + ${failCount} unresolved = ${moeCount + llmCount + failCount} total`);

  const meta = {
    moe_count: moeCount,
    llm_v1_count: llmCount,
    llm_v1_model: MODEL,
    llm_v1_prompt_version: PROMPT_VERSION,
    llm_v1_generated_at: generatedAt || new Date().toISOString(),
    llm_v1_failures: failCount,
    llm_v1_estimated_cost_usd: null, // filled in by generation run
  };

  // Merge cost from existing meta if present
  if (fs.existsSync(META_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
      if (existing.llm_v1_estimated_cost_usd != null) {
        meta.llm_v1_estimated_cost_usd = existing.llm_v1_estimated_cost_usd;
      }
    } catch { /* ignore */ }
  }

  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2) + '\n', 'utf8');
  console.log(`Metadata written: ${META_PATH}`);
  process.exit(0);
}

// ── Generate mode ─────────────────────────────────────────────────────────────

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('ANTHROPIC_API_KEY is not set. Aborting.');
  process.exit(1);
}

async function generateGloss({ compound, char, rhyme, origGloss }) {
  const userMsg = `Compound: ${compound}\nContaining char: ${char}\nRhyme group: ${rhyme}\nEnglish gloss (from CC-CEDICT): ${origGloss}\n\nTranslate the English gloss into MOE-style Traditional Chinese. Return JSON only.`;
  const body = JSON.stringify({
    model: MODEL,
    max_tokens: 100,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMsg }],
  });
  const headers = {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  };

  let response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body });

  if (response.status === 429) {
    console.warn('  429 rate-limited, sleeping 60s and retrying...');
    await sleep(60_000);
    response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body });
    if (response.status === 429) {
      throw new Error('429 after retry — aborting batch');
    }
  }

  if (response.status === 400) {
    const errBody = await response.text();
    if (errBody.includes('credit balance is too low') || errBody.includes('insufficient_quota')) {
      console.error('CREDIT_EXHAUSTED — aborting batch. Add credits and resume.');
      process.exit(2);
    }
    throw new Error(`API 400: ${errBody.slice(0, 200)}`);
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API ${response.status}: ${errText.slice(0, 200)}`);
  }
  const data = await response.json();
  const text = data.content?.[0]?.text ?? '';
  const inputTokens = data.usage?.input_tokens ?? 0;
  const outputTokens = data.usage?.output_tokens ?? 0;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    console.warn(`  No JSON for ${compound}: ${text.slice(0, 80)}`);
    return { gloss: null, inputTokens, outputTokens };
  }
  try {
    const parsed = JSON.parse(match[0]);
    return { gloss: parsed.gloss?.trim() ?? null, inputTokens, outputTokens };
  } catch {
    return { gloss: null, inputTokens, outputTokens };
  }
}

// Load resume state
const done = loadProgress();
if (done.size > 0) console.log(`Resuming — ${done.size} entries already done.`);

// Collect gap entries
const gapEntries = [];
for (const { rhyme, entry } of allEntries()) {
  if (isEnglishGloss(entry.gloss)) {
    gapEntries.push({ compound: entry.word, char: entry.answer, rhyme, origGloss: entry.gloss });
  }
}

const todo = gapEntries.filter(e => !done.has(e.compound));
console.log(`Gap total: ${gapEntries.length} | Remaining: ${todo.length}${DRY_RUN ? ' (--dry-run: capped at 10)' : ''}`);

const toProcess = DRY_RUN ? todo.slice(0, 10) : todo;
if (toProcess.length === 0) {
  console.log('Nothing to generate. Run with --sample to review, then --merge to apply.');
  process.exit(0);
}

const progressStream = fs.createWriteStream(PROGRESS_PATH, { flags: 'a' });

let successCount = 0;
let failCount = 0;
let totalInputTokens = 0;
let totalOutputTokens = 0;
const startTime = Date.now();

// Haiku pricing (per million tokens): input $0.80, output $4.00
const INPUT_PRICE_PER_M  = 0.80;
const OUTPUT_PRICE_PER_M = 4.00;

for (let i = 0; i < toProcess.length; i++) {
  const { compound, char, rhyme, origGloss } = toProcess[i];

  if (i > 0) await sleep(DELAY_MS);

  try {
    const { gloss, inputTokens, outputTokens } = await generateGloss({ compound, char, rhyme, origGloss });

    if (gloss && /[一-鿿㐀-䶿]/.test(gloss)) {
      const record = { compound, char, rhyme, orig_gloss: origGloss, gloss, generated_at: new Date().toISOString() };
      progressStream.write(JSON.stringify(record) + '\n');
      successCount++;
    } else {
      failCount++;
    }

    totalInputTokens  += inputTokens;
    totalOutputTokens += outputTokens;
  } catch (err) {
    failCount++;
    console.error(`\nError on "${compound}" (${rhyme}): ${err.message}`);
  }

  if ((i + 1) % 100 === 0 || i === toProcess.length - 1) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const rate = (i + 1) / ((Date.now() - startTime) / 1000);
    const remaining = toProcess.length - i - 1;
    const eta = remaining > 0 ? Math.round(remaining / rate) + 's' : '0s';
    const cost = (totalInputTokens / 1e6 * INPUT_PRICE_PER_M + totalOutputTokens / 1e6 * OUTPUT_PRICE_PER_M).toFixed(4);
    console.log(`[${i + 1}/${toProcess.length}] ${elapsed}s elapsed | ETA ~${eta} | ok=${successCount} err=${failCount} | cost=$${cost}`);
  }
}

progressStream.end();

const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
const totalCost = (totalInputTokens / 1e6 * INPUT_PRICE_PER_M + totalOutputTokens / 1e6 * OUTPUT_PRICE_PER_M).toFixed(4);

console.log('\n=== Generation complete ===');
console.log(`Attempted:  ${toProcess.length}`);
console.log(`Succeeded:  ${successCount}`);
console.log(`Failed:     ${failCount}`);
console.log(`Time:       ${totalElapsed}s`);
console.log(`Tokens:     ${totalInputTokens} in / ${totalOutputTokens} out`);
console.log(`Est. cost:  $${totalCost}`);

// Persist cost to meta file for --merge to pick up
const metaForCost = { llm_v1_estimated_cost_usd: parseFloat(totalCost) };
if (fs.existsSync(META_PATH)) {
  try {
    const existing = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));
    Object.assign(existing, metaForCost);
    fs.writeFileSync(META_PATH, JSON.stringify(existing, null, 2) + '\n', 'utf8');
  } catch { fs.writeFileSync(META_PATH, JSON.stringify(metaForCost, null, 2) + '\n', 'utf8'); }
} else {
  fs.writeFileSync(META_PATH, JSON.stringify(metaForCost, null, 2) + '\n', 'utf8');
}

console.log('\nNext steps:');
console.log(`  1. Review:  node scripts/llm-gen-drill4-glosses.mjs --sample`);
console.log(`  2. If ≥24/30 pass: node scripts/llm-gen-drill4-glosses.mjs --merge`);
