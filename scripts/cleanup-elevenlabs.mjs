/**
 * Delete all ElevenLabs audio clips from DB and disk.
 *
 * Run with: node scripts/cleanup-elevenlabs.mjs
 *
 * This script:
 *  1. Selects all rows in audio_clips WHERE provider='elevenlabs'
 *  2. Deletes each file from disk (if it exists)
 *  3. Deletes the DB rows
 *  4. Prints a summary
 *
 * This operation is irreversible. The ElevenLabs provider code remains
 * in place (elevenlabs-provider.mjs) — only the generated data is removed.
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'server', 'data.db');

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`DB not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  const clips = db.prepare(
    "SELECT id, text, voice_kind, voice_id, file_path, status FROM audio_clips WHERE provider = 'elevenlabs'"
  ).all();

  if (clips.length === 0) {
    console.log('No ElevenLabs clips found. Nothing to do.');
    db.close();
    return;
  }

  console.log(`Found ${clips.length} ElevenLabs clips to delete.`);
  console.log(`  Pending: ${clips.filter(c => c.status === 'pending').length}`);
  console.log(`  Approved: ${clips.filter(c => c.status === 'approved').length}`);
  console.log(`  Rejected: ${clips.filter(c => c.status === 'rejected').length}`);
  console.log('');

  let filesDeleted = 0;
  let filesNotFound = 0;
  let fileErrors = 0;

  for (const clip of clips) {
    if (clip.file_path) {
      try {
        if (fs.existsSync(clip.file_path)) {
          fs.unlinkSync(clip.file_path);
          filesDeleted++;
        } else {
          filesNotFound++;
        }
      } catch (err) {
        console.error(`  ERROR deleting ${clip.file_path}: ${err.message}`);
        fileErrors++;
      }
    }
  }

  const result = db.prepare("DELETE FROM audio_clips WHERE provider = 'elevenlabs'").run();

  console.log('---');
  console.log(`Rows deleted from DB: ${result.changes}`);
  console.log(`Files deleted from disk: ${filesDeleted}`);
  console.log(`Files not found (already missing): ${filesNotFound}`);
  console.log(`File delete errors: ${fileErrors}`);
  console.log('Done.');

  db.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
