#!/usr/bin/env node
/**
 * One-time backfill: match wenyan Yunxi clips by text against the
 * dynamic manifest and populate usage_context where missing.
 *
 * Background — Stage D-1 generated 17 Yunyang clips with proper
 * usage_context tags. The user regenerated all 17 via Audio Review's
 * "regenerate with different voice" UI using zh-CN-YunxiNeural and
 * approved them — but that UI path doesn't preserve usage_context,
 * leaving the new Yunxi rows with empty tags. Stage D-2's PoemReader
 * play-button lookup queries by tag, so this backfill is required
 * before D-2 ships.
 *
 * Idempotent — UPDATE only fires when audio_clips.usage_context is
 * one of: NULL, '', or '[]'. Anything else (including a populated
 * JSON array) is treated as already-tagged and left alone.
 *
 * Scope — restricted to (provider='azure', voice_id='zh-CN-YunxiNeural')
 * to avoid touching Yunyang rejected rows or any trainer audio.
 *
 * Usage:
 *   node scripts/wenyan-backfill-usage-context.mjs --poemId zhang-jiuling-ganyu-1
 *   node scripts/wenyan-backfill-usage-context.mjs            # all wenyan poems
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const _require = createRequire(import.meta.url);

const serverModules = path.join(__dirname, '..', 'server', 'node_modules');
const dotenv = _require(path.join(serverModules, 'dotenv'));
const Database = _require(path.join(serverModules, 'better-sqlite3'));

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

import { buildWenyanAudioManifest } from './wenyan-build-audio-manifest.mjs';

const DB_PATH = path.join(__dirname, '..', 'server', 'data.db');

// Wenyan-specific voice — must match wenyan-prewarm-audio.mjs (#26 D-1.5).
const WENYAN_PROVIDER = 'azure';
const WENYAN_VOICE_ID = 'zh-CN-YunxiNeural';

function parseArgs(argv) {
  const args = { poemId: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--poemId') args.poemId = argv[++i];
    else if (a.startsWith('--poemId=')) args.poemId = a.slice('--poemId='.length);
  }
  return args;
}

function truncate(s, n = 30) {
  return s.length > n ? s.slice(0, n) + '...' : s;
}

function isEmptyTag(value) {
  return value === null || value === '' || value === '[]';
}

function main() {
  const args = parseArgs(process.argv);

  if (!fs.existsSync(DB_PATH)) {
    console.error(`DB not found at ${DB_PATH}`);
    process.exit(1);
  }

  console.log(`[backfill] Loading manifest for poemId=${args.poemId ?? '(all)'}...`);
  const manifest = buildWenyanAudioManifest({ poemId: args.poemId ?? undefined });
  console.log(`[backfill] Manifest: ${manifest.length} entries`);
  if (manifest.length === 0) {
    console.error(`[backfill] Empty manifest — poemId "${args.poemId ?? '(all)'}" matched 0 entries.`);
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  // Lookup matches the wenyan UNIQUE-key tuple plus a status filter that
  // excludes 'rejected' rows (e.g., the dormant Yunyang pilot rows).
  const sLookup = db.prepare(
    "SELECT id, usage_context FROM audio_clips " +
      "WHERE text = ? AND voice_kind = 'mandarin' AND provider = ? AND voice_id = ? " +
      "AND status IN ('pending','approved')"
  );
  const sUpdate = db.prepare(
    "UPDATE audio_clips SET usage_context = ? WHERE id = ?"
  );

  let backfilled = 0, alreadyTagged = 0, notFound = 0;

  for (let i = 0; i < manifest.length; i++) {
    const item = manifest[i];
    console.log(`[${i + 1}/${manifest.length}] Looking up: ${truncate(item.text)}`);

    const row = sLookup.get(item.text, WENYAN_PROVIDER, WENYAN_VOICE_ID);
    if (!row) {
      console.log(`  ✗ no matching clip in audio_clips`);
      notFound++;
      continue;
    }

    if (!isEmptyTag(row.usage_context)) {
      console.log(`  - already tagged, skipping`);
      alreadyTagged++;
      continue;
    }

    const tagJson = JSON.stringify(item.usageContext);
    sUpdate.run(tagJson, row.id);
    console.log(`  ✓ backfilled tag: ${item.usageContext[0]}`);
    backfilled++;
  }

  console.log(
    `\n[backfill] Done: ${backfilled} backfilled, ${alreadyTagged} already-tagged, ${notFound} not-found`
  );
  db.close();
}

main();
