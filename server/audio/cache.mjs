/**
 * Disk-based audio cache.
 *
 * After the first synthesis of a given (text, voice) pair, the result is
 * persisted to disk. Subsequent requests for the same input return the cached
 * bytes without calling the upstream provider.
 *
 * Cache key = sha256(voice + ':' + text), truncated to 32 hex chars.
 * Two-level directory structure (ab/cdef12...) to avoid filesystem limits.
 * Atomic writes via tmp file + rename().
 */

import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class AudioCache {
  constructor(opts) {
    this.rootDir = opts.rootDir;
    fs.mkdirSync(this.rootDir, { recursive: true });
  }

  /**
   * Retrieve a cached entry, or null if not present or unreadable.
   * Catches all errors — a cache miss should never throw.
   */
  async get(text, voice) {
    const filePath = this.pathFor(text, voice);
    try {
      const [audio, stat] = await Promise.all([
        fsp.readFile(filePath),
        fsp.stat(filePath),
      ]);
      return {
        audio,
        mimeType: 'audio/mpeg',
        sizeBytes: stat.size,
        cachedAt: stat.mtime,
      };
    } catch {
      return null;
    }
  }

  /** Persist an entry. Overwrites if one already exists. Atomic on POSIX. */
  async put(text, voice, audio) {
    const filePath = this.pathFor(text, voice);
    const dir = path.dirname(filePath);
    await fsp.mkdir(dir, { recursive: true });
    const rand = crypto.randomBytes(8).toString('hex');
    const tmpPath = `${filePath}.${process.pid}.${rand}.tmp`;
    await fsp.writeFile(tmpPath, audio);
    try {
      await fsp.rename(tmpPath, filePath);
    } catch (err) {
      try { await fsp.unlink(tmpPath); } catch { /* ignored */ }
      throw err;
    }
  }

  /** Has a value ever been cached for this (text, voice)? */
  async has(text, voice) {
    try {
      await fsp.access(this.pathFor(text, voice));
      return true;
    } catch {
      return false;
    }
  }

  /** Remove an entry. Safe to call if it doesn't exist. */
  async delete(text, voice) {
    try {
      await fsp.unlink(this.pathFor(text, voice));
    } catch {
      /* ignored */
    }
  }

  /** Total cache size in bytes. Useful for monitoring. */
  async size() {
    let fileCount = 0;
    let totalBytes = 0;
    const walk = async (dir) => {
      const entries = await fsp.readdir(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          await walk(full);
        } else if (e.isFile() && full.endsWith('.mp3')) {
          const s = await fsp.stat(full);
          fileCount += 1;
          totalBytes += s.size;
        }
      }
    };
    try {
      await walk(this.rootDir);
    } catch {
      /* root may not exist yet */
    }
    return { fileCount, totalBytes };
  }

  pathFor(text, voice) {
    const key = this.keyFor(text, voice);
    const shard = key.slice(0, 2);
    const rest = key.slice(2);
    return path.join(this.rootDir, shard, `${rest}.mp3`);
  }

  keyFor(text, voice) {
    const h = crypto.createHash('sha256');
    h.update(voice);
    h.update(':');
    h.update(text);
    return h.digest('hex').slice(0, 32);
  }
}
