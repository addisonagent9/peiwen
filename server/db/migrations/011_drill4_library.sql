CREATE TABLE IF NOT EXISTS user_rhyme_library (
  user_id TEXT NOT NULL,
  rhyme_id TEXT NOT NULL,
  char TEXT NOT NULL,
  source TEXT NOT NULL,
  added_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, rhyme_id, char),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_url_user_rhyme ON user_rhyme_library(user_id, rhyme_id);

INSERT OR IGNORE INTO app_settings (key, value, description) VALUES
  ('drill4_correct_advance_ms', '1500', 'Drill 4 auto-advance delay after correct answer (ms)');
