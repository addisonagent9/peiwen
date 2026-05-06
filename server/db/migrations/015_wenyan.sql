-- 015: 文言教材 module foundation
-- Creates 5 tables for the admin-only wenyan learning module:
--   wenyan_dict_entries        — sense-keyed dictionary entries (the durable artifact)
--   wenyan_dict_entry_poems    — M:N join: which poems exemplify which sense
--   wenyan_user_progress       — per-user poem completion
--   wenyan_user_vocab          — per-user library, keyed on entry_id
--   wenyan_pairing_sessions    — pairing exercise history
--
-- Notes:
-- - No BEGIN/COMMIT (runner wraps each migration in a transaction).
-- - CREATE-only migration. No DROP/RENAME, so defer_foreign_keys
--   is not needed.
-- - poem_id is TEXT slug (e.g., "libai-jingyesi"), no FK to a
--   wenyan_poems table (poems live in JSON content file in v1;
--   FK can be added in a later migration if schema grows).

CREATE TABLE IF NOT EXISTS wenyan_dict_entries (
  entry_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  word            TEXT NOT NULL,
  sense_slug      TEXT NOT NULL,
  pinyin          TEXT,
  modern_meaning  TEXT NOT NULL,
  ancient_meaning TEXT NOT NULL,
  notes           TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (word, sense_slug)
);

CREATE INDEX IF NOT EXISTS idx_wenyan_dict_entries_word
  ON wenyan_dict_entries (word);

CREATE TABLE IF NOT EXISTS wenyan_dict_entry_poems (
  entry_id  INTEGER NOT NULL REFERENCES wenyan_dict_entries(entry_id),
  poem_id   TEXT NOT NULL,
  position  TEXT,
  PRIMARY KEY (entry_id, poem_id)
);

CREATE INDEX IF NOT EXISTS idx_wenyan_dict_entry_poems_poem
  ON wenyan_dict_entry_poems (poem_id);

CREATE TABLE IF NOT EXISTS wenyan_user_progress (
  user_id      TEXT NOT NULL REFERENCES users(id),
  poem_id      TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, poem_id)
);

CREATE TABLE IF NOT EXISTS wenyan_user_vocab (
  user_id            TEXT NOT NULL REFERENCES users(id),
  entry_id           INTEGER NOT NULL REFERENCES wenyan_dict_entries(entry_id),
  first_seen_poem_id TEXT NOT NULL,
  learned_at         TEXT NOT NULL DEFAULT (datetime('now')),
  mastery            INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, entry_id)
);

CREATE INDEX IF NOT EXISTS idx_wenyan_user_vocab_user_time
  ON wenyan_user_vocab (user_id, learned_at DESC);

CREATE TABLE IF NOT EXISTS wenyan_pairing_sessions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        TEXT NOT NULL REFERENCES users(id),
  entry_ids_json TEXT NOT NULL,
  correct_count  INTEGER NOT NULL,
  total_count    INTEGER NOT NULL,
  completed_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_wenyan_pairing_sessions_user_time
  ON wenyan_pairing_sessions (user_id, completed_at DESC);
