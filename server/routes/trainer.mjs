/**
 * Trainer state Express routes.
 *
 * Mounted under /api/trainer. Manages the "meta" state of the trainer —
 * foundation module completion, streak, language pref.
 *
 * ── Endpoints ────────────────────────────────────────────────────────────────
 *   GET    /state              → current user's trainer state (lazy-init)
 *   PATCH  /state              → partial update (language, foundation, streak)
 *   POST   /foundation/complete → mark Phase 0 foundation as done
 */

import express from 'express';

function getUserId(req) {
  const id = req.user?.id;
  if (typeof id !== 'string') throw new Error('AUTH_REQUIRED');
  return id;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export function createTrainerRouter(repo, requireAuth) {
  const router = express.Router();

  // GET /api/trainer/state --------------------------------------------------
  router.get(
    '/state',
    requireAuth,
    (req, res, next) => {
      try {
        const userId = getUserId(req);
        const state = repo.ensureTrainerState(userId);
        res.json({ state });
      } catch (err) {
        next(err);
      }
    },
  );

  // PATCH /api/trainer/state ------------------------------------------------
  router.patch(
    '/state',
    requireAuth,
    express.json(),
    (req, res, next) => {
      try {
        const userId = getUserId(req);
        const current = repo.ensureTrainerState(userId);
        const patch = req.body ?? {};

        const ALLOWED_LANGS = new Set(['zh-Hans', 'zh-Hant', 'en-bilingual']);
        if (
          patch.uiLanguage !== undefined &&
          !ALLOWED_LANGS.has(patch.uiLanguage)
        ) {
          res.status(400).json({ error: 'INVALID_LANGUAGE' });
          return;
        }

        repo.upsertTrainerState({
          ...current,
          foundationCompleted:
            patch.foundationCompleted ?? current.foundationCompleted,
          uiLanguage: patch.uiLanguage ?? current.uiLanguage,
          lastActivityDate:
            patch.lastActivityDate ?? current.lastActivityDate,
          streakDays: patch.streakDays ?? current.streakDays,
          // currentTier is not patchable via PATCH — it's a legacy column
        });
        res.json({ state: repo.getTrainerState(userId) });
      } catch (err) {
        next(err);
      }
    },
  );

  // POST /api/trainer/foundation/complete ----------------------------------
  router.post(
    '/foundation/complete',
    requireAuth,
    (req, res, next) => {
      try {
        const userId = getUserId(req);
        const current = repo.ensureTrainerState(userId);
        repo.upsertTrainerState({ ...current, foundationCompleted: true });
        res.json({ state: repo.getTrainerState(userId) });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
