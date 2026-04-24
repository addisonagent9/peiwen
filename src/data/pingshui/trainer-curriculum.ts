/**
 * 平水韵 Trainer — Curriculum Data
 *
 * The 30 平声 韵部 in pedagogical (not numerical) order, with tier assignments,
 * family groupings, seed characters, mnemonics, and anchor poems.
 *
 * ── Pedagogical principles encoded here ──────────────────────────────────────
 *   • Tier 1 (5 categories): distinctive, high-frequency rhymes. Quick wins.
 *     Unlocked after Phase 0 foundation module is complete.
 *   • Tier 2 (20 categories): the confusable families. Taught in family groups
 *     of 2–3 so learners confront the traps directly instead of collapsing
 *     their mental model later.
 *   • Tier 3 (5 categories): 三江 (small/rare) + the four -m endings
 *     (十二侵, 十三覃, 十四盐, 十五咸) that disappeared from Mandarin entirely.
 *     Taught as a historical-phonology recognition task.
 *
 * ── Data completeness notes ──────────────────────────────────────────────────
 *   • All 30 categories have: id, label, tier, family, 8+ seed characters,
 *     a mnemonic, and modern rime signature. This is enough to start drills.
 *   • Anchor poems are provided for all Tier 1 categories and a selection of
 *     Tier 2/3. Poems are verified to rhyme in the listed 韵部 under 平水韵
 *     (not modern Mandarin — some will feel "off" to a Mandarin ear, which is
 *     exactly the teaching point).
 *   • Mnemonics are intentionally short (1–2 sentences) for mobile display.
 *
 * ── Seed characters ──────────────────────────────────────────────────────────
 *   These are NOT exhaustive lists — full character-to-韵部 lookup lives in
 *   the existing pingshui data module. Seeds are chosen for high frequency
 *   (appear in common Tang/Song poems) so learners build recognition for
 *   characters they will actually encounter.
 */

import type { Rhyme, RhymeFamily } from '../../types/pingshui-trainer';

// ---------------------------------------------------------------------------
// Family definitions
// ---------------------------------------------------------------------------

export const FAMILIES: Record<string, RhymeFamily> = {
  'ong-family': {
    id: 'ong-family',
    label: '-ong 家族',
    memberIds: ['shangping-01-dong', 'shangping-02-dong2'],
    teachingNote:
      '一东 and 二冬 sound identical to the modern Mandarin ear but are strictly ' +
      'separate in 平水韵. Historically they differed in medial glide. This is ' +
      "the single most famous confusable pair — learn them together.",
  },
  'ang-family': {
    id: 'ang-family',
    label: '-ang 家族',
    memberIds: ['xiaping-07-yang', 'shangping-03-jiang'],
    teachingNote:
      '七阳 is large and common; 三江 is small and rare. They are allowed to ' +
      '通押 in some contexts. Teach 七阳 first as Tier 1, revisit with 三江 later.',
  },
  'eng-ing-family': {
    id: 'eng-ing-family',
    label: '-eng/-ing 家族',
    memberIds: ['xiaping-08-geng', 'xiaping-09-qing', 'xiaping-10-zheng'],
    teachingNote:
      '八庚, 九青, 十蒸 all sound like -eng or -ing to modern ears but are three ' +
      'distinct categories. This triple is a classic 出韵 trap. Drill them as a set.',
  },
  'i-family': {
    id: 'i-family',
    label: '-i 家族',
    memberIds: ['shangping-04-zhi', 'shangping-05-wei', 'shangping-08-qi'],
    teachingNote:
      '四支, 五微, 八齐 all end in -i sounds. Historically differentiated by ' +
      'initial glides and vowel height. Modern Mandarin has largely merged them.',
  },
  'u-family': {
    id: 'u-family',
    label: '-u 家族',
    memberIds: ['shangping-06-yu', 'shangping-07-yu2'],
    teachingNote:
      '六鱼 (鱼) and 七虞 (虞) — the classic -u pair. Often blurred in Mandarin.',
  },
  'ai-family': {
    id: 'ai-family',
    label: '-ai 家族',
    memberIds: ['shangping-09-jia', 'shangping-10-hui'],
    teachingNote: '九佳 and 十灰 — both -ai family, historically distinct medials.',
  },
  'en-family': {
    id: 'en-family',
    label: '-en/-un 家族',
    memberIds: ['shangping-11-zhen', 'shangping-12-wen', 'shangping-13-yuan'],
    teachingNote:
      '真, 文, 元 — the famous -en triple. 十三元 is notorious as "出韵大户" ' +
      "because its scope feels arbitrary to modern learners. Drill aggressively.",
  },
  'an-family': {
    id: 'an-family',
    label: '-an 家族',
    memberIds: ['shangping-14-han', 'shangping-15-shan', 'xiaping-01-xian'],
    teachingNote:
      '寒, 删, 先 — three -an categories that feel identical in Mandarin. ' +
      "Split historically by medial and vowel. Another classic 出韵 trap triple.",
  },
  'ao-family': {
    id: 'ao-family',
    label: '-ao 家族',
    memberIds: ['xiaping-02-xiao', 'xiaping-03-yao', 'xiaping-04-hao'],
    teachingNote: '萧, 肴, 豪 — three -ao categories. Extremely confusable in modern Mandarin.',
  },
  'o-family': {
    id: 'o-family',
    label: '-o 家族',
    memberIds: ['xiaping-05-ge'],
    teachingNote: '五歌 stands largely alone in 平水韵 for the -o sound.',
  },
  'a-family': {
    id: 'a-family',
    label: '-a 家族',
    memberIds: ['xiaping-06-ma'],
    teachingNote: '六麻 — the pure open -a sound. Distinctive and easy to hear.',
  },
  'ou-family': {
    id: 'ou-family',
    label: '-ou 家族',
    memberIds: ['xiaping-11-you'],
    teachingNote: '十一尤 — distinctive -ou ending, appears in countless famous poems.',
  },
  'm-endings-family': {
    id: 'm-endings-family',
    label: '-m 韵尾家族（古代闭口韵）',
    memberIds: [
      'xiaping-12-qin',
      'xiaping-13-tan',
      'xiaping-14-yan',
      'xiaping-15-xian',
    ],
    teachingNote:
      'The "lost" -m endings. In 中古汉语 these ended in a closed-lip /m/ sound ' +
      'that merged into -n in Mandarin, erasing the original category boundary. ' +
      "The learner's task is pure recognition — memorize which characters belonged here.",
  },
};

// ---------------------------------------------------------------------------
// The 30 平声 韵部
// ---------------------------------------------------------------------------

export const RHYMES_PINGSHENG: Rhyme[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // TIER 1 — Quick wins. Unlock after Phase 0 foundation module.
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'shangping-01-dong',
    ordinal: 1,
    label: '一东',
    rhymeCharacter: '东',
    tone: 'ping',
    half: 'shangping',
    tier: 1,
    family: 'ong-family',
    confusables: ['shangping-02-dong2'],
    modernRime: '-ong / -eng (partial)',
    seedCharacters: [
      { char: '东', pinyin: 'dōng', jyutping: 'dung1', set: 1 },
      { char: '风', pinyin: 'fēng', jyutping: 'fung1', set: 1 },
      { char: '空', pinyin: 'kōng', jyutping: 'hung1', set: 1 },
      { char: '中', pinyin: 'zhōng', jyutping: 'zung1', set: 1 },
      { char: '红', pinyin: 'hóng', jyutping: 'hung4', set: 1 },
      { char: '同', pinyin: 'tóng', jyutping: 'tung4', set: 1 },
      { char: '通', pinyin: 'tōng', jyutping: 'tung1', set: 1 },
      { char: '弓', pinyin: 'gōng', jyutping: 'gung1', set: 1 },
      { char: '宫', pinyin: 'gōng', jyutping: 'gung1', set: 1 },
      { char: '功', pinyin: 'gōng', jyutping: 'gung1', set: 1 },
      { char: '虹', pinyin: 'hóng', jyutping: 'hung4', set: 1, showMandarinAudio: true },
      { char: '翁', pinyin: 'wēng', jyutping: 'jung1', set: 1, showMandarinAudio: true },
      { char: '冬', pinyin: 'dōng', jyutping: 'dung1', set: 2 },
      { char: '龙', pinyin: 'lóng', jyutping: 'lung4', set: 2 },
      { char: '聪', pinyin: 'cōng', jyutping: 'cung1', set: 2 },
      { char: '工', pinyin: 'gōng', jyutping: 'gung1', set: 2 },
      { char: '丰', pinyin: 'fēng', jyutping: 'fung1', set: 2 },
      { char: '公', pinyin: 'gōng', jyutping: 'gung1', set: 2 },
      { char: '熔', pinyin: 'róng', jyutping: 'jung4', set: 2 },
      { char: '充', pinyin: 'chōng', jyutping: 'cung1', set: 2 },
      { char: '鸿', pinyin: 'hóng', jyutping: 'hung4', set: 3, showMandarinAudio: true },
      { char: '葱', pinyin: 'cōng', jyutping: 'cung1', set: 3 },
      { char: '丛', pinyin: 'cóng', jyutping: 'cung4', set: 3 },
      { char: '穷', pinyin: 'qióng', jyutping: 'kung4', set: 3 },
      { char: '戎', pinyin: 'róng', jyutping: 'jung4', set: 3, showMandarinAudio: true },
      { char: '蓬', pinyin: 'péng', jyutping: 'pung4', set: 4, showMandarinAudio: true },
      { char: '蒙', pinyin: 'méng', jyutping: 'mung4', set: 4 },
      { char: '蜂', pinyin: 'fēng', jyutping: 'fung1', set: 4 },
      { char: '衷', pinyin: 'zhōng', jyutping: 'zung1', set: 4, showMandarinAudio: true },
      { char: '嵩', pinyin: 'sōng', jyutping: 'sung1', set: 4, showMandarinAudio: true },
      { char: '茸', pinyin: 'róng', jyutping: 'jung4', set: 4, showMandarinAudio: true },
      { char: '曈', pinyin: 'tóng', jyutping: 'tung4', set: 4, showMandarinAudio: true },
      { char: '瞳', pinyin: 'tóng', jyutping: 'tung4', set: 4, showMandarinAudio: true },
      { char: '桐', pinyin: 'tóng', jyutping: 'tung4', set: 4, showMandarinAudio: true },
      { char: '侗', pinyin: 'tóng', jyutping: 'tung4', set: 4, showMandarinAudio: true },
      { char: '彤', pinyin: 'tóng', jyutping: 'tung4', set: 4, showMandarinAudio: true },
    ],
    mnemonic:
      '想象东方日出,风从空中吹过 — "东、风、空、中" 都属一东。长长的 -ong 音, ' +
      '像钟声回响。',
    anchorPoem: {
      author: '陆游',
      title: '示儿',
      text: '死去元知万事空,但悲不见九州同。\n王师北定中原日,家祭无忘告乃翁。',
      rhymingCharacters: [
        { char: '空', jyutping: 'hung1', pinyin: 'kōng' },
        { char: '同', jyutping: 'tung4', pinyin: 'tóng' },
        { char: '翁', jyutping: 'jung1', pinyin: 'wēng' },
      ],
      gloss:
        "Lu You's deathbed poem. The three end-rhymes 空·同·翁 are all 一东 — " +
        'a clean demonstration of the category with a poem most learners know.',
    },
  },

  {
    id: 'xiaping-07-yang',
    ordinal: 7,
    label: '七阳',
    rhymeCharacter: '阳',
    tone: 'ping',
    half: 'xiaping',
    tier: 1,
    family: 'ang-family',
    confusables: ['shangping-03-jiang'],
    modernRime: '-ang',
    seedCharacters: [
      { char: '阳', pinyin: 'yáng', jyutping: 'joeng4', set: 1 },
      { char: '光', pinyin: 'guāng', jyutping: 'gwong1', set: 1 },
      { char: '霜', pinyin: 'shuāng', jyutping: 'soeng1', set: 1 },
      { char: '乡', pinyin: 'xiāng', jyutping: 'hoeng1', set: 1 },
      { char: '香', pinyin: 'xiāng', jyutping: 'hoeng1', set: 1 },
      { char: '长', pinyin: 'cháng', jyutping: 'coeng4', set: 1 },
      { char: '常', pinyin: 'cháng', jyutping: 'soeng4', set: 1 },
      { char: '场', pinyin: 'chǎng', jyutping: 'coeng4', set: 1 },
      { char: '章', pinyin: 'zhāng', jyutping: 'zoeng1', set: 1 },
      { char: '羊', pinyin: 'yáng', jyutping: 'joeng4', set: 1 },
      { char: '方', pinyin: 'fāng', jyutping: 'fong1', set: 1 },
      { char: '凉', pinyin: 'liáng', jyutping: 'loeng4', set: 1 },
      { char: '郎', pinyin: 'láng', jyutping: 'long4', set: 2 },
      { char: '狂', pinyin: 'kuáng', jyutping: 'kwong4', set: 2 },
      { char: '房', pinyin: 'fáng', jyutping: 'fong4', set: 2 },
      { char: '床', pinyin: 'chuáng', jyutping: 'cong4', set: 2 },
      { char: '黄', pinyin: 'huáng', jyutping: 'wong4', set: 2 },
      { char: '王', pinyin: 'wáng', jyutping: 'wong4', set: 2 },
      { char: '梁', pinyin: 'liáng', jyutping: 'loeng4', set: 2 },
      { char: '墙', pinyin: 'qiáng', jyutping: 'coeng4', set: 2 },
      { char: '堂', pinyin: 'táng', jyutping: 'tong4', set: 2 },
      { char: '杨', pinyin: 'yáng', jyutping: 'joeng4', set: 2 },
      { char: '扬', pinyin: 'yáng', jyutping: 'joeng4', set: 2 },
      { char: '伤', pinyin: 'shāng', jyutping: 'soeng1', set: 2 },
      { char: '苍', pinyin: 'cāng', jyutping: 'cong1', set: 3 },
      { char: '妆', pinyin: 'zhuāng', jyutping: 'zong1', set: 3 },
      { char: '肠', pinyin: 'cháng', jyutping: 'coeng4', set: 3 },
      { char: '塘', pinyin: 'táng', jyutping: 'tong4', set: 3 },
      { char: '觞', pinyin: 'shāng', jyutping: 'soeng1', set: 3, showMandarinAudio: true },
      { char: '彰', pinyin: 'zhāng', jyutping: 'zoeng1', set: 3 },
      { char: '茫', pinyin: 'máng', jyutping: 'mong4', set: 3 },
      { char: '徨', pinyin: 'huáng', jyutping: 'wong4', set: 4, showMandarinAudio: true },
      { char: '蹡', pinyin: 'qiāng', jyutping: 'coeng1', set: 4, showMandarinAudio: true },
      { char: '殇', pinyin: 'shāng', jyutping: 'soeng1', set: 4, showMandarinAudio: true },
    ],
    mnemonic:
      '阳光普照,大地宽广 — 开口呼 "-ang",最响亮的韵。" 床前明月光" 的 "光" 就在这里。',
    anchorPoem: {
      author: '李白',
      title: '静夜思',
      text: '床前明月光,疑是地上霜。\n举头望明月,低头思故乡。',
      rhymingCharacters: [
        { char: '光', jyutping: 'gwong1', pinyin: 'guāng' },
        { char: '霜', jyutping: 'soeng1', pinyin: 'shuāng' },
        { char: '乡', jyutping: 'hoeng1', pinyin: 'xiāng' },
      ],
      gloss:
        'Arguably the most memorized poem in Chinese. 光·霜·乡 are all 七阳, ' +
        'making this the ideal anchor: familiar poem + distinctive sound.',
    },
  },

  {
    id: 'xiaping-11-you',
    ordinal: 11,
    label: '十一尤',
    rhymeCharacter: '尤',
    tone: 'ping',
    half: 'xiaping',
    tier: 1,
    family: 'ou-family',
    confusables: [],
    modernRime: '-ou / -iu',
    seedCharacters: [
      { char: '尤', pinyin: 'yóu', jyutping: 'jau4', set: 1 },
      { char: '忧', pinyin: 'yōu', jyutping: 'jau1', set: 1 },
      { char: '秋', pinyin: 'qiū', jyutping: 'cau1', set: 1 },
      { char: '楼', pinyin: 'lóu', jyutping: 'lau4', set: 1 },
      { char: '流', pinyin: 'liú', jyutping: 'lau4', set: 1 },
      { char: '舟', pinyin: 'zhōu', jyutping: 'zau1', set: 1 },
      { char: '留', pinyin: 'liú', jyutping: 'lau4', set: 1 },
      { char: '收', pinyin: 'shōu', jyutping: 'sau1', set: 1 },
      { char: '愁', pinyin: 'chóu', jyutping: 'sau4', set: 1 },
      { char: '游', pinyin: 'yóu', jyutping: 'jau4', set: 1 },
      { char: '州', pinyin: 'zhōu', jyutping: 'zau1', set: 1 },
      { char: '头', pinyin: 'tóu', jyutping: 'tau4', set: 1 },
      { char: '牛', pinyin: 'niú', jyutping: 'ngau4', set: 2 },
      { char: '丘', pinyin: 'qiū', jyutping: 'jau1', set: 2 },
      { char: '求', pinyin: 'qiú', jyutping: 'kau4', set: 2 },
      { char: '休', pinyin: 'xiū', jyutping: 'jau1', set: 2 },
      { char: '周', pinyin: 'zhōu', jyutping: 'zau1', set: 2 },
      { char: '柔', pinyin: 'róu', jyutping: 'jau4', set: 2 },
      { char: '谋', pinyin: 'móu', jyutping: 'mau4', set: 2 },
      { char: '由', pinyin: 'yóu', jyutping: 'jau4', set: 2 },
      { char: '悠', pinyin: 'yōu', jyutping: 'jau4', set: 3 },
      { char: '酬', pinyin: 'chóu', jyutping: 'cau4', set: 3 },
      { char: '稠', pinyin: 'chóu', jyutping: 'cau4', set: 3 },
      { char: '讴', pinyin: 'ōu', jyutping: 'au1', set: 3, showMandarinAudio: true },
      { char: '侯', pinyin: 'hóu', jyutping: 'hau4', set: 3 },
      { char: '眸', pinyin: 'móu', jyutping: 'mau4', set: 3 },
      { char: '惆', pinyin: 'chóu', jyutping: 'cau4', set: 4, showMandarinAudio: true },
      { char: '畴', pinyin: 'chóu', jyutping: 'cau4', set: 4, showMandarinAudio: true },
      { char: '蹂', pinyin: 'róu', jyutping: 'jau4', set: 4, showMandarinAudio: true },
      { char: '鞣', pinyin: 'róu', jyutping: 'jau4', set: 4, showMandarinAudio: true },
      { char: '雠', pinyin: 'chóu', jyutping: 'cau4', set: 4, showMandarinAudio: true },
      { char: '逑', pinyin: 'qiú', jyutping: 'kau4', set: 4, showMandarinAudio: true },
    ],
    mnemonic:
      '独上高楼,望水流 — 收口 "-ou",带着一丝忧愁。登楼、望秋、思舟,都是十一尤。',
    anchorPoem: {
      author: '王之涣',
      title: '登鹳雀楼',
      text: '白日依山尽,黄河入海流。\n欲穷千里目,更上一层楼。',
      rhymingCharacters: [
        { char: '流', jyutping: 'lau4', pinyin: 'liú' },
        { char: '楼', jyutping: 'lau4', pinyin: 'lóu' },
      ],
      gloss:
        'Short, universally known, and the rhyme 流·楼 is unambiguously 十一尤.',
    },
  },

  {
    id: 'xiaping-06-ma',
    ordinal: 6,
    label: '六麻',
    rhymeCharacter: '麻',
    tone: 'ping',
    half: 'xiaping',
    tier: 1,
    family: 'a-family',
    confusables: [],
    modernRime: '-a / -ia / -ua',
    seedCharacters: [
      { char: '麻', pinyin: 'má', jyutping: 'maa4', set: 1 },
      { char: '家', pinyin: 'jiā', jyutping: 'gaa1', set: 1 },
      { char: '花', pinyin: 'huā', jyutping: 'faa1', set: 1 },
      { char: '霞', pinyin: 'xiá', jyutping: 'haa4', set: 1 },
      { char: '华', pinyin: 'huá', jyutping: 'waa4', set: 1 },
      { char: '沙', pinyin: 'shā', jyutping: 'saa1', set: 1 },
      { char: '茶', pinyin: 'chá', jyutping: 'caa4', set: 1 },
      { char: '加', pinyin: 'jiā', jyutping: 'gaa1', set: 1 },
      { char: '涯', pinyin: 'yá', jyutping: 'ngaai4', set: 1, showMandarinAudio: true },
      { char: '瓜', pinyin: 'guā', jyutping: 'gwaa1', set: 1 },
      { char: '斜', pinyin: 'xié', jyutping: 'ce4', set: 1 },
      { char: '鸦', pinyin: 'yā', jyutping: 'aa1', set: 1, showMandarinAudio: true },
      { char: '爬', pinyin: 'pá', jyutping: 'paa4', set: 2 },
      { char: '差', pinyin: 'chā', jyutping: 'caa1', set: 2 },
      { char: '巴', pinyin: 'bā', jyutping: 'baa1', set: 2 },
      { char: '纱', pinyin: 'shā', jyutping: 'saa1', set: 2 },
      { char: '牙', pinyin: 'yá', jyutping: 'ngaa4', set: 2 },
      { char: '夸', pinyin: 'kuā', jyutping: 'kwaa1', set: 2 },
      { char: '蛙', pinyin: 'wā', jyutping: 'waa1', set: 2 },
      { char: '葩', pinyin: 'pā', jyutping: 'paa1', set: 3 },
      { char: '嘉', pinyin: 'jiā', jyutping: 'gaa1', set: 3 },
      { char: '琶', pinyin: 'pá', jyutping: 'paa4', set: 3 },
      { char: '嗟', pinyin: 'jiē', jyutping: 'ze1', set: 3, showMandarinAudio: true },
      { char: '遐', pinyin: 'xiá', jyutping: 'haa4', set: 3, showMandarinAudio: true },
      { char: '笳', pinyin: 'jiā', jyutping: 'gaa1', set: 4, showMandarinAudio: true },
      { char: '衙', pinyin: 'yá', jyutping: 'ngaa4', set: 4, showMandarinAudio: true },
      { char: '葭', pinyin: 'jiā', jyutping: 'gaa1', set: 4, showMandarinAudio: true },
      { char: '袈', pinyin: 'jiā', jyutping: 'gaa1', set: 4, showMandarinAudio: true },
      { char: '查', pinyin: 'chá', jyutping: 'caa4', set: 4 },
      { char: '枷', pinyin: 'jiā', jyutping: 'gaa1', set: 4, showMandarinAudio: true },
      { char: '跏', pinyin: 'jiā', jyutping: 'gaa1', set: 4, showMandarinAudio: true },
    ],
    mnemonic:
      '麻、家、花、霞 — 张大嘴巴,最开放的 "-a" 音。一朵花开在农家。',
    anchorPoem: {
      author: '孟浩然',
      title: '过故人庄',
      text:
        '故人具鸡黍,邀我至田家。\n绿树村边合,青山郭外斜。\n' +
        '开轩面场圃,把酒话桑麻。\n待到重阳日,还来就菊花。',
      rhymingCharacters: [
        { char: '家', jyutping: 'gaa1', pinyin: 'jiā' },
        { char: '斜', jyutping: 'ce4', pinyin: 'xié' },
        { char: '麻', jyutping: 'maa4', pinyin: 'má' },
        { char: '花', jyutping: 'faa1', pinyin: 'huā' },
      ],
      gloss:
        '家·斜·麻·花 all rhyme in 六麻. A pastoral poem where the rhyme itself ' +
        'feels open and airy — the sound matches the subject.',
    },
  },

  {
    id: 'xiaping-05-ge',
    ordinal: 5,
    label: '五歌',
    rhymeCharacter: '歌',
    tone: 'ping',
    half: 'xiaping',
    tier: 1,
    family: 'o-family',
    confusables: [],
    modernRime: '-e / -o / -uo',
    seedCharacters: [
      { char: '歌', pinyin: 'gē', jyutping: 'go1', set: 1 },
      { char: '多', pinyin: 'duō', jyutping: 'do1', set: 1 },
      { char: '何', pinyin: 'hé', jyutping: 'ho4', set: 1 },
      { char: '河', pinyin: 'hé', jyutping: 'ho4', set: 1 },
      { char: '过', pinyin: 'guò', jyutping: 'gwo3', set: 1 },
      { char: '波', pinyin: 'bō', jyutping: 'bo1', set: 1 },
      { char: '罗', pinyin: 'luó', jyutping: 'lo4', set: 1, showMandarinAudio: true },
      { char: '柯', pinyin: 'kē', jyutping: 'o1', set: 1, showMandarinAudio: true },
      { char: '磨', pinyin: 'mó', jyutping: 'mo4', set: 1, showMandarinAudio: true },
      { char: '娥', pinyin: 'é', jyutping: 'ngo4', set: 1, showMandarinAudio: true },
      { char: '蛾', pinyin: 'é', jyutping: 'ngo4', set: 1, showMandarinAudio: true },
      { char: '哥', pinyin: 'gē', jyutping: 'go1', set: 1 },
      { char: '鹅', pinyin: 'é', jyutping: 'ngo4', set: 2 },
      { char: '坡', pinyin: 'pō', jyutping: 'po1', set: 2 },
      { char: '拖', pinyin: 'tuō', jyutping: 'to1', set: 2 },
      { char: '锅', pinyin: 'guō', jyutping: 'wo1', set: 2 },
      { char: '驼', pinyin: 'tuó', jyutping: 'to4', set: 2 },
      { char: '蓑', pinyin: 'suō', jyutping: 'so1', set: 2 },
      { char: '荷', pinyin: 'hé', jyutping: 'ho4', set: 2 },
      { char: '科', pinyin: 'kē', jyutping: 'fo1', set: 2 },
      { char: '搓', pinyin: 'cuō', jyutping: 'co1', set: 2 },
      { char: '娑', pinyin: 'suō', jyutping: 'so1', set: 3, showMandarinAudio: true },
      { char: '蹉', pinyin: 'cuō', jyutping: 'co1', set: 3, showMandarinAudio: true },
      { char: '峨', pinyin: 'é', jyutping: 'ngo4', set: 3, showMandarinAudio: true },
      { char: '讹', pinyin: 'é', jyutping: 'ngo4', set: 3, showMandarinAudio: true },
      { char: '庞', pinyin: 'páng', jyutping: 'pong4', set: 3 },
      { char: '驮', pinyin: 'tuó', jyutping: 'to4', set: 4, showMandarinAudio: true },
      { char: '坨', pinyin: 'tuó', jyutping: 'to4', set: 4, showMandarinAudio: true },
      { char: '酡', pinyin: 'tuó', jyutping: 'to4', set: 4, showMandarinAudio: true },
      { char: '傩', pinyin: 'nuó', jyutping: 'no4', set: 4, showMandarinAudio: true },
      { char: '疴', pinyin: 'kē', jyutping: 'o1', set: 4, showMandarinAudio: true },
      { char: '嵯', pinyin: 'cuó', jyutping: 'co4', set: 4, showMandarinAudio: true },
      { char: '矬', pinyin: 'cuó', jyutping: 'co4', set: 4, showMandarinAudio: true },
    ],
    mnemonic:
      '长歌当哭,几度欢歌。圆口的 "-o",低回悠长。歌、多、何、河 — 都在五歌。',
    anchorPoem: {
      author: '骆宾王',
      title: '咏鹅',
      text: '鹅,鹅,鹅,曲项向天歌。\n白毛浮绿水,红掌拨清波。',
      rhymingCharacters: [
        { char: '鹅', jyutping: 'ngo4', pinyin: 'é' },
        { char: '歌', jyutping: 'go1', pinyin: 'gē' },
        { char: '波', jyutping: 'bo1', pinyin: 'bō' },
      ],
      gloss:
        "Written by Luo Binwang at age 7 — the most famous 'first poem' in " +
        'Chinese education. 鹅·歌·波 are all 五歌. An ideal Tier-1 anchor ' +
        'because nearly every Chinese learner already knows the poem by heart.',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TIER 2 — The confusable families. Unlock after Tier 1 mastery.
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'shangping-02-dong2',
    ordinal: 2,
    label: '二冬',
    rhymeCharacter: '冬',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'ong-family',
    confusables: ['shangping-01-dong'],
    modernRime: '-ong',
    seedCharacters: ['冬', '农', '钟', '龙', '松', '峰', '封', '逢', '浓', '宗', '重', '从'],
    mnemonic:
      '冬夜寒钟响,与一东相似却不同。二冬多为 zh/ch/sh 声母开头的字。',
  },

  {
    id: 'shangping-04-zhi',
    ordinal: 4,
    label: '四支',
    rhymeCharacter: '支',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'i-family',
    confusables: ['shangping-05-wei', 'shangping-08-qi'],
    modernRime: '-i / -ei',
    seedCharacters: ['支', '枝', '时', '诗', '思', '知', '儿', '师', '旗', '悲', '眉', '追'],
    mnemonic: '四支最大、最杂 — 时、诗、思、知,写诗常用,务必熟记。',
  },

  {
    id: 'shangping-05-wei',
    ordinal: 5,
    label: '五微',
    rhymeCharacter: '微',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'i-family',
    confusables: ['shangping-04-zhi', 'shangping-08-qi'],
    modernRime: '-ei / -ui',
    seedCharacters: ['微', '飞', '归', '非', '衣', '依', '威', '晖', '扉', '违', '稀', '肥'],
    mnemonic: '细微之声,飞归故里。五微多含 -ei/-ui 收音,注意与四支区别。',
  },

  {
    id: 'shangping-06-yu',
    ordinal: 6,
    label: '六鱼',
    rhymeCharacter: '鱼',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'u-family',
    confusables: ['shangping-07-yu2'],
    modernRime: '-u / -ü',
    seedCharacters: ['鱼', '书', '居', '渠', '初', '除', '虚', '余', '徐', '疏', '舒', '如'],
    mnemonic: '鱼跃清渠,书卷堆居 — 六鱼多为 -ü 收音。',
  },

  {
    id: 'shangping-07-yu2',
    ordinal: 7,
    label: '七虞',
    rhymeCharacter: '虞',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'u-family',
    confusables: ['shangping-06-yu'],
    modernRime: '-u',
    seedCharacters: ['虞', '无', '夫', '孤', '图', '湖', '胡', '都', '枯', '呼', '扶', '壶'],
    mnemonic: '七虞多为 -u 正收音,比六鱼更 "圆" 一些。',
  },

  {
    id: 'shangping-08-qi',
    ordinal: 8,
    label: '八齐',
    rhymeCharacter: '齐',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'i-family',
    confusables: ['shangping-04-zhi', 'shangping-05-wei'],
    modernRime: '-i',
    seedCharacters: ['齐', '西', '啼', '堤', '低', '鸡', '溪', '稽', '畦', '泥', '迷', '梯'],
    mnemonic: '八齐收口最齐整 — 西、啼、堤、低,都是清脆的 -i。',
  },

  {
    id: 'shangping-09-jia',
    ordinal: 9,
    label: '九佳',
    rhymeCharacter: '佳',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'ai-family',
    confusables: ['shangping-10-hui'],
    modernRime: '-ai / -a',
    seedCharacters: ['佳', '街', '鞋', '钗', '牌', '斋', '柴', '排', '涯', '怀', '乖', '埋'],
    mnemonic: '九佳之字,多有 -ai 之韵。佳人街头,鞋履生花。',
  },

  {
    id: 'shangping-10-hui',
    ordinal: 10,
    label: '十灰',
    rhymeCharacter: '灰',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'ai-family',
    confusables: ['shangping-09-jia'],
    modernRime: '-ui / -ei / -ai',
    seedCharacters: ['灰', '回', '来', '催', '杯', '台', '梅', '哀', '哉', '苔', '培', '摧'],
    mnemonic:
      '十灰跨度最广 — 既含 -ui (回、催),又含 -ai (来、台)。' +
      '"少小离家老大回" 的 "回" 就在这里。',
    anchorPoem: {
      author: '贺知章',
      title: '回乡偶书',
      text: '少小离家老大回,乡音无改鬓毛衰。\n儿童相见不相识,笑问客从何处来。',
      rhymingCharacters: [
        { char: '回', jyutping: 'wui4', pinyin: 'huí' },
        { char: '衰', jyutping: 'seoi1', pinyin: 'shuāi' },
        { char: '来', jyutping: 'loi4', pinyin: 'lái' },
      ],
      gloss:
        '回·衰·来 all belong to 十灰 in 平水韵, despite sounding different in ' +
        'modern Mandarin. This is a perfect teaching moment: the category is ' +
        'defined by historical phonology, not current pronunciation.',
    },
  },

  {
    id: 'shangping-11-zhen',
    ordinal: 11,
    label: '十一真',
    rhymeCharacter: '真',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'en-family',
    confusables: ['shangping-12-wen', 'shangping-13-yuan'],
    modernRime: '-en / -in',
    seedCharacters: ['真', '人', '春', '尘', '身', '神', '邻', '新', '因', '亲', '陈', '贫'],
    mnemonic: '十一真 — 春风吹面,尘中见真人。-in/-en 收音。',
  },

  {
    id: 'shangping-12-wen',
    ordinal: 12,
    label: '十二文',
    rhymeCharacter: '文',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'en-family',
    confusables: ['shangping-11-zhen', 'shangping-13-yuan'],
    modernRime: '-en / -un',
    seedCharacters: ['文', '云', '君', '群', '闻', '纷', '芬', '分', '勤', '斤', '军', '殷'],
    mnemonic: '十二文多含 -un/-uen — 君、云、群、闻,温文尔雅。',
  },

  {
    id: 'shangping-13-yuan',
    ordinal: 13,
    label: '十三元',
    rhymeCharacter: '元',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'en-family',
    confusables: ['shangping-11-zhen', 'shangping-12-wen'],
    modernRime: '-en / -uan / -an (mixed)',
    seedCharacters: ['元', '原', '门', '痕', '魂', '温', '尊', '孙', '园', '言', '繁', '轩'],
    mnemonic:
      '十三元臭名昭著 — "出韵大户"。范围跨度极广,-en, -uan, -an 都有。' +
      '必须死记硬背,没有捷径。',
  },

  {
    id: 'shangping-14-han',
    ordinal: 14,
    label: '十四寒',
    rhymeCharacter: '寒',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'an-family',
    confusables: ['shangping-15-shan', 'xiaping-01-xian'],
    modernRime: '-an',
    seedCharacters: ['寒', '看', '安', '残', '欢', '官', '宽', '丹', '弹', '滩', '兰', '难'],
    mnemonic: '十四寒 — 寒风凛冽,天地苍茫。-an 开口。',
  },

  {
    id: 'shangping-15-shan',
    ordinal: 15,
    label: '十五删',
    rhymeCharacter: '删',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'an-family',
    confusables: ['shangping-14-han', 'xiaping-01-xian'],
    modernRime: '-an / -uan',
    seedCharacters: ['删', '山', '间', '关', '还', '颜', '斑', '蛮', '闲', '湾', '环', '攀'],
    mnemonic: '十五删 — "两岸猿声啼不住" 的 "间、还、山" 都在这里。',
    anchorPoem: {
      author: '李白',
      title: '早发白帝城',
      text: '朝辞白帝彩云间,千里江陵一日还。\n两岸猿声啼不住,轻舟已过万重山。',
      rhymingCharacters: [
        { char: '间', jyutping: 'gaan1', pinyin: 'jiān' },
        { char: '还', jyutping: 'waan4', pinyin: 'huán' },
        { char: '山', jyutping: 'saan1', pinyin: 'shān' },
      ],
      gloss: '间·还·山 all 十五删 — one of the cleanest Tier-2 teaching anchors.',
    },
  },

  {
    id: 'xiaping-01-xian',
    ordinal: 1,
    label: '一先',
    rhymeCharacter: '先',
    tone: 'ping',
    half: 'xiaping',
    tier: 2,
    family: 'an-family',
    confusables: ['shangping-14-han', 'shangping-15-shan'],
    modernRime: '-ian / -uan',
    seedCharacters: ['先', '天', '前', '年', '边', '眠', '烟', '千', '仙', '田', '连', '怜'],
    mnemonic:
      '一先含 -ian 细音 — 天、前、年、边。与寒、删同为 -an 家族,但音更细。',
  },

  {
    id: 'xiaping-02-xiao',
    ordinal: 2,
    label: '二萧',
    rhymeCharacter: '萧',
    tone: 'ping',
    half: 'xiaping',
    tier: 2,
    family: 'ao-family',
    confusables: ['xiaping-03-yao', 'xiaping-04-hao'],
    modernRime: '-iao',
    seedCharacters: ['萧', '朝', '桥', '消', '遥', '条', '摇', '娇', '骄', '烧', '飘', '潮'],
    mnemonic: '二萧细音 -iao — 朝来萧瑟,桥上遥望。',
  },

  {
    id: 'xiaping-03-yao',
    ordinal: 3,
    label: '三肴',
    rhymeCharacter: '肴',
    tone: 'ping',
    half: 'xiaping',
    tier: 2,
    family: 'ao-family',
    confusables: ['xiaping-02-xiao', 'xiaping-04-hao'],
    modernRime: '-ao',
    seedCharacters: ['肴', '交', '茅', '郊', '梢', '敲', '包', '抛', '抄', '巢', '稍', '嘲'],
    mnemonic: '三肴中洪音 -ao — 交、茅、郊、敲,比二萧更 "粗" 一些。',
  },

  {
    id: 'xiaping-04-hao',
    ordinal: 4,
    label: '四豪',
    rhymeCharacter: '豪',
    tone: 'ping',
    half: 'xiaping',
    tier: 2,
    family: 'ao-family',
    confusables: ['xiaping-02-xiao', 'xiaping-03-yao'],
    modernRime: '-ao',
    seedCharacters: ['豪', '高', '劳', '刀', '涛', '毫', '号', '袍', '嚎', '叨', '陶', '逃'],
    mnemonic: '四豪开口最大 -ao — 高、豪、涛、劳,气势豪迈。',
  },

  {
    id: 'xiaping-08-geng',
    ordinal: 8,
    label: '八庚',
    rhymeCharacter: '庚',
    tone: 'ping',
    half: 'xiaping',
    tier: 2,
    family: 'eng-ing-family',
    confusables: ['xiaping-09-qing', 'xiaping-10-zheng'],
    modernRime: '-eng / -ing',
    seedCharacters: ['庚', '行', '声', '情', '兵', '明', '平', '城', '更', '生', '京', '轻'],
    mnemonic:
      '八庚最大 — 声、情、兵、明。"国破山河在,城春草木深" — 其实 "深" 是十二侵,' +
      '但 "城" 是八庚。',
    anchorPoem: {
      author: '李白',
      title: '赠汪伦',
      text: '李白乘舟将欲行,忽闻岸上踏歌声。\n桃花潭水深千尺,不及汪伦送我情。',
      rhymingCharacters: [
        { char: '行', jyutping: 'hang4', pinyin: 'xíng' },
        { char: '声', jyutping: 'sing1', pinyin: 'shēng' },
        { char: '情', jyutping: 'cing4', pinyin: 'qíng' },
      ],
      gloss: '行·声·情 all 八庚. Simple, famous, unambiguous anchor.',
    },
  },

  {
    id: 'xiaping-09-qing',
    ordinal: 9,
    label: '九青',
    rhymeCharacter: '青',
    tone: 'ping',
    half: 'xiaping',
    tier: 2,
    family: 'eng-ing-family',
    confusables: ['xiaping-08-geng', 'xiaping-10-zheng'],
    modernRime: '-ing',
    seedCharacters: ['青', '星', '经', '听', '停', '亭', '庭', '灵', '冥', '瓶', '零', '萤'],
    mnemonic: '九青纯 -ing — 青山星辰,听经停亭。比八庚更清亮。',
  },

  {
    id: 'xiaping-10-zheng',
    ordinal: 10,
    label: '十蒸',
    rhymeCharacter: '蒸',
    tone: 'ping',
    half: 'xiaping',
    tier: 2,
    family: 'eng-ing-family',
    confusables: ['xiaping-08-geng', 'xiaping-09-qing'],
    modernRime: '-eng',
    seedCharacters: ['蒸', '冰', '登', '层', '僧', '腾', '承', '鹰', '膺', '惩', '增', '能'],
    mnemonic: '十蒸范围较窄 — 冰、登、层、僧。常被误入八庚。',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TIER 3 — Rare / endangered rhymes. Unlock after Tier 2.
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'shangping-03-jiang',
    ordinal: 3,
    label: '三江',
    rhymeCharacter: '江',
    tone: 'ping',
    half: 'shangping',
    tier: 3,
    family: 'ang-family',
    confusables: ['xiaping-07-yang'],
    modernRime: '-iang / -uang',
    seedCharacters: ['江', '窗', '双', '邦', '降', '缸', '撞', '幢', '扛', '腔', '淙', '庞'],
    mnemonic:
      '三江小而罕 — 江、窗、双、邦。常与七阳通押,但严格来说是独立一韵。',
  },

  {
    id: 'xiaping-12-qin',
    ordinal: 12,
    label: '十二侵',
    rhymeCharacter: '侵',
    tone: 'ping',
    half: 'xiaping',
    tier: 3,
    family: 'm-endings-family',
    confusables: ['xiaping-13-tan', 'xiaping-14-yan', 'xiaping-15-xian'],
    modernRime: '-in / -en (was -im)',
    seedCharacters: ['侵', '心', '金', '深', '音', '林', '阴', '寻', '沉', '琴', '今', '吟'],
    mnemonic:
      '十二侵古音收 -m (闭口音)。"国破山河在,城春草木深" 中的 "深·心·金·簪" ' +
      '现代同押 -n,古属同一韵部。',
    anchorPoem: {
      author: '杜甫',
      title: '春望',
      text:
        '国破山河在,城春草木深。\n感时花溅泪,恨别鸟惊心。\n' +
        '烽火连三月,家书抵万金。\n白头搔更短,浑欲不胜簪。',
      rhymingCharacters: [
        { char: '深', jyutping: 'sam1', pinyin: 'shēn' },
        { char: '心', jyutping: 'sam1', pinyin: 'xīn' },
        { char: '金', jyutping: 'gam1', pinyin: 'jīn' },
        { char: '簪', jyutping: 'zaam1', pinyin: 'zān' },
      ],
      gloss:
        '深·心·金·簪 all 十二侵 — originally all ending in -m. ' +
        'In modern Mandarin they now end in -n, merged into the -en/-in family.',
    },
  },

  {
    id: 'xiaping-13-tan',
    ordinal: 13,
    label: '十三覃',
    rhymeCharacter: '覃',
    tone: 'ping',
    half: 'xiaping',
    tier: 3,
    family: 'm-endings-family',
    confusables: ['xiaping-12-qin', 'xiaping-14-yan', 'xiaping-15-xian'],
    modernRime: '-an (was -am)',
    seedCharacters: ['覃', '南', '男', '谭', '潭', '参', '含', '耽', '贪', '探', '涵', '堪'],
    mnemonic: '十三覃古音 -am — 南、男、潭、参。现代汉语并入 -an。',
  },

  {
    id: 'xiaping-14-yan',
    ordinal: 14,
    label: '十四盐',
    rhymeCharacter: '盐',
    tone: 'ping',
    half: 'xiaping',
    tier: 3,
    family: 'm-endings-family',
    confusables: ['xiaping-12-qin', 'xiaping-13-tan', 'xiaping-15-xian'],
    modernRime: '-an / -ian (was -iam)',
    seedCharacters: ['盐', '檐', '廉', '帘', '嫌', '淹', '潜', '蟾', '添', '谦', '签', '纤'],
    mnemonic: '十四盐古音 -iam — 细口闭音。盐、檐、廉、帘。',
  },

  {
    id: 'xiaping-15-xian',
    ordinal: 15,
    label: '十五咸',
    rhymeCharacter: '咸',
    tone: 'ping',
    half: 'xiaping',
    tier: 3,
    family: 'm-endings-family',
    confusables: ['xiaping-12-qin', 'xiaping-13-tan', 'xiaping-14-yan'],
    modernRime: '-an / -ian (was -am/-iam)',
    seedCharacters: ['咸', '衔', '凡', '岩', '帆', '杉', '监', '缄', '馋', '谗', '嵌', '岚'],
    mnemonic: '十五咸最冷僻 — 咸、衔、岩、帆。古音 -am/-iam,常与十四盐通押。',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Rhymes at the specified tier. */
export const rhymesByTier = (tier: 1 | 2 | 3): Rhyme[] =>
  RHYMES_PINGSHENG.filter((r) => r.tier === tier);

/** Find a rhyme by its ID. */
export const rhymeById = (id: string): Rhyme | undefined =>
  RHYMES_PINGSHENG.find((r) => r.id === id);

/** Find the rhyme that contains a given character among its seed list.
 *  NOTE: For full character coverage, use the existing pingshui lookup;
 *  this helper only checks curriculum seed sets. */
export const findSeedRhyme = (character: string): Rhyme | undefined =>
  RHYMES_PINGSHENG.find((r) => r.seedCharacters.includes(character));

/** Count of rhymes in each tier — useful for progress dashboards. */
export const TIER_COUNTS = {
  1: rhymesByTier(1).length, // 5
  2: rhymesByTier(2).length, // 20
  3: rhymesByTier(3).length, // 5
} as const;
