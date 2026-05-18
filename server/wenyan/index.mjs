/**
 * 文言教材 module mount.
 *
 * Stage D-2: audio playback endpoint added (Yunxi voice). All routes
 * remain admin-gated via requireWenyanAdmin.
 *
 * Endpoints (all admin-gated via requireWenyanAdmin):
 *   GET  /api/wenyan/health
 *   GET  /api/wenyan/progress
 *   POST /api/wenyan/poems/:id/complete
 *   GET  /api/wenyan/library
 *   GET  /api/wenyan/pairing/queue
 *   POST /api/wenyan/pairing/submit
 *   GET  /api/wenyan/audio?tag=<wenyan:...>
 */

import express from 'express';
import { requireWenyanAdmin } from '../middleware/wenyan-admin.mjs';
import { mountWenyanAudio } from './audio.mjs';

// Fisher-Yates in-place shuffle.
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Opaque token for the queue → submit handshake. Server doesn't store
// it; the client just echoes it back so future implementations can
// session-scope state if needed.
function pairingId() {
  // 12 hex chars from crypto-quality randomness, prefixed for clarity.
  const buf = new Uint8Array(6);
  // Node has globalThis.crypto since v19; this codebase runs Node 20+.
  globalThis.crypto.getRandomValues(buf);
  let hex = '';
  for (const byte of buf) hex += byte.toString(16).padStart(2, '0');
  return `pq_${hex}`;
}

export function mountWenyan(app, db, requireAuth) {
  const router = express.Router();
  router.use(requireAuth);
  router.use(requireWenyanAdmin);

  // --- Health (bumped to stage 'D' — audio playback shipped) ---
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', stage: 'D', module: 'wenyan' });
  });

  // --- Progress: completed-poems list for current user ---
  const stmtProgress = db.prepare(`
    SELECT poem_id, completed_at
    FROM wenyan_user_progress
    WHERE user_id = ?
    ORDER BY completed_at DESC
  `);
  router.get('/progress', (req, res) => {
    const rows = stmtProgress.all(req.user.id);
    res.json({ progress: rows });
  });

  // --- Complete a poem: upsert progress + populate user_vocab + emit
  //     pairingDue trigger flag. Idempotent (re-completing a poem
  //     refreshes completed_at; vocab stays — user_vocab.PRIMARY KEY
  //     blocks duplicate entries per (user_id, entry_id)).
  const stmtUpsertProgress = db.prepare(`
    INSERT INTO wenyan_user_progress (user_id, poem_id)
    VALUES (?, ?)
    ON CONFLICT(user_id, poem_id) DO UPDATE SET completed_at = datetime('now')
    RETURNING completed_at
  `);
  const stmtEntriesForPoem = db.prepare(`
    SELECT entry_id FROM wenyan_dict_entry_poems WHERE poem_id = ?
  `);
  const stmtFirstEntryForPoem = db.prepare(`
    SELECT entry_id FROM wenyan_dict_entry_poems WHERE poem_id = ? LIMIT 1
  `);
  const stmtUpsertVocab = db.prepare(`
    INSERT INTO wenyan_user_vocab (user_id, entry_id, first_seen_poem_id)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, entry_id) DO NOTHING
  `);
  const stmtCountProgress = db.prepare(`
    SELECT COUNT(*) AS count FROM wenyan_user_progress WHERE user_id = ?
  `);
  const completeTxn = db.transaction((userId, poemId) => {
    const progressRow = stmtUpsertProgress.get(userId, poemId);
    const entries = stmtEntriesForPoem.all(poemId);
    let vocabAdded = 0;
    for (const { entry_id } of entries) {
      const result = stmtUpsertVocab.run(userId, entry_id, poemId);
      if (result.changes > 0) vocabAdded++;
    }
    return { completed_at: progressRow.completed_at, vocab_added: vocabAdded };
  });
  router.post('/poems/:id/complete', (req, res) => {
    const poemId = req.params.id;
    if (!poemId || typeof poemId !== 'string' || poemId.length > 64) {
      return res.status(400).json({ error: 'INVALID_POEM_ID' });
    }
    // Sanity check: poem must have dict entries seeded (rejects typos).
    const exists = stmtFirstEntryForPoem.get(poemId);
    if (!exists) {
      return res.status(404).json({ error: 'POEM_NOT_FOUND' });
    }
    const result = completeTxn(req.user.id, poemId);
    // Compute pairingDue post-txn (stateless count query).
    const { count } = stmtCountProgress.get(req.user.id);
    const pairingDue = count > 0 && count % 3 === 0;
    res.json({ ok: true, ...result, pairingDue });
  });

  // --- Library: user's personal vocab library, joined with the
  //     authoritative dict entries so the client gets the full row.
  const stmtLibrary = db.prepare(`
    SELECT
      e.entry_id,
      e.word,
      e.sense_slug,
      e.pinyin,
      e.modern_meaning,
      e.ancient_meaning,
      e.notes,
      v.first_seen_poem_id,
      v.learned_at,
      v.mastery
    FROM wenyan_user_vocab v
    JOIN wenyan_dict_entries e ON e.entry_id = v.entry_id
    WHERE v.user_id = ?
    ORDER BY v.learned_at DESC
  `);
  router.get('/library', (req, res) => {
    const rows = stmtLibrary.all(req.user.id);
    res.json({ library: rows });
  });

  // --- Pairing queue: pull entries from last 3 completed poems' vocab.
  //     Shuffle, take 5; fall back to full library if <5 in recent set;
  //     422 if total <5 (defensive — shouldn't happen post-Stage-B).
  const stmtRecentPoemIds = db.prepare(`
    SELECT poem_id FROM wenyan_user_progress
    WHERE user_id = ?
    ORDER BY completed_at DESC LIMIT 3
  `);
  const stmtVocabFromRecent = db.prepare(`
    SELECT v.entry_id, e.word, e.pinyin, e.ancient_meaning, e.sense_slug
    FROM wenyan_user_vocab v
    JOIN wenyan_dict_entries e ON e.entry_id = v.entry_id
    WHERE v.user_id = ? AND v.first_seen_poem_id IN (SELECT value FROM json_each(?))
  `);
  const stmtVocabAll = db.prepare(`
    SELECT v.entry_id, e.word, e.pinyin, e.ancient_meaning, e.sense_slug
    FROM wenyan_user_vocab v
    JOIN wenyan_dict_entries e ON e.entry_id = v.entry_id
    WHERE v.user_id = ?
  `);
  router.get('/pairing/queue', (req, res) => {
    const userId = req.user.id;
    const recentRows = stmtRecentPoemIds.all(userId);
    const recentIds = recentRows.map(r => r.poem_id);

    let candidates = [];
    if (recentIds.length > 0) {
      candidates = stmtVocabFromRecent.all(userId, JSON.stringify(recentIds));
    }
    if (candidates.length < 5) {
      // Fall back to full library — covers edge case where user
      // re-completed an old poem and the recent-3 set has too few.
      candidates = stmtVocabAll.all(userId);
    }
    if (candidates.length < 5) {
      return res.status(422).json({ error: 'INSUFFICIENT_VOCABULARY' });
    }

    const picked = shuffle(candidates).slice(0, 5);
    const words = picked.map(p => ({
      entry_id: p.entry_id,
      word: p.word,
      pinyin: p.pinyin,
    }));
    const meanings = shuffle(
      picked.map(p => ({
        entry_id: p.entry_id,
        text: p.ancient_meaning,
        sense_slug: p.sense_slug,
      })),
    );

    res.json({
      pairingId: pairingId(),
      words,
      meanings,
    });
  });

  // --- Pairing submit: stateless validation, mastery update, session log.
  const stmtUserVocabExists = db.prepare(`
    SELECT 1 FROM wenyan_user_vocab WHERE user_id = ? AND entry_id = ?
  `);
  const stmtBumpMastery = db.prepare(`
    UPDATE wenyan_user_vocab
    SET mastery = MIN(mastery + 1, 3)
    WHERE user_id = ? AND entry_id = ?
  `);
  const stmtInsertSession = db.prepare(`
    INSERT INTO wenyan_pairing_sessions (user_id, entry_ids_json, correct_count, total_count)
    VALUES (?, ?, ?, ?)
  `);
  const submitTxn = db.transaction((userId, validatedPairs) => {
    const results = [];
    let correctCount = 0;
    for (const { word_entry_id, meaning_entry_id } of validatedPairs) {
      const correct = word_entry_id === meaning_entry_id;
      if (correct) {
        stmtBumpMastery.run(userId, word_entry_id);
        correctCount++;
      }
      results.push({
        word_entry_id,
        user_meaning_entry_id: meaning_entry_id,
        correct,
        actual_meaning_entry_id: word_entry_id,
      });
    }
    const wordIds = validatedPairs.map(p => p.word_entry_id);
    stmtInsertSession.run(
      userId,
      JSON.stringify(wordIds),
      correctCount,
      validatedPairs.length,
    );
    return { correct_count: correctCount, total_count: validatedPairs.length, results };
  });
  router.post('/pairing/submit', express.json(), (req, res) => {
    const userId = req.user.id;
    const body = req.body ?? {};
    const pairs = Array.isArray(body.pairs) ? body.pairs : null;

    if (!pairs || pairs.length !== 5) {
      return res.status(422).json({ error: 'INVALID_SUBMISSION', reason: 'pairs must be exactly 5' });
    }

    // Shape validation
    const wordIds = new Set();
    const meaningIds = new Set();
    for (const p of pairs) {
      if (
        typeof p?.word_entry_id !== 'number' ||
        typeof p?.meaning_entry_id !== 'number'
      ) {
        return res.status(422).json({ error: 'INVALID_SUBMISSION', reason: 'malformed pair' });
      }
      wordIds.add(p.word_entry_id);
      meaningIds.add(p.meaning_entry_id);
    }
    if (wordIds.size !== 5 || meaningIds.size !== 5) {
      return res.status(422).json({ error: 'INVALID_SUBMISSION', reason: 'duplicate ids' });
    }

    // Defensive: each entry_id must be in this user's vocab. Same set
    // applies to both word and meaning ids since we validated both as
    // distinct + length-5 (and the queue draws meanings from the same
    // pool as words).
    for (const id of wordIds) {
      if (!stmtUserVocabExists.get(userId, id)) {
        return res.status(422).json({ error: 'STALE_PAIRING', reason: `word ${id} not in user vocab` });
      }
    }
    for (const id of meaningIds) {
      if (!stmtUserVocabExists.get(userId, id)) {
        return res.status(422).json({ error: 'STALE_PAIRING', reason: `meaning ${id} not in user vocab` });
      }
    }

    const result = submitTxn(userId, pairs);
    res.json(result);
  });

  // --- Audio (Stage D-2): GET /audio?tag=<wenyan:...> ---
  // Inherits requireAuth + requireWenyanAdmin from this router.
  mountWenyanAudio(router, db);

  app.use('/api/wenyan', router);
}
