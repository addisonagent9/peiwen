// Auto-generated copy of src/data/pingshui/audio-prewarm-manifest.ts
// Keep in sync manually. Any entry added to the .ts file must also be added here.

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

export const AUDIO_PREWARM_MANIFEST = [
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

  // ─── Mandarin: Foundation narration — body paragraphs + insights (25) ──

  // Screen 1: four-tones
  { text: '中古汉语(诗人写格律诗时的语音基础)有四个声调:平、上、去、入。', voiceKind: 'mandarin', usageContext: ['foundation:four-tones:body:0'] },
  { text: '这和今天普通话的四声(一声、二声、三声、四声)不是同一个系统 — 是两个分别经历了千年演变的体系。', voiceKind: 'mandarin', usageContext: ['foundation:four-tones:body:1'] },
  { text: '现代普通话 ≠ 中古汉语。学韵部,就是学回那个古老的声调体系。', voiceKind: 'mandarin', usageContext: ['foundation:four-tones:insight'] },

  // Screen 2: shangping
  { text: '平水韵中,"平声" 字太多,一卷书装不下,所以被分成 "上平" 和 "下平" 两半。', voiceKind: 'mandarin', usageContext: ['foundation:shangping:body:0'] },
  { text: '上平共十五韵,从 一东 开始,到 十五删 结束。', voiceKind: 'mandarin', usageContext: ['foundation:shangping:body:1'] },
  { text: '注意:"上平" 不是另一个声调 — 它和 下平 都还是 平声,只是编排上的分册。', voiceKind: 'mandarin', usageContext: ['foundation:shangping:body:2'] },
  { text: '上平 · 下平 是历史分册的产物,不是声调的分别。', voiceKind: 'mandarin', usageContext: ['foundation:shangping:insight'] },

  // Screen 3: xiaping
  { text: '下平也是十五韵,从 一先 开始,到 十五咸 结束。', voiceKind: 'mandarin', usageContext: ['foundation:xiaping:body:0'] },
  { text: '常见的 七阳、十一尤、六麻 都在下平。许多唐诗名作就押这些韵。', voiceKind: 'mandarin', usageContext: ['foundation:xiaping:body:1'] },
  { text: '这样,"平声" 总共三十韵 — 律诗押韵大多在这三十韵之中选择。', voiceKind: 'mandarin', usageContext: ['foundation:xiaping:body:2'] },
  { text: '平声 = 上平 15 + 下平 15 = 共 30 韵。格律诗押韵的主战场。', voiceKind: 'mandarin', usageContext: ['foundation:xiaping:insight'] },

  // Screen 4: zesheng
  { text: '除了平声,其他三个声调 — 上声、去声、入声 — 合称为 "仄声"。', voiceKind: 'mandarin', usageContext: ['foundation:zesheng:body:0'] },
  { text: '为什么要合称?因为写格律诗时,我们只需要判断一个字是 "平" 还是 "仄",不需要区分上、去、入的细节。', voiceKind: 'mandarin', usageContext: ['foundation:zesheng:body:1'] },
  { text: '平水韵把三个仄声声调分得很细:上声 29 韵,去声 30 韵,入声 17 韵。但学习时,我们主要做到辨认,不必每韵深记。', voiceKind: 'mandarin', usageContext: ['foundation:zesheng:body:2'] },
  { text: '平 / 仄 是格律诗的基本骨架 — 每个字非此即彼。', voiceKind: 'mandarin', usageContext: ['foundation:zesheng:insight'] },

  // Screen 5: rusheng
  { text: '入声是一种"突然刹车"的发音。现代普通话的四声都是"延长拉开"的 — 读完声调后,嘴巴还是开着的。但入声字不一样:读到最后,嘴巴会突然"闭起来"或"卡住",声音戛然而止。', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:body:0'] },
  { text: '古代的入声有三种结尾方式 — 不需要会真的发出这些音,只需要知道"这个字古代曾经有这种闭口结尾"。', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:body:1'] },
  { text: '普通话里,这三种闭口音全部消失了 — 入声字被重新分配到了一、二、三、四声之中,无规律可循。结果就是:你无法从现代读音判断一个字是否入声。这也是为什么写格律诗时,入声字最容易让人踩雷。训练器会帮你通过重复识别来记住这些字 — 这是本课程的核心目标之一。', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:body:2'] },
  { text: '下面这些字在普通话里早已失去入声特征,但在粤语等南方方言中仍保留了原本的 -p、-t、-k 收尾。括号里的粤语拼音不需要你学会发音 — 它只是作为证据,说明这些字古代确实属于入声。', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:body:3'] },
  { text: '学入声,不是学发音 — 而是学"哪些字是入声"。这是核心挑战。', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:insight'] },

  // Screen 6: yunmu
  { text: '每一个韵部都以一个代表字命名。例如:"一东" 因为 东 是它的首字代表字;"七阳" 以 阳 代表。', voiceKind: 'mandarin', usageContext: ['foundation:yunmu:body:0'] },
  { text: '这些代表字本身就属于这一韵,但 "一东" 中的字远不止 东 一个 — 风、空、中、红、通 等几百字都属一东。', voiceKind: 'mandarin', usageContext: ['foundation:yunmu:body:1'] },
  { text: '平水韵共 106 个韵部:平声 30(上平 15 + 下平 15),上声 29,去声 30,入声 17。', voiceKind: 'mandarin', usageContext: ['foundation:yunmu:body:2'] },
  { text: '听上去数目惊人,但好消息是:写格律诗最需要掌握的,只是 平声 那 30 个。从 五个 最常用的 开始学即可。', voiceKind: 'mandarin', usageContext: ['foundation:yunmu:body:3'] },
  { text: '106 看起来多,但入门只需 5 个。基础课程完成后,从第一层的五韵开始。', voiceKind: 'mandarin', usageContext: ['foundation:yunmu:insight'] },

  // ─── Cantonese: 入声 evidence characters (6) ──────────────────────────
  { text: '十', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '入', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '月', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '日', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '白', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '六', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
];
