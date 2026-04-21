/**
 * ⚠️  KEEP IN SYNC WITH:
 *   - src/data/pingshui/audio-prewarm-manifest.ts (canonical manifest)
 *   - server/routes/admin-audio.mjs (POST /prewarm handler)
 * If you add items to the manifest, update the ITEMS array below too.
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

// Import provider
import { ElevenLabsAudioProvider } from '../server/audio/elevenlabs-provider.mjs';

const DB_PATH = path.join(__dirname, '..', 'server', 'data.db');
const CACHE_DIR = path.join(__dirname, '..', 'server', 'data', 'audio-cache', 'pending');

// ---------------------------------------------------------------------------
// Manifest — duplicated from src/data/pingshui/audio-prewarm-manifest.ts
// because we can't import .ts from .mjs directly.
// ---------------------------------------------------------------------------

const ITEMS = [
  // Foundation titles
  ...['四声','上平','下平','仄声','入声','韵目'].map(t => ({ text: t, voiceKind: 'mandarin', usageContext: ['foundation:title'] })),
  // Foundation demo chars (deduplicated)
  ...['东','好','去','冬','支','先','阳','尤','月','十','入','日','白','六','一东','七阳','十五咸'].map(t => ({ text: t, voiceKind: 'mandarin', usageContext: ['foundation:demo'] })),
  // Tier 1 seeds (not already in above)
  ...['风','空','中','红','同','通','翁','弓','宫','功','虹',
      '光','霜','乡','香','长','常','场','章','羊','方','凉',
      '忧','秋','楼','流','舟','留','收','头','愁','游','州',
      '麻','家','花','霞','华','沙','斜','茶','涯','鸦','加','瓜',
      '歌','多','何','河','过','波','磨','罗','娥','蛾','哥','柯'].map(t => ({ text: t, voiceKind: 'mandarin', usageContext: ['curriculum:tier1:seed'] })),
  // Cantonese evidence
  ...['十','入','月','日','白','六'].map(t => ({ text: t, voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] })),
];

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`DB not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const mandarinVoiceId = process.env.ELEVENLABS_VOICE_ID_MANDARIN;
  const cantoneseVoiceId = process.env.ELEVENLABS_VOICE_ID_CANTONESE;

  if (!apiKey) {
    console.error('ELEVENLABS_API_KEY not set');
    process.exit(1);
  }

  const mandarinProvider = mandarinVoiceId ? new ElevenLabsAudioProvider({ apiKey, voiceId: mandarinVoiceId }) : null;
  const cantoneseProvider = cantoneseVoiceId ? new ElevenLabsAudioProvider({ apiKey, voiceId: cantoneseVoiceId }) : null;

  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const sCheck = db.prepare('SELECT id FROM audio_clips WHERE text = ? AND voice_kind = ? AND provider = ? AND voice_id = ?');
  const sInsert = db.prepare(`
    INSERT INTO audio_clips (text, voice_kind, provider, voice_id, status, file_path, usage_context)
    VALUES (?, ?, ?, ?, 'pending', ?, ?)
  `);

  let generated = 0;
  let skipped = 0;
  let errors = 0;
  let totalChars = 0;

  for (let i = 0; i < ITEMS.length; i++) {
    const item = ITEMS[i];
    const provider = item.voiceKind === 'cantonese' ? cantoneseProvider : mandarinProvider;
    const voiceId = item.voiceKind === 'cantonese' ? cantoneseVoiceId : mandarinVoiceId;

    if (!provider || !voiceId) {
      console.log(`  SKIP ${item.text} (${item.voiceKind}) — no provider configured`);
      skipped++;
      continue;
    }

    const existing = sCheck.get(item.text, item.voiceKind, 'elevenlabs', voiceId);
    if (existing) {
      skipped++;
      continue;
    }

    console.log(`  [${i+1}/${ITEMS.length}] Generating: ${item.text} (${item.voiceKind}/elevenlabs)`);

    try {
      const result = await provider.synthesize({ text: item.text });

      const hash = crypto.createHash('sha256')
        .update(`elevenlabs:${voiceId}:${item.text}`)
        .digest('hex').slice(0, 32);
      const shard = hash.slice(0, 2);
      const filePath = path.join(CACHE_DIR, shard, `${hash.slice(2)}.mp3`);

      await fsp.mkdir(path.join(CACHE_DIR, shard), { recursive: true });
      await fsp.writeFile(filePath, result.audio);

      sInsert.run(item.text, item.voiceKind, 'elevenlabs', voiceId, filePath, JSON.stringify(item.usageContext));

      generated++;
      totalChars += item.text.length;
    } catch (err) {
      console.error(`  ERROR on ${item.text}: ${err.message}`);
      errors++;
    }

    // Be polite to the API
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nDone. Generated: ${generated}, Skipped: ${skipped}, Errors: ${errors}`);
  console.log(`Total characters sent to TTS: ${totalChars}`);
  console.log(`Estimated ElevenLabs cost: ~${Math.ceil(totalChars / 1000) * 30} credits`);

  db.close();
}

main().catch(err => { console.error(err); process.exit(1); });
