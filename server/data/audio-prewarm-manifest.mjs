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
  { text: '粤语佐证', voiceKind: 'mandarin', usageContext: ['foundation:cantonese-evidence:title'] },
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
  { text: '为什么中古音和现代普通话差这么多?因为汉语经过了一千多年的演变,不断简化、合并。但并非所有方言都走了同样的路 — 粤语、闽南语等南方方言,保留了更多古音特征。本课程会反复用粤语作为"佐证",让你用耳朵直接感知古代的韵律。', voiceKind: 'mandarin', usageContext: ['foundation:four-tones:body:2'] },
  { text: '现代普通话 ≠ 中古汉语。学韵部,就是学回那个古老的声调体系。', voiceKind: 'mandarin', usageContext: ['foundation:four-tones:insight'] },

  // Screen 2: shangping
  { text: '平水韵中,"平声" 字太多,一卷书装不下,所以被分成 "上平" 和 "下平" 两半。', voiceKind: 'mandarin', usageContext: ['foundation:shangping:body:0'] },
  { text: '上平共十五韵,从 一东 开始,到 十五删 结束。', voiceKind: 'mandarin', usageContext: ['foundation:shangping:body:1'] },
  { text: '注意:"上平" 不是另一个声调 — 它和 下平 都还是 平声,只是编排上的分册。', voiceKind: 'mandarin', usageContext: ['foundation:shangping:body:2'] },
  { text: '一东韵是全书开篇,最熟悉的韵之一。这首陆游的《示儿》押的就是 一东韵 — 同·翁 两字都收 -ong 音,在普通话和粤语里都保留得很好。这是"简单情况" — 语音演变中幸运留下的家族关系。', voiceKind: 'mandarin', usageContext: ['foundation:shangping:body:3'] },
  { text: '上平 · 下平 是历史分册的产物,不是声调的分别。', voiceKind: 'mandarin', usageContext: ['foundation:shangping:insight'] },

  // Screen 3: xiaping
  { text: '下平也是十五韵,从 一先 开始,到 十五咸 结束。', voiceKind: 'mandarin', usageContext: ['foundation:xiaping:body:0'] },
  { text: '常见的 七阳、十一尤、六麻 都在下平。许多唐诗名作就押这些韵。', voiceKind: 'mandarin', usageContext: ['foundation:xiaping:body:1'] },
  { text: '这样,"平声" 总共三十韵 — 律诗押韵大多在这三十韵之中选择。', voiceKind: 'mandarin', usageContext: ['foundation:xiaping:body:2'] },
  { text: '七阳韵是下平最著名的韵之一,也是李白《静夜思》押的韵。光·霜·乡 三字在普通话和粤语里都清晰地押韵(-ang / -oeng)。听一听,感受一下韵律。不是所有韵都这么"和谐" — 后面你会看到更复杂的情况。', voiceKind: 'mandarin', usageContext: ['foundation:xiaping:body:3'] },
  { text: '平声 = 上平 15 + 下平 15 = 共 30 韵。格律诗押韵的主战场。', voiceKind: 'mandarin', usageContext: ['foundation:xiaping:insight'] },

  // Screen 4: zesheng
  { text: '除了平声,其他三个声调 — 上声、去声、入声 — 合称为 "仄声"。', voiceKind: 'mandarin', usageContext: ['foundation:zesheng:body:0'] },
  { text: '为什么要合称?因为写格律诗时,我们只需要判断一个字是 "平" 还是 "仄",不需要区分上、去、入的细节。', voiceKind: 'mandarin', usageContext: ['foundation:zesheng:body:1'] },
  { text: '平水韵把三个仄声声调分得很细:上声 29 韵,去声 30 韵,入声 17 韵 — 共 76 仄声韵部。但学格律时,你多数时候只需要记"平"还是"仄"。入声因为在普通话里消失了,格外棘手 — 下一屏详谈。', voiceKind: 'mandarin', usageContext: ['foundation:zesheng:body:2'] },
  { text: '平 / 仄 是格律诗的基本骨架 — 每个字非此即彼。', voiceKind: 'mandarin', usageContext: ['foundation:zesheng:insight'] },

  // Screen 5: rusheng
  { text: '入声是一种"突然刹车"的发音。现代普通话的四声都是"延长拉开"的 — 读完声调后,嘴巴还是开着的。但入声字不一样:读到最后,嘴巴会突然"闭起来"或"卡住",声音戛然而止。这是你学到的第一个"普通话失去、粤语保留"的案例 — 下一屏会揭示还有第二个。', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:body:0'] },
  { text: '古代的入声有三种结尾方式 — 不需要会真的发出这些音,只需要知道"这个字古代曾经有这种闭口结尾"。', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:body:1'] },
  { text: '普通话里,这三种闭口音全部消失了 — 入声字被重新分配到了一、二、三、四声之中,无规律可循。结果就是:你无法从现代读音判断一个字是否入声。这也是为什么写格律诗时,入声字最容易让人踩雷。训练器会帮你通过重复识别来记住这些字 — 这是本课程的核心目标之一。', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:body:2'] },
  { text: '下面这些字在普通话里早已失去入声特征,但在粤语等南方方言中仍保留了原本的 -p、-t、-k 收尾。括号里的粤语拼音不需要你学会发音 — 它只是作为证据,说明这些字古代确实属于入声。', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:body:3'] },
  { text: '学入声,不是学发音 — 而是学"哪些字是入声"。这是核心挑战。', voiceKind: 'mandarin', usageContext: ['foundation:rusheng:insight'] },

  // Screen 6: cantonese-evidence (NEW)
  { text: '前面你已经学过:入声 (-p/-t/-k) 在普通话里完全消失了,但粤语里仍在。这不是偶然 — 粤语整体上比普通话演变得慢,保留了更多中古汉语的特征,像一台"语言时间机器"。', voiceKind: 'mandarin', usageContext: ['foundation:cantonese-evidence:body:0'] },
  { text: '你不需要会说粤语。你只需要:当一首唐诗用粤语朗诵时,两个在普通话里"不太押韵"的字,可能在粤语里发音完全相同。这一刻,你就听到了一千两百年前,诗人听到的那种韵律。', voiceKind: 'mandarin', usageContext: ['foundation:cantonese-evidence:body:1'] },
  { text: '其实,中古汉语还有一类"闭口韵"消失了:-m 鼻音结尾(像说"嗯"但要闭紧双唇)。深、心、金、簪 等字,古代都以 -m 结尾。普通话里全部合并到了 -n;粤语里依然保留。', voiceKind: 'mandarin', usageContext: ['foundation:cantonese-evidence:body:2'] },
  { text: '下面这首《春望》(杜甫)就押 -m 韵。普通话读出来,四个韵脚字(深·心·金·簪)勉强押韵;粤语读出来,深·心 完全同音(sam¹),-m 闭口一目了然。', voiceKind: 'mandarin', usageContext: ['foundation:cantonese-evidence:body:3'] },
  { text: '粤语 = 你的耳朵证据。从第一层起,每个韵部配一首诗、一段双语朗诵。', voiceKind: 'mandarin', usageContext: ['foundation:cantonese-evidence:insight'] },

  // Screen 7: yunmu
  { text: '每一个韵部都以一个代表字命名。例如:"一东" 因为 东 是它的首字代表字;"七阳" 以 阳 代表。', voiceKind: 'mandarin', usageContext: ['foundation:yunmu:body:0'] },
  { text: '这些代表字本身就属于这一韵,但 "一东" 中的字远不止 东 一个 — 风、空、中、红、通 等几百字都属一东。', voiceKind: 'mandarin', usageContext: ['foundation:yunmu:body:1'] },
  { text: '平水韵共 106 个韵部:平声 30(上平 15 + 下平 15),上声 29,去声 30,入声 17。', voiceKind: 'mandarin', usageContext: ['foundation:yunmu:body:2'] },
  { text: '106 看起来多,但入门只需 5 个。基础课程完成后,从第一层的五韵开始。每一韵都配有代表诗、韵脚字表、粤语拼音佐证、以及普通话+粤语双语音频 — 记得:用耳朵听。', voiceKind: 'mandarin', usageContext: ['foundation:yunmu:body:3'] },
  { text: '106 个韵部 → 30 平 + 76 仄。平声是格律诗押韵的主战场。', voiceKind: 'mandarin', usageContext: ['foundation:yunmu:insight'] },

  // ─── Cantonese: 入声 evidence characters (6) ──────────────────────────
  { text: '十', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '入', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '月', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '日', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '白', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },
  { text: '六', voiceKind: 'cantonese', usageContext: ['foundation:rusheng:cantonese-evidence'] },

  // ─── Anchor poems: Mandarin (9) ───────────────────────────────────────
  { text: '死去元知万事空,但悲不见九州同。\n王师北定中原日,家祭无忘告乃翁。', voiceKind: 'mandarin', usageContext: ['anchor:shangping-01-dong'] },
  { text: '床前明月光,疑是地上霜。\n举头望明月,低头思故乡。', voiceKind: 'mandarin', usageContext: ['anchor:xiaping-07-yang'] },
  { text: '白日依山尽,黄河入海流。\n欲穷千里目,更上一层楼。', voiceKind: 'mandarin', usageContext: ['anchor:xiaping-11-you'] },
  { text: '故人具鸡黍,邀我至田家。\n绿树村边合,青山郭外斜。\n开轩面场圃,把酒话桑麻。\n待到重阳日,还来就菊花。', voiceKind: 'mandarin', usageContext: ['anchor:xiaping-06-ma'] },
  { text: '鹅,鹅,鹅,曲项向天歌。\n白毛浮绿水,红掌拨清波。', voiceKind: 'mandarin', usageContext: ['anchor:xiaping-05-ge'] },
  { text: '少小离家老大回,乡音无改鬓毛衰。\n儿童相见不相识,笑问客从何处来。', voiceKind: 'mandarin', usageContext: ['anchor:shangping-10-hui'] },
  { text: '朝辞白帝彩云间,千里江陵一日还。\n两岸猿声啼不住,轻舟已过万重山。', voiceKind: 'mandarin', usageContext: ['anchor:shangping-15-shan'] },
  { text: '李白乘舟将欲行,忽闻岸上踏歌声。\n桃花潭水深千尺,不及汪伦送我情。', voiceKind: 'mandarin', usageContext: ['anchor:xiaping-08-geng'] },
  { text: '国破山河在,城春草木深。\n感时花溅泪,恨别鸟惊心。\n烽火连三月,家书抵万金。\n白头搔更短,浑欲不胜簪。', voiceKind: 'mandarin', usageContext: ['anchor:xiaping-12-qin'] },

  // ─── Anchor poems: Cantonese (9) ──────────────────────────────────────
  { text: '死去元知万事空,但悲不见九州同。\n王师北定中原日,家祭无忘告乃翁。', voiceKind: 'cantonese', usageContext: ['anchor:shangping-01-dong'] },
  { text: '床前明月光,疑是地上霜。\n举头望明月,低头思故乡。', voiceKind: 'cantonese', usageContext: ['anchor:xiaping-07-yang'] },
  { text: '白日依山尽,黄河入海流。\n欲穷千里目,更上一层楼。', voiceKind: 'cantonese', usageContext: ['anchor:xiaping-11-you'] },
  { text: '故人具鸡黍,邀我至田家。\n绿树村边合,青山郭外斜。\n开轩面场圃,把酒话桑麻。\n待到重阳日,还来就菊花。', voiceKind: 'cantonese', usageContext: ['anchor:xiaping-06-ma'] },
  { text: '鹅,鹅,鹅,曲项向天歌。\n白毛浮绿水,红掌拨清波。', voiceKind: 'cantonese', usageContext: ['anchor:xiaping-05-ge'] },
  { text: '少小离家老大回,乡音无改鬓毛衰。\n儿童相见不相识,笑问客从何处来。', voiceKind: 'cantonese', usageContext: ['anchor:shangping-10-hui'] },
  { text: '朝辞白帝彩云间,千里江陵一日还。\n两岸猿声啼不住,轻舟已过万重山。', voiceKind: 'cantonese', usageContext: ['anchor:shangping-15-shan'] },
  { text: '李白乘舟将欲行,忽闻岸上踏歌声。\n桃花潭水深千尺,不及汪伦送我情。', voiceKind: 'cantonese', usageContext: ['anchor:xiaping-08-geng'] },
  { text: '国破山河在,城春草木深。\n感时花溅泪,恨别鸟惊心。\n烽火连三月,家书抵万金。\n白头搔更短,浑欲不胜簪。', voiceKind: 'cantonese', usageContext: ['anchor:xiaping-12-qin'] },
];
