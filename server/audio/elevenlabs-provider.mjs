/**
 * ElevenLabs TTS provider.
 *
 * Uses the ElevenLabs text-to-speech REST API.
 * Parallel to azure-provider.mjs — same interface shape.
 *
 * Reference: https://elevenlabs.io/docs/api-reference/text-to-speech
 */

import { AudioUnavailableError, AudioProviderError } from './provider.mjs';

const DEFAULT_MODEL = 'eleven_multilingual_v2';

export class ElevenLabsAudioProvider {
  name = 'elevenlabs';

  /**
   * @param {object} config
   * @param {string} config.apiKey — ElevenLabs API key
   * @param {string} config.voiceId — Voice ID (e.g. 'MI36FIkp9wRP7cpWKPTl')
   * @param {string} [config.model] — Model ID (defaults to eleven_multilingual_v2)
   */
  constructor(config) {
    this.config = config;
  }

  isAvailable() {
    return Boolean(this.config.apiKey && this.config.voiceId);
  }

  /**
   * Synthesize speech from text.
   *
   * @param {object} req
   * @param {string} req.text — text to synthesize
   * @returns {Promise<{audio: Buffer, mimeType: string, voice: string, sourceText: string}>}
   * @throws {AudioUnavailableError} if the provider is not configured
   * @throws {AudioProviderError} if the upstream API returns an error
   */
  async synthesize(req) {
    if (!this.isAvailable()) {
      throw new AudioUnavailableError(
        'ElevenLabs not configured (missing API key or voice ID)',
      );
    }

    const voiceId = this.config.voiceId;
    const model = this.config.model ?? DEFAULT_MODEL;
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: req.text,
        model_id: model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new AudioProviderError(
        `ElevenLabs TTS failed: ${res.status} ${res.statusText}${
          text ? ` — ${text.slice(0, 200)}` : ''
        }`,
        res.status,
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    return {
      audio: Buffer.from(arrayBuffer),
      mimeType: 'audio/mpeg',
      voice: voiceId,
      sourceText: req.text,
    };
  }
}
