/**
 * Audio service — the façade that routes and prewarm scripts consume.
 *
 * Responsibilities:
 *   1. Pick the right provider based on environment config
 *   2. Check cache before hitting the provider
 *   3. Persist provider results to cache
 *   4. Surface errors in a uniform shape
 *   5. Support explicit provider selection (for admin audio review)
 */

import path from 'path';
import { NullAudioProvider, DEFAULT_VOICE, AudioUnavailableError } from './provider.mjs';
import { AzureAudioProvider } from './azure-provider.mjs';
import { ElevenLabsAudioProvider } from './elevenlabs-provider.mjs';
import { AlibabaAudioProvider } from './alibaba-provider.mjs';
import { AudioCache } from './cache.mjs';

export class AudioService {
  constructor(config) {
    this.cache = new AudioCache({ rootDir: config.cacheDir });

    // Named providers map — for explicit provider selection via synthesizeWith
    this.providers = {};

    if (config.azure?.apiKey && config.azure?.region) {
      this.providers.azure = new AzureAudioProvider({
        apiKey: config.azure.apiKey,
        region: config.azure.region,
      });
    }

    if (config.elevenlabs?.apiKey) {
      this.elevenLabsConfig = config.elevenlabs;
      if (config.elevenlabs.voiceIdMandarin) {
        this.providers.elevenlabs = new ElevenLabsAudioProvider({
          apiKey: config.elevenlabs.apiKey,
          voiceId: config.elevenlabs.voiceIdMandarin,
        });
      }
    }

    if (config.alibaba?.apiKey) {
      this.alibabaConfig = config.alibaba;
      this.providers.alibaba = new AlibabaAudioProvider({
        apiKey: config.alibaba.apiKey,
        model: config.alibaba.model,
        voice: config.alibaba.voice,
        baseUrl: config.alibaba.baseUrl,
      });
    }

    // Default provider: ElevenLabs > Azure > Alibaba > Null
    this.provider = this.providers.elevenlabs
      ?? this.providers.azure
      ?? this.providers.alibaba
      ?? new NullAudioProvider();
  }

  /** Is any audio synthesis provider available? */
  isAvailable() {
    return this.provider.isAvailable();
  }

  /** Default provider name, for diagnostics. */
  get providerName() {
    return this.provider.name;
  }

  /** Summary of all configured providers, for boot logging. */
  describeProviders() {
    const parts = [];
    if (this.providers.elevenlabs) {
      parts.push(`elevenlabs(${this.elevenLabsConfig?.voiceIdMandarin?.slice(0, 8) ?? '?'}...)`);
    }
    if (this.providers.azure) {
      parts.push('azure(configured)');
    }
    if (this.providers.alibaba) {
      parts.push(`alibaba(${this.alibabaConfig?.model ?? 'cosyvoice'})`);
    }
    if (parts.length === 0) parts.push('null');
    return parts.join(' | ');
  }

  /**
   * Synthesize (or serve from cache) the given text using the default provider.
   * Backward-compatible with existing audio route.
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

  /**
   * Synthesize with an explicit provider + voice. Used by admin audio review.
   * Does NOT check or write to the shared cache — admin audio has its own
   * file management via audio_clips table.
   *
   * @param {string} text
   * @param {object} opts
   * @param {string} opts.provider — 'azure', 'elevenlabs', or 'alibaba'
   * @param {string} opts.voiceId — provider-specific voice identifier
   * @returns {Promise<{audio: Buffer, mimeType: string, voice: string, sourceText: string}>}
   */
  async synthesizeWith(text, { provider: providerName, voiceId }) {
    const normalized = text.trim();
    if (!normalized) throw new Error('Empty text');

    let p;
    if (providerName === 'azure') {
      p = this.providers.azure;
      if (!p) throw new AudioUnavailableError('Azure provider not configured');
    } else if (providerName === 'elevenlabs') {
      if (!this.elevenLabsConfig?.apiKey) {
        throw new AudioUnavailableError('ElevenLabs provider not configured');
      }
      p = new ElevenLabsAudioProvider({
        apiKey: this.elevenLabsConfig.apiKey,
        voiceId: voiceId,
      });
    } else if (providerName === 'alibaba') {
      if (!this.alibabaConfig?.apiKey) {
        throw new AudioUnavailableError('Alibaba Qwen3-TTS provider not configured');
      }
      p = new AlibabaAudioProvider({
        apiKey: this.alibabaConfig.apiKey,
        model: this.alibabaConfig.model,
        voice: (voiceId && voiceId.trim()) ? voiceId : this.alibabaConfig.voice,
        baseUrl: this.alibabaConfig.baseUrl,
      });
    } else {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    return p.synthesize({ text: normalized, voice: voiceId });
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
    elevenlabs:
      process.env.ELEVENLABS_API_KEY
        ? {
            apiKey: process.env.ELEVENLABS_API_KEY,
            voiceIdMandarin: process.env.ELEVENLABS_VOICE_ID_MANDARIN,
            voiceIdCantonese: process.env.ELEVENLABS_VOICE_ID_CANTONESE,
          }
        : undefined,
    alibaba:
      process.env.ALIBABA_DASHSCOPE_API_KEY
        ? (() => {
            const envBaseUrl = process.env.ALIBABA_DASHSCOPE_BASE_URL;
            const baseUrl = (envBaseUrl && !envBaseUrl.startsWith('wss://'))
              ? envBaseUrl
              : undefined;
            return {
              apiKey: process.env.ALIBABA_DASHSCOPE_API_KEY,
              model: process.env.ALIBABA_QWEN_MODEL ?? process.env.ALIBABA_COSYVOICE_MODEL ?? 'qwen3-tts-flash',
              voice: process.env.ALIBABA_QWEN_VOICE ?? process.env.ALIBABA_COSYVOICE_VOICE ?? undefined,
              baseUrl,
            };
          })()
        : undefined,
  });
}
