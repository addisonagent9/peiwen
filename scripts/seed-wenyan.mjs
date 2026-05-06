/**
 * Seed wenyan dictionary entries from the bundled JSON content.
 *
 * Reads src/data/wenyan/poems.json and upserts (word, sense_slug) into
 * wenyan_dict_entries + wenyan_dict_entry_poems. Idempotent — re-runs
 * update existing rows in place via ON CONFLICT clauses.
 *
 * Usage:
 *   node scripts/seed-wenyan.mjs
 *   npm run seed:wenyan
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const dbPath = path.resolve(repoRoot, 'server/data.db');
const jsonPath = path.resolve(repoRoot, 'src/data/wenyan/poems.json');

// better-sqlite3 lives in server/node_modules
const _require = createRequire(import.meta.url);
const Database = _require(path.join(repoRoot, 'server/node_modules/better-sqlite3'));

const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log(`[seed-wenyan] Loading ${content.poems.length} poems`);

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const upsertEntry = db.prepare(`
  INSERT INTO wenyan_dict_entries (word, sense_slug, pinyin, modern_meaning, ancient_meaning, notes)
  VALUES (@word, @senseSlug, @pinyin, @modernMeaning, @ancientMeaning, @notes)
  ON CONFLICT(word, sense_slug) DO UPDATE SET
    pinyin          = excluded.pinyin,
    modern_meaning  = excluded.modern_meaning,
    ancient_meaning = excluded.ancient_meaning,
    notes           = excluded.notes,
    updated_at      = datetime('now')
  RETURNING entry_id
`);

const upsertEntryPoem = db.prepare(`
  INSERT INTO wenyan_dict_entry_poems (entry_id, poem_id, position)
  VALUES (@entry_id, @poem_id, @position)
  ON CONFLICT(entry_id, poem_id) DO UPDATE SET position = excluded.position
`);

const seed = db.transaction(() => {
  let entriesUpserted = 0;
  let joinsUpserted = 0;
  for (const poem of content.poems) {
    for (const vocab of poem.vocabulary) {
      const row = upsertEntry.get({
        word: vocab.word,
        senseSlug: vocab.senseSlug,
        pinyin: vocab.pinyin ?? null,
        modernMeaning: vocab.modernMeaning,
        ancientMeaning: vocab.ancientMeaning,
        notes: vocab.notes ?? null,
      });
      entriesUpserted++;
      upsertEntryPoem.run({
        entry_id: row.entry_id,
        poem_id: poem.id,
        position: null, // Stage B has no positions; backfill possible later
      });
      joinsUpserted++;
    }
  }
  return { entriesUpserted, joinsUpserted };
});

const result = seed();
console.log(`[seed-wenyan] Upserted ${result.entriesUpserted} entries, ${result.joinsUpserted} entry-poem joins`);

const counts = db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM wenyan_dict_entries)     AS entries,
    (SELECT COUNT(*) FROM wenyan_dict_entry_poems) AS joins
`).get();
console.log(`[seed-wenyan] Total in DB: ${counts.entries} entries, ${counts.joins} joins`);

db.close();
