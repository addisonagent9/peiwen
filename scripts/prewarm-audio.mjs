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
 * Uses voice pools from server/audio/voice-pools.mjs (primary voice per voiceKind).
 *
 * ⚠️  KEEP IN SYNC WITH:
 *   - src/data/pingshui/audio-prewarm-manifest.ts (canonical manifest)
 *   - server/routes/admin-audio.mjs (POST /prewarm handler)
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import crypto from 'crypto';
import fs from 'fs';
import fsp from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

import { getPrimaryVoice } from '../server/audio/voice-pools.mjs';
import { AzureAudioProvider } from '../server/audio/azure-provider.mjs';
import { AlibabaAudioProvider } from '../server/audio/alibaba-provider.mjs';
import { ElevenLabsAudioProvider } from '../server/audio/elevenlabs-provider.mjs';

const DB_PATH = path.join(__dirname, '..', 'server', 'data.db');
const CACHE_DIR = path.join(__dirname, '..', 'server', 'data', 'audio-cache', 'pending');

const ITEMS = [
  ...['四声','上平','下平','仄声','入声','韵目'].map(t => ({ text: t, voiceKind: 'mandarin', usageContext: ['foundation:title'] })),
  ...['东','好','去','冬','支','先','阳','尤','月','十','入','日','白','六','一东','七阳','十五咸'].map(t => ({ text: t, voiceKind: 'mandarin', usageContext: ['foundation:demo'] })),
  ...['风','空','中','红','同','通','翁','弓','宫','功','虹',
      '光','霜','乡','香','长','常','场','章','羊','方','凉',
      '忧','秋','楼','流','舟','留','收','头','愁','游','州',
      '麻','家','花','霞','华','沙','斜','茶','涯','鸦','加','瓜',
      '歌','多','何','河','过','波','磨','罗','娥','蛾','哥','柯'].map(t => ({ text: t, voiceKind: 'mandarin', usageContext: ['curriculum:tier1:seed'] })),
  ...['十','入','月','日','白','六'].map(t => ({ text: t, voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] })),
];

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

  const sCheck = db.prepare('SELECT id FROM audio_clips WHERE text = ? AND voice_kind = ? AND provider = ? AND voice_id = ?');
  const sInsert = db.prepare(`
    INSERT INTO audio_clips (text, voice_kind, provider, voice_id, status, file_path, usage_context)
    VALUES (?, ?, ?, ?, 'pending', ?, ?)
  `);

  let generated = 0, skipped = 0, errors = 0, totalChars = 0;

  for (let i = 0; i < ITEMS.length; i++) {
    const item = ITEMS[i];
    const { provider: providerName, voiceId } = getPrimaryVoice(item.voiceKind);

    const existing = sCheck.get(item.text, item.voiceKind, providerName, voiceId);
    if (existing) { skipped++; continue; }

    const provider = buildProvider(providerName, voiceId);
    if (!provider) {
      console.log(`  SKIP ${item.text} (${item.voiceKind}) — ${providerName} not configured`);
      skipped++;
      continue;
    }

    console.log(`  [${i+1}/${ITEMS.length}] ${item.text} (${item.voiceKind}/${providerName}/${voiceId})`);

    try {
      const result = await provider.synthesize({ text: item.text, voice: voiceId });

      const hash = crypto.createHash('sha256')
        .update(`${providerName}:${voiceId}:${item.text}`)
        .digest('hex').slice(0, 32);
      const shard = hash.slice(0, 2);
      const filePath = path.join(CACHE_DIR, shard, `${hash.slice(2)}.mp3`);
      await fsp.mkdir(path.join(CACHE_DIR, shard), { recursive: true });
      await fsp.writeFile(filePath, result.audio);

      sInsert.run(item.text, item.voiceKind, providerName, voiceId, filePath, JSON.stringify(item.usageContext));
      generated++;
      totalChars += item.text.length;
    } catch (err) {
      console.error(`  ERROR on ${item.text}: ${err.message}`);
      errors++;
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nDone. Generated: ${generated}, Skipped: ${skipped}, Errors: ${errors}`);
  console.log(`Total characters sent to TTS: ${totalChars}`);
  db.close();
}

main().catch(err => { console.error(err); process.exit(1); });
