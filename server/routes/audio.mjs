/**
 * Audio route — GET /api/audio/:text
 *
 * Serves approved TTS audio for a single Chinese character or short phrase.
 * Only clips with status='approved' in audio_clips are served.
 *
 * GET /api/audio/status — health check + approved clip counts
 * GET /api/audio/:text  — serves approved audio (404 if not approved)
 */

import express from 'express';
import fsp from 'fs/promises';

const MAX_TEXT_LENGTH = 100;
const VALID_VOICE_KINDS = new Set(['mandarin', 'cantonese']);

// Simple in-memory rate limiter
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;

function createRateLimiter() {
  const buckets = new Map();
  return function checkRate(key) {
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
      buckets.set(key, { count: 1, windowStart: now });
      return true;
    }
    bucket.count += 1;
    return bucket.count <= RATE_LIMIT_MAX;
  };
}

/**
 * @param {import('../audio/service.mjs').AudioService} service
 * @param {import('better-sqlite3').Database} db
 */
export function createAudioRouter(service, db) {
  const router = express.Router();
  const checkRate = createRateLimiter();

  const sGetApproved = db.prepare(`
    SELECT file_path FROM audio_clips
    WHERE text = ? AND voice_kind = ? AND status = 'approved'
    LIMIT 1
  `);

  const sCountApproved = db.prepare(`
    SELECT voice_kind, COUNT(*) as n FROM audio_clips
    WHERE status = 'approved'
    GROUP BY voice_kind
  `);

  // GET /api/audio/status
  router.get('/status', (_req, res) => {
    const rows = sCountApproved.all();
    const counts = { mandarin: 0, cantonese: 0 };
    for (const r of rows) {
      if (r.voice_kind in counts) counts[r.voice_kind] = r.n;
    }
    res.json({
      available: service.isAvailable(),
      provider: service.providerName,
      approvedClips: counts,
    });
  });

  // GET /api/audio/:text
  router.get('/:text', async (req, res, next) => {
    try {
      const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
      if (!checkRate(ip)) {
        res.status(429).json({ error: 'RATE_LIMITED' });
        return;
      }

      const rawText = req.params.text;
      const text = Array.isArray(rawText) ? rawText[0] : rawText;
      if (typeof text !== 'string' || !text.length) {
        res.status(400).json({ error: 'INVALID_TEXT' });
        return;
      }
      if (text.length > MAX_TEXT_LENGTH) {
        res.status(400).json({ error: 'TEXT_TOO_LONG' });
        return;
      }

      const voiceParam = req.query.voice;
      const voiceKind = typeof voiceParam === 'string' && VALID_VOICE_KINDS.has(voiceParam)
        ? voiceParam
        : 'mandarin';

      const row = sGetApproved.get(text, voiceKind);
      if (!row || !row.file_path) {
        res.status(404).json({ error: 'AUDIO_NOT_APPROVED' });
        return;
      }

      try {
        const audio = await fsp.readFile(row.file_path);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', String(audio.length));
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.send(audio);
      } catch {
        res.status(404).json({ error: 'AUDIO_NOT_APPROVED' });
      }
    } catch (err) {
      next(err);
    }
  });

  return router;
}
