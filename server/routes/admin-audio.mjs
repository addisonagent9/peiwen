/**
 * Admin audio review routes.
 *
 * All endpoints require requireAdmin middleware. Provides CRUD for the
 * audio_clips table: list items, generate TTS samples, approve/reject,
 * regenerate, and bulk-approve.
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import crypto from 'crypto';
import { getPrimaryVoice, getNextVoice, VOICE_POOLS } from '../audio/voice-pools.mjs';
import { TIER1_SEED_CHARS } from '../data/tier-seed-chars.mjs';

/**
 * @param {object} opts
 * @param {import('better-sqlite3').Database} opts.db
 * @param {import('../audio/service.mjs').AudioService} opts.audioService
 * @param {import('express').RequestHandler} opts.requireAdmin
 * @param {string} opts.cacheDir — root audio cache directory
 */
export function createAdminAudioRouter({ db, audioService, requireAdmin, cacheDir }) {
  const router = express.Router();

  const pendingDir = path.join(cacheDir, 'pending');
  const approvedDir = path.join(cacheDir, 'approved');
  fs.mkdirSync(pendingDir, { recursive: true });
  fs.mkdirSync(approvedDir, { recursive: true });

  function shardedPath(baseDir, text, provider, voiceId) {
    const hash = crypto.createHash('sha256')
      .update(`${provider}:${voiceId}:${text}`)
      .digest('hex')
      .slice(0, 32);
    const shard = hash.slice(0, 2);
    return path.join(baseDir, shard, `${hash.slice(2)}.mp3`);
  }

  async function safeDelete(filePath) {
    try {
      if (filePath) await fsp.unlink(filePath);
    } catch {
      /* best-effort */
    }
  }

  async function atomicWrite(filePath, data) {
    const dir = path.dirname(filePath);
    await fsp.mkdir(dir, { recursive: true });
    const rand = crypto.randomBytes(8).toString('hex');
    const tmp = `${filePath}.${process.pid}.${rand}.tmp`;
    await fsp.writeFile(tmp, data);
    await fsp.rename(tmp, filePath);
  }

  // ─── Action log helpers (#23 Undo) ─────────────────────────────────────
  // snapshotClip captures a clip's pre-action state so undo can restore it.
  function snapshotClip(clip, newStatus, newFilePath) {
    return {
      clipId: clip.id,
      prevStatus: clip.status,
      prevFilePath: clip.file_path,
      prevReviewedAt: clip.reviewed_at,
      prevReviewedBy: clip.reviewed_by,
      prevReviewApprovedAt: clip.review_approved_at ?? null,
      prevReviewRejectedAt: clip.review_rejected_at ?? null,
      newStatus,
      newFilePath,
    };
  }

  // appendActionLog inserts one row into review_action_log. Returns rowid or
  // null if userId is missing (defensive — requireAdmin should guarantee it).
  function appendActionLog(userId, action, payload) {
    if (!userId) return null;
    const result = db.prepare(`
      INSERT INTO review_action_log (user_id, action, payload, created_at)
      VALUES (?, ?, ?, ?)
    `).run(userId, action, JSON.stringify(payload), Date.now());
    return result.lastInsertRowid;
  }

  // GET /api/admin/audio/items
  router.get('/items', requireAdmin, (req, res, next) => {
    try {
      const statusFilter = req.query.status ?? 'all';
      const vkFilter = req.query.voiceKind ?? 'all';
      const search = req.query.search;

      let sql = 'SELECT * FROM audio_clips WHERE 1=1';
      const params = [];

      if (statusFilter !== 'all') {
        sql += ' AND status = ?';
        params.push(statusFilter);
      }
      if (vkFilter !== 'all') {
        sql += ' AND voice_kind = ?';
        params.push(vkFilter);
      }
      if (search) {
        sql += ' AND text LIKE ?';
        params.push(`%${search}%`);
      }

      // For Approved tab and "All" filter, sort latest-approved-first
      // (#23). Pending clips have NULL review_approved_at and fall to the
      // bottom; their alphabetic sub-order is preserved by the secondary
      // sort. Pending and Rejected tabs keep the original alphabetic sort.
      if (statusFilter === 'approved' || statusFilter === 'all') {
        sql += ' ORDER BY review_approved_at IS NULL, review_approved_at DESC, voice_kind ASC, text ASC';
      } else {
        sql += ' ORDER BY voice_kind ASC, text ASC';
      }

      const rows = db.prepare(sql).all(...params);

      // Group by (text, voice_kind)
      const groups = new Map();
      for (const row of rows) {
        const key = `${row.text}||${row.voice_kind}`;
        if (!groups.has(key)) {
          groups.set(key, {
            text: row.text,
            voiceKind: row.voice_kind,
            usageContext: row.usage_context ? JSON.parse(row.usage_context) : [],
            clips: [],
          });
        }
        groups.get(key).clips.push({
          id: row.id,
          provider: row.provider,
          voiceId: row.voice_id,
          generationText: row.generation_text,
          status: row.status,
          filePath: row.file_path,
          createdAt: row.created_at,
          reviewedAt: row.reviewed_at,
        });
      }

      const items = Array.from(groups.values()).map(item => {
        const seed = TIER1_SEED_CHARS.find(s => s.char === item.text);
        return { ...item, pinyin: seed?.pinyin ?? null, jyutping: seed?.jyutping ?? null };
      });
      res.json({ items });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/admin/audio/generate
  router.post('/generate', requireAdmin, express.json(), async (req, res, next) => {
    try {
      const { text, voiceKind, voiceOverride } = req.body ?? {};

      if (typeof text !== 'string' || !text.trim() || text.length > 200) {
        return res.status(400).json({ error: 'INVALID_TEXT' });
      }
      if (voiceKind !== 'mandarin' && voiceKind !== 'cantonese') {
        return res.status(400).json({ error: 'INVALID_VOICE_KIND' });
      }

      let provider, voiceId;
      if (voiceOverride && voiceOverride.provider && voiceOverride.voiceId) {
        const pool = VOICE_POOLS[voiceKind];
        const isValid = pool && pool.some(v =>
          v.provider === voiceOverride.provider && v.voiceId === voiceOverride.voiceId
        );
        if (!isValid) {
          return res.status(400).json({ error: 'INVALID_VOICE_OVERRIDE' });
        }
        provider = voiceOverride.provider;
        voiceId = voiceOverride.voiceId;
      } else {
        ({ provider, voiceId } = getPrimaryVoice(voiceKind));
      }
      const generationText = text.trim();

      const result = await audioService.synthesizeWith(generationText, { provider, voiceId });
      const filePath = shardedPath(pendingDir, text.trim(), provider, voiceId);
      await atomicWrite(filePath, result.audio);

      const row = db.prepare(`
        INSERT INTO audio_clips (text, voice_kind, provider, voice_id, file_path, generation_text, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
        ON CONFLICT(text, voice_kind, provider, voice_id) DO UPDATE SET
          file_path = excluded.file_path,
          generation_text = excluded.generation_text,
          status = 'pending',
          created_at = datetime('now'),
          reviewed_at = NULL,
          reviewed_by = NULL
        RETURNING *
      `).get(text.trim(), voiceKind, provider, voiceId, filePath, generationText);

      res.json({
        id: row.id,
        text: row.text,
        voiceKind: row.voice_kind,
        provider: row.provider,
        voiceId: row.voice_id,
        generationText: row.generation_text,
        status: row.status,
        filePath: row.file_path,
      });
    } catch (err) {
      if (err.name === 'AudioUnavailableError') {
        return res.status(503).json({ error: 'AUDIO_UNAVAILABLE', reason: err.message });
      }
      next(err);
    }
  });

  // POST /api/admin/audio/approve
  router.post('/approve', requireAdmin, express.json(), async (req, res, next) => {
    try {
      const { clipId } = req.body ?? {};
      if (typeof clipId !== 'number') {
        return res.status(400).json({ error: 'INVALID_CLIP_ID' });
      }

      const clip = db.prepare('SELECT * FROM audio_clips WHERE id = ?').get(clipId);
      if (!clip) return res.status(404).json({ error: 'CLIP_NOT_FOUND' });

      // Move file from pending to approved
      const approvedPath = shardedPath(approvedDir, clip.text, clip.provider, clip.voice_id);
      if (clip.file_path) {
        try {
          await fsp.mkdir(path.dirname(approvedPath), { recursive: true });
          await fsp.rename(clip.file_path, approvedPath);
        } catch {
          // File might already be in approved dir or missing — copy approach
          try {
            await atomicWrite(approvedPath, await fsp.readFile(clip.file_path));
            await safeDelete(clip.file_path);
          } catch { /* best-effort */ }
        }
      }

      const userId = req.user?.id ?? 'unknown';
      const userIdForLog = req.user?.id;  // null/undefined → skip log (FK-safe)

      const txn = db.transaction(() => {
        // Capture pre-state of primary clip for action log
        const primarySnapshot = snapshotClip(clip, 'approved', approvedPath);

        // Approve this clip
        db.prepare(`
          UPDATE audio_clips SET status = 'approved', file_path = ?,
            reviewed_at = datetime('now'), reviewed_by = ?,
            review_approved_at = datetime('now')
          WHERE id = ?
        `).run(approvedPath, userId, clipId);

        // Reject siblings (same text + voice_kind, different id)
        const siblings = db.prepare(`
          SELECT * FROM audio_clips
          WHERE text = ? AND voice_kind = ? AND id != ? AND status != 'rejected'
        `).all(clip.text, clip.voice_kind, clipId);

        const siblingSnapshots = siblings.map(sib =>
          snapshotClip(sib, 'rejected', sib.file_path)
        );
        const rejectedIds = [];
        for (const sib of siblings) {
          db.prepare(`
            UPDATE audio_clips SET status = 'rejected',
              reviewed_at = datetime('now'), reviewed_by = ?,
              review_rejected_at = datetime('now')
            WHERE id = ?
          `).run(userId, sib.id);
          rejectedIds.push(sib.id);
        }

        // Append action log (#23): approve = primary + cascade siblings
        appendActionLog(userIdForLog, 'approve', {
          items: [{ primary: primarySnapshot, siblings: siblingSnapshots }],
          displayText: clip.text,
          displayVoiceKind: clip.voice_kind,
        });

        return { rejectedIds, siblings };
      });

      const { rejectedIds, siblings } = txn();

      // Delete rejected files (async, best-effort)
      for (const sib of siblings) {
        safeDelete(sib.file_path);
      }

      res.json({ ok: true, approvedClipId: clipId, rejectedClipIds: rejectedIds });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/admin/audio/reject
  router.post('/reject', requireAdmin, express.json(), async (req, res, next) => {
    try {
      const { clipId } = req.body ?? {};
      if (typeof clipId !== 'number') {
        return res.status(400).json({ error: 'INVALID_CLIP_ID' });
      }

      const clip = db.prepare('SELECT * FROM audio_clips WHERE id = ?').get(clipId);
      if (!clip) return res.status(404).json({ error: 'CLIP_NOT_FOUND' });

      const userId = req.user?.id ?? 'unknown';
      const userIdForLog = req.user?.id;

      db.transaction(() => {
        // Capture pre-state for action log
        const snapshot = snapshotClip(clip, 'rejected', clip.file_path);

        db.prepare(`
          UPDATE audio_clips SET status = 'rejected',
            reviewed_at = datetime('now'), reviewed_by = ?,
            review_rejected_at = datetime('now')
          WHERE id = ?
        `).run(userId, clipId);

        // Append action log (#23): reject = single clip, no siblings
        appendActionLog(userIdForLog, 'reject', {
          items: [{ primary: snapshot, siblings: [] }],
          displayText: clip.text,
          displayVoiceKind: clip.voice_kind,
        });
      })();

      // .mp3 file is unlinked — undo cannot restore it (DB-only revert per
      // #23 v1 scope F1). Frontend surfaces hasFile=false on undo response.
      await safeDelete(clip.file_path);

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/admin/audio/regenerate
  // Re-synthesize SAME voice with current/updated generation_text. No voice cycling.
  router.post('/regenerate', requireAdmin, express.json(), async (req, res, next) => {
    try {
      const clipId = parseInt(req.body?.clipId);
      const providedGenText = req.body?.generationText;
      if (!clipId) return res.status(400).json({ error: 'INVALID_CLIP_ID' });

      const clip = db.prepare('SELECT * FROM audio_clips WHERE id = ?').get(clipId);
      if (!clip) return res.status(404).json({ error: 'CLIP_NOT_FOUND' });

      const generationText = (providedGenText && typeof providedGenText === 'string' && providedGenText.trim())
        ? providedGenText.trim()
        : (clip.generation_text || clip.text);

      const result = await audioService.synthesizeWith(generationText, {
        provider: clip.provider,
        voiceId: clip.voice_id,
      });

      await atomicWrite(clip.file_path, result.audio);

      db.prepare(`
        UPDATE audio_clips SET generation_text = ?, status = 'pending',
          created_at = datetime('now'), reviewed_at = NULL, reviewed_by = NULL
        WHERE id = ?
      `).run(generationText, clipId);

      const updated = db.prepare('SELECT * FROM audio_clips WHERE id = ?').get(clipId);
      res.json({
        id: updated.id,
        text: updated.text,
        voiceKind: updated.voice_kind,
        provider: updated.provider,
        voiceId: updated.voice_id,
        generationText: updated.generation_text,
        status: updated.status,
        filePath: updated.file_path,
        createdAt: updated.created_at,
      });
    } catch (err) {
      if (err.name === 'AudioUnavailableError') {
        return res.status(503).json({ error: 'AUDIO_UNAVAILABLE', reason: err.message });
      }
      next(err);
    }
  });

  // POST /api/admin/audio/add-voice
  // Generate a clip using the backup voice for a given (text, voiceKind).
  router.post('/add-voice', requireAdmin, express.json(), async (req, res, next) => {
    try {
      const { text, voiceKind } = req.body ?? {};
      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'INVALID_TEXT' });
      }
      if (voiceKind !== 'mandarin' && voiceKind !== 'cantonese') {
        return res.status(400).json({ error: 'INVALID_VOICE_KIND' });
      }

      const primary = getPrimaryVoice(voiceKind);
      const backup = getNextVoice(voiceKind, primary);

      if (backup.provider === primary.provider && backup.voiceId === primary.voiceId) {
        return res.status(400).json({ error: 'NO_BACKUP_VOICE_AVAILABLE' });
      }

      const generationText = text.trim();
      const result = await audioService.synthesizeWith(generationText, {
        provider: backup.provider,
        voiceId: backup.voiceId,
      });
      const filePath = shardedPath(pendingDir, text.trim(), backup.provider, backup.voiceId);
      await atomicWrite(filePath, result.audio);

      const row = db.prepare(`
        INSERT INTO audio_clips (text, voice_kind, provider, voice_id, file_path, generation_text, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
        ON CONFLICT(text, voice_kind, provider, voice_id) DO UPDATE SET
          file_path = excluded.file_path,
          generation_text = excluded.generation_text,
          status = 'pending',
          created_at = datetime('now'),
          reviewed_at = NULL,
          reviewed_by = NULL
        RETURNING *
      `).get(text.trim(), voiceKind, backup.provider, backup.voiceId, filePath, generationText);

      res.json({
        id: row.id,
        text: row.text,
        voiceKind: row.voice_kind,
        provider: row.provider,
        voiceId: row.voice_id,
        generationText: row.generation_text,
        status: row.status,
        filePath: row.file_path,
        createdAt: row.created_at,
      });
    } catch (err) {
      if (err.name === 'AudioUnavailableError') {
        return res.status(503).json({ error: 'AUDIO_UNAVAILABLE', reason: err.message });
      }
      next(err);
    }
  });

  // POST /api/admin/audio/bulk-approve
  router.post('/bulk-approve', requireAdmin, express.json(), async (req, res, next) => {
    try {
      const { provider, voiceKind } = req.body ?? {};
      if (!['azure', 'elevenlabs', 'alibaba'].includes(provider)) {
        return res.status(400).json({ error: 'INVALID_PROVIDER' });
      }
      if (!['mandarin', 'cantonese'].includes(voiceKind)) {
        return res.status(400).json({ error: 'INVALID_VOICE_KIND' });
      }

      const userId = req.user?.id ?? 'unknown';
      const userIdForLog = req.user?.id;
      const pending = db.prepare(`
        SELECT * FROM audio_clips
        WHERE provider = ? AND voice_kind = ? AND status = 'pending'
      `).all(provider, voiceKind);

      const approvedIds = [];
      // Collect snapshots for one bulk action log entry (#23 F3)
      const bulkItems = [];
      // Sibling files to async-delete after all per-clip txns complete
      const allSiblingsToDelete = [];

      for (const clip of pending) {
        // Move file
        const approvedPath = shardedPath(approvedDir, clip.text, clip.provider, clip.voice_id);
        if (clip.file_path) {
          try {
            await fsp.mkdir(path.dirname(approvedPath), { recursive: true });
            await fsp.rename(clip.file_path, approvedPath);
          } catch {
            try {
              await atomicWrite(approvedPath, await fsp.readFile(clip.file_path));
              await safeDelete(clip.file_path);
            } catch { /* best-effort */ }
          }
        }

        const txnResult = db.transaction(() => {
          const primarySnapshot = snapshotClip(clip, 'approved', approvedPath);

          db.prepare(`
            UPDATE audio_clips SET status = 'approved', file_path = ?,
              reviewed_at = datetime('now'), reviewed_by = ?,
              review_approved_at = datetime('now')
            WHERE id = ?
          `).run(approvedPath, userId, clip.id);

          const siblings = db.prepare(`
            SELECT * FROM audio_clips
            WHERE text = ? AND voice_kind = ? AND id != ? AND status != 'rejected'
          `).all(clip.text, clip.voice_kind, clip.id);

          const siblingSnapshots = siblings.map(s =>
            snapshotClip(s, 'rejected', s.file_path)
          );

          for (const sib of siblings) {
            db.prepare(`
              UPDATE audio_clips SET status = 'rejected',
                reviewed_at = datetime('now'), reviewed_by = ?,
                review_rejected_at = datetime('now')
              WHERE id = ?
            `).run(userId, sib.id);
          }

          return { primarySnapshot, siblingSnapshots, siblings };
        })();

        bulkItems.push({
          primary: txnResult.primarySnapshot,
          siblings: txnResult.siblingSnapshots,
        });
        for (const sib of txnResult.siblings) {
          allSiblingsToDelete.push(sib);
        }
        approvedIds.push(clip.id);
      }

      // Single action log entry covering the entire bulk operation (#23 F3)
      if (bulkItems.length > 0) {
        appendActionLog(userIdForLog, 'bulk-approve', {
          items: bulkItems,
          count: bulkItems.length,
          provider,
          voiceKind,
        });
      }

      // Async file deletes for rejected siblings (best-effort)
      for (const sib of allSiblingsToDelete) {
        safeDelete(sib.file_path);
      }

      res.json({ ok: true, count: approvedIds.length, approvedClipIds: approvedIds });
    } catch (err) {
      next(err);
    }
  });

  // ─── #23 Undo endpoints ───────────────────────────────────────────────
  // Helper: build human-readable label from a log row payload
  function buildActionLabel(row) {
    const payload = JSON.parse(row.payload);
    if (row.action === 'approve') {
      const sibCount = payload.items[0]?.siblings.length ?? 0;
      const base = `Revert approve of ${payload.displayText} (${payload.displayVoiceKind})?`;
      if (sibCount > 0) {
        return `${base} This also reverts auto-rejection of ${sibCount} sibling clip${sibCount > 1 ? 's' : ''}.`;
      }
      return base;
    }
    if (row.action === 'reject') {
      return `Revert reject of ${payload.displayText} (${payload.displayVoiceKind})? Status returns to pending. Audio file was deleted; click Regenerate to recreate.`;
    }
    if (row.action === 'bulk-approve') {
      return `Revert bulk approval of ${payload.count} clips? This affects ${payload.count} clips approved together with their auto-rejected siblings.`;
    }
    return 'Revert most recent action?';
  }

  // GET /api/admin/audio/undo-status — does this user have an undoable action?
  router.get('/undo-status', requireAdmin, (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'NO_USER' });

      // Per-user 20-action cap (#23 F4): query the user's last 20 entries
      // overall; the most-recent NOT-undone among them is the candidate.
      // Older actions (beyond the cap window) are not undoable.
      const recent20 = db.prepare(`
        SELECT id, action, payload, created_at, undone_at
        FROM review_action_log
        WHERE user_id = ?
        ORDER BY created_at DESC LIMIT 20
      `).all(userId);

      const candidate = recent20.find(r => r.undone_at === null);
      if (!candidate) {
        return res.json({ canUndo: false });
      }

      const payload = JSON.parse(candidate.payload);
      const sibCount = candidate.action === 'approve'
        ? (payload.items[0]?.siblings.length ?? 0)
        : 0;

      res.json({
        canUndo: true,
        actionLabel: buildActionLabel(candidate),
        action: candidate.action,
        isCascade: candidate.action === 'approve' && sibCount > 0,
        isBulk: candidate.action === 'bulk-approve',
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/admin/audio/undo — revert most recent undoable action for user
  router.post('/undo', requireAdmin, async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'NO_USER' });

      const recent20 = db.prepare(`
        SELECT id, action, payload, created_at, undone_at
        FROM review_action_log
        WHERE user_id = ?
        ORDER BY created_at DESC LIMIT 20
      `).all(userId);

      const candidate = recent20.find(r => r.undone_at === null);
      if (!candidate) {
        return res.status(404).json({ error: 'NOTHING_TO_UNDO' });
      }

      const payload = JSON.parse(candidate.payload);

      // Track file moves to perform outside the DB transaction
      const fileMoves = [];

      const restoreSnapshot = (snap) => {
        db.prepare(`
          UPDATE audio_clips SET
            status = ?,
            file_path = ?,
            reviewed_at = ?,
            reviewed_by = ?,
            review_approved_at = ?,
            review_rejected_at = ?
          WHERE id = ?
        `).run(
          snap.prevStatus,
          snap.prevFilePath,
          snap.prevReviewedAt,
          snap.prevReviewedBy,
          snap.prevReviewApprovedAt,
          snap.prevReviewRejectedAt,
          snap.clipId,
        );
        // Record file restore intent (best-effort, outside txn)
        if (snap.newFilePath && snap.prevFilePath && snap.newFilePath !== snap.prevFilePath) {
          fileMoves.push({ from: snap.newFilePath, to: snap.prevFilePath, clipId: snap.clipId });
        }
      };

      db.transaction(() => {
        for (const item of payload.items) {
          restoreSnapshot(item.primary);
          for (const sib of item.siblings) {
            restoreSnapshot(sib);
          }
        }
        db.prepare(`
          UPDATE review_action_log SET undone_at = ? WHERE id = ?
        `).run(Date.now(), candidate.id);
      })();

      // File moves: rename approved→pending for primary clips. Rejected
      // siblings' files are gone (unlinked at approve time); no restore.
      for (const mv of fileMoves) {
        try {
          await fsp.mkdir(path.dirname(mv.to), { recursive: true });
          await fsp.rename(mv.from, mv.to);
        } catch {
          /* best-effort — may already be moved or missing */
        }
      }

      // Build response: revertedClips with hasFile flag for UI warning
      const revertedClips = [];
      for (const item of payload.items) {
        const probe = async (snap) => {
          let hasFile = false;
          if (snap.prevFilePath) {
            try {
              await fsp.access(snap.prevFilePath);
              hasFile = true;
            } catch { /* file gone */ }
          }
          revertedClips.push({
            clipId: snap.clipId,
            newStatus: snap.prevStatus,
            hasFile,
          });
        };
        await probe(item.primary);
        for (const sib of item.siblings) {
          await probe(sib);
        }
      }

      res.json({ ok: true, revertedClips });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/admin/audio/file/:clipId — serve raw audio for admin preview
  router.get('/file/:clipId', requireAdmin, async (req, res, next) => {
    try {
      const clipId = Number(req.params.clipId);
      if (!Number.isFinite(clipId)) {
        return res.status(400).json({ error: 'INVALID_CLIP_ID' });
      }
      const clip = db.prepare('SELECT file_path FROM audio_clips WHERE id = ?').get(clipId);
      if (!clip || !clip.file_path) {
        return res.status(404).json({ error: 'CLIP_NOT_FOUND' });
      }
      try {
        const audio = await fsp.readFile(clip.file_path);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', String(audio.length));
        res.send(audio);
      } catch {
        res.status(404).json({ error: 'FILE_NOT_FOUND' });
      }
    } catch (err) {
      next(err);
    }
  });

  // POST /api/admin/audio/prewarm — generate pending clips using voice pools
  router.post('/prewarm', requireAdmin, express.json(), async (req, res, next) => {
    try {
      // ⚠️  KEEP IN SYNC WITH src/data/pingshui/audio-prewarm-manifest.ts and scripts/prewarm-audio.mjs
      const titles = ['四声','上平','下平','仄声','入声','韵目'];
      const demoChars = ['东','好','去','冬','支','先','阳','尤','月','十','入','日','白','六','一东','七阳','十五咸'];
      const tier1Seeds = [
        '风','空','中','红','同','通','翁','弓','宫','功','虹',
        '光','霜','乡','香','长','常','场','章','羊','方','凉',
        '忧','秋','楼','流','舟','留','收','头','愁','游','州',
        '麻','家','花','霞','华','沙','斜','茶','涯','鸦','加','瓜',
        '歌','多','何','河','过','波','磨','罗','娥','蛾','哥','柯',
      ];
      const cantoneseChars = ['十','入','月','日','白','六'];

      const allMandarin = [...new Set([...titles, ...demoChars, ...tier1Seeds])];
      const items = [
        ...allMandarin.map(t => ({ text: t, voiceKind: 'mandarin' })),
        ...cantoneseChars.map(t => ({ text: t, voiceKind: 'cantonese' })),
      ];

      const sCheck = db.prepare('SELECT id FROM audio_clips WHERE text = ? AND voice_kind = ? AND provider = ? AND voice_id = ?');
      const sInsert = db.prepare(`
        INSERT INTO audio_clips (text, voice_kind, provider, voice_id, status, file_path, generation_text, usage_context)
        VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)
      `);

      let generated = 0, skipped = 0;

      for (const item of items) {
        const { provider: providerName, voiceId } = getPrimaryVoice(item.voiceKind);

        const existing = sCheck.get(item.text, item.voiceKind, providerName, voiceId);
        if (existing) { skipped++; continue; }

        try {
          const result = await audioService.synthesizeWith(item.text, { provider: providerName, voiceId });
          const filePath = shardedPath(pendingDir, item.text, providerName, voiceId);
          await atomicWrite(filePath, result.audio);
          sInsert.run(item.text, item.voiceKind, providerName, voiceId, filePath, item.text, JSON.stringify(['prewarm']));
          generated++;
        } catch (err) {
          console.error(`[prewarm] error on ${item.text}: ${err.message}`);
        }

        await new Promise(r => setTimeout(r, 200));
      }

      res.json({ ok: true, generated, skipped });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
