/**
 * Convert raw voice_id from the DB into a human-friendly label.
 * e.g. 'zh-CN-YunyangNeural' → 'CN_PRI_Yunyang'
 */

export function formatVoiceLabel(voiceId: string): string {
  const map: Record<string, string> = {
    'zh-CN-YunyangNeural': 'CN_PRI_Yunyang',
    'zh-CN-YunxiNeural': 'CN_SEC_Yunxi',
    'zh-HK-WanLungNeural': 'HK_PRI_WanLung',
    'Rocky': 'HK_SEC_Rocky',
  };
  return map[voiceId] ?? voiceId;
}
