-- Per completed drill session
CREATE TABLE IF NOT EXISTS drill_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  tier INTEGER NOT NULL,
  drill_number INTEGER NOT NULL,
  rhyme_id TEXT,
  size INTEGER NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_drill_sessions_user_tier_drill
  ON drill_sessions(user_id, tier, drill_number);

-- Drill unlock state within a tier
CREATE TABLE IF NOT EXISTS tier_drill_unlocks (
  user_id TEXT NOT NULL,
  tier INTEGER NOT NULL,
  drill_number INTEGER NOT NULL,
  unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, tier, drill_number),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tier-level unlock state
CREATE TABLE IF NOT EXISTS tier_unlocks (
  user_id TEXT NOT NULL,
  tier INTEGER NOT NULL,
  unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, tier),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Backfill: all existing users get Tier 1 + Drill 1 unlocked
INSERT OR IGNORE INTO tier_unlocks (user_id, tier)
  SELECT id, 1 FROM users;
INSERT OR IGNORE INTO tier_drill_unlocks (user_id, tier, drill_number)
  SELECT id, 1, 1 FROM users;
