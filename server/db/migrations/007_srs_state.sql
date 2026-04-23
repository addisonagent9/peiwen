CREATE TABLE IF NOT EXISTS srs_state (
  user_id        TEXT NOT NULL,
  text           TEXT NOT NULL,
  rhyme_id       TEXT NOT NULL,
  interval_days  INTEGER NOT NULL DEFAULT 1,
  ease_factor    REAL NOT NULL DEFAULT 2.5,
  next_review    TEXT NOT NULL,
  last_reviewed  TEXT,
  correct_count  INTEGER NOT NULL DEFAULT 0,
  wrong_count    INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'new'
                   CHECK (status IN ('new', 'learning', 'mastered')),
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, text)
);

CREATE INDEX IF NOT EXISTS idx_srs_state_due
  ON srs_state (user_id, next_review);

CREATE INDEX IF NOT EXISTS idx_srs_state_rhyme
  ON srs_state (rhyme_id);
