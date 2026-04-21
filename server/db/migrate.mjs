/**
 * Minimal SQLite migration runner.
 *
 * Tracks applied migrations in a `schema_migrations` table and runs every
 * *.sql file in the migrations directory that hasn't been applied yet, in
 * lexicographic filename order.
 *
 * Usage (e.g. in server/index.mjs on boot):
 *
 *   import Database from 'better-sqlite3';
 *   import path from 'path';
 *   import { runMigrations } from './db/migrate.mjs';
 *
 *   const db = new Database(DB_PATH);
 *   db.pragma('journal_mode = WAL');
 *   db.pragma('foreign_keys = ON');
 *   runMigrations(db, path.join(__dirname, 'db/migrations'));
 *
 * If you already have a migration system, skip this file and apply
 * `002_srs.sql` however you normally do.
 */

import fs from 'fs';
import path from 'path';

export function runMigrations(db, migrationsDir) {
  // Bootstrap the tracker table.
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const appliedStmt = db.prepare('SELECT name FROM schema_migrations');
  const applied = new Set(
    appliedStmt.all().map((r) => r.name),
  );

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const result = { applied: [], skipped: [] };

  const insertApplied = db.prepare(
    'INSERT INTO schema_migrations (name) VALUES (?)',
  );

  for (const file of files) {
    if (applied.has(file)) {
      result.skipped.push(file);
      continue;
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    const txn = db.transaction(() => {
      db.exec(sql);
      insertApplied.run(file);
    });
    txn();
    result.applied.push(file);
    // Small, boring log line — keep it boring for prod logs.
    // eslint-disable-next-line no-console
    console.log(`[migrate] applied ${file}`);
  }

  return result;
}
