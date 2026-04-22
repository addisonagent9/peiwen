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
import { getPrimaryVoice, getNextVoice } from '../audio/voice-pools.mjs';

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

      sql += ' ORDER BY voice_kind ASC, text ASC';

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

      res.json({ items: Array.from(groups.values()) });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/admin/audio/generate
  router.post('/generate', requireAdmin, express.json(), async (req, res, next) => {
    try {
      const { text, voiceKind } = req.body ?? {};

      if (typeof text !== 'string' || !text.trim() || text.length > 200) {
        return res.status(400).json({ error: 'INVALID_TEXT' });
      }
      if (voiceKind !== 'mandarin' && voiceKind !== 'cantonese') {
        return res.status(400).json({ error: 'INVALID_VOICE_KIND' });
      }

      const { provider, voiceId } = getPrimaryVoice(voiceKind);
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
