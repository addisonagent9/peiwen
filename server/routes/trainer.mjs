/**
 * Trainer state Express routes.
 *
 * Mounted under /api/trainer. Manages the "meta" state of the trainer —
 * foundation module completion, tier progression, streak, language pref.
 *
 * ── Endpoints ────────────────────────────────────────────────────────────────
 *   GET    /state              → current user's trainer state (lazy-init)
 *   PATCH  /state              → partial update (language, foundation, streak)
 *   POST   /foundation/complete → mark Phase 0 foundation as done
 *   POST   /tier/unlock        → advance to next tier if prereqs met
 */

import express from 'express';
import { rhymesByTier } from '../data/trainer-curriculum.mjs';

function getUserId(req) {
  const id = req.user?.id;
  if (typeof id !== 'string') throw new Error('AUTH_REQUIRED');
  return id;
}

// ---------------------------------------------------------------------------
// Tier-unlock prerequisite logic
// ---------------------------------------------------------------------------

/**
 * A user can unlock tier N if all tier N-1 rhymes have mastery_level >= 3
 * (i.e. in 'review' state — they don't need to be fully 'mastered',
 * which would take months of real-time calendar delay).
 *
 * This threshold can be tuned: stricter (=4) would require full mastery;
 * looser (=2) would let users speed-run. Level 3 is the sweet spot.
 */
function tierUnlockAllowed(repo, userId, targetTier) {
  if (targetTier === 1) return { allowed: true };

  const prevTier = targetTier - 1;
  const prevRhymes = rhymesByTier(prevTier);
  const progress = repo.getProgress(userId);
  const byId = new Map(progress.map((p) => [p.rhymeId, p]));

  const unmet = prevRhymes.filter((r) => {
    const p = byId.get(r.id);
    return !p || p.masteryLevel < 3;
  });

  if (unmet.length === 0) return { allowed: true };

  return {
    allowed: false,
    reason:
      `Tier ${prevTier} not yet mastered — ` +
      `${unmet.length} of ${prevRhymes.length} rhymes still below review level`,
  };
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
          // currentTier is deliberately NOT patchable here — use /tier/unlock
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

  // POST /api/trainer/tier/unlock ------------------------------------------
  router.post(
    '/tier/unlock',
    requireAuth,
    (req, res, next) => {
      try {
        const userId = getUserId(req);
        const current = repo.ensureTrainerState(userId);
        const targetTier = current.currentTier + 1;

        if (targetTier > 3) {
          res.status(400).json({ error: 'ALREADY_AT_MAX_TIER' });
          return;
        }

        const gate = tierUnlockAllowed(repo, userId, targetTier);
        if (!gate.allowed) {
          res.status(403).json({
            error: 'PREREQUISITES_NOT_MET',
            reason: gate.reason,
          });
          return;
        }

        repo.upsertTrainerState({ ...current, currentTier: targetTier });
        res.json({ state: repo.getTrainerState(userId) });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
