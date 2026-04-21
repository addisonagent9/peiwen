/**
 * Alibaba Qwen3-TTS-Flash provider via DashScope REST API.
 * Supports Mandarin, Cantonese (Rocky/Kiki), Minnan (Roy), Shanghainese (Jada),
 * Sichuan (Sunny/Eric), Beijing (Dylan), Tianjin (Peter), Nanjing (Li), Shaanxi (Marcus).
 *
 * Reference: https://www.alibabacloud.com/help/en/model-studio/qwen-tts
 */

import { AudioProviderError } from './provider.mjs';

const DEFAULT_MODEL = 'qwen3-tts-flash';
const DEFAULT_BASE_URL = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
const DEFAULT_VOICE = 'Cherry';
const TIMEOUT_MS = 30_000;

export class AlibabaAudioProvider {
  /**
   * @param {object} config
   * @param {string} config.apiKey
   * @param {string} [config.model]
   * @param {string} [config.voice]
   * @param {string} [config.baseUrl]
   */
  constructor(config) {
    this.config = config;
    this.model = config.model ?? DEFAULT_MODEL;
    this.voice = config.voice ?? DEFAULT_VOICE;
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  }

  get name() { return 'alibaba'; }
  isAvailable() { return Boolean(this.config.apiKey); }

  /**
   * @param {{ text: string, voice?: string }} params
   * @returns {Promise<{audio: Buffer, mimeType: string, voice: string, sourceText: string}>}
   */
  async synthesize({ text, voice }) {
    if (!text || !text.trim()) {
      throw new AudioProviderError('Alibaba Qwen3-TTS: empty text');
    }

    const effectiveVoice = voice || this.voice;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let apiResponse;
    try {
      apiResponse = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          input: {
            text: text.trim(),
            voice: effectiveVoice,
          },
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new AudioProviderError('Alibaba Qwen3-TTS: request timed out after 30s');
      }
      throw new AudioProviderError(`Alibaba Qwen3-TTS network error: ${err.message}`);
    }
    clearTimeout(timeout);

    if (!apiResponse.ok) {
      const body = await apiResponse.text().catch(() => '');
      throw new AudioProviderError(
        `Alibaba Qwen3-TTS HTTP ${apiResponse.status}: ${body.slice(0, 500)}`,
      );
    }

    const json = await apiResponse.json();
    const audioUrl = json?.output?.audio?.url;

    if (!audioUrl) {
      throw new AudioProviderError(
        `Alibaba Qwen3-TTS: no audio URL in response — ${JSON.stringify(json).slice(0, 500)}`,
      );
    }

    // Download the audio file from the URL (Alibaba hosts it for 24 hours)
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new AudioProviderError(
        `Alibaba Qwen3-TTS: failed to download audio from ${audioUrl} (HTTP ${audioResponse.status})`,
      );
    }

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

    return {
      audio: audioBuffer,
      mimeType: 'audio/wav',
      voice: effectiveVoice,
      sourceText: text.trim(),
    };
  }
}
