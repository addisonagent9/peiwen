#!/usr/bin/env node
/**
 * PREWARM WENYAN AUDIO CLIPS
 *
 * Reads the dynamic manifest from scripts/wenyan-build-audio-manifest.mjs
 * (which derives clips from src/data/wenyan/poems.json) and synthesizes
 * via the trainer's existing audio infrastructure (voice-pools,
 * azure-provider, audio_clips table). Mirrors scripts/prewarm-audio.mjs
 * flow but isolates from the trainer pipeline so wenyan iteration won't
 * regress trainer audio.
 *
 * IMPORTANT: Run as the service user (www-data on VPS), NOT as root.
 * If run as root, the generated files will be owned by root and the
 * service will hit EACCES when trying to regenerate them.
 *
 * VPS — Stage D-1 pilot:
 *   sudo -u www-data node scripts/wenyan-prewarm-audio.mjs --poemId zhang-jiuling-ganyu-1
 *
 * VPS — full batch (post-D-1 ratification):
 *   sudo -u www-data node scripts/wenyan-prewarm-audio.mjs
 *
 * DRY_RUN=1 prints what would be generated without TTS calls.
 *
 * Flags:
 *   --poemId <id>    restrict to one poem
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import crypto from 'crypto';
import fs from 'fs';
import fsp from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);

const serverModules = path.join(__dirname, '..', 'server', 'node_modules');
const dotenv = _require(path.join(serverModules, 'dotenv'));
const Database = _require(path.join(serverModules, 'better-sqlite3'));

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

import { buildWenyanAudioManifest } from './wenyan-build-audio-manifest.mjs';
import { getPrimaryVoice } from '../server/audio/voice-pools.mjs';
import { AzureAudioProvider } from '../server/audio/azure-provider.mjs';

const DB_PATH = path.join(__dirname, '..', 'server', 'data.db');
const CACHE_DIR = path.join(__dirname, '..', 'server', 'data', 'audio-cache', 'pending');
const DRY_RUN = process.env.DRY_RUN === '1';
const AZURE_NEURAL_TTS_USD_PER_M_CHARS = 16;

function buildProvider(providerName, _voiceId) {
  if (providerName === 'azure') {
    const apiKey = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;
    if (!apiKey || !region) return null;
    return new AzureAudioProvider({ apiKey, region });
  }
  // Stage D-1 pilot is mandarin-only; mandarin pool primary is azure.
  // Other providers (alibaba/elevenlabs) wired here when wenyan needs them.
  return null;
}

function parseArgs(argv) {
  const args = { poemId: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--poemId') args.poemId = argv[++i];
    else if (a.startsWith('--poemId=')) args.poemId = a.slice('--poemId='.length);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);

  if (!fs.existsSync(DB_PATH)) {
    console.error(`DB not found at ${DB_PATH}`);
    process.exit(1);
  }

  const manifest = buildWenyanAudioManifest({ poemId: args.poemId ?? undefined });
  if (manifest.length === 0) {
    console.error(`Manifest empty — poemId "${args.poemId ?? '(all)'}" matched 0 entries.`);
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const sCheck = db.prepare(
    "SELECT id, status FROM audio_clips WHERE text = ? AND voice_kind = ? AND provider = ? AND voice_id = ? AND status IN ('pending','approved')"
  );
  const sInsert = db.prepare(`
    INSERT INTO audio_clips (text, voice_kind, provider, voice_id, status, file_path, generation_text, usage_context)
    VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)
  `);

  let generated = 0, skipped = 0, errors = 0, totalChars = 0;
  const total = manifest.length;

  if (DRY_RUN) console.log('[DRY RUN] No TTS calls will be made.\n');
  console.log(`Wenyan manifest: ${total} entries (filter: ${args.poemId ?? '(all)'})\n`);

  for (let i = 0; i < total; i++) {
    const item = manifest[i];
    const { provider: providerName, voiceId } = getPrimaryVoice(item.voiceKind);

    const existing = sCheck.get(item.text, item.voiceKind, providerName, voiceId);
    if (existing) {
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  [${i + 1}/${total}] WOULD generate: ${item.text.slice(0, 30)}${item.text.length > 30 ? '...' : ''} (${item.voiceKind}/${providerName}/${voiceId})`);
      generated++;
      totalChars += item.text.length;
      continue;
    }

    const provider = buildProvider(providerName, voiceId);
    if (!provider) {
      console.log(`  SKIP ${item.text.slice(0, 20)} (${item.voiceKind}) — ${providerName} not configured`);
      skipped++;
      continue;
    }

    console.log(`  [${i + 1}/${total}] ${item.text.slice(0, 40)}${item.text.length > 40 ? '...' : ''} (${item.voiceKind}/${providerName}/${voiceId})`);

    try {
      const result = await provider.synthesize({ text: item.text, voice: voiceId });

      const hash = crypto.createHash('sha256')
        .update(`${providerName}:${voiceId}:${item.text}`)
        .digest('hex').slice(0, 32);
      const shard = hash.slice(0, 2);
      const filePath = path.join(CACHE_DIR, shard, `${hash.slice(2)}.mp3`);
      await fsp.mkdir(path.join(CACHE_DIR, shard), { recursive: true });
      await fsp.writeFile(filePath, result.audio);

      sInsert.run(
        item.text,
        item.voiceKind,
        providerName,
        voiceId,
        filePath,
        item.text,
        JSON.stringify(item.usageContext),
      );
      generated++;
      totalChars += item.text.length;
    } catch (err) {
      console.error(`  ERROR on ${item.text.slice(0, 20)}: ${err.message}`);
      errors++;
    }

    // Throttle (200ms ≈ 5 req/s) — same as trainer prewarm.
    await new Promise((r) => setTimeout(r, 200));
  }

  const cost = (totalChars / 1_000_000) * AZURE_NEURAL_TTS_USD_PER_M_CHARS;
  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Done. Generated: ${generated}, Skipped: ${skipped}, Errors: ${errors}`);
  console.log(`Total chars sent to Azure: ${totalChars}`);
  console.log(`Estimated cost: $${cost.toFixed(4)} (Azure Neural TTS @ $${AZURE_NEURAL_TTS_USD_PER_M_CHARS}/M chars)`);
  db.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
