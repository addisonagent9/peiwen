/**
 * Audio provider abstraction layer.
 *
 * Defines the contract for text-to-speech providers and common error types.
 * Providers must implement `isAvailable()` and `synthesize()`.
 *
 * @module server/audio/provider
 */

/**
 * Default voice for Mandarin Chinese (Taiwan) synthesis.
 * Microsoft Azure Neural TTS voice identifier.
 */
export const DEFAULT_VOICE = 'zh-TW-HsiaoChenNeural';

/**
 * Thrown when no audio provider is configured or the provider
 * cannot fulfil the request because it is unavailable.
 */
export class AudioUnavailableError extends Error {
  /**
   * @param {string} reason — human-readable explanation
   */
  constructor(reason) {
    super(`Audio provider not available: ${reason}`);
    this.name = 'AudioUnavailableError';
  }
}

/**
 * Thrown when the upstream audio provider returns an error response.
 */
export class AudioProviderError extends Error {
  /**
   * @param {string} message — error description
   * @param {number} [statusCode] — HTTP status code from the provider, if any
   */
  constructor(message, statusCode) {
    super(message);
    this.name = 'AudioProviderError';
    this.statusCode = statusCode;
  }
}

/**
 * A no-op provider that always throws {@link AudioUnavailableError}.
 *
 * Used as a safe default when no real provider is configured so that callers
 * get a clear error instead of a crash.
 */
export class NullAudioProvider {
  /** Provider name for logging / diagnostics. */
  name = 'null';

  /**
   * Always returns `false` — this provider cannot synthesize audio.
   * @returns {boolean}
   */
  isAvailable() {
    return false;
  }

  /**
   * Always throws — no audio backend is available.
   *
   * @param {object} _req — synthesis request (ignored)
   * @returns {Promise<object>}
   * @throws {AudioUnavailableError}
   */
  async synthesize(_req) {
    throw new AudioUnavailableError('no audio provider configured');
  }
}
