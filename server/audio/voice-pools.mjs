/**
 * Voice pools for audio generation.
 * Each voiceKind has an ordered array. Index 0 = primary (used for initial generation).
 * Regenerate advances to the next index, wrapping around at end.
 *
 * DEPRECATED env vars — no longer used, kept for rollback only:
 *   AZURE_SPEECH_VOICE_MANDARIN
 *   ALIBABA_QWEN_VOICE
 *   ALIBABA_COSYVOICE_MODEL
 *   ALIBABA_COSYVOICE_VOICE
 *   ALIBABA_DASHSCOPE_BASE_URL
 *   ELEVENLABS_VOICE_ID_MANDARIN
 *   ELEVENLABS_VOICE_ID_CANTONESE
 *
 * STILL ACTIVE (required):
 *   AZURE_SPEECH_KEY
 *   AZURE_SPEECH_REGION
 *   ALIBABA_DASHSCOPE_API_KEY
 *   ALIBABA_QWEN_MODEL (defaults to qwen3-tts-flash)
 */

export const VOICE_POOLS = {
  mandarin: [
    { provider: 'azure',   voiceId: 'zh-CN-YunyangNeural' },
    { provider: 'azure',   voiceId: 'zh-CN-YunxiNeural' },
  ],
  cantonese: [
    { provider: 'alibaba', voiceId: 'Rocky' },
    { provider: 'azure',   voiceId: 'zh-HK-WanLungNeural' },
  ],
};

/**
 * Get the primary voice for a voiceKind (first in pool).
 * @param {string} voiceKind - 'mandarin' or 'cantonese'
 * @returns {{ provider: string, voiceId: string }}
 */
export function getPrimaryVoice(voiceKind) {
  const pool = VOICE_POOLS[voiceKind];
  if (!pool || pool.length === 0) {
    throw new Error(`No voice pool configured for voiceKind '${voiceKind}'`);
  }
  return pool[0];
}

/**
 * Get the next voice in the pool given the current one. Wraps around.
 * @param {string} voiceKind
 * @param {{ provider: string, voiceId: string } | null} currentVoice
 * @returns {{ provider: string, voiceId: string }}
 */
export function getNextVoice(voiceKind, currentVoice) {
  const pool = VOICE_POOLS[voiceKind];
  if (!pool || pool.length === 0) {
    throw new Error(`No voice pool configured for voiceKind '${voiceKind}'`);
  }
  if (!currentVoice) return pool[0];
  const idx = pool.findIndex(
    v => v.provider === currentVoice.provider && v.voiceId === currentVoice.voiceId,
  );
  if (idx === -1) return pool[0];
  return pool[(idx + 1) % pool.length];
}
