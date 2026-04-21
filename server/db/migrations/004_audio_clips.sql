-- =============================================================================
-- Migration 004 — Audio clip management for admin review system
--
-- Adds audio_clips table for tracking generated TTS audio files with
-- approval workflow. Also adds audio_intent column to user_trainer_state.
--
-- Safe to re-run: every CREATE uses IF NOT EXISTS.
-- =============================================================================

CREATE TABLE IF NOT EXISTS audio_clips (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  text          TEXT    NOT NULL,
  voice_kind    TEXT    NOT NULL CHECK (voice_kind IN ('mandarin','cantonese')),
  provider      TEXT    NOT NULL CHECK (provider IN ('azure','elevenlabs')),
  voice_id      TEXT    NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected')),
  file_path     TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  reviewed_at   TEXT,
  reviewed_by   TEXT,
  usage_context TEXT,   -- JSON array of strings

  UNIQUE (text, voice_kind, provider, voice_id)
);

CREATE INDEX IF NOT EXISTS idx_audio_clips_status
  ON audio_clips (status);

CREATE INDEX IF NOT EXISTS idx_audio_clips_vk_status
  ON audio_clips (voice_kind, status);

CREATE INDEX IF NOT EXISTS idx_audio_clips_text
  ON audio_clips (text);

-- Add audio_intent column to user_trainer_state (for foundation autoplay toggle)
ALTER TABLE user_trainer_state
  ADD COLUMN audio_intent TEXT NOT NULL DEFAULT 'auto-on'
  CHECK (audio_intent IN ('auto-on', 'auto-off'));
