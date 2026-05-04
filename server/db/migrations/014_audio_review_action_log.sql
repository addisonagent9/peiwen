-- =============================================================================
-- Migration 014 — Audio review action log + per-status timestamps (#23)
--
-- Adds:
--   1. audio_clips.review_approved_at / review_rejected_at — temporal columns
--      that enable "latest-approved-first" sort in the Audio Review Library.
--      Backfilled from reviewed_at for existing approved/rejected rows.
--   2. review_action_log — durable history of approve/reject/bulk-approve
--      actions. Each row carries a JSON payload of pre-action state for
--      every affected clip (primary + auto-rejected siblings, or all clips
--      from a bulk operation), so /undo can restore exact prior state.
--      undone_at marks an entry as already reverted; multi-press undo walks
--      back through NOT-yet-undone entries in created_at DESC order, capped
--      at the user's last 20 actions.
--
-- Per #23 v1 scope:
--   - regenerate is intentionally excluded from undo coverage (cost-bearing,
--     user-confirmed at click time).
--   - File restoration is not attempted for clips whose .mp3 was unlinked
--     (rejected siblings during approve, or rejected clips). Undo restores
--     DB state only; the UI surfaces hasFile=false so user can Regenerate.
-- =============================================================================

ALTER TABLE audio_clips ADD COLUMN review_approved_at TEXT;
ALTER TABLE audio_clips ADD COLUMN review_rejected_at TEXT;

UPDATE audio_clips
SET review_approved_at = COALESCE(reviewed_at, created_at)
WHERE status = 'approved' AND review_approved_at IS NULL;

UPDATE audio_clips
SET review_rejected_at = COALESCE(reviewed_at, created_at)
WHERE status = 'rejected' AND review_rejected_at IS NULL;

CREATE TABLE IF NOT EXISTS review_action_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT    NOT NULL REFERENCES users(id),
  action      TEXT    NOT NULL CHECK (action IN ('approve','reject','bulk-approve')),
  -- JSON: { items: [{ primary: ClipSnapshot, siblings: ClipSnapshot[] }],
  --         displayText?, displayVoiceKind?, count? }
  -- ClipSnapshot: { clipId, prevStatus, prevFilePath, prevReviewedAt,
  --                 prevReviewedBy, prevReviewApprovedAt, prevReviewRejectedAt,
  --                 newStatus, newFilePath }
  payload     TEXT    NOT NULL,
  created_at  INTEGER NOT NULL,  -- unix milliseconds
  undone_at   INTEGER             -- nullable; NULL = available to undo
);

CREATE INDEX IF NOT EXISTS idx_review_action_log_user_time
  ON review_action_log (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_review_action_log_undone
  ON review_action_log (user_id, undone_at, created_at DESC);
