-- 016_users_prefers_simplified.sql
-- Adds prefers_simplified to users table (0=繁體, 1=简体).
-- Default 0 preserves current UX for existing users.
-- ui_language default in user_trainer_state stays 'zh-Hans' — they
-- are allowed to diverge for users who never click the toggle. Sync
-- only happens on explicit toggle action.
ALTER TABLE users ADD COLUMN prefers_simplified INTEGER NOT NULL DEFAULT 0;
