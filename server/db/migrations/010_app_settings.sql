CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  updated_by TEXT
);

INSERT OR IGNORE INTO app_settings (key, value, description) VALUES
  ('drill3_correct_advance_ms', '700', 'Drill 3 auto-advance delay after correct answer (ms)'),
  ('drill3_wrong_advance_ms', '1400', 'Drill 3 auto-advance delay after wrong answer, with countdown bar (ms)');
