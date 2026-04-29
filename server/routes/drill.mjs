/**
 * Drill routes — GET /status, GET /queue, POST /response
 * Mounted at /api/trainer/drill
 *
 * No SRS scheduling. All chars always available. Interleaved difficulty
 * sets for pedagogically effective drilling.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TIER1_SEED_CHARS, TIER1_RHYME_IDS } from '../data/tier1-seed-chars.mjs';
import { RHYMES_PINGSHENG, FAMILIES } from '../data/trainer-curriculum.mjs';
import { getUnlockStatus, recordDrillCompletion, getDrillSessionCount, isDrillUnlocked } from '../trainer/unlocks.mjs';
import { getVariants } from '../lib/variants.mjs';

const __drill_dirname = path.dirname(fileURLToPath(import.meta.url));
let drill4Corpus = null;
let pingshuiData = null;
try {
  const corpusPath = path.resolve(__drill_dirname, '../../src/data/pingshui/drill4-corpus.json');
  drill4Corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
} catch { drill4Corpus = {}; }
try {
  const psPath = path.resolve(__drill_dirname, '../../src/data/pingshui.json');
  pingshuiData = JSON.parse(fs.readFileSync(psPath, 'utf8'));
} catch { pingshuiData = { chars: {}, rhymes: {} }; }

const VALID_RHYME_LABELS = new Set(RHYMES_PINGSHENG.map(r => r.label));

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

  // GET /recall-queue?limit=10
  router.get('/recall-queue', composedGate, (req, res, next) => {
    try {
      const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
      const byRhyme = {};
      for (const s of TIER1_SEED_CHARS) {
        if (!byRhyme[s.rhymeId]) byRhyme[s.rhymeId] = [];
        byRhyme[s.rhymeId].push(s);
      }
      const rhymeIds = Object.keys(byRhyme);
      const items = [];

      for (let i = 0; i < limit; i++) {
        const targetRhymeId = rhymeIds[i % rhymeIds.length];
        const targetPool = shuffle(byRhyme[targetRhymeId]);
        const template = buildInterleaveTemplate(4);
        const correct = [];
        const pickedChars = new Set();
        for (const targetSet of template) {
          let found = null;
          for (let s = targetSet; s >= 1; s--) {
            found = targetPool.find(c => c.set <= (s + 1) && c.set >= s && !pickedChars.has(c.char));
            if (found) break;
          }
          if (!found) found = targetPool.find(c => !pickedChars.has(c.char));
          if (found) {
            pickedChars.add(found.char);
            correct.push(found);
          }
        }
        if (correct.length < 4) {
          for (const c of targetPool) {
            if (correct.length >= 4) break;
            if (!pickedChars.has(c.char)) { correct.push(c); pickedChars.add(c.char); }
          }
        }

        const distractorRhymes = shuffle(rhymeIds.filter(id => id !== targetRhymeId));
        const distractors = [];
        for (const rid of distractorRhymes) {
          if (distractors.length >= 4) break;
          const pool = shuffle(byRhyme[rid]);
          for (const c of pool) {
            if (distractors.length >= 4) break;
            if (!pickedChars.has(c.char)) { distractors.push(c); pickedChars.add(c.char); }
          }
        }

        const allTiles = shuffle([...correct.slice(0, 4), ...distractors.slice(0, 4)]);
        items.push({
          type: 'rhyme-to-chars',
          targetRhymeId,
          targetLabel: RHYMES_PINGSHENG.find(r => r.id === targetRhymeId)?.label ?? targetRhymeId,
          tiles: allTiles.map(c => ({
            char: c.char,
            pinyin: c.pinyin,
            jyutping: c.jyutping,
            belongsToTarget: c.rhymeId === targetRhymeId,
          })),
        });
      }

      res.json({ items, totalAvailable: TIER1_SEED_CHARS.length });
    } catch (err) {
      next(err);
    }
  });

  // GET /pair-queue?scope=tier1&limit=10
  const VALID_SCOPES = new Set(['tier1']);
  const VALID_LIMITS = new Set([5, 10, 20]);

  router.get('/pair-queue', composedGate, (req, res, next) => {
    try {
      const userId = req.user.id;
      const scope = req.query.scope;
      if (!scope || !VALID_SCOPES.has(scope)) {
        return res.status(400).json({ error: 'INVALID_SCOPE' });
      }
      const limit = parseInt(req.query.limit) || 10;
      if (!VALID_LIMITS.has(limit)) {
        return res.status(400).json({ error: 'INVALID_LIMIT' });
      }
      if (!isDrillUnlocked(db, userId, 1, 3)) {
        return res.status(403).json({ error: 'DRILL_LOCKED' });
      }

      const byRhyme = {};
      for (const s of TIER1_SEED_CHARS) {
        if (!byRhyme[s.rhymeId]) byRhyme[s.rhymeId] = { 1: [], 2: [], 3: [], 4: [] };
        byRhyme[s.rhymeId][s.set].push(s);
      }
      const rhymeIds = TIER1_RHYME_IDS;
      const template = buildInterleaveTemplate(limit);
      const items = [];

      for (const targetSet of template) {
        let pair = null;
        for (let attempt = 0; attempt < 5 && !pair; attempt++) {
          let candidate = null;
          if (targetSet === 1) {
            const rid = rhymeIds[Math.floor(Math.random() * rhymeIds.length)];
            const pool = shuffle(byRhyme[rid][1]);
            if (pool.length >= 2) candidate = { left: pool[0], right: pool[1], rhymes: true };
          } else if (targetSet === 2) {
            const [r1, r2] = shuffle([...rhymeIds]).slice(0, 2);
            const l = shuffle(byRhyme[r1][1])[0];
            const r = shuffle(byRhyme[r2][1])[0];
            if (l && r) candidate = { left: l, right: r, rhymes: false };
          } else if (targetSet === 3) {
            const rid = rhymeIds[Math.floor(Math.random() * rhymeIds.length)];
            const common = shuffle(byRhyme[rid][1])[0];
            const rare = shuffle([...byRhyme[rid][3], ...byRhyme[rid][4]])[0];
            if (common && rare) candidate = { left: common, right: rare, rhymes: true };
          } else {
            const [r1, r2] = shuffle([...rhymeIds]).slice(0, 2);
            const l = shuffle([...byRhyme[r1][3], ...byRhyme[r1][4]])[0];
            const r = shuffle([...byRhyme[r2][3], ...byRhyme[r2][4]])[0];
            if (l && r) candidate = { left: l, right: r, rhymes: false };
          }
          if (candidate && candidate.left.char !== candidate.right.char) {
            pair = candidate;
          }
        }
        if (!pair) continue;

        const leftRhyme = RHYMES_PINGSHENG.find(r => r.id === pair.left.rhymeId);
        const rightRhyme = RHYMES_PINGSHENG.find(r => r.id === pair.right.rhymeId);
        const sameRhyme = pair.left.rhymeId === pair.right.rhymeId;
        const leftFamily = leftRhyme ? FAMILIES[leftRhyme.family] : null;
        const rightFamily = rightRhyme ? FAMILIES[rightRhyme.family] : null;
        const sameFamily = sameRhyme || (leftRhyme?.family === rightRhyme?.family);

        items.push({
          type: 'pair',
          left: { char: pair.left.char, pinyin: pair.left.pinyin, jyutping: pair.left.jyutping, rhymeId: pair.left.rhymeId },
          right: { char: pair.right.char, pinyin: pair.right.pinyin, jyutping: pair.right.jyutping, rhymeId: pair.right.rhymeId },
          rhymes: pair.rhymes,
          family: sameFamily && leftFamily ? leftFamily.label : null,
          teachingNote: sameRhyme
            ? { left: leftFamily?.teachingNote ?? null }
            : { left: leftFamily?.teachingNote ?? null, right: rightFamily?.teachingNote ?? null },
          mnemonic: sameRhyme
            ? { left: leftRhyme?.mnemonic ?? null }
            : { left: leftRhyme?.mnemonic ?? null, right: rightRhyme?.mnemonic ?? null },
          leftAnchor: leftRhyme?.anchorPoem ?? null,
          rightAnchor: sameRhyme ? null : (rightRhyme?.anchorPoem ?? null),
          leftLabel: leftRhyme?.label ?? pair.left.rhymeId,
          rightLabel: rightRhyme?.label ?? pair.right.rhymeId,
        });
      }

      res.json({ items });
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

  // GET /unlocks
  router.get('/unlocks', composedGate, (req, res, next) => {
    try {
      const userId = req.user.id;
      const status = getUnlockStatus(db, userId);
      const sessionCounts = {};
      for (const d of status.drills) {
        const key = `${d.tier}-${d.drillNumber}`;
        sessionCounts[key] = getDrillSessionCount(db, userId, d.tier, d.drillNumber);
      }
      res.json({ ...status, sessionCounts });
    } catch (err) {
      next(err);
    }
  });

  // POST /session-complete
  router.post('/session-complete', composedGate, express.json(), (req, res, next) => {
    try {
      const userId = req.user.id;
      const { tier, drillNumber, size, correctCount, wrongCount } = req.body ?? {};

      if (!tier || !drillNumber || !size) {
        return res.status(400).json({ error: 'INVALID_BODY' });
      }

      recordDrillCompletion(db, userId, tier, drillNumber, {
        size,
        correctCount: correctCount ?? 0,
        wrongCount: wrongCount ?? 0,
      });

      const status = getUnlockStatus(db, userId);
      res.json({ ok: true, unlocks: status });
    } catch (err) {
      next(err);
    }
  });

  // GET /word-queue?scope=tier1&limit=10
  router.get('/word-queue', composedGate, (req, res, next) => {
    try {
      const userId = req.user.id;
      if (!isDrillUnlocked(db, userId, 1, 4)) {
        return res.status(403).json({ error: 'DRILL_LOCKED' });
      }
      const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));
      const tier1Labels = TIER1_RHYME_IDS
        .map(id => RHYMES_PINGSHENG.find(r => r.id === id)?.label)
        .filter(Boolean);
      const perRhyme = Math.floor(limit / tier1Labels.length);
      const remainder = limit % tier1Labels.length;
      const items = [];
      const seen = new Set();
      for (let ri = 0; ri < tier1Labels.length; ri++) {
        const bucket = shuffle(drill4Corpus[tier1Labels[ri]] ?? []);
        const target = perRhyme + (ri < remainder ? 1 : 0);
        let picked = 0;
        for (const entry of bucket) {
          if (picked >= target) break;
          if (!seen.has(entry.word + '|' + entry.answer)) {
            seen.add(entry.word + '|' + entry.answer);
            items.push(entry);
            picked++;
          }
        }
      }
      res.json({ items: shuffle(items) });
    } catch (err) { next(err); }
  });

  // POST /word-response
  router.post('/word-response', composedGate, express.json(), (req, res, next) => {
    try {
      const userId = req.user.id;
      const { answer, expected, rhyme } = req.body ?? {};
      if (!answer || !expected) return res.status(400).json({ error: 'INVALID_BODY' });
      const a = answer.trim();
      const e = expected.trim();
      const corpusForRhyme = drill4Corpus[rhyme] ?? [];
      const isIssuedPrompt = corpusForRhyme.some(entry => entry.answer === e);
      if (!isIssuedPrompt) {
        return res.status(422).json({ ok: false, reason: 'unknown_prompt' });
      }
      const correct = a.length === 1 && e.length === 1 && getVariants(e).has(a);
      let addedToLibrary = false;
      if (correct && rhyme) {
        const result = db.prepare(
          "INSERT OR IGNORE INTO user_rhyme_library (user_id, rhyme_id, char, source) VALUES (?, ?, ?, 'drill4')"
        ).run(userId, rhyme, expected);
        addedToLibrary = (result.changes ?? 0) > 0;
      }
      res.json({ correct, expected, addedToLibrary });
    } catch (err) { next(err); }
  });

  // POST /library/add (manual or practice add — validated)
  router.post('/library/add', composedGate, express.json(), (req, res, next) => {
    try {
      const userId = req.user.id;
      const { rhyme_id, char, source } = req.body ?? {};
      if (!rhyme_id || typeof rhyme_id !== 'string' || !char || typeof char !== 'string') {
        return res.status(400).json({ ok: false, reason: 'missing_field' });
      }
      const src = source ?? 'manual';
      if (src !== 'manual' && src !== 'practice') {
        return res.status(400).json({ ok: false, reason: 'invalid_source' });
      }
      if (!VALID_RHYME_LABELS.has(rhyme_id)) {
        return res.status(422).json({ ok: false, reason: 'unknown_rhyme_id' });
      }
      const charEntries = pingshuiData.chars[char] ?? [];
      const hasPingInRhyme = charEntries.some(e => e.tone === '平' && e.rhyme === rhyme_id);
      if (!hasPingInRhyme) {
        return res.status(422).json({ ok: false, reason: 'char_not_in_rhyme' });
      }
      const result = db.prepare(
        'INSERT OR IGNORE INTO user_rhyme_library (user_id, rhyme_id, char, source) VALUES (?, ?, ?, ?)'
      ).run(userId, rhyme_id, char, src);
      res.json({ added: (result.changes ?? 0) > 0 });
    } catch (err) { next(err); }
  });

  // POST /practice-queue
  router.post('/practice-queue', composedGate, express.json(), (req, res, next) => {
    try {
      const { rhyme_id, size } = req.body ?? {};
      if (!VALID_RHYME_LABELS.has(rhyme_id)) {
        return res.status(422).json({ ok: false, reason: 'unknown_rhyme_id' });
      }
      if (size !== 5 && size !== 10 && size !== 20) {
        return res.status(400).json({ ok: false, reason: 'invalid_size' });
      }
      const template = buildInterleaveTemplate(size);
      const rhyme = RHYMES_PINGSHENG.find(r => r.label === rhyme_id);
      const seedsBySet = { 1: [], 2: [], 3: [], 4: [] };
      for (const sc of TIER1_SEED_CHARS) {
        if (sc.rhymeId === rhyme?.id) {
          seedsBySet[sc.set].push(sc.char);
        }
      }
      const queue = template.map((tierHint, i) => ({
        slot_index: i,
        tier_hint: tierHint,
        seed_examples: shuffle(seedsBySet[tierHint] ?? []).slice(0, 3),
      }));
      res.json({ rhyme_id, size, queue });
    } catch (err) { next(err); }
  });

  // GET /library
  router.get('/library', composedGate, (req, res, next) => {
    try {
      const userId = req.user.id;
      const rows = db.prepare(
        'SELECT rhyme_id, char FROM user_rhyme_library WHERE user_id = ? ORDER BY added_at DESC'
      ).all(userId);
      const ps = JSON.parse(fs.readFileSync(path.resolve(__drill_dirname, '../../src/data/pingshui.json'), 'utf8'));
      const tier1Labels = TIER1_RHYME_IDS.map(id => RHYMES_PINGSHENG.find(r => r.id === id)?.label).filter(Boolean);
      const rhymes = tier1Labels.map(label => {
        const bucket = ps.rhymes[label];
        const userChars = rows.filter(r => r.rhyme_id === label).map(r => r.char);
        return {
          rhyme_id: label,
          rhyme_label: label,
          total_chars: bucket?.chars?.length ?? 0,
          user_chars: userChars,
        };
      });
      res.json({ rhymes });
    } catch (err) { next(err); }
  });

  return router;
}
