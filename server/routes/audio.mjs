/**
 * Audio route — GET /api/audio/:text
 *
 * Serves TTS audio for a single Chinese character or short phrase.
 * Browsers can <audio src="..."> this URL directly.
 *
 * GET /api/audio/status — health check / diagnostics
 * GET /api/audio/:text  — the actual TTS endpoint
 */

import express from 'express';
import { DEFAULT_VOICE, AudioUnavailableError } from '../audio/provider.mjs';

const SUPPORTED_VOICES = new Set(['zh-TW-HsiaoChenNeural']);
const MAX_TEXT_LENGTH = 100;

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

export function createAudioRouter(service) {
  const router = express.Router();
  const checkRate = createRateLimiter();

  // GET /api/audio/status
  router.get('/status', (_req, res) => {
    res.json({
      available: service.isAvailable(),
      provider: service.providerName,
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
      const voice =
        typeof voiceParam === 'string' && SUPPORTED_VOICES.has(voiceParam)
          ? voiceParam
          : DEFAULT_VOICE;

      const result = await service.synthesize(text, voice);

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Length', String(result.audio.length));
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('X-Audio-Source', result.cacheHit ? 'cache' : 'synthesis');
      res.send(result.audio);
    } catch (err) {
      if (err instanceof AudioUnavailableError) {
        res.status(503).json({
          error: 'AUDIO_UNAVAILABLE',
          reason: err.message,
        });
        return;
      }
      next(err);
    }
  });

  return router;
}
