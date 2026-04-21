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

      sql += ' ORDER BY CASE status WHEN \'pending\' THEN 0 WHEN \'approved\' THEN 1 ELSE 2 END, created_at DESC';

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
          status: row.status,
          filePath: row.file_path,
          createdAt: row.created_at,
          reviewedAt: row.reviewed_at,
        });
      }

      res.json({ items: Array.from(groups.values()) });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/admin/audio/generate
  router.post('/generate', requireAdmin, express.json(), async (req, res, next) => {
    try {
      const { text, voiceKind, provider, voiceId } = req.body ?? {};

      if (typeof text !== 'string' || !text.trim() || text.length > 200) {
        return res.status(400).json({ error: 'INVALID_TEXT' });
      }
      if (!['mandarin', 'cantonese'].includes(voiceKind)) {
        return res.status(400).json({ error: 'INVALID_VOICE_KIND' });
      }
      if (!['azure', 'elevenlabs'].includes(provider)) {
        return res.status(400).json({ error: 'INVALID_PROVIDER' });
      }
      if (typeof voiceId !== 'string' || !voiceId.trim()) {
        return res.status(400).json({ error: 'INVALID_VOICE_ID' });
      }

      const result = await audioService.synthesizeWith(text.trim(), { provider, voiceId });
      const filePath = shardedPath(pendingDir, text.trim(), provider, voiceId);
      await atomicWrite(filePath, result.audio);

      const row = db.prepare(`
        INSERT INTO audio_clips (text, voice_kind, provider, voice_id, status, file_path)
        VALUES (?, ?, ?, ?, 'pending', ?)
        ON CONFLICT(text, voice_kind, provider, voice_id) DO UPDATE SET
          file_path = excluded.file_path,
          status = 'pending',
          created_at = datetime('now'),
          reviewed_at = NULL,
          reviewed_by = NULL
        RETURNING *
      `).get(text.trim(), voiceKind, provider, voiceId, filePath);

      res.json({
        id: row.id,
        text: row.text,
        voiceKind: row.voice_kind,
        provider: row.provider,
        voiceId: row.voice_id,
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

      const txn = db.transaction(() => {
        // Approve this clip
        db.prepare(`
          UPDATE audio_clips SET status = 'approved', file_path = ?, reviewed_at = datetime('now'), reviewed_by = ?
          WHERE id = ?
        `).run(approvedPath, userId, clipId);

        // Reject siblings (same text + voice_kind, different id)
        const siblings = db.prepare(`
          SELECT id, file_path FROM audio_clips
          WHERE text = ? AND voice_kind = ? AND id != ? AND status != 'rejected'
        `).all(clip.text, clip.voice_kind, clipId);

        const rejectedIds = [];
        for (const sib of siblings) {
          db.prepare(`
            UPDATE audio_clips SET status = 'rejected', reviewed_at = datetime('now'), reviewed_by = ?
            WHERE id = ?
          `).run(userId, sib.id);
          rejectedIds.push(sib.id);
        }

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
      db.prepare(`
        UPDATE audio_clips SET status = 'rejected', reviewed_at = datetime('now'), reviewed_by = ?
        WHERE id = ?
      `).run(userId, clipId);

      await safeDelete(clip.file_path);

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/admin/audio/regenerate
  router.post('/regenerate', requireAdmin, express.json(), async (req, res, next) => {
    try {
      const { clipId } = req.body ?? {};
      if (typeof clipId !== 'number') {
        return res.status(400).json({ error: 'INVALID_CLIP_ID' });
      }

      const clip = db.prepare('SELECT * FROM audio_clips WHERE id = ?').get(clipId);
      if (!clip) return res.status(404).json({ error: 'CLIP_NOT_FOUND' });

      const result = await audioService.synthesizeWith(clip.text, {
        provider: clip.provider,
        voiceId: clip.voice_id,
      });

      const filePath = shardedPath(pendingDir, clip.text, clip.provider, clip.voice_id);
      await atomicWrite(filePath, result.audio);

      db.prepare(`
        UPDATE audio_clips SET file_path = ?, status = 'pending', created_at = datetime('now'),
          reviewed_at = NULL, reviewed_by = NULL
        WHERE id = ?
      `).run(filePath, clipId);

      const updated = db.prepare('SELECT * FROM audio_clips WHERE id = ?').get(clipId);
      res.json({
        id: updated.id,
        text: updated.text,
        voiceKind: updated.voice_kind,
        provider: updated.provider,
        voiceId: updated.voice_id,
        status: updated.status,
        filePath: updated.file_path,
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
      if (!['azure', 'elevenlabs'].includes(provider)) {
        return res.status(400).json({ error: 'INVALID_PROVIDER' });
      }
      if (!['mandarin', 'cantonese'].includes(voiceKind)) {
        return res.status(400).json({ error: 'INVALID_VOICE_KIND' });
      }

      const userId = req.user?.id ?? 'unknown';
      const pending = db.prepare(`
        SELECT * FROM audio_clips
        WHERE provider = ? AND voice_kind = ? AND status = 'pending'
      `).all(provider, voiceKind);

      const approvedIds = [];

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

        const txn = db.transaction(() => {
          db.prepare(`
            UPDATE audio_clips SET status = 'approved', file_path = ?, reviewed_at = datetime('now'), reviewed_by = ?
            WHERE id = ?
          `).run(approvedPath, userId, clip.id);

          const siblings = db.prepare(`
            SELECT id, file_path FROM audio_clips
            WHERE text = ? AND voice_kind = ? AND id != ? AND status != 'rejected'
          `).all(clip.text, clip.voice_kind, clip.id);

          for (const sib of siblings) {
            db.prepare(`
              UPDATE audio_clips SET status = 'rejected', reviewed_at = datetime('now'), reviewed_by = ?
              WHERE id = ?
            `).run(userId, sib.id);
            // Async delete outside txn
          }

          return siblings;
        });

        const siblings = txn();
        for (const sib of siblings) {
          safeDelete(sib.file_path);
        }

        approvedIds.push(clip.id);
      }

      res.json({ ok: true, count: approvedIds.length, approvedClipIds: approvedIds });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
