/**
 * Drill routes — GET /status, GET /queue, POST /response
 * Mounted at /api/trainer/drill
 *
 * No SRS scheduling. All chars always available. Interleaved difficulty
 * sets for pedagogically effective drilling.
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

const INTERLEAVE_TEMPLATES = {
  5:  [1, 1, 2, 1, 3],
  10: [1, 1, 2, 1, 3, 2, 1, 4, 3, 2],
  20: [1, 1, 2, 1, 3, 2, 1, 4, 3, 2, 1, 1, 2, 3, 2, 4, 3, 2, 1, 3],
};

function buildInterleaveTemplate(size) {
  if (INTERLEAVE_TEMPLATES[size]) return INTERLEAVE_TEMPLATES[size];
  if (size >= 50) {
    const t10 = INTERLEAVE_TEMPLATES[10];
    const result = [];
    for (let i = 0; i < Math.ceil(size / 10); i++) {
      result.push(...t10);
    }
    return result.slice(0, size);
  }
  return INTERLEAVE_TEMPLATES[10].slice(0, size);
}

function buildInterleavedQueue(pool, limit) {
  const template = buildInterleaveTemplate(limit);
  const bySet = { 1: [], 2: [], 3: [], 4: [] };
  for (const c of shuffle(pool)) {
    if (bySet[c.set]) bySet[c.set].push(c);
  }

  const picked = new Set();
  const result = [];

  for (const targetSet of template) {
    if (result.length >= limit) break;
    let char = null;
    for (let s = targetSet; s >= 1; s--) {
      const idx = bySet[s]?.findIndex(c => !picked.has(c.char));
      if (idx !== undefined && idx >= 0) {
        char = bySet[s].splice(idx, 1)[0];
        break;
      }
    }
    if (!char) {
      for (let s = targetSet + 1; s <= 4; s++) {
        const idx = bySet[s]?.findIndex(c => !picked.has(c.char));
        if (idx !== undefined && idx >= 0) {
          char = bySet[s].splice(idx, 1)[0];
          break;
        }
      }
    }
    if (char) {
      picked.add(char.char);
      result.push(char);
    }
  }

  return result;
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

  // GET /queue?type=char-to-rhyme&limit=10&scope=all|tier1
  router.get('/queue', composedGate, (req, res, next) => {
    try {
      // scope param accepted for future tier expansion; currently only Tier 1 exists
      const seedPool = TIER1_SEED_CHARS;
      const limit = Math.min(seedPool.length, Math.max(1, parseInt(req.query.limit) || 10));

      const selected = buildInterleavedQueue(seedPool, limit);

      const items = selected.map(seed => ({
        type: 'char-to-rhyme',
        text: seed.char,
        rhymeId: seed.rhymeId,
        pinyin: seed.pinyin,
        jyutping: seed.jyutping,
        options: shuffle([seed.rhymeId, ...pickDistractors(seed.rhymeId)]),
      }));

      res.json({ items, totalAvailable: seedPool.length });
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
