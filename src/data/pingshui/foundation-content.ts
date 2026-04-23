/**
 * Foundation module content — structured data for the 7 teaching screens.
 *
 * Separating content from UI lets us:
 *   — translate into zh-Hant / en-bilingual without touching the component
 *   — feed demo phrases directly into the audio pre-warmer
 *   — edit copy without risking React state bugs
 *
 * ── The 7 screens ────────────────────────────────────────────────────────────
 *   1. 四声     — the four classical tones; introduces Cantonese as evidence
 *   2. 上平     — why 平 splits into 上平 and 下平; 示儿 anchor poem
 *   3. 下平     — same, the second half; 静夜思 anchor poem
 *   4. 仄声     — the three 仄 tones: 上声, 去声, 入声
 *   5. 入声     — the lost tone; first case of Mandarin-lost/Cantonese-kept
 *   6. 粤语佐证 — thesis screen: Cantonese as diagnostic evidence; 春望 demo
 *   7. 韵目     — how a category gets its name; preview of the 106 system
 *
 * Each screen has: headline, body paragraphs, optional demo items with audio,
 * optional anchor poem demo, and an optional "key insight" callout.
 */

export interface DemoItem {
  /** The character or short phrase. */
  text: string;
  /** What this demonstrates in the screen's context. */
  caption: string;
  /** Modern Mandarin pinyin, for visual reference. Displayed alongside audio. */
  pinyin?: string;
  /** The classical tone this character carries in 平水韵. */
  classicalTone?: 'ping' | 'shang' | 'qu' | 'ru';
  /** Any extra note shown below the item (e.g. "lost in modern Mandarin"). */
  note?: string;
  /** Cantonese Jyutping evidence — shows that this character still has an entering-tone ending in Cantonese. */
  cantoneseEvidence?: { jyutping: string; descriptor?: string };
}

export interface AnchorDemoConfig {
  /** Rhyme ID from trainer-curriculum.ts, e.g. 'shangping-01-dong'. */
  rhymeId: string;
  /** Whether to show the jyutping callout table. */
  showJyutpingCallout?: boolean;
  /** Callout message rendered below the jyutping table. */
  calloutMessage?: string;
}

export interface FoundationScreen {
  /** Stable ID, used for progress tracking and deep-links. */
  id: string;
  /** Number in the sequence, starting at 1. */
  step: number;
  /** Headline Chinese character/phrase — the big-typography element. */
  title: string;
  /** One-line subtitle in Chinese. */
  subtitle: string;
  /** Body paragraphs. Rendered as separate <p> elements. */
  body: string[];
  /** Demo items with audio. Order matters. */
  demos?: DemoItem[];
  /** Anchor poem demo — renders a bordered poem card with play buttons. */
  anchorDemo?: AnchorDemoConfig;
  /** A key insight pulled out as a visual callout at the end of the screen. */
  insight?: string;
  /** Optional pedagogical warning (red-tinted callout). */
  caveat?: string;
}

// ---------------------------------------------------------------------------
// The seven screens
// ---------------------------------------------------------------------------

export const FOUNDATION_SCREENS: FoundationScreen[] = [
  {
    id: 'four-tones',
    step: 1,
    title: '四声',
    subtitle: '古汉语的声调系统',
    body: [
      '中古汉语(诗人写格律诗时的语音基础)有四个声调:平、上、去、入。',
      '这和今天普通话的四声(一声、二声、三声、四声)不是同一个系统 — 是两个分别经历了千年演变的体系。',
      '为什么中古音和现代普通话差这么多?因为汉语经过了一千多年的演变,不断简化、合并。但并非所有方言都走了同样的路 — 粤语、闽南语等南方方言,保留了更多古音特征。本课程会反复用粤语作为"佐证",让你用耳朵直接感知古代的韵律。',
    ],
    demos: [
      { text: '东', caption: '平声示例', pinyin: 'dōng', classicalTone: 'ping' },
      { text: '好', caption: '上声示例', pinyin: 'hǎo', classicalTone: 'shang' },
      { text: '去', caption: '去声示例', pinyin: 'qù', classicalTone: 'qu' },
    ],
    insight: '现代普通话 ≠ 中古汉语。学韵部,就是学回那个古老的声调体系。',
  },

  {
    id: 'shangping',
    step: 2,
    title: '上平',
    subtitle: '平声的前十五韵',
    body: [
      '平水韵中,"平声" 字太多,一卷书装不下,所以被分成 "上平" 和 "下平" 两半。',
      '上平共十五韵,从 一东 开始,到 十五删 结束。',
      '注意:"上平" 不是另一个声调 — 它和 下平 都还是 平声,只是编排上的分册。',
      '一东韵是全书开篇,最熟悉的韵之一。这首陆游的《示儿》押的就是 一东韵 — 同·翁 两字都收 -ong 音,在普通话和粤语里都保留得很好。这是"简单情况" — 语音演变中幸运留下的家族关系。',
    ],
    demos: [
      { text: '东', caption: '一东 韵目字', pinyin: 'dōng', classicalTone: 'ping' },
      { text: '冬', caption: '二冬 韵目字', pinyin: 'dōng', classicalTone: 'ping' },
      { text: '支', caption: '四支 韵目字', pinyin: 'zhī', classicalTone: 'ping' },
    ],
    anchorDemo: { rhymeId: 'shangping-01-dong' },
    insight: '上平 · 下平 是历史分册的产物,不是声调的分别。',
  },

  {
    id: 'xiaping',
    step: 3,
    title: '下平',
    subtitle: '平声的后十五韵',
    body: [
      '下平也是十五韵,从 一先 开始,到 十五咸 结束。',
      '常见的 七阳、十一尤、六麻 都在下平。许多唐诗名作就押这些韵。',
      '这样,"平声" 总共三十韵 — 律诗押韵大多在这三十韵之中选择。',
      '七阳韵是下平最著名的韵之一,也是李白《静夜思》押的韵。光·霜·乡 三字在普通话和粤语里都清晰地押韵(-ang / -oeng)。听一听,感受一下韵律。不是所有韵都这么"和谐" — 后面你会看到更复杂的情况。',
    ],
    demos: [
      { text: '先', caption: '一先 韵目字', pinyin: 'xiān', classicalTone: 'ping' },
      { text: '阳', caption: '七阳 韵目字', pinyin: 'yáng', classicalTone: 'ping' },
      { text: '尤', caption: '十一尤 韵目字', pinyin: 'yóu', classicalTone: 'ping' },
    ],
    anchorDemo: { rhymeId: 'xiaping-07-yang' },
    insight: '平声 = 上平 15 + 下平 15 = 共 30 韵。格律诗押韵的主战场。',
  },

  {
    id: 'zesheng',
    step: 4,
    title: '仄声',
    subtitle: '三个声调合称的 "另一边"',
    body: [
      '除了平声,其他三个声调 — 上声、去声、入声 — 合称为 "仄声"。',
      '为什么要合称?因为写格律诗时,我们只需要判断一个字是 "平" 还是 "仄",不需要区分上、去、入的细节。',
      '平水韵把三个仄声声调分得很细:上声 29 韵,去声 30 韵,入声 17 韵 — 共 76 仄声韵部。但学格律时,你多数时候只需要记"平"还是"仄"。入声因为在普通话里消失了,格外棘手 — 下一屏详谈。',
    ],
    demos: [
      { text: '好', caption: '上声 · 今读三声', pinyin: 'hǎo', classicalTone: 'shang' },
      { text: '去', caption: '去声 · 今读四声', pinyin: 'qù', classicalTone: 'qu' },
      { text: '月', caption: '入声 · 今读四声', pinyin: 'yuè', classicalTone: 'ru',
        note: '在普通话中已消失,下一步会详谈。' },
    ],
    insight: '平 / 仄 是格律诗的基本骨架 — 每个字非此即彼。',
  },

  {
    id: 'rusheng',
    step: 5,
    title: '入声',
    subtitle: '消失的第四声',
    body: [
      '入声是一种"突然刹车"的发音。现代普通话的四声都是"延长拉开"的 — 读完声调后,嘴巴还是开着的。但入声字不一样:读到最后,嘴巴会突然"闭起来"或"卡住",声音戛然而止。这是你学到的第一个"普通话失去、粤语保留"的案例 — 下一屏会揭示还有第二个。',
      '古代的入声有三种结尾方式 — 不需要会真的发出这些音,只需要知道"这个字古代曾经有这种闭口结尾"。',
      '普通话里,这三种闭口音全部消失了 — 入声字被重新分配到了一、二、三、四声之中,无规律可循。结果就是:你无法从现代读音判断一个字是否入声。这也是为什么写格律诗时,入声字最容易让人踩雷。训练器会帮你通过重复识别来记住这些字 — 这是本课程的核心目标之一。',
      '下面这些字在普通话里早已失去入声特征,但在粤语等南方方言中仍保留了原本的 -p、-t、-k 收尾。括号里的粤语拼音不需要你学会发音 — 它只是作为证据,说明这些字古代确实属于入声。',
    ],
    demos: [
      { text: '十', caption: '-p 闭唇音 · 双唇合拢', pinyin: 'shí', classicalTone: 'ru',
        note: '今读二声,古属入声。读完后双唇合拢,像说"噗"一样。',
        cantoneseEvidence: { jyutping: 'sap6', descriptor: '保留 -p 收尾' } },
      { text: '入', caption: '-p 闭唇音 · 双唇合拢', pinyin: 'rù', classicalTone: 'ru',
        note: '今读四声,古属入声。',
        cantoneseEvidence: { jyutping: 'jap6', descriptor: '保留 -p 收尾' } },
      { text: '月', caption: '-t 闭舌音 · 舌尖顶上齿', pinyin: 'yuè', classicalTone: 'ru',
        note: '今读四声,古属入声。读完后舌尖顶住上齿后方。',
        cantoneseEvidence: { jyutping: 'jyut6', descriptor: '保留 -t 收尾' } },
      { text: '日', caption: '-t 闭舌音 · 舌尖顶上齿', pinyin: 'rì', classicalTone: 'ru',
        note: '今读四声,古属入声。',
        cantoneseEvidence: { jyutping: 'jat6', descriptor: '保留 -t 收尾' } },
      { text: '白', caption: '-k 闭喉音 · 舌根顶软腭', pinyin: 'bái', classicalTone: 'ru',
        note: '今读二声,古属入声。读完后舌根顶住软腭。',
        cantoneseEvidence: { jyutping: 'baak6', descriptor: '保留 -k 收尾' } },
      { text: '六', caption: '-k 闭喉音 · 舌根顶软腭', pinyin: 'liù', classicalTone: 'ru',
        note: '今读四声,古属入声。',
        cantoneseEvidence: { jyutping: 'luk6', descriptor: '保留 -k 收尾' } },
    ],
    insight: '学入声,不是学发音 — 而是学"哪些字是入声"。这是核心挑战。',
  },

  {
    id: 'cantonese-evidence',
    step: 6,
    title: '粤语佐证',
    subtitle: '用耳朵穿越千年',
    body: [
      '前面你已经学过:入声 (-p/-t/-k) 在普通话里完全消失了,但粤语里仍在。这不是偶然 — 粤语整体上比普通话演变得慢,保留了更多中古汉语的特征,像一台"语言时间机器"。',
      '你不需要会说粤语。你只需要:当一首唐诗用粤语朗诵时,两个在普通话里"不太押韵"的字,可能在粤语里发音完全相同。这一刻,你就听到了一千两百年前,诗人听到的那种韵律。',
      '其实,中古汉语还有一类"闭口韵"消失了:-m 鼻音结尾(像说"嗯"但要闭紧双唇)。深、心、金、簪 等字,古代都以 -m 结尾。普通话里全部合并到了 -n;粤语里依然保留。',
      '下面这首《春望》(杜甫)就押 -m 韵。普通话读出来,四个韵脚字(深·心·金·簪)勉强押韵;粤语读出来,深·心 完全同音(sam¹),-m 闭口一目了然。',
    ],
    anchorDemo: {
      rhymeId: 'xiaping-12-qin',
      showJyutpingCallout: true,
      calloutMessage: '粤语中 深/心 完全同音(sam¹),-m 收尾一目了然;普通话 shēn/xīn 虽押韵,但已无闭口音,家族关系被隐藏。',
    },
    insight: '粤语 = 你的耳朵证据。从第一层起,每个韵部配一首诗、一段双语朗诵。',
    caveat: '不同粤语口音略有差别,本课程使用标准粤语(广州话)。如果你熟悉其他方言(如闽南语、客家话),也会发现类似的古音保留现象。',
  },

  {
    id: 'yunmu',
    step: 7,
    title: '韵目',
    subtitle: '每一韵部的 "名牌"',
    body: [
      '每一个韵部都以一个代表字命名。例如:"一东" 因为 东 是它的首字代表字;"七阳" 以 阳 代表。',
      '这些代表字本身就属于这一韵,但 "一东" 中的字远不止 东 一个 — 风、空、中、红、通 等几百字都属一东。',
      '平水韵共 106 个韵部:平声 30(上平 15 + 下平 15),上声 29,去声 30,入声 17。',
      '106 看起来多,但入门只需 5 个。基础课程完成后,从第一层的五韵开始。每一韵都配有代表诗、韵脚字表、粤语拼音佐证、以及普通话+粤语双语音频 — 记得:用耳朵听。',
    ],
    demos: [
      { text: '一东', caption: '第一个 韵部', pinyin: 'yī dōng' },
      { text: '七阳', caption: '最常用的 韵部之一', pinyin: 'qī yáng' },
      { text: '十五咸', caption: '下平最后一韵', pinyin: 'shí wǔ xián' },
    ],
    insight: '106 个韵部 → 30 平 + 76 仄。平声是格律诗押韵的主战场。',
  },
];

// ---------------------------------------------------------------------------
// Phrases for the audio pre-warmer
// ---------------------------------------------------------------------------

/**
 * Every text string from the foundation module that should be pre-synthesized
 * and cached. Characters from `demos[].text` are NOT included here because
 * the prewarmer already pulls them from curriculum data.
 *
 * This is only the descriptive / title strings — the ones learners might
 * tap to replay.
 */
export const FOUNDATION_AUDIO_PHRASES: readonly string[] = [
  // Screen titles (tap-to-replay)
  '四声', '上平', '下平', '仄声', '入声', '粤语佐证', '韵目',
  // A few key phrases worth hearing in voiceover
  '平声', '上声', '去声',
  '一东', '七阳', '十五咸',
];
