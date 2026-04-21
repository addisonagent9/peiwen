-- =============================================================================
-- Migration 002 — 平水韵 Trainer: SRS + user progress tables
--
-- Adds four tables to the existing poetry-checker SQLite database:
--   srs_cards           — per-character spaced-repetition state (SM-2)
--   srs_reviews         — append-only log of every review event
--   user_rhyme_progress — aggregated mastery per 韵部 per user
--   user_trainer_state  — top-level trainer state (foundation done? tier? streak?)
--
-- Assumes the existing `users` table has a TEXT PRIMARY KEY `id`.
-- If your users PK column is named differently, update the FOREIGN KEY refs.
--
-- Safe to re-run: every CREATE uses IF NOT EXISTS.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- srs_cards: one row per (user, character) that has ever entered the SRS system
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS srs_cards (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         TEXT    NOT NULL,
  character       TEXT    NOT NULL,       -- the Chinese character itself, e.g. '月'
  rhyme_id        TEXT    NOT NULL,       -- e.g. 'shangping-01-dong'

  -- SM-2 algorithm state
  state           TEXT    NOT NULL
                    CHECK (state IN ('new','learning','review','mastered','suspended'))
                    DEFAULT 'new',
  interval_days   REAL    NOT NULL DEFAULT 0,   -- days until next review
  ease_factor     REAL    NOT NULL DEFAULT 2.5, -- SM-2 EF, min 1.3
  repetitions     INTEGER NOT NULL DEFAULT 0,   -- consecutive successful reviews
  lapses          INTEGER NOT NULL DEFAULT 0,   -- times fallen back to learning

  -- Scheduling
  due_date        TEXT    NOT NULL,       -- ISO-8601 UTC timestamp
  last_reviewed   TEXT,                   -- ISO-8601 UTC or NULL
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, character)
);

-- Hot path: "give me all cards due for user X right now"
CREATE INDEX IF NOT EXISTS idx_srs_cards_due
  ON srs_cards (user_id, due_date)
  WHERE state != 'suspended';

-- Query: "mastery counts by rhyme for user X"
CREATE INDEX IF NOT EXISTS idx_srs_cards_user_rhyme
  ON srs_cards (user_id, rhyme_id, state);

-- -----------------------------------------------------------------------------
-- srs_reviews: append-only review log (useful for analytics + undo)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS srs_reviews (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id           INTEGER NOT NULL,
  grade             INTEGER NOT NULL CHECK (grade BETWEEN 0 AND 5),
  drill_type        TEXT    NOT NULL
                      CHECK (drill_type IN (
                        'char-to-rhyme','rhyme-to-chars','rhyme-judgment',
                        'odd-one-out','tone-id','poem-rhyme-tag'
                      )),
  reviewed_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  response_time_ms  INTEGER,                  -- how long the user took (nullable)
  previous_interval REAL    NOT NULL,
  new_interval      REAL    NOT NULL,

  FOREIGN KEY (card_id) REFERENCES srs_cards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_srs_reviews_card_time
  ON srs_reviews (card_id, reviewed_at DESC);

-- -----------------------------------------------------------------------------
-- user_rhyme_progress: aggregated state per 韵部 per user
-- Driven by triggers or backend rollup on review. Speeds up dashboard queries.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_rhyme_progress (
  user_id          TEXT    NOT NULL,
  rhyme_id         TEXT    NOT NULL,

  -- 0=locked 1=introduced 2=learning 3=review 4=mastered
  mastery_level    INTEGER NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 4),

  unlocked_at      TEXT,                    -- ISO-8601 or NULL if still locked
  mastered_at      TEXT,                    -- ISO-8601 or NULL
  recent_accuracy  REAL    NOT NULL DEFAULT 0, -- rolling avg across last 20 reviews
  review_count     INTEGER NOT NULL DEFAULT 0,

  PRIMARY KEY (user_id, rhyme_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- user_trainer_state: top-level trainer state per user
-- One row per user. Created on first trainer visit.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_trainer_state (
  user_id                TEXT    PRIMARY KEY,
  foundation_completed   INTEGER NOT NULL DEFAULT 0, -- 0/1 boolean
  current_tier           INTEGER NOT NULL DEFAULT 1 CHECK (current_tier BETWEEN 1 AND 3),
  streak_days            INTEGER NOT NULL DEFAULT 0,
  last_activity_date     TEXT,                       -- YYYY-MM-DD in user's local tz
  ui_language            TEXT    NOT NULL DEFAULT 'zh-Hans'
                            CHECK (ui_language IN ('zh-Hans','zh-Hant','en-bilingual')),
  created_at             TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at             TEXT    NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================================
-- Verification queries (safe to run after migration)
-- =============================================================================
--
--   SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'srs_%'
--     OR name LIKE 'user_%trainer%' OR name LIKE 'user_rhyme%';
--
--   Expected: srs_cards, srs_reviews, user_rhyme_progress, user_trainer_state
-- =============================================================================
