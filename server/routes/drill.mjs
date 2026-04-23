/**
 * Drill routes — GET /status, GET /queue, POST /response
 * Mounted at /api/trainer/drill
 *
 * No SRS scheduling. All chars always available; drill picks N random
 * from the tier pool. correct_count/wrong_count tracked for analytics.
 */

import express from 'express';
import { TIER1_SEED_CHARS, TIER1_RHYME_IDS } from '../data/tier1-seed-chars.mjs';

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

  const sGet = db.prepare(`
    SELECT * FROM srs_state WHERE user_id = ? AND text = ?
  `);

  const sUpsert = db.prepare(`
    INSERT INTO srs_state (user_id, text, rhyme_id, interval_days, ease_factor, next_review, last_reviewed, correct_count, wrong_count, status)
    VALUES (?, ?, ?, 1, 2.5, datetime('now'), datetime('now'), ?, ?, 'learning')
    ON CONFLICT(user_id, text) DO UPDATE SET
      last_reviewed = datetime('now'),
      correct_count = excluded.correct_count,
      wrong_count = excluded.wrong_count
  `);

  const sStats = db.prepare(`
    SELECT
      COUNT(*) as total_count,
      COALESCE(SUM(correct_count), 0) as correct_total,
      COALESCE(SUM(wrong_count), 0) as wrong_total
    FROM srs_state WHERE user_id = ?
  `);

  // GET /status
  router.get('/status', composedGate, (req, res, next) => {
    try {
      const userId = req.user.id;
      const row = sStats.get(userId);
      res.json({
        totalCount: row.total_count,
        totalDrilled: row.correct_total + row.wrong_total,
        correctCount: row.correct_total,
        wrongCount: row.wrong_total,
        totalAvailable: TIER1_SEED_CHARS.length,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /queue?type=char-to-rhyme&limit=10
  router.get('/queue', composedGate, (req, res, next) => {
    try {
      const limit = Math.min(TIER1_SEED_CHARS.length, Math.max(1, parseInt(req.query.limit) || 10));
      const pool = shuffle(TIER1_SEED_CHARS).slice(0, limit);

      const items = pool.map(seed => ({
        type: 'char-to-rhyme',
        text: seed.char,
        rhymeId: seed.rhymeId,
        pinyin: seed.pinyin,
        jyutping: seed.jyutping,
        options: shuffle([seed.rhymeId, ...pickDistractors(seed.rhymeId)]),
      }));

      res.json({ items, totalAvailable: TIER1_SEED_CHARS.length });
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
      const correctCount = (existing?.correct_count ?? 0) + (correct ? 1 : 0);
      const wrongCount = (existing?.wrong_count ?? 0) + (correct ? 0 : 1);

      sUpsert.run(userId, text, seed.rhymeId, correctCount, wrongCount);

      res.json({ ok: true, correctCount, wrongCount });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
