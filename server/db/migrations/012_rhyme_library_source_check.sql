-- 012: Add CHECK constraint on user_rhyme_library.source to
-- enumerate valid values (drill4, manual, practice). The 'practice'
-- value is for chars added via the 韵部库 self-practice exercise.

BEGIN TRANSACTION;

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

-- 2. Copy existing rows (all should satisfy the new constraint
-- since current values are 'drill4' or 'manual')
INSERT INTO user_rhyme_library_new (user_id, rhyme_id, char, source, added_at)
  SELECT user_id, rhyme_id, char, source, added_at
  FROM user_rhyme_library;

-- 3. Drop old table
DROP TABLE user_rhyme_library;

-- 4. Rename new table
ALTER TABLE user_rhyme_library_new RENAME TO user_rhyme_library;

-- 5. Recreate indexes from migration 011
CREATE INDEX IF NOT EXISTS idx_url_user_rhyme ON user_rhyme_library(user_id, rhyme_id);

COMMIT;
