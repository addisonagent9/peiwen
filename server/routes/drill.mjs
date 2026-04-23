/**
 * Drill routes — GET /queue, POST /response
 * Mounted at /api/trainer/drill
 */

import express from 'express';
import { TIER1_SEED_CHARS, TIER1_RHYME_IDS } from '../data/tier1-seed-chars.mjs';
import { updateSrsState } from '../srs/algorithm.mjs';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(correctRhymeId, count = 3) {
  const others = TIER1_RHYME_IDS.filter(id => id !== correctRhymeId);
  return shuffle(others).slice(0, count);
}

export function createDrillRouter(db, composedGate) {
  const router = express.Router();

  const sDue = db.prepare(`
    SELECT * FROM srs_state
    WHERE user_id = ? AND next_review <= datetime('now')
    ORDER BY next_review ASC
    LIMIT ?
  `);

  const sExisting = db.prepare(`
    SELECT text FROM srs_state WHERE user_id = ?
  `);

  const sGet = db.prepare(`
    SELECT * FROM srs_state WHERE user_id = ? AND text = ?
  `);

  const sUpsert = db.prepare(`
    INSERT INTO srs_state (user_id, text, rhyme_id, interval_days, ease_factor, next_review, last_reviewed, correct_count, wrong_count, status)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?)
    ON CONFLICT(user_id, text) DO UPDATE SET
      interval_days = excluded.interval_days,
      ease_factor = excluded.ease_factor,
      next_review = excluded.next_review,
      last_reviewed = datetime('now'),
      correct_count = excluded.correct_count,
      wrong_count = excluded.wrong_count,
      status = excluded.status
  `);

  const sDueCount = db.prepare(`
    SELECT COUNT(*) as n FROM srs_state
    WHERE user_id = ? AND next_review <= datetime('now')
  `);

  const sTotalCount = db.prepare(`
    SELECT COUNT(*) as n FROM srs_state WHERE user_id = ?
  `);

  const sNextDue = db.prepare(`
    SELECT next_review FROM srs_state
    WHERE user_id = ? AND next_review > datetime('now')
    ORDER BY next_review ASC LIMIT 1
  `);

  // GET /status
  router.get('/status', composedGate, (req, res, next) => {
    try {
      const userId = req.user.id;
      const dueCount = sDueCount.get(userId).n;
      const totalCount = sTotalCount.get(userId).n;
      const nextRow = sNextDue.get(userId);
      const nextDueAt = nextRow?.next_review ?? null;
      let minutesUntilNext = null;
      if (nextDueAt) {
        const diff = new Date(nextDueAt).getTime() - Date.now();
        minutesUntilNext = Math.max(0, Math.round(diff / 60000));
      }
      res.json({ dueCount, totalCount, nextDueAt, minutesUntilNext });
    } catch (err) {
      next(err);
    }
  });

  // GET /queue?type=char-to-rhyme&limit=10
  router.get('/queue', composedGate, (req, res, next) => {
    try {
      const userId = req.user.id;
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

      const dueRows = sDue.all(userId, limit);
      const items = [];

      for (const row of dueRows) {
        const seed = TIER1_SEED_CHARS.find(s => s.char === row.text);
        if (!seed) continue;
        const distractors = pickDistractors(row.rhyme_id);
        items.push({
          type: 'char-to-rhyme',
          text: row.text,
          rhymeId: row.rhyme_id,
          pinyin: seed.pinyin,
          jyutping: seed.jyutping,
          options: shuffle([row.rhyme_id, ...distractors]),
        });
      }

      if (items.length < limit) {
        const existingSet = new Set(sExisting.all(userId).map(r => r.text));
        const newChars = TIER1_SEED_CHARS.filter(s => !existingSet.has(s.char));
        const backfill = shuffle(newChars).slice(0, limit - items.length);

        for (const seed of backfill) {
          const distractors = pickDistractors(seed.rhymeId);
          items.push({
            type: 'char-to-rhyme',
            text: seed.char,
            rhymeId: seed.rhymeId,
            pinyin: seed.pinyin,
            jyutping: seed.jyutping,
            options: shuffle([seed.rhymeId, ...distractors]),
          });
        }
      }

      const dueCount = sDueCount.get(userId).n;
      res.json({ items, dueCount });
    } catch (err) {
      next(err);
    }
  });

  // POST /response
  router.post('/response', composedGate, express.json(), (req, res, next) => {
    try {
      const userId = req.user.id;
      const { text, correct } = req.body ?? {};

      if (typeof text !== 'string' || typeof correct !== 'boolean') {
        return res.status(400).json({ error: 'INVALID_BODY' });
      }

      const seed = TIER1_SEED_CHARS.find(s => s.char === text);
      if (!seed) {
        return res.status(400).json({ error: 'UNKNOWN_CHAR' });
      }

      const existing = sGet.get(userId, text);
      const current = existing
        ? {
            interval_days: existing.interval_days,
            ease_factor: existing.ease_factor,
            status: existing.status,
            correct_count: existing.correct_count,
            wrong_count: existing.wrong_count,
          }
        : {
            interval_days: 1,
            ease_factor: 2.5,
            status: 'new',
            correct_count: 0,
            wrong_count: 0,
          };

      const updated = updateSrsState(current, correct);

      sUpsert.run(
        userId, text, seed.rhymeId,
        updated.interval_days, updated.ease_factor, updated.next_review,
        updated.correct_count, updated.wrong_count, updated.status,
      );

      res.json({
        ok: true,
        newInterval: updated.interval_days,
        newStatus: updated.status,
        nextReview: updated.next_review,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
