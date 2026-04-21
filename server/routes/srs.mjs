/**
 * SRS Express routes.
 *
 * Mounted under /api/srs in the example wiring (see server/trainer/index.mjs).
 * Every route is guarded by the auth middleware passed into createSRSRouter,
 * and every query is scoped to req.user.id — no cross-user access possible.
 *
 * ── Endpoints ────────────────────────────────────────────────────────────────
 *   GET    /due                 → cards due now for the current user
 *   POST   /seed/:rhymeId       → create cards for a rhyme's seed characters
 *   POST   /review              → submit a review { cardId, grade, drillType,
 *                                                    responseTimeMs? }
 *   GET    /progress            → per-rhyme mastery rollup
 *
 * The :rhymeId path param must match a rhyme in the curriculum data. Seed
 * character lists are looked up from the curriculum module, not passed in
 * by the client — this way the client can't inject arbitrary characters.
 */

import express from 'express';
import { rhymeById } from '../data/trainer-curriculum.mjs';

// ---------------------------------------------------------------------------
// Authed request helpers
// ---------------------------------------------------------------------------

/**
 * We assume your auth middleware attaches `req.user = { id: string }`.
 * If your middleware uses a different shape (e.g. `req.userId`,
 * `req.session.userId`), adjust `getUserId` below — it's the only place
 * the coupling lives.
 */
export function getUserId(req) {
  const id = req.user?.id;
  if (typeof id !== 'string') {
    throw new Error('AUTH_REQUIRED');
  }
  return id;
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const VALID_GRADES = new Set([0, 1, 2, 3, 4, 5]);
const VALID_DRILLS = new Set([
  'char-to-rhyme',
  'rhyme-to-chars',
  'rhyme-judgment',
  'odd-one-out',
  'tone-id',
  'poem-rhyme-tag',
]);

function isValidGrade(v) {
  return typeof v === 'number' && VALID_GRADES.has(v);
}
function isValidDrillType(v) {
  return typeof v === 'string' && VALID_DRILLS.has(v);
}

// ---------------------------------------------------------------------------
// Router factory
// ---------------------------------------------------------------------------

export function createSRSRouter(repo, requireAuth) {
  const router = express.Router();

  // GET /api/srs/due ---------------------------------------------------------
  router.get(
    '/due',
    requireAuth,
    (req, res, next) => {
      try {
        const userId = getUserId(req);
        const cards = repo.getDueCards(userId, new Date());
        res.json({ cards });
      } catch (err) {
        next(err);
      }
    },
  );

  // POST /api/srs/seed/:rhymeId ---------------------------------------------
  router.post(
    '/seed/:rhymeId',
    requireAuth,
    (req, res, next) => {
      try {
        const userId = getUserId(req);
        const rhymeIdParam = req.params.rhymeId;
        const rhymeIdStr = Array.isArray(rhymeIdParam)
          ? rhymeIdParam[0]
          : rhymeIdParam;
        if (typeof rhymeIdStr !== 'string') {
          res.status(400).json({ error: 'INVALID_RHYME_ID' });
          return;
        }
        const rhyme = rhymeById(rhymeIdStr);
        if (!rhyme) {
          res.status(404).json({ error: 'UNKNOWN_RHYME' });
          return;
        }
        const created = repo.seedCardsForRhyme(
          userId,
          rhyme.id,
          rhyme.seedCharacters,
        );
        res.json({ created, total: rhyme.seedCharacters.length });
      } catch (err) {
        next(err);
      }
    },
  );

  // POST /api/srs/review ----------------------------------------------------
  router.post(
    '/review',
    requireAuth,
    express.json(),
    (req, res, next) => {
      try {
        const userId = getUserId(req);
        const { cardId, grade, drillType, responseTimeMs } = req.body ?? {};

        if (typeof cardId !== 'number') {
          res.status(400).json({ error: 'INVALID_CARD_ID' });
          return;
        }
        if (!isValidGrade(grade)) {
          res.status(400).json({ error: 'INVALID_GRADE' });
          return;
        }
        if (!isValidDrillType(drillType)) {
          res.status(400).json({ error: 'INVALID_DRILL_TYPE' });
          return;
        }
        if (
          responseTimeMs !== undefined &&
          (typeof responseTimeMs !== 'number' || responseTimeMs < 0)
        ) {
          res.status(400).json({ error: 'INVALID_RESPONSE_TIME' });
          return;
        }

        const updated = repo.applyReview(userId, {
          cardId,
          grade,
          drillType,
          responseTimeMs,
        });
        res.json({ card: updated });
      } catch (err) {
        if (err instanceof Error && err.message.includes('not found')) {
          res.status(404).json({ error: 'CARD_NOT_FOUND' });
          return;
        }
        if (
          err instanceof Error &&
          err.message.includes('does not belong')
        ) {
          res.status(403).json({ error: 'FORBIDDEN' });
          return;
        }
        next(err);
      }
    },
  );

  // GET /api/srs/progress ---------------------------------------------------
  router.get(
    '/progress',
    requireAuth,
    (req, res, next) => {
      try {
        const userId = getUserId(req);
        const progress = repo.getProgress(userId);
        res.json({ progress });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
