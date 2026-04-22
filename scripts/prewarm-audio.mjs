/**
 * PREWARM AUDIO CLIPS
 *
 * IMPORTANT: Run this as the service user (www-data on the VPS), NOT as root.
 * If run as root, the generated files will be owned by root and the service
 * will hit EACCES when trying to regenerate them.
 *
 * Correct command on the VPS:
 *   sudo -u www-data node scripts/prewarm-audio.mjs
 *
 * Or chown the output directory afterwards:
 *   sudo chown -R www-data:www-data /var/www/pw.truesolartime.com/server/data/audio-cache/
 *
 * DRY_RUN=1 node scripts/prewarm-audio.mjs — prints what it WOULD generate without calling TTS.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import crypto from 'crypto';
import fs from 'fs';
import fsp from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);

// better-sqlite3 and dotenv live in server/node_modules — add to require search path
const serverModules = path.join(__dirname, '..', 'server', 'node_modules');
const dotenvPath = path.join(serverModules, 'dotenv');
const bsqlitePath = path.join(serverModules, 'better-sqlite3');
const dotenv = _require(dotenvPath);
const Database = _require(bsqlitePath);

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

import { AUDIO_PREWARM_MANIFEST } from '../server/data/audio-prewarm-manifest.mjs';
import { getPrimaryVoice } from '../server/audio/voice-pools.mjs';
import { AzureAudioProvider } from '../server/audio/azure-provider.mjs';
import { AlibabaAudioProvider } from '../server/audio/alibaba-provider.mjs';
import { ElevenLabsAudioProvider } from '../server/audio/elevenlabs-provider.mjs';

const DB_PATH = path.join(__dirname, '..', 'server', 'data.db');
const CACHE_DIR = path.join(__dirname, '..', 'server', 'data', 'audio-cache', 'pending');
const DRY_RUN = process.env.DRY_RUN === '1';

function buildProvider(providerName, voiceId) {
  if (providerName === 'azure') {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;
    if (!key || !region) return null;
    return new AzureAudioProvider({ apiKey: key, region });
  }
  if (providerName === 'alibaba') {
    const key = process.env.ALIBABA_DASHSCOPE_API_KEY;
    if (!key) return null;
    const model = process.env.ALIBABA_QWEN_MODEL ?? 'qwen3-tts-flash';
    return new AlibabaAudioProvider({ apiKey: key, model, voice: voiceId });
  }
  if (providerName === 'elevenlabs') {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return null;
    return new ElevenLabsAudioProvider({ apiKey: key, voiceId });
  }
  return null;
}

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`DB not found at ${DB_PATH}`);
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
  const total = AUDIO_PREWARM_MANIFEST.length;

  if (DRY_RUN) console.log('[DRY RUN] No TTS calls will be made.\n');
  console.log(`Manifest: ${total} entries\n`);

  for (let i = 0; i < total; i++) {
    const item = AUDIO_PREWARM_MANIFEST[i];
    const { provider: providerName, voiceId } = getPrimaryVoice(item.voiceKind);

    const existing = sCheck.get(item.text, item.voiceKind, providerName, voiceId);
    if (existing) {
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  [${i+1}/${total}] WOULD generate: ${item.text.slice(0, 30)}${item.text.length > 30 ? '...' : ''} (${item.voiceKind}/${providerName}/${voiceId})`);
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

    console.log(`  [${i+1}/${total}] ${item.text.slice(0, 40)}${item.text.length > 40 ? '...' : ''} (${item.voiceKind}/${providerName}/${voiceId})`);

    try {
      const result = await provider.synthesize({ text: item.text, voice: voiceId });

      const hash = crypto.createHash('sha256')
        .update(`${providerName}:${voiceId}:${item.text}`)
        .digest('hex').slice(0, 32);
      const shard = hash.slice(0, 2);
      const filePath = path.join(CACHE_DIR, shard, `${hash.slice(2)}.mp3`);
      await fsp.mkdir(path.join(CACHE_DIR, shard), { recursive: true });
      await fsp.writeFile(filePath, result.audio);

      sInsert.run(item.text, item.voiceKind, providerName, voiceId, filePath, item.text, JSON.stringify(item.usageContext));
      generated++;
      totalChars += item.text.length;
    } catch (err) {
      console.error(`  ERROR on ${item.text.slice(0, 20)}: ${err.message}`);
      errors++;
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Done. Generated: ${generated}, Skipped: ${skipped}, Errors: ${errors}`);
  console.log(`Total characters for TTS: ${totalChars}`);
  db.close();
}

main().catch(err => { console.error(err); process.exit(1); });
