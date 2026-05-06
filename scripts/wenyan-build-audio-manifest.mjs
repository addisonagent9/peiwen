#!/usr/bin/env node
/**
 * Build a dynamic audio manifest from src/data/wenyan/poems.json.
 *
 * Per-poem clips:
 *   - N background clips    (one per chunk in poems.json)
 *   - M couplet clips       (one per \n-separated line in fullText —
 *                            each line is already a complete couplet
 *                            for 5/7-char regulated verse)
 *   - 1 translation clip
 *   - K vocabulary clips    (text format: "{word}：{ancientMeaning}。"
 *                            full-width colon cues a slight pause that
 *                            separates headword from gloss)
 *
 * Manifest entry shape mirrors trainer's static manifest:
 *   { text, voiceKind: 'mandarin', usageContext: [...] }
 *
 * Provider + voice_id are NOT in the manifest — resolved downstream
 * via getPrimaryVoice('mandarin') in the prewarm script. If the
 * trainer's mandarin pool primary changes, wenyan follows automatically.
 *
 * Usage:
 *   node scripts/wenyan-build-audio-manifest.mjs                  # all poems, summary
 *   node scripts/wenyan-build-audio-manifest.mjs --poemId X       # one poem, summary
 *   node scripts/wenyan-build-audio-manifest.mjs --json           # full manifest as JSON
 *   node scripts/wenyan-build-audio-manifest.mjs --poemId X --json
 */

import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);

const POEMS_PATH = path.join(__dirname, '..', 'src', 'data', 'wenyan', 'poems.json');

const AZURE_NEURAL_TTS_USD_PER_M_CHARS = 16;

/**
 * Build the wenyan audio manifest for one or all poems.
 *
 * @param {object} [opts]
 * @param {string} [opts.poemId] — restrict to a single poem id
 * @returns {Array<{ text: string, voiceKind: 'mandarin', usageContext: string[] }>}
 */
export function buildWenyanAudioManifest(opts = {}) {
  const data = _require(POEMS_PATH);
  const manifest = [];

  const poems = opts.poemId
    ? data.poems.filter((p) => p.id === opts.poemId)
    : data.poems;

  for (const poem of poems) {
    // Background — one clip per chunk
    for (let i = 0; i < poem.background.length; i++) {
      manifest.push({
        text: poem.background[i],
        voiceKind: 'mandarin',
        usageContext: [`wenyan:background:${poem.id}:chunk-${i + 1}`],
      });
    }

    // Couplets — one clip per \n-separated line of fullText
    const lines = poem.fullText.split('\n').map((l) => l.trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      manifest.push({
        text: lines[i],
        voiceKind: 'mandarin',
        usageContext: [`wenyan:poem-body:${poem.id}:couplet-${i + 1}`],
      });
    }

    // Translation — single clip
    manifest.push({
      text: poem.translation,
      voiceKind: 'mandarin',
      usageContext: [`wenyan:translation:${poem.id}`],
    });

    // Vocabulary — one clip per entry, "{word}：{ancientMeaning}。"
    // Trailing 。 appended only when missing — keeps prosody natural.
    for (const v of poem.vocabulary) {
      const gloss = /[。！？]$/.test(v.ancientMeaning)
        ? v.ancientMeaning
        : v.ancientMeaning + '。';
      manifest.push({
        text: `${v.word}：${gloss}`,
        voiceKind: 'mandarin',
        usageContext: [`wenyan:vocab:${poem.id}:${v.senseSlug}`],
      });
    }
  }

  return manifest;
}

function parseArgs(argv) {
  const args = { poemId: null, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--poemId') args.poemId = argv[++i];
    else if (a.startsWith('--poemId=')) args.poemId = a.slice('--poemId='.length);
    else if (a === '--json') args.json = true;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const manifest = buildWenyanAudioManifest({ poemId: args.poemId ?? undefined });

  if (args.json) {
    process.stdout.write(JSON.stringify(manifest, null, 2) + '\n');
    return;
  }

  console.log(`Wenyan audio manifest`);
  console.log(`  filter:  ${args.poemId ?? '(all poems)'}`);
  console.log(`  entries: ${manifest.length}`);
  if (manifest.length === 0) {
    console.log(`  (no entries — poemId not found?)`);
    return;
  }
  const totalChars = manifest.reduce((sum, m) => sum + m.text.length, 0);
  const cost = (totalChars / 1_000_000) * AZURE_NEURAL_TTS_USD_PER_M_CHARS;
  console.log(`  chars:   ${totalChars}`);
  console.log(`  est. Azure TTS cost: $${cost.toFixed(4)}  ($${AZURE_NEURAL_TTS_USD_PER_M_CHARS}/M chars)`);
}

// Run main only when invoked directly (not when imported as a module).
const argv1 = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (argv1 && import.meta.url === pathToFileURL(argv1).href) {
  main();
}
