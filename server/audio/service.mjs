/**
 * Audio service — the façade that routes and prewarm scripts consume.
 *
 * Responsibilities:
 *   1. Pick the right provider based on environment config
 *   2. Check cache before hitting the provider
 *   3. Persist provider results to cache
 *   4. Surface errors in a uniform shape
 */

import path from 'path';
import { NullAudioProvider, DEFAULT_VOICE, AudioUnavailableError } from './provider.mjs';
import { AzureAudioProvider } from './azure-provider.mjs';
import { AudioCache } from './cache.mjs';

export class AudioService {
  constructor(config) {
    this.cache = new AudioCache({ rootDir: config.cacheDir });
    if (config.azure?.apiKey && config.azure?.region) {
      this.provider = new AzureAudioProvider({
        apiKey: config.azure.apiKey,
        region: config.azure.region,
      });
    } else {
      this.provider = new NullAudioProvider();
    }
  }

  /** Is audio synthesis actually available? */
  isAvailable() {
    return this.provider.isAvailable();
  }

  /** Provider name, for diagnostics. */
  get providerName() {
    return this.provider.name;
  }

  /**
   * Synthesize (or serve from cache) the given text.
   *
   * @throws {AudioUnavailableError} if no provider is configured AND no cache
   *         entry exists for the request.
   */
  async synthesize(text, voice) {
    const v = voice ?? DEFAULT_VOICE;
    const normalized = text.trim();
    if (!normalized) {
      throw new Error('Empty text');
    }

    const cached = await this.cache.get(normalized, v);
    if (cached) {
      return {
        audio: cached.audio,
        mimeType: cached.mimeType,
        voice: v,
        cacheHit: true,
      };
    }

    if (!this.provider.isAvailable()) {
      throw new AudioUnavailableError(
        'No audio provider configured and no cached entry for this text',
      );
    }

    const result = await this.provider.synthesize({ text: normalized, voice: v });
    this.cache.put(normalized, v, result.audio).catch((e) => {
      console.warn('[audio] cache write failed:', e instanceof Error ? e.message : e);
    });
    return {
      audio: result.audio,
      mimeType: result.mimeType,
      voice: v,
      cacheHit: false,
    };
  }

  /** Cache size for monitoring. */
  cacheSize() {
    return this.cache.size();
  }
}

/**
 * Build an AudioService from environment variables.
 * Missing env vars are NOT an error — falls back to NullAudioProvider.
 */
export function createAudioServiceFromEnv(opts = {}) {
  const defaultCacheDir = path.join(process.cwd(), 'data', 'audio-cache');
  return new AudioService({
    cacheDir: opts.cacheDir ?? defaultCacheDir,
    azure:
      process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION
        ? {
            apiKey: process.env.AZURE_SPEECH_KEY,
            region: process.env.AZURE_SPEECH_REGION,
          }
        : undefined,
  });
}
