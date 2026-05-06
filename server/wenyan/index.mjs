/**
 * 文言教材 module mount.
 *
 * Stage B: real endpoints for user progress, poem completion, and
 * personal vocabulary library. Pairing-trigger logic and audio
 * (Stages C/D) not yet wired.
 *
 * Endpoints (all admin-gated via requireWenyanAdmin):
 *   GET  /api/wenyan/health
 *   GET  /api/wenyan/progress
 *   POST /api/wenyan/poems/:id/complete
 *   GET  /api/wenyan/library
 */

import express from 'express';
import { requireWenyanAdmin } from '../middleware/wenyan-admin.mjs';

export function mountWenyan(app, db, requireAuth) {
  const router = express.Router();
  router.use(requireAuth);
  router.use(requireWenyanAdmin);

  // --- Health (kept from Stage A; bumped to stage 'B') ---
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', stage: 'B', module: 'wenyan' });
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

  // --- Complete a poem: upsert progress + populate user_vocab from
  //     the dict_entry_poems join. Idempotent (re-completing a poem
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
    // Sanity check: the poem must have at least one dict entry seeded
    // for it (i.e., it's a known poem, not a typo / arbitrary slug).
    const exists = stmtFirstEntryForPoem.get(poemId);
    if (!exists) {
      return res.status(404).json({ error: 'POEM_NOT_FOUND' });
    }
    const result = completeTxn(req.user.id, poemId);
    res.json({ ok: true, ...result });
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

  app.use('/api/wenyan', router);
}
