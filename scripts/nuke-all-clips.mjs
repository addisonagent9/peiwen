/**
 * Delete ALL audio_clips rows from DB and ALL files in the pending/approved dirs.
 * This is a destructive operation for starting fresh after broken state.
 *
 * Run with: node scripts/nuke-all-clips.mjs
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'server', 'data.db');
const PENDING_DIR = path.join(__dirname, '..', 'server', 'data', 'audio-cache', 'pending');
const APPROVED_DIR = path.join(__dirname, '..', 'server', 'data', 'audio-cache', 'approved');

function rmrfContents(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += rmrfContents(p);
      try { fs.rmdirSync(p); } catch { /* not empty */ }
    } else {
      fs.unlinkSync(p);
      count++;
    }
  }
  return count;
}

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`DB not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  const before = db.prepare('SELECT COUNT(*) as n FROM audio_clips').get();
  console.log(`Before: ${before.n} clips in DB`);

  const result = db.prepare('DELETE FROM audio_clips').run();
  console.log(`Deleted ${result.changes} DB rows`);

  const pendingFiles = rmrfContents(PENDING_DIR);
  console.log(`Deleted ${pendingFiles} files from pending/`);

  const approvedFiles = rmrfContents(APPROVED_DIR);
  console.log(`Deleted ${approvedFiles} files from approved/`);

  console.log('Done. Nothing is left. Start fresh with prewarm.');
  db.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
