/**
 * Alibaba CosyVoice TTS provider via DashScope WebSocket API.
 *
 * Uses the streaming WebSocket protocol for text-to-speech synthesis.
 * Supports both Mandarin and Cantonese via cosyvoice-v3-flash model
 * in the Singapore (international) region.
 *
 * Reference: https://help.aliyun.com/zh/dashscope/developer-reference/cosyvoice-websocket-api
 */

import { WebSocket } from 'ws';
import crypto from 'crypto';
import { AudioUnavailableError, AudioProviderError } from './provider.mjs';

const DEFAULT_MODEL = 'cosyvoice-v3-flash';
const DEFAULT_BASE_URL = 'wss://dashscope-intl.aliyuncs.com/api-ws/v1/inference/';
const TIMEOUT_MS = 30_000;

export class AlibabaAudioProvider {
  name = 'alibaba';

  /**
   * @param {object} config
   * @param {string} config.apiKey — DashScope API key
   * @param {string} [config.model] — Model ID (defaults to cosyvoice-v3-flash)
   * @param {string} [config.voice] — Preset voice ID (optional, API picks default if omitted)
   * @param {string} [config.baseUrl] — WebSocket URL (defaults to Singapore intl region)
   */
  constructor(config) {
    this.config = config;
    this.model = config.model ?? DEFAULT_MODEL;
    this.voice = config.voice ?? undefined;
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  }

  isAvailable() {
    return Boolean(this.config.apiKey);
  }

  /**
   * Synthesize speech from text via WebSocket streaming.
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
        'Alibaba CosyVoice not configured (missing DashScope API key)',
      );
    }

    const taskId = crypto.randomUUID();
    const text = req.text;
    const voiceLabel = this.voice ?? 'default';

    return new Promise((resolve, reject) => {
      const audioChunks = [];
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try { ws.close(); } catch { /* ignored */ }
          reject(new AudioProviderError('Alibaba CosyVoice timed out after 30s', 504));
        }
      }, TIMEOUT_MS);

      const cleanup = () => {
        clearTimeout(timeout);
      };

      const ws = new WebSocket(this.baseUrl, {
        headers: {
          'Authorization': `bearer ${this.config.apiKey}`,
          'X-DashScope-DataInspection': 'enable',
        },
      });

      ws.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          cleanup();
          reject(new AudioProviderError(
            `Alibaba CosyVoice WebSocket error: ${err.message}`,
          ));
        }
      });

      ws.on('open', () => {
        // Step 1: Send run-task command
        const runTask = {
          header: {
            action: 'run-task',
            task_id: taskId,
            streaming: 'duplex',
          },
          payload: {
            model: this.model,
            task_group: 'audio',
            task: 'tts',
            function: 'SpeechSynthesizer',
            input: {},
            parameters: {
              text_type: 'PlainText',
              format: 'mp3',
              sample_rate: 22050,
              ...(this.voice ? { voice: this.voice } : {}),
            },
          },
        };
        ws.send(JSON.stringify(runTask));
      });

      ws.on('message', (data, isBinary) => {
        if (isBinary) {
          // Binary frame = audio chunk
          audioChunks.push(Buffer.from(data));
          return;
        }

        // Text frame = JSON event
        let event;
        try {
          event = JSON.parse(data.toString());
        } catch {
          return; // Ignore unparseable messages
        }

        const action = event?.header?.action;
        const code = event?.header?.code;

        if (code && code !== 'SUCCESS' && action === 'task-failed') {
          if (!resolved) {
            resolved = true;
            cleanup();
            try { ws.close(); } catch { /* ignored */ }
            const msg = event?.header?.message ?? event?.header?.error_message ?? 'Unknown error';
            reject(new AudioProviderError(
              `Alibaba CosyVoice task failed: ${code} — ${msg}`,
            ));
          }
          return;
        }

        if (action === 'task-started') {
          // Step 2: Send the text
          const continueTask = {
            header: {
              action: 'continue-task',
              task_id: taskId,
              streaming: 'duplex',
            },
            payload: {
              input: { text },
            },
          };
          ws.send(JSON.stringify(continueTask));

          // Step 3: Signal end of input
          const finishTask = {
            header: {
              action: 'finish-task',
              task_id: taskId,
              streaming: 'duplex',
            },
            payload: {
              input: {},
            },
          };
          ws.send(JSON.stringify(finishTask));
        }

        if (action === 'task-finished') {
          if (!resolved) {
            resolved = true;
            cleanup();
            try { ws.close(); } catch { /* ignored */ }

            if (audioChunks.length === 0) {
              reject(new AudioProviderError('Alibaba CosyVoice returned no audio data'));
              return;
            }

            resolve({
              audio: Buffer.concat(audioChunks),
              mimeType: 'audio/mpeg',
              voice: voiceLabel,
              sourceText: text,
            });
          }
        }
      });

      ws.on('close', (code, reason) => {
        if (!resolved) {
          resolved = true;
          cleanup();
          reject(new AudioProviderError(
            `Alibaba CosyVoice WebSocket closed unexpectedly (code=${code}, reason="${reason?.toString?.() ?? ''}", received ${audioChunks.length} chunks before close, but no task-finished event)`,
          ));
        }
      });
    });
  }
}
