/**
 * End-to-end integration smoke test.
 *
 * Spins up a fresh in-memory SQLite DB, runs migrations, seeds cards for
 * a rhyme, applies reviews, and verifies the full data flow end-to-end.
 *
 * Run with:
 *   node --test server/e2e.test.mjs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { runMigrations } from './db/migrate.mjs';
import { SRSRepository } from './srs/repository.mjs';
import { rhymeById } from './data/trainer-curriculum.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, 'db/migrations');

function setupDb() {
  const db = new Database(':memory:');
  db.pragma('journal_mode = MEMORY');
  db.pragma('foreign_keys = ON');

  // Create minimal users table matching the assumed shape
  db.exec(`
    CREATE TABLE users (
      id         TEXT PRIMARY KEY,
      email      TEXT,
      name       TEXT,
      avatar     TEXT,
      is_premium INTEGER DEFAULT 0,
      is_admin   INTEGER DEFAULT 0
    );
    INSERT INTO users (id, email) VALUES ('test-user-1', 'a@example.com');
    INSERT INTO users (id, email) VALUES ('test-user-2', 'b@example.com');
  `);

  runMigrations(db, migrationsDir);
  return db;
}

describe('E2E: full trainer flow', () => {
  it('seeds cards, applies reviews, rolls up progress', () => {
    const db = setupDb();
    const repo = new SRSRepository(db);
    const userId = "test-user-1";
    const dong = rhymeById('shangping-01-dong');

    // 1. Initialize trainer state
    const state = repo.ensureTrainerState(userId);
    assert.equal(state.currentTier, 1);
    assert.equal(state.foundationCompleted, false);

    // 2. Seed cards for 一东
    const created = repo.seedCardsForRhyme(userId, dong.id, dong.seedCharacters);
    assert.equal(created, 12);

    // Re-seeding is idempotent
    const createdAgain = repo.seedCardsForRhyme(userId, dong.id, dong.seedCharacters);
    assert.equal(createdAgain, 0);

    // 3. Due cards should include all 12
    const due = repo.getDueCards(userId);
    assert.equal(due.length, 12);
    assert.ok(due.every((c) => c.state === 'new'));

    // 4. Apply a review with grade 4 on the first card
    const firstCard = due[0];
    const updated = repo.applyReview(userId, {
      cardId: firstCard.id,
      grade: 4,
      drillType: 'char-to-rhyme',
      responseTimeMs: 2500,
    });
    assert.equal(updated.state, 'learning');
    assert.equal(updated.repetitions, 1);
    assert.equal(updated.intervalDays, 1);
    assert.ok(updated.lastReviewed !== null);

    // 5. Progress rollup should show rhyme as introduced
    const progress = repo.getProgress(userId);
    const dongProgress = progress.find((p) => p.rhymeId === dong.id);
    assert.ok(dongProgress, 'progress row should exist');
    assert.ok(dongProgress.masteryLevel >= 1);

    // 6. A lapse increments the lapse counter
    const learningCard = repo.applyReview(userId, {
      cardId: firstCard.id,
      grade: 0,
      drillType: 'char-to-rhyme',
    });
    assert.equal(learningCard.repetitions, 0);
    // Note: the repository doesn't expose lapses directly, but we can check
    // via raw row access that the lapse was recorded.
    const rawLapses = db
      .prepare('SELECT lapses FROM srs_cards WHERE id = ?')
      .get(firstCard.id);
    assert.equal(rawLapses.lapses, 1);

    // 7. Reviews log has 2 entries for this card
    const reviewCount = db
      .prepare('SELECT COUNT(*) as n FROM srs_reviews WHERE card_id = ?')
      .get(firstCard.id);
    assert.equal(reviewCount.n, 2);

    db.close();
  });

  it('rejects reviews on another user cards (403)', () => {
    const db = setupDb();
    const repo = new SRSRepository(db);
    const dong = rhymeById('shangping-01-dong');
    repo.seedCardsForRhyme("test-user-1", dong.id, dong.seedCharacters);
    const [card] = repo.getDueCards("test-user-1");

    assert.throws(
      () =>
        repo.applyReview("test-user-2", {
          cardId: card.id,
          grade: 5,
          drillType: 'char-to-rhyme',
        }),
      /does not belong/,
    );
    db.close();
  });

  it('cascade-deletes SRS data when user is deleted', () => {
    const db = setupDb();
    const repo = new SRSRepository(db);
    const dong = rhymeById('shangping-01-dong');
    repo.seedCardsForRhyme("test-user-1", dong.id, dong.seedCharacters);
    const [card] = repo.getDueCards("test-user-1");
    repo.applyReview("test-user-1", {
      cardId: card.id,
      grade: 4,
      drillType: 'char-to-rhyme',
    });

    const beforeCards = db.prepare('SELECT COUNT(*) as n FROM srs_cards').get();
    const beforeReviews = db.prepare('SELECT COUNT(*) as n FROM srs_reviews').get();
    assert.ok(beforeCards.n > 0);
    assert.ok(beforeReviews.n > 0);

    db.prepare('DELETE FROM users WHERE id = ?').run("test-user-1");

    const afterCards = db.prepare('SELECT COUNT(*) as n FROM srs_cards').get();
    const afterReviews = db.prepare('SELECT COUNT(*) as n FROM srs_reviews').get();
    assert.equal(afterCards.n, 0);
    assert.equal(afterReviews.n, 0);

    db.close();
  });

  it('migration runner is idempotent', () => {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    db.exec('CREATE TABLE users (id TEXT PRIMARY KEY)');

    const first = runMigrations(db, migrationsDir);
    const second = runMigrations(db, migrationsDir);
    assert.equal(first.applied.length, 1);
    assert.equal(second.applied.length, 0);
    assert.equal(second.skipped.length, 1);

    db.close();
  });
});
