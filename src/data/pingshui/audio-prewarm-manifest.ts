/**
 * Audio pre-warm manifest — every text item that needs TTS synthesis.
 *
 * ⚠️  KEEP IN SYNC WITH:
 *   - server/routes/admin-audio.mjs (POST /prewarm handler, hardcoded arrays)
 *   - scripts/prewarm-audio.mjs (standalone prewarm script, hardcoded arrays)
 * If you add items here, update both of those files too.
 *
 * Sources:
 *   1. Foundation screen titles (6 screens)
 *   2. Foundation demo characters (deduplicated across all 6 screens)
 *   3. Tier 1 seed characters (5 rhymes x 12 chars, minus duplicates from #2)
 *   4. Cantonese evidence characters (入声 screen demos with cantoneseEvidence)
 *
 * Total entries: 82
 *   - Mandarin foundation titles: 6
 *   - Mandarin foundation demos: 17
 *   - Mandarin Tier 1 seeds (new): 53
 *   - Cantonese rusheng evidence: 6
 */

export interface AudioManifestEntry {
  text: string;
  voiceKind: 'mandarin' | 'cantonese';
  usageContext: string[];
}

export const AUDIO_PREWARM_MANIFEST: AudioManifestEntry[] = [
  // ─── Mandarin: Foundation screen titles (6) ────────────────────────────
  { text: '四声', voiceKind: 'mandarin', usageContext: ['foundation:four-tones:title'] },
  { text: '上平', voiceKind: 'mandarin', usageContext: ['foundation:shangping:title'] },
  { text: '下平', voiceKind: 'mandarin', usageContext: ['foundation:xiaping:title'] },
  { text: '仄声', voiceKind: 'mandarin', usageContext: ['foundation:zesheng:title'] },
  { text: '入声', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:title'] },
  { text: '韵目', voiceKind: 'mandarin', usageContext: ['foundation:yunmu:title'] },

  // ─── Mandarin: Foundation demo characters (17, deduplicated) ───────────
  { text: '东', voiceKind: 'mandarin', usageContext: ['foundation:four-tones:demo:0', 'foundation:shangping:demo:0', 'curriculum:shangping-01-dong:seed'] },
  { text: '好', voiceKind: 'mandarin', usageContext: ['foundation:four-tones:demo:1', 'foundation:zesheng:demo:0'] },
  { text: '去', voiceKind: 'mandarin', usageContext: ['foundation:four-tones:demo:2', 'foundation:zesheng:demo:1'] },
  { text: '冬', voiceKind: 'mandarin', usageContext: ['foundation:shangping:demo:1'] },
  { text: '支', voiceKind: 'mandarin', usageContext: ['foundation:shangping:demo:2'] },
  { text: '先', voiceKind: 'mandarin', usageContext: ['foundation:xiaping:demo:0'] },
  { text: '阳', voiceKind: 'mandarin', usageContext: ['foundation:xiaping:demo:1', 'curriculum:xiaping-07-yang:seed'] },
  { text: '尤', voiceKind: 'mandarin', usageContext: ['foundation:xiaping:demo:2', 'curriculum:xiaping-11-you:seed'] },
  { text: '月', voiceKind: 'mandarin', usageContext: ['foundation:zesheng:demo:2', 'foundation:rusheng:demo:2'] },
  { text: '十', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:demo:0'] },
  { text: '入', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:demo:1'] },
  { text: '日', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:demo:3'] },
  { text: '白', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:demo:4'] },
  { text: '六', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:demo:5'] },
  { text: '一东', voiceKind: 'mandarin', usageContext: ['foundation:yunmu:demo:0'] },
  { text: '七阳', voiceKind: 'mandarin', usageContext: ['foundation:yunmu:demo:1'] },
  { text: '十五咸', voiceKind: 'mandarin', usageContext: ['foundation:yunmu:demo:2'] },

  // ─── Mandarin: Tier 1 seed characters (53, excluding duplicates) ──────
  // 一东 seeds (11 new — 东 already above)
  { text: '风', voiceKind: 'mandarin', usageContext: ['curriculum:shangping-01-dong:seed'] },
  { text: '空', voiceKind: 'mandarin', usageContext: ['curriculum:shangping-01-dong:seed'] },
  { text: '中', voiceKind: 'mandarin', usageContext: ['curriculum:shangping-01-dong:seed'] },
  { text: '红', voiceKind: 'mandarin', usageContext: ['curriculum:shangping-01-dong:seed'] },
  { text: '同', voiceKind: 'mandarin', usageContext: ['curriculum:shangping-01-dong:seed'] },
  { text: '通', voiceKind: 'mandarin', usageContext: ['curriculum:shangping-01-dong:seed'] },
  { text: '翁', voiceKind: 'mandarin', usageContext: ['curriculum:shangping-01-dong:seed'] },
  { text: '弓', voiceKind: 'mandarin', usageContext: ['curriculum:shangping-01-dong:seed'] },
  { text: '宫', voiceKind: 'mandarin', usageContext: ['curriculum:shangping-01-dong:seed'] },
  { text: '功', voiceKind: 'mandarin', usageContext: ['curriculum:shangping-01-dong:seed'] },
  { text: '虹', voiceKind: 'mandarin', usageContext: ['curriculum:shangping-01-dong:seed'] },

  // 七阳 seeds (11 new — 阳 already above)
  { text: '光', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-07-yang:seed'] },
  { text: '霜', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-07-yang:seed'] },
  { text: '乡', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-07-yang:seed'] },
  { text: '香', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-07-yang:seed'] },
  { text: '长', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-07-yang:seed'] },
  { text: '常', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-07-yang:seed'] },
  { text: '场', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-07-yang:seed'] },
  { text: '章', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-07-yang:seed'] },
  { text: '羊', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-07-yang:seed'] },
  { text: '方', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-07-yang:seed'] },
  { text: '凉', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-07-yang:seed'] },

  // 十一尤 seeds (11 new — 尤 already above)
  { text: '忧', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-11-you:seed'] },
  { text: '秋', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-11-you:seed'] },
  { text: '楼', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-11-you:seed'] },
  { text: '流', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-11-you:seed'] },
  { text: '舟', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-11-you:seed'] },
  { text: '留', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-11-you:seed'] },
  { text: '收', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-11-you:seed'] },
  { text: '头', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-11-you:seed'] },
  { text: '愁', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-11-you:seed'] },
  { text: '游', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-11-you:seed'] },
  { text: '州', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-11-you:seed'] },

  // 六麻 seeds (12 new)
  { text: '麻', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-06-ma:seed'] },
  { text: '家', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-06-ma:seed'] },
  { text: '花', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-06-ma:seed'] },
  { text: '霞', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-06-ma:seed'] },
  { text: '华', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-06-ma:seed'] },
  { text: '沙', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-06-ma:seed'] },
  { text: '斜', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-06-ma:seed'] },
  { text: '茶', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-06-ma:seed'] },
  { text: '涯', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-06-ma:seed'] },
  { text: '鸦', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-06-ma:seed'] },
  { text: '加', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-06-ma:seed'] },
  { text: '瓜', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-06-ma:seed'] },

  // 五歌 seeds (12 new)
  { text: '歌', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-05-ge:seed'] },
  { text: '多', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-05-ge:seed'] },
  { text: '何', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-05-ge:seed'] },
  { text: '河', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-05-ge:seed'] },
  { text: '过', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-05-ge:seed'] },
  { text: '波', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-05-ge:seed'] },
  { text: '磨', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-05-ge:seed'] },
  { text: '罗', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-05-ge:seed'] },
  { text: '娥', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-05-ge:seed'] },
  { text: '蛾', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-05-ge:seed'] },
  { text: '哥', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-05-ge:seed'] },
  { text: '柯', voiceKind: 'mandarin', usageContext: ['curriculum:xiaping-05-ge:seed'] },

  // ─── Cantonese: 入声 evidence characters (6) ──────────────────────────
  { text: '十', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '入', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '月', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '日', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '白', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '六', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
];
