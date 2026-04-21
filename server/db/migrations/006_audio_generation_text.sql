-- =============================================================================
-- Migration 006 — Add generation_text column to audio_clips
--
-- Allows admin to override the text sent to TTS (e.g. "一朵花" instead of "花"
-- to work around single-character mispronunciation).
-- =============================================================================

ALTER TABLE audio_clips ADD COLUMN generation_text TEXT;

-- Backfill: existing clips used their target text as generation input
UPDATE audio_clips SET generation_text = text WHERE generation_text IS NULL;
