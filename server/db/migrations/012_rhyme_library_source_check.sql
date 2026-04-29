-- 012: Add CHECK constraint on user_rhyme_library.source to
-- enumerate valid values (drill4, manual, practice). The 'practice'
-- value is for chars added via the 韵部库 self-practice exercise.
--
-- Note: no explicit BEGIN/COMMIT — the migration runner wraps each
-- migration in a transaction (server/db/migrate.mjs).
--
-- PRAGMA defer_foreign_keys is required because DROP TABLE inside a
-- transaction with foreign_keys=ON triggers an FK check. Deferring
-- lets the rebuild complete before FK validation runs at COMMIT.

PRAGMA defer_foreign_keys = ON;

-- 1. Create new table with constraint
CREATE TABLE user_rhyme_library_new (
  user_id TEXT NOT NULL,
  rhyme_id TEXT NOT NULL,
  char TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('drill4', 'manual', 'practice')),
  added_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, rhyme_id, char),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 2. Copy existing rows
INSERT INTO user_rhyme_library_new (user_id, rhyme_id, char, source, added_at)
  SELECT user_id, rhyme_id, char, source, added_at
  FROM user_rhyme_library;

-- 3. Drop old table
DROP TABLE user_rhyme_library;

-- 4. Rename new table
ALTER TABLE user_rhyme_library_new RENAME TO user_rhyme_library;

-- 5. Recreate index dropped with old table
CREATE INDEX IF NOT EXISTS idx_url_user_rhyme ON user_rhyme_library(user_id, rhyme_id);
