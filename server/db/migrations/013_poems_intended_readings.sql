-- 013: Add intended_readings JSON column to poems for multi-tone
-- (多音字) user selection. Per-cell pin shape:
--   { "<cellIndex>": { "tone": "平", "rhyme": "一東" } }
-- Empty object {} is the default for new/unmigrated poems.
--
-- Note: no explicit BEGIN/COMMIT — the migration runner wraps each
-- migration in a transaction (server/db/migrate.mjs).

ALTER TABLE poems ADD COLUMN intended_readings TEXT NOT NULL DEFAULT '{}';
