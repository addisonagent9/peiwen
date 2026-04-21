-- =============================================================================
-- Migration 005 — add 'alibaba' to audio_clips.provider CHECK constraint
--
-- SQLite requires table recreation to modify CHECK constraints.
-- Safe to re-run: IF NOT EXISTS on indexes, and the table recreation is
-- idempotent (if audio_clips already has the alibaba constraint, the new
-- table will be identical to the old one).
-- =============================================================================

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS audio_clips_new (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  text          TEXT    NOT NULL,
  voice_kind    TEXT    NOT NULL CHECK (voice_kind IN ('mandarin','cantonese')),
  provider      TEXT    NOT NULL CHECK (provider IN ('azure','elevenlabs','alibaba')),
  voice_id      TEXT    NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected')),
  file_path     TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  reviewed_at   TEXT,
  reviewed_by   TEXT,
  usage_context TEXT,

  UNIQUE (text, voice_kind, provider, voice_id)
);

INSERT OR IGNORE INTO audio_clips_new SELECT * FROM audio_clips;
DROP TABLE IF EXISTS audio_clips;
ALTER TABLE audio_clips_new RENAME TO audio_clips;

CREATE INDEX IF NOT EXISTS idx_audio_clips_status
  ON audio_clips (status);

CREATE INDEX IF NOT EXISTS idx_audio_clips_vk_status
  ON audio_clips (voice_kind, status);

CREATE INDEX IF NOT EXISTS idx_audio_clips_text
  ON audio_clips (text);

PRAGMA foreign_keys = ON;
