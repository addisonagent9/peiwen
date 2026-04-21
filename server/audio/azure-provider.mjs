/**
 * Azure Speech TTS provider.
 *
 * Uses the Azure Cognitive Services Speech REST API directly.
 */

import {
  AudioUnavailableError,
  AudioProviderError,
  DEFAULT_VOICE,
} from './provider.mjs';

const DEFAULT_OUTPUT_FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
const DEFAULT_USER_AGENT = 'pw-trainer/1.0';

export class AzureAudioProvider {
  name = 'azure-speech';

  constructor(config) {
    this.config = config;
  }

  isAvailable() {
    return Boolean(this.config.apiKey && this.config.region);
  }

  async synthesize(req) {
    if (!this.isAvailable()) {
      throw new AudioUnavailableError(
        'Azure Speech not configured (missing key or region)',
      );
    }

    const voice = req.voice ?? DEFAULT_VOICE;
    const ssml = req.isSSML
      ? this.ensureSpeakRoot(req.text, voice)
      : this.buildSSML(req.text, voice, req.rate ?? 1.0);
    const sourceText = req.isSSML
      ? this.stripSSML(req.text)
      : req.text;

    const url = `https://${this.config.region}.tts.speech.microsoft.com/cognitiveservices/v1`;
    const outputFormat = this.config.outputFormat ?? DEFAULT_OUTPUT_FORMAT;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.config.apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': outputFormat,
        'User-Agent': DEFAULT_USER_AGENT,
      },
      body: ssml,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new AudioProviderError(
        `Azure TTS failed: ${res.status} ${res.statusText}${
          text ? ` — ${text.slice(0, 200)}` : ''
        }`,
        res.status,
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    return {
      audio: Buffer.from(arrayBuffer),
      mimeType: 'audio/mpeg',
      voice,
      sourceText,
    };
  }

  /** Build a minimal SSML document from plain text. */
  buildSSML(text, voice, rate) {
    const locale = this.voiceLocale(voice);
    const escapedText = this.escapeXml(text);
    const ratePct = `${Math.round((rate - 1) * 100)}%`;
    return (
      `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" ` +
      `xml:lang="${locale}">` +
      `<voice name="${voice}">` +
      `<prosody rate="${ratePct}">${escapedText}</prosody>` +
      `</voice>` +
      `</speak>`
    );
  }

  /** Ensure user-provided SSML has a <speak> root. */
  ensureSpeakRoot(ssml, voice) {
    const trimmed = ssml.trim();
    if (trimmed.startsWith('<speak')) return trimmed;
    const locale = this.voiceLocale(voice);
    return (
      `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" ` +
      `xml:lang="${locale}">` +
      `<voice name="${voice}">${trimmed}</voice>` +
      `</speak>`
    );
  }

  voiceLocale(voice) {
    const parts = voice.split('-');
    return `${parts[0]}-${parts[1]}`;
  }

  escapeXml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  stripSSML(ssml) {
    return ssml.replace(/<[^>]+>/g, '').trim();
  }
}
