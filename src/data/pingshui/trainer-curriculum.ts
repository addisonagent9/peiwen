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
    label: '一東',
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
      { char: '聪', pinyin: 'cōng', jyutping: 'cung1', set: 2 },
      { char: '工', pinyin: 'gōng', jyutping: 'gung1', set: 2 },
      { char: '公', pinyin: 'gōng', jyutping: 'gung1', set: 2 },
      { char: '充', pinyin: 'chōng', jyutping: 'cung1', set: 2 },
      { char: '鸿', pinyin: 'hóng', jyutping: 'hung4', set: 3, showMandarinAudio: true },
      { char: '葱', pinyin: 'cōng', jyutping: 'cung1', set: 3 },
      { char: '丛', pinyin: 'cóng', jyutping: 'cung4', set: 3 },
      { char: '穷', pinyin: 'qióng', jyutping: 'kung4', set: 3 },
      { char: '戎', pinyin: 'róng', jyutping: 'jung4', set: 3, showMandarinAudio: true },
      { char: '蓬', pinyin: 'péng', jyutping: 'pung4', set: 4, showMandarinAudio: true },
      { char: '蒙', pinyin: 'méng', jyutping: 'mung4', set: 4 },
      { char: '衷', pinyin: 'zhōng', jyutping: 'zung1', set: 4, showMandarinAudio: true },
      { char: '嵩', pinyin: 'sōng', jyutping: 'sung1', set: 4, showMandarinAudio: true },
      { char: '曈', pinyin: 'tóng', jyutping: 'tung4', set: 4, showMandarinAudio: true },
      { char: '瞳', pinyin: 'tóng', jyutping: 'tung4', set: 4, showMandarinAudio: true },
      { char: '桐', pinyin: 'tóng', jyutping: 'tung4', set: 4, showMandarinAudio: true },
      { char: '侗', pinyin: 'tóng', jyutping: 'tung4', set: 4, showMandarinAudio: true },
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
    label: '七陽',
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
      { char: '驮', pinyin: 'tuó', jyutping: 'to4', set: 4, showMandarinAudio: true },
      { char: '酡', pinyin: 'tuó', jyutping: 'to4', set: 4, showMandarinAudio: true },
      { char: '傩', pinyin: 'nuó', jyutping: 'no4', set: 4, showMandarinAudio: true },
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
    seedCharacters: [
      { char: '冬', pinyin: 'dōng', jyutping: 'dung1', set: 1, showMandarinAudio: true },
      { char: '钟', pinyin: 'zhōng', jyutping: 'zung1', set: 1, showMandarinAudio: true },
      { char: '松', pinyin: 'sōng', jyutping: 'cung4', set: 1, showMandarinAudio: true },
      { char: '峰', pinyin: 'fēng', jyutping: 'fung1', set: 1, showMandarinAudio: true },
      { char: '封', pinyin: 'fēng', jyutping: 'fung1', set: 1, showMandarinAudio: true },
      { char: '龙', pinyin: 'lóng', jyutping: 'lung4', set: 1, showMandarinAudio: true },
      { char: '容', pinyin: 'róng', jyutping: 'jung4', set: 1, showMandarinAudio: true },
      { char: '重', pinyin: 'chóng', jyutping: 'cung4', set: 1, showMandarinAudio: true },
      { char: '浓', pinyin: 'nóng', jyutping: 'nung4', set: 1, showMandarinAudio: true },
      { char: '从', pinyin: 'cóng', jyutping: 'cung4', set: 1, showMandarinAudio: true },
      { char: '农', pinyin: 'nóng', jyutping: 'nung4', set: 1, showMandarinAudio: true },
      { char: '宗', pinyin: 'zōng', jyutping: 'zung1', set: 1, showMandarinAudio: true },
      { char: '庸', pinyin: 'yōng', jyutping: 'jung4', set: 2, showMandarinAudio: true },
      { char: '凶', pinyin: 'xiōng', jyutping: 'hung1', set: 2, showMandarinAudio: true },
      { char: '胸', pinyin: 'xiōng', jyutping: 'hung1', set: 2, showMandarinAudio: true },
      { char: '蜂', pinyin: 'fēng', jyutping: 'fung1', set: 2, showMandarinAudio: true },
      { char: '锋', pinyin: 'fēng', jyutping: 'fung1', set: 2, showMandarinAudio: true },
      { char: '蓉', pinyin: 'róng', jyutping: 'jung4', set: 2, showMandarinAudio: true },
      { char: '锺', pinyin: 'zhōng', jyutping: 'zung1', set: 2, showMandarinAudio: true },
      { char: '鏞', pinyin: 'yōng', jyutping: 'jung4', set: 2, showMandarinAudio: true },
      { char: '蛩', pinyin: 'qióng', jyutping: 'kung4', set: 3, showMandarinAudio: true },
      { char: '邛', pinyin: 'qióng', jyutping: 'kung4', set: 3, showMandarinAudio: true },
      { char: '慵', pinyin: 'yōng', jyutping: 'jung4', set: 3, showMandarinAudio: true },
      { char: '舂', pinyin: 'chōng', jyutping: 'cung1', set: 3, showMandarinAudio: true },
      { char: '雍', pinyin: 'yōng', jyutping: 'jung1', set: 3, showMandarinAudio: true },
      { char: '痈', pinyin: 'yōng', jyutping: 'jung1', set: 3, showMandarinAudio: true },
      { char: '邕', pinyin: 'yōng', jyutping: 'jung1', set: 4, showMandarinAudio: true },
      { char: '纵', pinyin: 'zòng', jyutping: 'zung3', set: 4, showMandarinAudio: true },
      { char: '喁', pinyin: 'yóng', jyutping: 'jung4', set: 4, showMandarinAudio: true },
      { char: '跫', pinyin: 'qióng', jyutping: 'kung4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '王维',
      title: '过香积寺',
      text:
        '不知香积寺，数里入云峰。\n' +
        '古木无人径，深山何处钟。\n' +
        '泉声咽危石，日色冷青松。\n' +
        '薄暮空潭曲，安禅制毒龙。',
      rhymingCharacters: [
        { char: '峰', jyutping: 'fung1', pinyin: 'fēng' },
        { char: '钟', jyutping: 'zung1', pinyin: 'zhōng' },
        { char: '松', jyutping: 'cung4', pinyin: 'sōng' },
        { char: '龙', jyutping: 'lung4', pinyin: 'lóng' },
      ],
      gloss:
        "Wang Wei's 《过香积寺》 is a 五律 where 峰·钟·松·龙 all rhyme in 二冬. " +
        "These chars sound identical to 一東 in modern Mandarin but were " +
        "classified as a distinct rhyme by Tang poets — the defining " +
        "pedagogical challenge of the 一東/二冬 confusable pair.",
    },
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
    seedCharacters: [
      { char: '之', pinyin: 'zhī', jyutping: 'zi1', set: 1, showMandarinAudio: true },
      { char: '时', pinyin: 'shí', jyutping: 'si4', set: 1, showMandarinAudio: true },
      { char: '知', pinyin: 'zhī', jyutping: 'zi1', set: 1, showMandarinAudio: true },
      { char: '思', pinyin: 'sī', jyutping: 'si1', set: 1, showMandarinAudio: true },
      { char: '诗', pinyin: 'shī', jyutping: 'si1', set: 1, showMandarinAudio: true },
      { char: '期', pinyin: 'qī', jyutping: 'kei4', set: 1, showMandarinAudio: true },
      { char: '迟', pinyin: 'chí', jyutping: 'ci4', set: 1, showMandarinAudio: true },
      { char: '枝', pinyin: 'zhī', jyutping: 'zi1', set: 1, showMandarinAudio: true },
      { char: '师', pinyin: 'shī', jyutping: 'si1', set: 1, showMandarinAudio: true },
      { char: '姿', pinyin: 'zī', jyutping: 'zi1', set: 1, showMandarinAudio: true },
      { char: '离', pinyin: 'lí', jyutping: 'lei4', set: 1, showMandarinAudio: true },
      { char: '儿', pinyin: 'ér', jyutping: 'ji4', set: 1, showMandarinAudio: true },
      { char: '眉', pinyin: 'méi', jyutping: 'mei4', set: 2, showMandarinAudio: true },
      { char: '谁', pinyin: 'shéi', jyutping: 'seoi4', set: 2, showMandarinAudio: true },
      { char: '随', pinyin: 'suí', jyutping: 'ceoi4', set: 2, showMandarinAudio: true },
      { char: '持', pinyin: 'chí', jyutping: 'ci4', set: 2, showMandarinAudio: true },
      { char: '危', pinyin: 'wēi', jyutping: 'ngai4', set: 2, showMandarinAudio: true },
      { char: '宜', pinyin: 'yí', jyutping: 'ji4', set: 2, showMandarinAudio: true },
      { char: '辞', pinyin: 'cí', jyutping: 'ci4', set: 2, showMandarinAudio: true },
      { char: '词', pinyin: 'cí', jyutping: 'ci4', set: 2, showMandarinAudio: true },
      { char: '为', pinyin: 'wéi', jyutping: 'wai4', set: 3, showMandarinAudio: true },
      { char: '衰', pinyin: 'shuāi', jyutping: 'seoi1', set: 3, showMandarinAudio: true },
      { char: '骑', pinyin: 'qí', jyutping: 'ke4', set: 3, showMandarinAudio: true },
      { char: '治', pinyin: 'chí', jyutping: 'ci4', set: 3, showMandarinAudio: true },
      { char: '遗', pinyin: 'yí', jyutping: 'wai4', set: 3, showMandarinAudio: true },
      { char: '疑', pinyin: 'yí', jyutping: 'ji4', set: 3, showMandarinAudio: true },
      { char: '龟', pinyin: 'guī', jyutping: 'gwai1', set: 4, showMandarinAudio: true },
      { char: '漪', pinyin: 'yī', jyutping: 'ji1', set: 4, showMandarinAudio: true },
      { char: '嬉', pinyin: 'xī', jyutping: 'hei1', set: 4, showMandarinAudio: true },
      { char: '麋', pinyin: 'mí', jyutping: 'mei4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '李商隐',
      title: '夜雨寄北',
      text:
        '君问归期未有期，巴山夜雨涨秋池。\n' +
        '何当共剪西窗烛，却话巴山夜雨时。',
      rhymingCharacters: [
        { char: '期', jyutping: 'kei4', pinyin: 'qī' },
        { char: '池', jyutping: 'ci4', pinyin: 'chí' },
        { char: '时', jyutping: 'si4', pinyin: 'shí' },
      ],
      gloss:
        "Li Shangyin's 《夜雨寄北》 is a 七绝 where 期·池·时 all rhyme in " +
        "四支. All three are Set 1 high-frequency chars — among the most " +
        "commonly drilled in the chapter.",
    },
    mnemonic:
      '四支是平水韵中收字最多的韵部 — 时、诗、思、知,写诗常用。' +
      '许多常见字在此韵兼有平/去两读（为、骑、治、遗）。',
    teachingNote:
      '四支韻為 -i 系最寬之韻, 與五微、八齊為近鄰韻。' +
      '注意「衰」(shuāi) 平水韻單屬四支；賀知章《回鄉偶書》「鬢毛衰」與來/迴押韻為傳世名篇之出韵 (非異讀, 非文白異讀)。' +
      '「兒」字四支讀 ér (常見) / 八齊讀 ní (姓氏), 為 Type A 跨韻例。',
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
    seedCharacters: [
      { char: '微', pinyin: 'wēi', jyutping: 'mei4', set: 1, showMandarinAudio: true },
      { char: '归', pinyin: 'guī', jyutping: 'gwai1', set: 1, showMandarinAudio: true },
      { char: '飞', pinyin: 'fēi', jyutping: 'fei1', set: 1, showMandarinAudio: true },
      { char: '稀', pinyin: 'xī', jyutping: 'hei1', set: 1, showMandarinAudio: true },
      { char: '衣', pinyin: 'yī', jyutping: 'ji1', set: 1, showMandarinAudio: true },
      { char: '非', pinyin: 'fēi', jyutping: 'fei1', set: 1, showMandarinAudio: true },
      { char: '违', pinyin: 'wéi', jyutping: 'wai4', set: 1, showMandarinAudio: true },
      { char: '机', pinyin: 'jī', jyutping: 'gei1', set: 1, showMandarinAudio: true },
      { char: '晖', pinyin: 'huī', jyutping: 'fai1', set: 1, showMandarinAudio: true },
      { char: '依', pinyin: 'yī', jyutping: 'ji1', set: 1, showMandarinAudio: true },
      { char: '肥', pinyin: 'féi', jyutping: 'fei4', set: 1, showMandarinAudio: true },
      { char: '围', pinyin: 'wéi', jyutping: 'wai4', set: 1, showMandarinAudio: true },
      { char: '扉', pinyin: 'fēi', jyutping: 'fei1', set: 2, showMandarinAudio: true },
      { char: '辉', pinyin: 'huī', jyutping: 'fai1', set: 2, showMandarinAudio: true },
      { char: '威', pinyin: 'wēi', jyutping: 'wai1', set: 2, showMandarinAudio: true },
      { char: '挥', pinyin: 'huī', jyutping: 'fai1', set: 2, showMandarinAudio: true },
      { char: '妃', pinyin: 'fēi', jyutping: 'fei1', set: 2, showMandarinAudio: true },
      { char: '饥', pinyin: 'jī', jyutping: 'gei1', set: 2, showMandarinAudio: true },
      { char: '菲', pinyin: 'fēi', jyutping: 'fei1', set: 2, showMandarinAudio: true },
      { char: '薇', pinyin: 'wēi', jyutping: 'mei4', set: 2, showMandarinAudio: true },
      { char: '几', pinyin: 'jī', jyutping: 'gei2', set: 3, showMandarinAudio: true },
      { char: '霏', pinyin: 'fēi', jyutping: 'fei1', set: 3, showMandarinAudio: true },
      { char: '闱', pinyin: 'wéi', jyutping: 'wai4', set: 3, showMandarinAudio: true },
      { char: '绯', pinyin: 'fēi', jyutping: 'fei1', set: 3, showMandarinAudio: true },
      { char: '韦', pinyin: 'wéi', jyutping: 'wai5', set: 3, showMandarinAudio: true },
      { char: '巍', pinyin: 'wēi', jyutping: 'ngai4', set: 3, showMandarinAudio: true },
      { char: '騑', pinyin: 'fēi', jyutping: 'fei1', set: 4, showMandarinAudio: true },
      { char: '鞿', pinyin: 'jī', jyutping: 'gei1', set: 4, showMandarinAudio: true },
      { char: '翚', pinyin: 'huī', jyutping: 'fai1', set: 4, showMandarinAudio: true },
      { char: '沂', pinyin: 'yí', jyutping: 'ji4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '杜甫',
      title: '秋兴·其三',
      text: '千家山郭静朝晖，日日江楼坐翠微。\n信宿渔人还泛泛，清秋燕子故飞飞。\n匡衡抗疏功名薄，刘向传经心事违。\n同学少年多不贱，五陵衣马自轻肥。',
      rhymingCharacters: [
        { char: '晖', jyutping: 'fai1', pinyin: 'huī' },
        { char: '微', jyutping: 'mei4', pinyin: 'wēi' },
        { char: '飞', jyutping: 'fei1', pinyin: 'fēi' },
        { char: '违', jyutping: 'wai4', pinyin: 'wéi' },
        { char: '肥', jyutping: 'fei4', pinyin: 'féi' },
      ],
      gloss:
        "Du Fu's third poem in the Autumn Meditations sequence — the city of " +
        'Kuizhou at dawn, the river tower at dusk, fishermen drifting and swallows ' +
        "in flight: a quiet world that throws his political failures into relief.",
    },
    mnemonic:
      '千家山郭朝暉裡, 翠微遠樓燕飛飛 — 五微一韻, 主圍朝暉之輕微, ' +
      '衣帶當風, 機心暫息, 是杜甫秋日的疏淡心境。',
    teachingNote:
      '五微韻屬 -i 系, 與四支、八齊為近鄰韻, 唐人偶有借韻於此三韻之間。' +
      '本韻字多含 -ei / -ui 餘音 (如「歸」「微」), 與四支「兒、儀」之 -i 餘音可資辨別。',
  },

  {
    id: 'shangping-06-yu',
    ordinal: 6,
    label: '六魚',
    rhymeCharacter: '鱼',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'u-family',
    confusables: ['shangping-07-yu2'],
    modernRime: '-ü / -u',
    seedCharacters: [
      { char: '书', pinyin: 'shū', jyutping: 'syu1', set: 1, showMandarinAudio: true },
      { char: '如', pinyin: 'rú', jyutping: 'jyu4', set: 1, showMandarinAudio: true },
      { char: '居', pinyin: 'jū', jyutping: 'geoi1', set: 1, showMandarinAudio: true },
      { char: '鱼', pinyin: 'yú', jyutping: 'jyu4', set: 1, showMandarinAudio: true },
      { char: '余', pinyin: 'yú', jyutping: 'jyu4', set: 1, showMandarinAudio: true },
      { char: '渠', pinyin: 'qú', jyutping: 'keoi4', set: 1, showMandarinAudio: true },
      { char: '虚', pinyin: 'xū', jyutping: 'heoi1', set: 1, showMandarinAudio: true },
      { char: '初', pinyin: 'chū', jyutping: 'co1', set: 1, showMandarinAudio: true },
      { char: '疏', pinyin: 'shū', jyutping: 'so1', set: 1, showMandarinAudio: true },
      { char: '庐', pinyin: 'lú', jyutping: 'lou4', set: 1, showMandarinAudio: true },
      { char: '除', pinyin: 'chú', jyutping: 'ceoi4', set: 1, showMandarinAudio: true },
      { char: '舒', pinyin: 'shū', jyutping: 'syu1', set: 1, showMandarinAudio: true },
      { char: '闾', pinyin: 'lǘ', jyutping: 'leoi4', set: 2, showMandarinAudio: true },
      { char: '蔬', pinyin: 'shū', jyutping: 'so1', set: 2, showMandarinAudio: true },
      { char: '蕖', pinyin: 'qú', jyutping: 'keoi4', set: 2, showMandarinAudio: true },
      { char: '储', pinyin: 'chǔ', jyutping: 'cyu5', set: 2, showMandarinAudio: true },
      { char: '徐', pinyin: 'xú', jyutping: 'ceoi4', set: 2, showMandarinAudio: true },
      { char: '滁', pinyin: 'chú', jyutping: 'ceoi4', set: 2, showMandarinAudio: true },
      { char: '嘘', pinyin: 'xū', jyutping: 'heoi1', set: 2, showMandarinAudio: true },
      { char: '墟', pinyin: 'xū', jyutping: 'heoi1', set: 2, showMandarinAudio: true },
      { char: '锄', pinyin: 'chú', jyutping: 'co4', set: 3, showMandarinAudio: true },
      { char: '馀', pinyin: 'yú', jyutping: 'jyu4', set: 3, showMandarinAudio: true },
      { char: '妤', pinyin: 'yú', jyutping: 'jyu4', set: 3, showMandarinAudio: true },
      { char: '苴', pinyin: 'jū', jyutping: 'zeoi1', set: 3, showMandarinAudio: true },
      { char: '沮', pinyin: 'jǔ', jyutping: 'zeoi2', set: 3, showMandarinAudio: true },
      { char: '蘧', pinyin: 'qú', jyutping: 'keoi4', set: 3, showMandarinAudio: true },
      { char: '疽', pinyin: 'jū', jyutping: 'zeoi1', set: 4, showMandarinAudio: true },
      { char: '樗', pinyin: 'chū', jyutping: 'cyu1', set: 4, showMandarinAudio: true },
      { char: '龉', pinyin: 'yǔ', jyutping: 'jyu5', set: 4, showMandarinAudio: true },
      { char: '茹', pinyin: 'rú', jyutping: 'jyu4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '自作',
      title: '闲居',
      text: '闲居陋室漫翻书，窗外青山似旧如。\n不问红尘多少事，一壶清茗伴云居。',
      rhymingCharacters: [
        { char: '书', jyutping: 'syu1', pinyin: 'shū' },
        { char: '如', jyutping: 'jyu4', pinyin: 'rú' },
        { char: '居', jyutping: 'geoi1', pinyin: 'jū' },
      ],
      gloss:
        "A quiet life in a humble room: turning pages, the same green mountain " +
        "through the window, a pot of clear tea — and the world's affairs left unasked.",
    },
    mnemonic:
      '陋室清茗讀書居, 青山雲外似舊如 — 六魚一韻, 主 -ü 之深圓, 隱士書齋之韻。',
    teachingNote:
      '六魚與七虞同屬 -u 系近鄰韻, 唐人偶有借韻通押。' +
      '注意「魚」「苴」二字兼屬六魚、七虞 (Type A 跨韻)。',
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
    seedCharacters: [
      { char: '珠', pinyin: 'zhū', jyutping: 'zyu1', set: 1, showMandarinAudio: true },
      { char: '腴', pinyin: 'yú', jyutping: 'jyu4', set: 1, showMandarinAudio: true },
      { char: '虞', pinyin: 'yú', jyutping: 'jyu4', set: 1, showMandarinAudio: true },
      { char: '乎', pinyin: 'hū', jyutping: 'fu4', set: 1, showMandarinAudio: true },
      { char: '无', pinyin: 'wú', jyutping: 'mou4', set: 1, showMandarinAudio: true },
      { char: '朱', pinyin: 'zhū', jyutping: 'zyu1', set: 1, showMandarinAudio: true },
      { char: '须', pinyin: 'xū', jyutping: 'seoi1', set: 1, showMandarinAudio: true },
      { char: '殊', pinyin: 'shū', jyutping: 'syu4', set: 1, showMandarinAudio: true },
      { char: '儒', pinyin: 'rú', jyutping: 'jyu4', set: 1, showMandarinAudio: true },
      { char: '隅', pinyin: 'yú', jyutping: 'jyu4', set: 1, showMandarinAudio: true },
      { char: '趋', pinyin: 'qū', jyutping: 'ceoi1', set: 1, showMandarinAudio: true },
      { char: '夫', pinyin: 'fū', jyutping: 'fu1', set: 1, showMandarinAudio: true },
      { char: '孤', pinyin: 'gū', jyutping: 'gu1', set: 2, showMandarinAudio: true },
      { char: '都', pinyin: 'dū', jyutping: 'dou1', set: 2, showMandarinAudio: true },
      { char: '图', pinyin: 'tú', jyutping: 'tou4', set: 2, showMandarinAudio: true },
      { char: '徒', pinyin: 'tú', jyutping: 'tou4', set: 2, showMandarinAudio: true },
      { char: '模', pinyin: 'mó', jyutping: 'mou4', set: 2, showMandarinAudio: true },
      { char: '湖', pinyin: 'hú', jyutping: 'wu4', set: 2, showMandarinAudio: true },
      { char: '胡', pinyin: 'hú', jyutping: 'wu4', set: 2, showMandarinAudio: true },
      { char: '吴', pinyin: 'wú', jyutping: 'ng4', set: 2, showMandarinAudio: true },
      { char: '苏', pinyin: 'sū', jyutping: 'sou1', set: 3, showMandarinAudio: true },
      { char: '卢', pinyin: 'lú', jyutping: 'lou4', set: 3, showMandarinAudio: true },
      { char: '雏', pinyin: 'chú', jyutping: 'co4', set: 3, showMandarinAudio: true },
      { char: '株', pinyin: 'zhū', jyutping: 'zyu1', set: 3, showMandarinAudio: true },
      { char: '蛛', pinyin: 'zhū', jyutping: 'zyu1', set: 3, showMandarinAudio: true },
      { char: '谀', pinyin: 'yú', jyutping: 'jyu4', set: 3, showMandarinAudio: true },
      { char: '铢', pinyin: 'zhū', jyutping: 'zyu1', set: 4, showMandarinAudio: true },
      { char: '衢', pinyin: 'qú', jyutping: 'keoi4', set: 4, showMandarinAudio: true },
      { char: '瑜', pinyin: 'yú', jyutping: 'jyu4', set: 4, showMandarinAudio: true },
      { char: '臾', pinyin: 'yú', jyutping: 'jyu4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '静品茶香',
      title: '欢声九月师生笑',
      text: '欢声九月师生笑，三尺枝头满玉珠。\n千古情深谁与透，杏坛夜雨最珍腴。',
      rhymingCharacters: [
        { char: '珠', jyutping: 'zyu1', pinyin: 'zhū' },
        { char: '腴', jyutping: 'jyu4', pinyin: 'yú' },
      ],
      gloss:
        'September: teachers and students laugh, branches hang heavy with jade-like ' +
        'fruit. Through millennia of devotion, an Apricot Forum night-rain stays ' +
        'the richest of all.',
    },
    mnemonic:
      '九月師生笑語, 杏壇夜雨珍腴 — 七虞一韻, 主 -u 之圓厚, 與六魚同氣連枝。',
    teachingNote:
      '七虞與六魚為 -u 系近鄰韻。「鱼」「苴」字兼屬兩韻 (Type A 跨韻), ' +
      '唐人借韻較多, 但嚴格平水韻不可混押。',
  },

  {
    id: 'shangping-08-qi',
    ordinal: 8,
    label: '八齊',
    rhymeCharacter: '齐',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'i-family',
    confusables: ['shangping-04-zhi', 'shangping-05-wei'],
    modernRime: '-i / -ei',
    seedCharacters: [
      { char: '萋', pinyin: 'qī', jyutping: 'cai1', set: 1, showMandarinAudio: true },
      { char: '西', pinyin: 'xī', jyutping: 'sai1', set: 1, showMandarinAudio: true },
      { char: '啼', pinyin: 'tí', jyutping: 'tai4', set: 1, showMandarinAudio: true },
      { char: '泥', pinyin: 'ní', jyutping: 'nai4', set: 1, showMandarinAudio: true },
      { char: '题', pinyin: 'tí', jyutping: 'tai4', set: 1, showMandarinAudio: true },
      { char: '嘶', pinyin: 'sī', jyutping: 'si1', set: 1, showMandarinAudio: true },
      { char: '低', pinyin: 'dī', jyutping: 'dai1', set: 1, showMandarinAudio: true },
      { char: '迷', pinyin: 'mí', jyutping: 'mai4', set: 1, showMandarinAudio: true },
      { char: '溪', pinyin: 'xī', jyutping: 'kai1', set: 1, showMandarinAudio: true },
      { char: '齐', pinyin: 'qí', jyutping: 'cai4', set: 1, showMandarinAudio: true },
      { char: '栖', pinyin: 'qī', jyutping: 'cai1', set: 1, showMandarinAudio: true },
      { char: '鸡', pinyin: 'jī', jyutping: 'gai1', set: 1, showMandarinAudio: true },
      { char: '梨', pinyin: 'lí', jyutping: 'lei4', set: 2, showMandarinAudio: true },
      { char: '兮', pinyin: 'xī', jyutping: 'hai4', set: 2, showMandarinAudio: true },
      { char: '携', pinyin: 'xié', jyutping: 'kwai4', set: 2, showMandarinAudio: true },
      { char: '堤', pinyin: 'dī', jyutping: 'tai4', set: 2, showMandarinAudio: true },
      { char: '蹄', pinyin: 'tí', jyutping: 'tai4', set: 2, showMandarinAudio: true },
      { char: '梯', pinyin: 'tī', jyutping: 'tai1', set: 2, showMandarinAudio: true },
      { char: '妻', pinyin: 'qī', jyutping: 'cai1', set: 2, showMandarinAudio: true },
      { char: '黎', pinyin: 'lí', jyutping: 'lai4', set: 2, showMandarinAudio: true },
      { char: '凄', pinyin: 'qī', jyutping: 'cai1', set: 3, showMandarinAudio: true },
      { char: '儿', pinyin: 'ní', jyutping: 'ngai4', set: 3, showMandarinAudio: true },
      { char: '提', pinyin: 'tí', jyutping: 'tai4', set: 3, showMandarinAudio: true },
      { char: '鼙', pinyin: 'pí', jyutping: 'pai4', set: 3, showMandarinAudio: true },
      { char: '圭', pinyin: 'guī', jyutping: 'gwai1', set: 3, showMandarinAudio: true },
      { char: '跻', pinyin: 'jī', jyutping: 'zai1', set: 3, showMandarinAudio: true },
      { char: '鞮', pinyin: 'dī', jyutping: 'dai1', set: 4, showMandarinAudio: true },
      { char: '嵇', pinyin: 'jī', jyutping: 'kai1', set: 4, showMandarinAudio: true },
      { char: '醯', pinyin: 'xī', jyutping: 'hai1', set: 4, showMandarinAudio: true },
      { char: '黧', pinyin: 'lí', jyutping: 'lai4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '李华',
      title: '春行即兴',
      text: '宜阳城下草萋萋，涧水东流复向西。\n芳树无人花自落，春山一路鸟空啼。',
      rhymingCharacters: [
        { char: '萋', jyutping: 'cai1', pinyin: 'qī' },
        { char: '西', jyutping: 'sai1', pinyin: 'xī' },
        { char: '啼', jyutping: 'tai4', pinyin: 'tí' },
      ],
      gloss:
        'Li Hua walks through Yiyang after the An Lushan rebellion. The grass is ' +
        'thick, the streams flow east and west, but no one is left to see the ' +
        "flowers fall — a quiet portrait of war's emptiness.",
    },
    mnemonic:
      '宜陽萋萋, 澗水東西 — 八齊一韻, 收於 -i 而帶喉間清氣, ' +
      '別於四支之鬆、五微之渺, 自有清切之質。',
    teachingNote:
      '八齊韻為 -i 系收音最清切者。注意「兒」字: 四支讀 ér (常見), ' +
      '八齊讀 ní (姓氏); 同字異韻不同讀, 為 Type A 跨韻例。',
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
    confusables: ['shangping-10-hui', 'xiaping-06-ma'],
    modernRime: '-ai / -ia',
    seedCharacters: [
      { char: '街', pinyin: 'jiē', jyutping: 'gaai1', set: 1, showMandarinAudio: true },
      { char: '偕', pinyin: 'xié', jyutping: 'gaai1', set: 1, showMandarinAudio: true },
      { char: '怀', pinyin: 'huái', jyutping: 'waai4', set: 1, showMandarinAudio: true },
      { char: '佳', pinyin: 'jiā', jyutping: 'gaai1', set: 1, showMandarinAudio: true },
      { char: '斋', pinyin: 'zhāi', jyutping: 'zaai1', set: 1, showMandarinAudio: true },
      { char: '阶', pinyin: 'jiē', jyutping: 'gaai1', set: 1, showMandarinAudio: true },
      { char: '谐', pinyin: 'xié', jyutping: 'haai4', set: 1, showMandarinAudio: true },
      { char: '乖', pinyin: 'guāi', jyutping: 'gwaai1', set: 1, showMandarinAudio: true },
      { char: '崖', pinyin: 'yá', jyutping: 'ngaai4', set: 1, showMandarinAudio: true },
      { char: '排', pinyin: 'pái', jyutping: 'paai4', set: 1, showMandarinAudio: true },
      { char: '埋', pinyin: 'mái', jyutping: 'maai4', set: 1, showMandarinAudio: true },
      { char: '鞋', pinyin: 'xié', jyutping: 'haai4', set: 1, showMandarinAudio: true },
      { char: '涯', pinyin: 'yá', jyutping: 'ngaai4', set: 2, showMandarinAudio: true },
      { char: '钗', pinyin: 'chāi', jyutping: 'caai1', set: 2, showMandarinAudio: true },
      { char: '牌', pinyin: 'pái', jyutping: 'paai4', set: 2, showMandarinAudio: true },
      { char: '槐', pinyin: 'huái', jyutping: 'waai4', set: 2, showMandarinAudio: true },
      { char: '揩', pinyin: 'kāi', jyutping: 'kaai1', set: 2, showMandarinAudio: true },
      { char: '豺', pinyin: 'chái', jyutping: 'caai4', set: 2, showMandarinAudio: true },
      { char: '骸', pinyin: 'hái', jyutping: 'haai4', set: 2, showMandarinAudio: true },
      { char: '淮', pinyin: 'huái', jyutping: 'waai4', set: 2, showMandarinAudio: true },
      { char: '皆', pinyin: 'jiē', jyutping: 'gaai1', set: 3, showMandarinAudio: true },
      { char: '喈', pinyin: 'jiē', jyutping: 'gaai1', set: 3, showMandarinAudio: true },
      { char: '俳', pinyin: 'pái', jyutping: 'paai4', set: 3, showMandarinAudio: true },
      { char: '楷', pinyin: 'kǎi', jyutping: 'kaai2', set: 3, showMandarinAudio: true },
      { char: '挨', pinyin: 'āi', jyutping: 'aai1', set: 3, showMandarinAudio: true },
      { char: '筛', pinyin: 'shāi', jyutping: 'sai1', set: 3, showMandarinAudio: true },
      { char: '秸', pinyin: 'jiē', jyutping: 'gaai1', set: 4, showMandarinAudio: true },
      { char: '睚', pinyin: 'yá', jyutping: 'ngaai4', set: 4, showMandarinAudio: true },
      { char: '霾', pinyin: 'mái', jyutping: 'maai4', set: 4, showMandarinAudio: true },
      { char: '啀', pinyin: 'ái', jyutping: 'ngaai4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '云隐秋山',
      title: '紫藤花',
      text: '馨花送爽缀香街，万缕情丝绕树偕。\n二月春声飞雨露，紫藤欢笑喜同怀。',
      rhymingCharacters: [
        { char: '街', jyutping: 'gaai1', pinyin: 'jiē' },
        { char: '偕', jyutping: 'gaai1', pinyin: 'xié' },
        { char: '怀', jyutping: 'waai4', pinyin: 'huái' },
      ],
      gloss:
        'Fragrant blossoms scent the street, threads of feeling wreath the trees. ' +
        'February rains arrive on the wind, and the wisteria laughs with all who pass.',
    },
    mnemonic:
      '馨花綴街, 紫藤同懷 — 九佳一韻, 主 -ai 之開朗, 春日紫藤之韻。',
    teachingNote:
      '九佳與十灰同屬 -ai 系近鄰韻, 唐人偶有借韻。' +
      '「涯」字三跨韻 (四支、六麻、九佳, Type A); ' +
      '「楷」字九佳、九蟹平上跨聲, 為 Type B 平仄之例。',
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
    modernRime: '-ai / -ui',
    seedCharacters: [
      { char: '开', pinyin: 'kāi', jyutping: 'hoi1', set: 1, showMandarinAudio: true },
      { char: '来', pinyin: 'lái', jyutping: 'loi4', set: 1, showMandarinAudio: true },
      { char: '裁', pinyin: 'cái', jyutping: 'coi4', set: 1, showMandarinAudio: true },
      { char: '回', pinyin: 'huí', jyutping: 'wui4', set: 1, showMandarinAudio: true },
      { char: '杯', pinyin: 'bēi', jyutping: 'bui1', set: 1, showMandarinAudio: true },
      { char: '梅', pinyin: 'méi', jyutping: 'mui4', set: 1, showMandarinAudio: true },
      { char: '雷', pinyin: 'léi', jyutping: 'leoi4', set: 1, showMandarinAudio: true },
      { char: '灰', pinyin: 'huī', jyutping: 'fui1', set: 1, showMandarinAudio: true },
      { char: '堆', pinyin: 'duī', jyutping: 'deoi1', set: 1, showMandarinAudio: true },
      { char: '摧', pinyin: 'cuī', jyutping: 'ceoi1', set: 1, showMandarinAudio: true },
      { char: '才', pinyin: 'cái', jyutping: 'coi4', set: 1, showMandarinAudio: true },
      { char: '哀', pinyin: 'āi', jyutping: 'oi1', set: 1, showMandarinAudio: true },
      { char: '苔', pinyin: 'tái', jyutping: 'toi4', set: 2, showMandarinAudio: true },
      { char: '哉', pinyin: 'zāi', jyutping: 'zoi1', set: 2, showMandarinAudio: true },
      { char: '埃', pinyin: 'āi', jyutping: 'oi1', set: 2, showMandarinAudio: true },
      { char: '莱', pinyin: 'lái', jyutping: 'loi4', set: 2, showMandarinAudio: true },
      { char: '猜', pinyin: 'cāi', jyutping: 'caai1', set: 2, showMandarinAudio: true },
      { char: '材', pinyin: 'cái', jyutping: 'coi4', set: 2, showMandarinAudio: true },
      { char: '栽', pinyin: 'zāi', jyutping: 'zoi1', set: 2, showMandarinAudio: true },
      { char: '灾', pinyin: 'zāi', jyutping: 'zoi1', set: 2, showMandarinAudio: true },
      { char: '胎', pinyin: 'tāi', jyutping: 'toi1', set: 3, showMandarinAudio: true },
      { char: '孩', pinyin: 'hái', jyutping: 'haai4', set: 3, showMandarinAudio: true },
      { char: '隈', pinyin: 'wēi', jyutping: 'wui1', set: 3, showMandarinAudio: true },
      { char: '徊', pinyin: 'huái', jyutping: 'wui4', set: 3, showMandarinAudio: true },
      { char: '裴', pinyin: 'péi', jyutping: 'pui4', set: 3, showMandarinAudio: true },
      { char: '槐', pinyin: 'huái', jyutping: 'waai4', set: 3, showMandarinAudio: true },
      { char: '嵬', pinyin: 'wéi', jyutping: 'ngai4', set: 4, showMandarinAudio: true },
      { char: '颓', pinyin: 'tuí', jyutping: 'teoi4', set: 4, showMandarinAudio: true },
      { char: '媒', pinyin: 'méi', jyutping: 'mui4', set: 4, showMandarinAudio: true },
      { char: '罍', pinyin: 'léi', jyutping: 'leoi4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '刚',
      title: '槐花开',
      text: '芳菲四月万花开，绿柳轻盈紫燕来。\n串串槐香蜂蝶吻，春风醉美水山裁。',
      rhymingCharacters: [
        { char: '开', jyutping: 'hoi1', pinyin: 'kāi' },
        { char: '来', jyutping: 'loi4', pinyin: 'lái' },
        { char: '裁', jyutping: 'coi4', pinyin: 'cái' },
      ],
      gloss:
        'Fourth month: flowers everywhere, willows fresh, swallows back. Acacia ' +
        'clusters draw bees and butterflies, and the spring wind cuts mountain ' +
        'and water into beauty.',
    },
    mnemonic:
      '槐香四月, 燕來水裁 — 十灰一韻, 主 -ai 之低回, 春深之韻。',
    teachingNote:
      '十灰與九佳同屬 -ai 系近鄰韻。「槐」字兼屬九佳、十灰, 為 Type A 跨韻。' +
      '注意「衰」字常被誤認為十灰平聲: 實則「衰」單屬四支, ' +
      '賀知章《回鄉偶書》「鬢毛衰」與來/迴押韻為出韵 (非異讀)。',
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
    seedCharacters: [
      { char: '银', pinyin: 'yín', jyutping: 'ngan4', set: 1, showMandarinAudio: true },
      { char: '呻', pinyin: 'shēn', jyutping: 'san1', set: 1, showMandarinAudio: true },
      { char: '沦', pinyin: 'lún', jyutping: 'leon4', set: 1, showMandarinAudio: true },
      { char: '真', pinyin: 'zhēn', jyutping: 'zan1', set: 1, showMandarinAudio: true },
      { char: '人', pinyin: 'rén', jyutping: 'jan4', set: 1, showMandarinAudio: true },
      { char: '春', pinyin: 'chūn', jyutping: 'ceon1', set: 1, showMandarinAudio: true },
      { char: '新', pinyin: 'xīn', jyutping: 'san1', set: 1, showMandarinAudio: true },
      { char: '尘', pinyin: 'chén', jyutping: 'can4', set: 1, showMandarinAudio: true },
      { char: '身', pinyin: 'shēn', jyutping: 'san1', set: 1, showMandarinAudio: true },
      { char: '神', pinyin: 'shén', jyutping: 'san4', set: 1, showMandarinAudio: true },
      { char: '亲', pinyin: 'qīn', jyutping: 'can1', set: 1, showMandarinAudio: true },
      { char: '邻', pinyin: 'lín', jyutping: 'leon4', set: 1, showMandarinAudio: true },
      { char: '臣', pinyin: 'chén', jyutping: 'san4', set: 2, showMandarinAudio: true },
      { char: '民', pinyin: 'mín', jyutping: 'man4', set: 2, showMandarinAudio: true },
      { char: '巾', pinyin: 'jīn', jyutping: 'gan1', set: 2, showMandarinAudio: true },
      { char: '因', pinyin: 'yīn', jyutping: 'jan1', set: 2, showMandarinAudio: true },
      { char: '辛', pinyin: 'xīn', jyutping: 'san1', set: 2, showMandarinAudio: true },
      { char: '仁', pinyin: 'rén', jyutping: 'jan4', set: 2, showMandarinAudio: true },
      { char: '滨', pinyin: 'bīn', jyutping: 'ban1', set: 2, showMandarinAudio: true },
      { char: '陈', pinyin: 'chén', jyutping: 'can4', set: 2, showMandarinAudio: true },
      { char: '论', pinyin: 'lún', jyutping: 'leon4', set: 3, showMandarinAudio: true },
      { char: '振', pinyin: 'zhēn', jyutping: 'zan3', set: 3, showMandarinAudio: true },
      { char: '频', pinyin: 'pín', jyutping: 'pan4', set: 3, showMandarinAudio: true },
      { char: '津', pinyin: 'jīn', jyutping: 'zeon1', set: 3, showMandarinAudio: true },
      { char: '巡', pinyin: 'xún', jyutping: 'ceon4', set: 3, showMandarinAudio: true },
      { char: '伸', pinyin: 'shēn', jyutping: 'san1', set: 3, showMandarinAudio: true },
      { char: '嗔', pinyin: 'chēn', jyutping: 'can1', set: 4, showMandarinAudio: true },
      { char: '蘋', pinyin: 'pín', jyutping: 'pan4', set: 4, showMandarinAudio: true },
      { char: '闽', pinyin: 'mǐn', jyutping: 'man5', set: 4, showMandarinAudio: true },
      { char: '秦', pinyin: 'qín', jyutping: 'ceon4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '静品茶香',
      title: '七绝·灵犀不点爱沉沦',
      text: '枝头月出满身银，魂梦痴萦墨色呻。\n晓岸风情扶碧水，灵犀不点爱沉沦。',
      rhymingCharacters: [
        { char: '银', jyutping: 'ngan4', pinyin: 'yín' },
        { char: '呻', jyutping: 'san1', pinyin: 'shēn' },
        { char: '沦', jyutping: 'leon4', pinyin: 'lún' },
      ],
      gloss:
        'Moon over the branches, the body silver. Dreams cling, ink-dark and aching. ' +
        'At dawn the wind unfurls jade water — but the secret heart never quickens, ' +
        'and love sinks down.',
    },
    mnemonic:
      '枝頭月銀, 沉淪痴魂 — 十一真一韻, 主 -en/-in 之清亮, 銀月之韻。',
    teachingNote:
      '十一真為 -en/-un 系出韵大戶之首, 與十二文、十三元極易混淆。' +
      '注意「信」「菌」「龜」「遴」屬仄聲 (去十二震 / 上十一轸 / 平四支), 不入十一真平聲。' +
      '「論」字兼屬十一真、十三元 (Type A 跨韻)。',
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
    seedCharacters: [
      { char: '闻', pinyin: 'wén', jyutping: 'man4', set: 1, showMandarinAudio: true },
      { char: '分', pinyin: 'fēn', jyutping: 'fan1', set: 1, showMandarinAudio: true },
      { char: '熏', pinyin: 'xūn', jyutping: 'fan1', set: 1, showMandarinAudio: true },
      { char: '云', pinyin: 'yún', jyutping: 'wan4', set: 1, showMandarinAudio: true },
      { char: '纹', pinyin: 'wén', jyutping: 'man4', set: 1, showMandarinAudio: true },
      { char: '文', pinyin: 'wén', jyutping: 'man4', set: 1, showMandarinAudio: true },
      { char: '君', pinyin: 'jūn', jyutping: 'gwan1', set: 1, showMandarinAudio: true },
      { char: '群', pinyin: 'qún', jyutping: 'kwan4', set: 1, showMandarinAudio: true },
      { char: '军', pinyin: 'jūn', jyutping: 'gwan1', set: 1, showMandarinAudio: true },
      { char: '勤', pinyin: 'qín', jyutping: 'kan4', set: 1, showMandarinAudio: true },
      { char: '纷', pinyin: 'fēn', jyutping: 'fan1', set: 1, showMandarinAudio: true },
      { char: '勋', pinyin: 'xūn', jyutping: 'fan1', set: 1, showMandarinAudio: true },
      { char: '氛', pinyin: 'fēn', jyutping: 'fan1', set: 2, showMandarinAudio: true },
      { char: '芬', pinyin: 'fēn', jyutping: 'fan1', set: 2, showMandarinAudio: true },
      { char: '坟', pinyin: 'fén', jyutping: 'fan4', set: 2, showMandarinAudio: true },
      { char: '裙', pinyin: 'qún', jyutping: 'kwan4', set: 2, showMandarinAudio: true },
      { char: '醺', pinyin: 'xūn', jyutping: 'fan1', set: 2, showMandarinAudio: true },
      { char: '焚', pinyin: 'fén', jyutping: 'fan4', set: 2, showMandarinAudio: true },
      { char: '氲', pinyin: 'yūn', jyutping: 'wan1', set: 2, showMandarinAudio: true },
      { char: '欣', pinyin: 'xīn', jyutping: 'jan1', set: 2, showMandarinAudio: true },
      { char: '纭', pinyin: 'yún', jyutping: 'wan4', set: 3, showMandarinAudio: true },
      { char: '耘', pinyin: 'yún', jyutping: 'wan4', set: 3, showMandarinAudio: true },
      { char: '斤', pinyin: 'jīn', jyutping: 'gan1', set: 3, showMandarinAudio: true },
      { char: '芹', pinyin: 'qín', jyutping: 'kan4', set: 3, showMandarinAudio: true },
      { char: '蚊', pinyin: 'wén', jyutping: 'man4', set: 3, showMandarinAudio: true },
      { char: '筋', pinyin: 'jīn', jyutping: 'gan1', set: 3, showMandarinAudio: true },
      { char: '汾', pinyin: 'fén', jyutping: 'fan4', set: 4, showMandarinAudio: true },
      { char: '殷', pinyin: 'yīn', jyutping: 'jan1', set: 4, showMandarinAudio: true },
      { char: '雯', pinyin: 'wén', jyutping: 'man4', set: 4, showMandarinAudio: true },
      { char: '蕲', pinyin: 'qí', jyutping: 'kei4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '李商隐',
      title: '促漏',
      text: '促漏遥钟动静闻，报章重叠杳难分。\n舞鸾镜匣收残黛，睡鸭香炉换夕熏。\n归去定知还向月，梦来何处更为云？\n南塘渐暖蒲堪结，两两鸳鸯护水纹。',
      rhymingCharacters: [
        { char: '闻', jyutping: 'man4', pinyin: 'wén' },
        { char: '分', jyutping: 'fan1', pinyin: 'fēn' },
        { char: '熏', jyutping: 'fan1', pinyin: 'xūn' },
        { char: '云', jyutping: 'wan4', pinyin: 'yún' },
        { char: '纹', jyutping: 'man4', pinyin: 'wén' },
      ],
      gloss:
        "Li Shangyin's late-night reverie: water-clock and bell, layered messages, " +
        'makeup boxes shut, incense changed at dusk. He goes home to the moon; in ' +
        'dreams she is a cloud. The south pond warms, and mandarin ducks guard the ' +
        'ripples in pairs.',
    },
    mnemonic:
      '促漏聞鐘, 分分鴛紋 — 十二文一韻, 主 -en/-un 之清遠, 義山夜思之韻。',
    teachingNote:
      '十二文與十一真、十三元為 -en/-un 系三鄰韻, 出韵大戶。' +
      '三韻在現代普通話幾乎合流, 但平水韻嚴格分立。' +
      '注意「殷」字兼屬十一真、十二文、十五删 (Type A 三跨韻, 不同義訓)。',
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
    confusables: ['shangping-11-zhen', 'shangping-12-wen', 'shangping-14-han'],
    modernRime: '-uan / -yuan / -un / -en',
    seedCharacters: [
      { char: '原', pinyin: 'yuán', jyutping: 'jyun4', set: 1, showMandarinAudio: true },
      { char: '垣', pinyin: 'yuán', jyutping: 'jyun4', set: 1, showMandarinAudio: true },
      { char: '辕', pinyin: 'yuán', jyutping: 'jyun4', set: 1, showMandarinAudio: true },
      { char: '言', pinyin: 'yán', jyutping: 'jin4', set: 1, showMandarinAudio: true },
      { char: '园', pinyin: 'yuán', jyutping: 'jyun4', set: 1, showMandarinAudio: true },
      { char: '元', pinyin: 'yuán', jyutping: 'jyun4', set: 1, showMandarinAudio: true },
      { char: '源', pinyin: 'yuán', jyutping: 'jyun4', set: 1, showMandarinAudio: true },
      { char: '轩', pinyin: 'xuān', jyutping: 'hin1', set: 1, showMandarinAudio: true },
      { char: '翻', pinyin: 'fān', jyutping: 'faan1', set: 1, showMandarinAudio: true },
      { char: '繁', pinyin: 'fán', jyutping: 'faan4', set: 1, showMandarinAudio: true },
      { char: '门', pinyin: 'mén', jyutping: 'mun4', set: 1, showMandarinAudio: true },
      { char: '村', pinyin: 'cūn', jyutping: 'cyun1', set: 1, showMandarinAudio: true },
      { char: '喧', pinyin: 'xuān', jyutping: 'hyun1', set: 2, showMandarinAudio: true },
      { char: '烦', pinyin: 'fán', jyutping: 'faan4', set: 2, showMandarinAudio: true },
      { char: '昏', pinyin: 'hūn', jyutping: 'fan1', set: 2, showMandarinAudio: true },
      { char: '魂', pinyin: 'hún', jyutping: 'wan4', set: 2, showMandarinAudio: true },
      { char: '尊', pinyin: 'zūn', jyutping: 'zyun1', set: 2, showMandarinAudio: true },
      { char: '恩', pinyin: 'ēn', jyutping: 'jan1', set: 2, showMandarinAudio: true },
      { char: '痕', pinyin: 'hén', jyutping: 'han4', set: 2, showMandarinAudio: true },
      { char: '孙', pinyin: 'sūn', jyutping: 'syun1', set: 2, showMandarinAudio: true },
      { char: '根', pinyin: 'gēn', jyutping: 'gan1', set: 3, showMandarinAudio: true },
      { char: '温', pinyin: 'wēn', jyutping: 'wan1', set: 3, showMandarinAudio: true },
      { char: '坤', pinyin: 'kūn', jyutping: 'kwan1', set: 3, showMandarinAudio: true },
      { char: '奔', pinyin: 'bēn', jyutping: 'ban1', set: 3, showMandarinAudio: true },
      { char: '萱', pinyin: 'xuān', jyutping: 'hyun1', set: 3, showMandarinAudio: true },
      { char: '暄', pinyin: 'xuān', jyutping: 'hyun1', set: 3, showMandarinAudio: true },
      { char: '猿', pinyin: 'yuán', jyutping: 'jyun4', set: 4, showMandarinAudio: true },
      { char: '援', pinyin: 'yuán', jyutping: 'wun4', set: 4, showMandarinAudio: true },
      { char: '樽', pinyin: 'zūn', jyutping: 'zyun1', set: 4, showMandarinAudio: true },
      { char: '蹲', pinyin: 'dūn', jyutping: 'deon1', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '自作',
      title: '抒志',
      text: '提缰策马越陵原，举目天清展四垣。\n豁荡铿然生浩气，胸怀远志荐轩辕。',
      rhymingCharacters: [
        { char: '原', jyutping: 'jyun4', pinyin: 'yuán' },
        { char: '垣', jyutping: 'jyun4', pinyin: 'yuán' },
        { char: '辕', jyutping: 'jyun4', pinyin: 'yuán' },
      ],
      gloss:
        'Reins gripped, riding past mound and plain. Eyes lift to a clear sky ' +
        'stretched four walls wide. Vast, ringing, the spirit rises — and a ' +
        'far-aimed will offers itself to the Yellow Emperor.',
    },
    mnemonic:
      '陵原四垣, 浩氣軒轅 — 十三元一韻, 主 -uan/-yuan 與 -un/-en 兩派同列, 騎馬豪情之韻。',
    teachingNote:
      '十三元為 -en/-un 系出韵大戶之尾, 含 -uan/-yuan (元 言 原 軒) 與 -un/-en (魂 門 尊 根) ' +
      '兩個子韻群。在現代普通話兩群聽來不押, 但平水韻同屬一韻。' +
      '「論」字兼屬十一真、十三元 (Type A 跨韻)。',
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
    confusables: ['shangping-13-yuan', 'shangping-15-shan', 'xiaping-01-xian'],
    modernRime: '-an',
    seedCharacters: [
      { char: '残', pinyin: 'cán', jyutping: 'caan4', set: 1, showMandarinAudio: true },
      { char: '欢', pinyin: 'huān', jyutping: 'fun1', set: 1, showMandarinAudio: true },
      { char: '酸', pinyin: 'suān', jyutping: 'syun1', set: 1, showMandarinAudio: true },
      { char: '寒', pinyin: 'hán', jyutping: 'hon4', set: 1, showMandarinAudio: true },
      { char: '看', pinyin: 'kān', jyutping: 'hon1', set: 1, showMandarinAudio: true },
      { char: '难', pinyin: 'nán', jyutping: 'naan4', set: 1, showMandarinAudio: true },
      { char: '安', pinyin: 'ān', jyutping: 'on1', set: 1, showMandarinAudio: true },
      { char: '宽', pinyin: 'kuān', jyutping: 'fun1', set: 1, showMandarinAudio: true },
      { char: '端', pinyin: 'duān', jyutping: 'dyun1', set: 1, showMandarinAudio: true },
      { char: '官', pinyin: 'guān', jyutping: 'gun1', set: 1, showMandarinAudio: true },
      { char: '阑', pinyin: 'lán', jyutping: 'laan4', set: 1, showMandarinAudio: true },
      { char: '盘', pinyin: 'pán', jyutping: 'pun4', set: 1, showMandarinAudio: true },
      { char: '干', pinyin: 'gān', jyutping: 'gon1', set: 2, showMandarinAudio: true },
      { char: '丹', pinyin: 'dān', jyutping: 'daan1', set: 2, showMandarinAudio: true },
      { char: '餐', pinyin: 'cān', jyutping: 'caan1', set: 2, showMandarinAudio: true },
      { char: '兰', pinyin: 'lán', jyutping: 'laan4', set: 2, showMandarinAudio: true },
      { char: '竿', pinyin: 'gān', jyutping: 'gon1', set: 2, showMandarinAudio: true },
      { char: '坛', pinyin: 'tán', jyutping: 'taan4', set: 2, showMandarinAudio: true },
      { char: '滩', pinyin: 'tān', jyutping: 'taan1', set: 2, showMandarinAudio: true },
      { char: '团', pinyin: 'tuán', jyutping: 'tyun4', set: 2, showMandarinAudio: true },
      { char: '鞍', pinyin: 'ān', jyutping: 'on1', set: 3, showMandarinAudio: true },
      { char: '澜', pinyin: 'lán', jyutping: 'laan4', set: 3, showMandarinAudio: true },
      { char: '鸾', pinyin: 'luán', jyutping: 'lyun4', set: 3, showMandarinAudio: true },
      { char: '弹', pinyin: 'dán', jyutping: 'daan6', set: 3, showMandarinAudio: true },
      { char: '肝', pinyin: 'gān', jyutping: 'gon1', set: 3, showMandarinAudio: true },
      { char: '湍', pinyin: 'tuān', jyutping: 'tyun1', set: 3, showMandarinAudio: true },
      { char: '完', pinyin: 'wán', jyutping: 'jyun4', set: 4, showMandarinAudio: true },
      { char: '桓', pinyin: 'huán', jyutping: 'wun4', set: 4, showMandarinAudio: true },
      { char: '单', pinyin: 'dān', jyutping: 'daan1', set: 4, showMandarinAudio: true },
      { char: '韩', pinyin: 'hán', jyutping: 'hon4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '自作',
      title: '夜叹',
      text: '凄风夜雨盏灯残，孑影空杯愈寡欢。\n吁叹无常多舛变，自将浊酒对辛酸。',
      rhymingCharacters: [
        { char: '残', jyutping: 'caan4', pinyin: 'cán' },
        { char: '欢', jyutping: 'fun1', pinyin: 'huān' },
        { char: '酸', jyutping: 'syun1', pinyin: 'suān' },
      ],
      gloss:
        'Cold wind, night rain, a lamp guttering low. A lone shadow, an empty cup, ' +
        'less and less joy. Sighing at fate\'s reversals, I turn my coarse wine to ' +
        'face the bitterness.',
    },
    mnemonic:
      '凄風夜雨燈殘, 濁酒對辛酸寒 — 十四寒一韻, 主 -an 之深長, 寒夜獨酌之韻。',
    teachingNote:
      '十四寒為 -an 系首, 與十五删、一先為近鄰韻。' +
      '注意「翰」字屬去聲十五翰 (仄), 不入十四寒平聲, 雖名相近不可通押。' +
      '「看」「難」「彈」字平仄兩讀 (平於十四寒 / 仄於十五翰), 為 Type B 平仄之例。',
  },

  {
    id: 'shangping-15-shan',
    ordinal: 15,
    label: '十五刪',
    rhymeCharacter: '删',
    tone: 'ping',
    half: 'shangping',
    tier: 2,
    family: 'an-family',
    confusables: ['shangping-14-han', 'xiaping-01-xian'],
    modernRime: '-an / -ian',
    seedCharacters: [
      { char: '山', pinyin: 'shān', jyutping: 'saan1', set: 1, showMandarinAudio: true },
      { char: '间', pinyin: 'jiān', jyutping: 'gaan1', set: 1, showMandarinAudio: true },
      { char: '还', pinyin: 'huán', jyutping: 'waan4', set: 1, showMandarinAudio: true },
      { char: '关', pinyin: 'guān', jyutping: 'gwaan1', set: 1, showMandarinAudio: true },
      { char: '颜', pinyin: 'yán', jyutping: 'ngaan4', set: 1, showMandarinAudio: true },
      { char: '闲', pinyin: 'xián', jyutping: 'haan4', set: 1, showMandarinAudio: true },
      { char: '攀', pinyin: 'pān', jyutping: 'paan1', set: 1, showMandarinAudio: true },
      { char: '斑', pinyin: 'bān', jyutping: 'baan1', set: 1, showMandarinAudio: true },
      { char: '湾', pinyin: 'wān', jyutping: 'waan1', set: 1, showMandarinAudio: true },
      { char: '班', pinyin: 'bān', jyutping: 'baan1', set: 1, showMandarinAudio: true },
      { char: '环', pinyin: 'huán', jyutping: 'waan4', set: 1, showMandarinAudio: true },
      { char: '艰', pinyin: 'jiān', jyutping: 'gaan1', set: 1, showMandarinAudio: true },
      { char: '寰', pinyin: 'huán', jyutping: 'waan4', set: 2, showMandarinAudio: true },
      { char: '顽', pinyin: 'wán', jyutping: 'waan4', set: 2, showMandarinAudio: true },
      { char: '悭', pinyin: 'qiān', jyutping: 'haan1', set: 2, showMandarinAudio: true },
      { char: '蛮', pinyin: 'mán', jyutping: 'maan4', set: 2, showMandarinAudio: true },
      { char: '删', pinyin: 'shān', jyutping: 'saan1', set: 2, showMandarinAudio: true },
      { char: '弯', pinyin: 'wān', jyutping: 'waan1', set: 2, showMandarinAudio: true },
      { char: '菅', pinyin: 'jiān', jyutping: 'gaan1', set: 2, showMandarinAudio: true },
      { char: '颁', pinyin: 'bān', jyutping: 'baan1', set: 2, showMandarinAudio: true },
      { char: '奸', pinyin: 'jiān', jyutping: 'gaan1', set: 3, showMandarinAudio: true },
      { char: '鹇', pinyin: 'xián', jyutping: 'haan4', set: 3, showMandarinAudio: true },
      { char: '孱', pinyin: 'chán', jyutping: 'saan4', set: 3, showMandarinAudio: true },
      { char: '斓', pinyin: 'lán', jyutping: 'laan4', set: 3, showMandarinAudio: true },
      { char: '鳏', pinyin: 'guān', jyutping: 'gwaan1', set: 3, showMandarinAudio: true },
      { char: '娴', pinyin: 'xián', jyutping: 'haan4', set: 3, showMandarinAudio: true },
      { char: '殷', pinyin: 'yān', jyutping: 'jan1', set: 4, showMandarinAudio: true },
      { char: '般', pinyin: 'bān', jyutping: 'bun1', set: 4, showMandarinAudio: true },
      { char: '鬟', pinyin: 'huán', jyutping: 'waan4', set: 4, showMandarinAudio: true },
      { char: '阛', pinyin: 'huán', jyutping: 'waan4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '李白',
      title: '早发白帝城',
      text: '朝辞白帝彩云间，千里江陵一日还。\n两岸猿声啼不住，轻舟已过万重山。',
      rhymingCharacters: [
        { char: '间', jyutping: 'gaan1', pinyin: 'jiān' },
        { char: '还', jyutping: 'waan4', pinyin: 'huán' },
        { char: '山', jyutping: 'saan1', pinyin: 'shān' },
      ],
      gloss:
        "Leaving Baidi at dawn through cloud-painted air, a thousand li to Jiangling " +
        "in one day. The gibbons of both shores can't quit their crying — and the " +
        'light boat has already cleared ten thousand mountains.',
    },
    mnemonic:
      '白帝彩雲, 萬山輕舟 — 十五删一韻, 主 -an 之開廣, 江行豪情之韻。',
    teachingNote:
      '十五删與十四寒、一先同屬 -an 系。' +
      '「殷」字兼屬十一真、十二文、十五删 (Type A 三跨韻, 此韻為「赤黑色」義)。' +
      '「間」字平仄兩讀 (平十五删為「中間」/ 仄十七霰為「間隔」), 為 Type B 平仄之例。',
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
    modernRime: '-ian / -uan / -ün',
    seedCharacters: [
      { char: '天', pinyin: 'tiān', jyutping: 'tin1', set: 1, showMandarinAudio: true },
      { char: '悬', pinyin: 'xuán', jyutping: 'jyun4', set: 1, showMandarinAudio: true },
      { char: '烟', pinyin: 'yān', jyutping: 'jin1', set: 1, showMandarinAudio: true },
      { char: '先', pinyin: 'xiān', jyutping: 'sin1', set: 1, showMandarinAudio: true },
      { char: '前', pinyin: 'qián', jyutping: 'cin4', set: 1, showMandarinAudio: true },
      { char: '川', pinyin: 'chuān', jyutping: 'cyun1', set: 1, showMandarinAudio: true },
      { char: '边', pinyin: 'biān', jyutping: 'bin1', set: 1, showMandarinAudio: true },
      { char: '年', pinyin: 'nián', jyutping: 'nin4', set: 1, showMandarinAudio: true },
      { char: '仙', pinyin: 'xiān', jyutping: 'sin1', set: 1, showMandarinAudio: true },
      { char: '千', pinyin: 'qiān', jyutping: 'cin1', set: 1, showMandarinAudio: true },
      { char: '然', pinyin: 'rán', jyutping: 'jin4', set: 1, showMandarinAudio: true },
      { char: '眠', pinyin: 'mián', jyutping: 'min4', set: 1, showMandarinAudio: true },
      { char: '田', pinyin: 'tián', jyutping: 'tin4', set: 2, showMandarinAudio: true },
      { char: '莲', pinyin: 'lián', jyutping: 'lin4', set: 2, showMandarinAudio: true },
      { char: '泉', pinyin: 'quán', jyutping: 'cyun4', set: 2, showMandarinAudio: true },
      { char: '妍', pinyin: 'yán', jyutping: 'jin4', set: 2, showMandarinAudio: true },
      { char: '鲜', pinyin: 'xiān', jyutping: 'sin1', set: 2, showMandarinAudio: true },
      { char: '弦', pinyin: 'xián', jyutping: 'jin4', set: 2, showMandarinAudio: true },
      { char: '偏', pinyin: 'piān', jyutping: 'pin1', set: 2, showMandarinAudio: true },
      { char: '联', pinyin: 'lián', jyutping: 'lyun4', set: 2, showMandarinAudio: true },
      { char: '玄', pinyin: 'xuán', jyutping: 'jyun4', set: 3, showMandarinAudio: true },
      { char: '渊', pinyin: 'yuān', jyutping: 'jyun1', set: 3, showMandarinAudio: true },
      { char: '缘', pinyin: 'yuán', jyutping: 'jyun4', set: 3, showMandarinAudio: true },
      { char: '篇', pinyin: 'piān', jyutping: 'pin1', set: 3, showMandarinAudio: true },
      { char: '颠', pinyin: 'diān', jyutping: 'din1', set: 3, showMandarinAudio: true },
      { char: '鞭', pinyin: 'biān', jyutping: 'bin1', set: 3, showMandarinAudio: true },
      { char: '燕', pinyin: 'yān', jyutping: 'jin1', set: 4, showMandarinAudio: true },
      { char: '旋', pinyin: 'xuán', jyutping: 'syun4', set: 4, showMandarinAudio: true },
      { char: '蝉', pinyin: 'chán', jyutping: 'sim4', set: 4, showMandarinAudio: true },
      { char: '涟', pinyin: 'lián', jyutping: 'lin4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '自作',
      title: '水帘洞',
      text: '朱陵别有天，紫盖碧帘悬。\n雾雨滋山翠，霓虹染夕烟。',
      rhymingCharacters: [
        { char: '天', jyutping: 'tin1', pinyin: 'tiān' },
        { char: '悬', jyutping: 'jyun4', pinyin: 'xuán' },
        { char: '烟', jyutping: 'jin1', pinyin: 'yān' },
      ],
      gloss:
        'At Zhuling there is a separate sky; under purple canopies a green curtain ' +
        'hangs. Mist and rain feed the mountain green, and rainbow light dyes the ' +
        'evening haze.',
    },
    mnemonic:
      '朱陵別天, 霧雨夕煙 — 一先一韻, 主 -an 之延長 (-ian, -uan, -ün), 仙境靜謐之韻。',
    teachingNote:
      '一先與十四寒、十五删同屬 -an 系。一先收音較靠 -ian / -ian-y, ' +
      '與十四寒之 -an, 十五删之 -an 開合不同, 三者鄰韻不通押。' +
      '「燕」字平仄兩讀 (平一先「燕京」 / 仄十七霰「燕子」常見), 為 Type B 例。',
  },

  {
    id: 'xiaping-02-xiao',
    ordinal: 2,
    label: '二蕭',
    rhymeCharacter: '萧',
    tone: 'ping',
    half: 'xiaping',
    tier: 2,
    family: 'ao-family',
    confusables: ['xiaping-03-yao', 'xiaping-04-hao'],
    modernRime: '-ao / -iao',
    seedCharacters: [
      { char: '飘', pinyin: 'piāo', jyutping: 'piu1', set: 1, showMandarinAudio: true },
      { char: '萧', pinyin: 'xiāo', jyutping: 'siu1', set: 1, showMandarinAudio: true },
      { char: '寮', pinyin: 'liáo', jyutping: 'liu4', set: 1, showMandarinAudio: true },
      { char: '朝', pinyin: 'zhāo', jyutping: 'ziu1', set: 1, showMandarinAudio: true },
      { char: '桥', pinyin: 'qiáo', jyutping: 'kiu4', set: 1, showMandarinAudio: true },
      { char: '遥', pinyin: 'yáo', jyutping: 'jiu4', set: 1, showMandarinAudio: true },
      { char: '摇', pinyin: 'yáo', jyutping: 'jiu4', set: 1, showMandarinAudio: true },
      { char: '销', pinyin: 'xiāo', jyutping: 'siu1', set: 1, showMandarinAudio: true },
      { char: '招', pinyin: 'zhāo', jyutping: 'ziu1', set: 1, showMandarinAudio: true },
      { char: '苗', pinyin: 'miáo', jyutping: 'miu4', set: 1, showMandarinAudio: true },
      { char: '潮', pinyin: 'cháo', jyutping: 'ciu4', set: 1, showMandarinAudio: true },
      { char: '妖', pinyin: 'yāo', jyutping: 'jiu1', set: 1, showMandarinAudio: true },
      { char: '娇', pinyin: 'jiāo', jyutping: 'giu1', set: 2, showMandarinAudio: true },
      { char: '椒', pinyin: 'jiāo', jyutping: 'ziu1', set: 2, showMandarinAudio: true },
      { char: '樵', pinyin: 'qiáo', jyutping: 'ciu4', set: 2, showMandarinAudio: true },
      { char: '焦', pinyin: 'jiāo', jyutping: 'ziu1', set: 2, showMandarinAudio: true },
      { char: '雕', pinyin: 'diāo', jyutping: 'diu1', set: 2, showMandarinAudio: true },
      { char: '寥', pinyin: 'liáo', jyutping: 'liu4', set: 2, showMandarinAudio: true },
      { char: '漂', pinyin: 'piāo', jyutping: 'piu1', set: 2, showMandarinAudio: true },
      { char: '凋', pinyin: 'diāo', jyutping: 'diu1', set: 2, showMandarinAudio: true },
      { char: '翘', pinyin: 'qiáo', jyutping: 'kiu4', set: 3, showMandarinAudio: true },
      { char: '标', pinyin: 'biāo', jyutping: 'biu1', set: 3, showMandarinAudio: true },
      { char: '鹩', pinyin: 'liáo', jyutping: 'liu4', set: 3, showMandarinAudio: true },
      { char: '邀', pinyin: 'yāo', jyutping: 'jiu1', set: 3, showMandarinAudio: true },
      { char: '韶', pinyin: 'sháo', jyutping: 'siu4', set: 3, showMandarinAudio: true },
      { char: '飙', pinyin: 'biāo', jyutping: 'biu1', set: 3, showMandarinAudio: true },
      { char: '苕', pinyin: 'tiáo', jyutping: 'tiu4', set: 4, showMandarinAudio: true },
      { char: '僚', pinyin: 'liáo', jyutping: 'liu4', set: 4, showMandarinAudio: true },
      { char: '辽', pinyin: 'liáo', jyutping: 'liu4', set: 4, showMandarinAudio: true },
      { char: '饶', pinyin: 'ráo', jyutping: 'jiu4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '自作',
      title: '春雪畅怀',
      text: '西风柔弱雪花飘，柳硬杨疏落壳萧。\n最喜出墙梅几朵，常欷艳丽锁庭寮。',
      rhymingCharacters: [
        { char: '飘', jyutping: 'piu1', pinyin: 'piāo' },
        { char: '萧', jyutping: 'siu1', pinyin: 'xiāo' },
        { char: '寮', jyutping: 'liu4', pinyin: 'liáo' },
      ],
      gloss:
        "Soft west wind, snow drifting; willows bare, poplars sparse, husks rustling. " +
        "Best of all, the wall-side plum's few blooms — bright as ever, locking up the " +
        'courtyard hall in their beauty.',
    },
    mnemonic:
      '西風雪飄, 牆梅鎖寮 — 二萧一韻, 主 -ao 之高揚, 春雪暢懷之韻。',
    teachingNote:
      '二萧與三肴、四豪同屬 -ao 系。三韻在現代普通話幾乎合流, 但平水韻嚴格分立。' +
      '注意「嘲」「蛟」「鈞」「燎」屬三肴或仄聲十八嘯, 不入二萧平聲。',
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
    seedCharacters: [
      { char: '郊', pinyin: 'jiāo', jyutping: 'gaau1', set: 1, showMandarinAudio: true },
      { char: '坳', pinyin: 'āo', jyutping: 'aau1', set: 1, showMandarinAudio: true },
      { char: '抄', pinyin: 'chāo', jyutping: 'caau1', set: 1, showMandarinAudio: true },
      { char: '交', pinyin: 'jiāo', jyutping: 'gaau1', set: 1, showMandarinAudio: true },
      { char: '茅', pinyin: 'máo', jyutping: 'maau4', set: 1, showMandarinAudio: true },
      { char: '包', pinyin: 'bāo', jyutping: 'baau1', set: 1, showMandarinAudio: true },
      { char: '巢', pinyin: 'cháo', jyutping: 'caau4', set: 1, showMandarinAudio: true },
      { char: '抛', pinyin: 'pāo', jyutping: 'paau1', set: 1, showMandarinAudio: true },
      { char: '庖', pinyin: 'páo', jyutping: 'paau4', set: 1, showMandarinAudio: true },
      { char: '跑', pinyin: 'pǎo', jyutping: 'paau2', set: 1, showMandarinAudio: true },
      { char: '梢', pinyin: 'shāo', jyutping: 'saau1', set: 1, showMandarinAudio: true },
      { char: '咆', pinyin: 'páo', jyutping: 'paau4', set: 1, showMandarinAudio: true },
      { char: '敲', pinyin: 'qiāo', jyutping: 'haau1', set: 2, showMandarinAudio: true },
      { char: '哮', pinyin: 'xiāo', jyutping: 'haau1', set: 2, showMandarinAudio: true },
      { char: '蛟', pinyin: 'jiāo', jyutping: 'gaau1', set: 2, showMandarinAudio: true },
      { char: '教', pinyin: 'jiāo', jyutping: 'gaau1', set: 2, showMandarinAudio: true },
      { char: '胞', pinyin: 'bāo', jyutping: 'baau1', set: 2, showMandarinAudio: true },
      { char: '泡', pinyin: 'pào', jyutping: 'paau1', set: 2, showMandarinAudio: true },
      { char: '凹', pinyin: 'āo', jyutping: 'aau1', set: 2, showMandarinAudio: true },
      { char: '匏', pinyin: 'páo', jyutping: 'paau4', set: 2, showMandarinAudio: true },
      { char: '苞', pinyin: 'bāo', jyutping: 'baau1', set: 3, showMandarinAudio: true },
      { char: '筲', pinyin: 'shāo', jyutping: 'saau1', set: 3, showMandarinAudio: true },
      { char: '钞', pinyin: 'chāo', jyutping: 'caau1', set: 3, showMandarinAudio: true },
      { char: '茆', pinyin: 'máo', jyutping: 'maau4', set: 3, showMandarinAudio: true },
      { char: '爻', pinyin: 'yáo', jyutping: 'ngaau4', set: 3, showMandarinAudio: true },
      { char: '嘲', pinyin: 'cháo', jyutping: 'zaau1', set: 3, showMandarinAudio: true },
      { char: '稍', pinyin: 'shāo', jyutping: 'saau1', set: 4, showMandarinAudio: true },
      { char: '铙', pinyin: 'náo', jyutping: 'naau4', set: 4, showMandarinAudio: true },
      { char: '崤', pinyin: 'xiáo', jyutping: 'ngaau4', set: 4, showMandarinAudio: true },
      { char: '聱', pinyin: 'áo', jyutping: 'ngou4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '自作',
      title: '逃学',
      text: '儿时逃学去南郊，布阵排兵战岭坳。\n日落回家忙作业，例题字典乱查抄。',
      rhymingCharacters: [
        { char: '郊', jyutping: 'gaau1', pinyin: 'jiāo' },
        { char: '坳', jyutping: 'aau1', pinyin: 'āo' },
        { char: '抄', jyutping: 'caau1', pinyin: 'chāo' },
      ],
      gloss:
        'Skipping school as a boy, off to the southern fields — drilling and fighting ' +
        'in the ridge hollow. Sundown, scrambling home for homework: example problems ' +
        'and dictionaries copied at random.',
    },
    mnemonic:
      '南郊嶺坳, 字典亂抄 — 三肴一韻, 主 -ao 之中段, 童年逃學之韻。',
    teachingNote:
      '三肴介於二萧、四豪之間, -ao 系中段。注意「嘲」「蛟」屬三肴 (非二萧); ' +
      '「漕」「髦」屬四豪 (非三肴); 「笤」屬二萧 (非三肴)。三韻字界須仔細分辨。',
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
    seedCharacters: [
      { char: '皋', pinyin: 'gāo', jyutping: 'gou1', set: 1, showMandarinAudio: true },
      { char: '豪', pinyin: 'háo', jyutping: 'hou4', set: 1, showMandarinAudio: true },
      { char: '刀', pinyin: 'dāo', jyutping: 'dou1', set: 1, showMandarinAudio: true },
      { char: '高', pinyin: 'gāo', jyutping: 'gou1', set: 1, showMandarinAudio: true },
      { char: '毛', pinyin: 'máo', jyutping: 'mou4', set: 1, showMandarinAudio: true },
      { char: '桃', pinyin: 'táo', jyutping: 'tou4', set: 1, showMandarinAudio: true },
      { char: '涛', pinyin: 'tāo', jyutping: 'tou1', set: 1, showMandarinAudio: true },
      { char: '操', pinyin: 'cāo', jyutping: 'cou1', set: 1, showMandarinAudio: true },
      { char: '曹', pinyin: 'cáo', jyutping: 'cou4', set: 1, showMandarinAudio: true },
      { char: '槽', pinyin: 'cáo', jyutping: 'cou4', set: 1, showMandarinAudio: true },
      { char: '牢', pinyin: 'láo', jyutping: 'lou4', set: 1, showMandarinAudio: true },
      { char: '嚎', pinyin: 'háo', jyutping: 'hou4', set: 1, showMandarinAudio: true },
      { char: '篙', pinyin: 'gāo', jyutping: 'gou1', set: 2, showMandarinAudio: true },
      { char: '韬', pinyin: 'tāo', jyutping: 'tou1', set: 2, showMandarinAudio: true },
      { char: '滔', pinyin: 'tāo', jyutping: 'tou1', set: 2, showMandarinAudio: true },
      { char: '陶', pinyin: 'táo', jyutping: 'tou4', set: 2, showMandarinAudio: true },
      { char: '逃', pinyin: 'táo', jyutping: 'tou4', set: 2, showMandarinAudio: true },
      { char: '遭', pinyin: 'zāo', jyutping: 'zou1', set: 2, showMandarinAudio: true },
      { char: '糟', pinyin: 'zāo', jyutping: 'zou1', set: 2, showMandarinAudio: true },
      { char: '骚', pinyin: 'sāo', jyutping: 'sou1', set: 2, showMandarinAudio: true },
      { char: '蒿', pinyin: 'hāo', jyutping: 'hou1', set: 3, showMandarinAudio: true },
      { char: '嗥', pinyin: 'háo', jyutping: 'hou4', set: 3, showMandarinAudio: true },
      { char: '翱', pinyin: 'áo', jyutping: 'ngou4', set: 3, showMandarinAudio: true },
      { char: '醪', pinyin: 'láo', jyutping: 'lou4', set: 3, showMandarinAudio: true },
      { char: '旄', pinyin: 'máo', jyutping: 'mou4', set: 3, showMandarinAudio: true },
      { char: '饕', pinyin: 'tāo', jyutping: 'tou1', set: 3, showMandarinAudio: true },
      { char: '嗷', pinyin: 'áo', jyutping: 'ngou4', set: 4, showMandarinAudio: true },
      { char: '鳌', pinyin: 'áo', jyutping: 'ngou4', set: 4, showMandarinAudio: true },
      { char: '醩', pinyin: 'zāo', jyutping: 'zou1', set: 4, showMandarinAudio: true },
      { char: '袍', pinyin: 'páo', jyutping: 'pou4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '自作',
      title: '谒辅文侯',
      text: '鲁山肃立谒牛皋，旅邸浅斟论俊豪。\n驰骋疆场威黠虏，朝廷昏愦阅屠刀。',
      rhymingCharacters: [
        { char: '皋', jyutping: 'gou1', pinyin: 'gāo' },
        { char: '豪', jyutping: 'hou4', pinyin: 'háo' },
        { char: '刀', jyutping: 'dou1', pinyin: 'dāo' },
      ],
      gloss:
        "Mount Lu stands solemn — I pay respects at Niu Gao's shrine. At the inn I " +
        'pour a thin cup and weigh the heroes. They galloped the front lines, struck ' +
        "terror in the cunning enemy — while the dim court watched a butcher's blade.",
    },
    mnemonic:
      '魯山謁皋, 朝廷屠刀 — 四豪一韻, 主 -ao 之低沉, 弔英雄之韻。',
    teachingNote:
      '四豪為 -ao 系收尾, 與二萧、三肴鄰而不通押。注意「漕」「髦」「唠」屬四豪 ' +
      '(非三肴), 字界與三肴須辨。',
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
    seedCharacters: [
      { char: '声', pinyin: 'shēng', jyutping: 'sing1', set: 1, showMandarinAudio: true },
      { char: '城', pinyin: 'chéng', jyutping: 'sing4', set: 1, showMandarinAudio: true },
      { char: '情', pinyin: 'qíng', jyutping: 'cing4', set: 1, showMandarinAudio: true },
      { char: '生', pinyin: 'shēng', jyutping: 'saang1', set: 1, showMandarinAudio: true },
      { char: '平', pinyin: 'píng', jyutping: 'ping4', set: 1, showMandarinAudio: true },
      { char: '明', pinyin: 'míng', jyutping: 'ming4', set: 1, showMandarinAudio: true },
      { char: '清', pinyin: 'qīng', jyutping: 'cing1', set: 1, showMandarinAudio: true },
      { char: '京', pinyin: 'jīng', jyutping: 'ging1', set: 1, showMandarinAudio: true },
      { char: '行', pinyin: 'xíng', jyutping: 'hang4', set: 1, showMandarinAudio: true },
      { char: '名', pinyin: 'míng', jyutping: 'ming4', set: 1, showMandarinAudio: true },
      { char: '程', pinyin: 'chéng', jyutping: 'cing4', set: 1, showMandarinAudio: true },
      { char: '营', pinyin: 'yíng', jyutping: 'jing4', set: 1, showMandarinAudio: true },
      { char: '横', pinyin: 'héng', jyutping: 'waang4', set: 2, showMandarinAudio: true },
      { char: '鸣', pinyin: 'míng', jyutping: 'ming4', set: 2, showMandarinAudio: true },
      { char: '卿', pinyin: 'qīng', jyutping: 'hing1', set: 2, showMandarinAudio: true },
      { char: '倾', pinyin: 'qīng', jyutping: 'king1', set: 2, showMandarinAudio: true },
      { char: '兵', pinyin: 'bīng', jyutping: 'bing1', set: 2, showMandarinAudio: true },
      { char: '蜻', pinyin: 'qīng', jyutping: 'cing1', set: 2, showMandarinAudio: true },
      { char: '轻', pinyin: 'qīng', jyutping: 'hing1', set: 2, showMandarinAudio: true },
      { char: '荆', pinyin: 'jīng', jyutping: 'ging1', set: 2, showMandarinAudio: true },
      { char: '茔', pinyin: 'yíng', jyutping: 'jing4', set: 3, showMandarinAudio: true },
      { char: '莺', pinyin: 'yīng', jyutping: 'jing1', set: 3, showMandarinAudio: true },
      { char: '棚', pinyin: 'péng', jyutping: 'paang4', set: 3, showMandarinAudio: true },
      { char: '衡', pinyin: 'héng', jyutping: 'hang4', set: 3, showMandarinAudio: true },
      { char: '樱', pinyin: 'yīng', jyutping: 'jing1', set: 3, showMandarinAudio: true },
      { char: '鲸', pinyin: 'jīng', jyutping: 'king4', set: 3, showMandarinAudio: true },
      { char: '庚', pinyin: 'gēng', jyutping: 'gang1', set: 4, showMandarinAudio: true },
      { char: '萌', pinyin: 'méng', jyutping: 'maang4', set: 4, showMandarinAudio: true },
      { char: '烹', pinyin: 'pēng', jyutping: 'paang1', set: 4, showMandarinAudio: true },
      { char: '瑛', pinyin: 'yīng', jyutping: 'jing1', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '自作',
      title: '思归',
      text: '寒蝉白露放悲声，散入秋风满客城。\n忽觉衫凉身一颤，谁人不起念乡情。',
      rhymingCharacters: [
        { char: '声', jyutping: 'sing1', pinyin: 'shēng' },
        { char: '城', jyutping: 'sing4', pinyin: 'chéng' },
        { char: '情', jyutping: 'cing4', pinyin: 'qíng' },
      ],
      gloss:
        "Cold cicadas, white dew, a mournful sound — it scatters on the autumn wind " +
        "through the traveler's town. A sudden chill through my robe, a shiver — and " +
        'who would not, then, stir with thoughts of home?',
    },
    mnemonic:
      '寒蟬白露, 衫涼鄉情 — 八庚一韻, 主 -eng/-ing 之清越, 客中思歸之韻。',
    teachingNote:
      '八庚與九青、十蒸同屬 -eng/-ing 系, 三韻在現代普通話幾乎合流。注意「經」「萍」' +
      '字兼屬八庚、九青 (Type A 跨韻); 嚴格平水韻不可混押。',
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
    seedCharacters: [
      { char: '溟', pinyin: 'míng', jyutping: 'ming4', set: 1, showMandarinAudio: true },
      { char: '醒', pinyin: 'xǐng', jyutping: 'sing2', set: 1, showMandarinAudio: true },
      { char: '星', pinyin: 'xīng', jyutping: 'sing1', set: 1, showMandarinAudio: true },
      { char: '青', pinyin: 'qīng', jyutping: 'cing1', set: 1, showMandarinAudio: true },
      { char: '庭', pinyin: 'tíng', jyutping: 'ting4', set: 1, showMandarinAudio: true },
      { char: '形', pinyin: 'xíng', jyutping: 'jing4', set: 1, showMandarinAudio: true },
      { char: '听', pinyin: 'tīng', jyutping: 'ting1', set: 1, showMandarinAudio: true },
      { char: '亭', pinyin: 'tíng', jyutping: 'ting4', set: 1, showMandarinAudio: true },
      { char: '萤', pinyin: 'yíng', jyutping: 'jing4', set: 1, showMandarinAudio: true },
      { char: '灵', pinyin: 'líng', jyutping: 'ling4', set: 1, showMandarinAudio: true },
      { char: '屏', pinyin: 'píng', jyutping: 'ping4', set: 1, showMandarinAudio: true },
      { char: '厅', pinyin: 'tīng', jyutping: 'ting1', set: 1, showMandarinAudio: true },
      { char: '瓶', pinyin: 'píng', jyutping: 'ping4', set: 2, showMandarinAudio: true },
      { char: '龄', pinyin: 'líng', jyutping: 'ling4', set: 2, showMandarinAudio: true },
      { char: '铭', pinyin: 'míng', jyutping: 'ming4', set: 2, showMandarinAudio: true },
      { char: '馨', pinyin: 'xīn', jyutping: 'hing1', set: 2, showMandarinAudio: true },
      { char: '婷', pinyin: 'tíng', jyutping: 'ting4', set: 2, showMandarinAudio: true },
      { char: '苓', pinyin: 'líng', jyutping: 'ling4', set: 2, showMandarinAudio: true },
      { char: '经', pinyin: 'jīng', jyutping: 'ging1', set: 2, showMandarinAudio: true },
      { char: '玲', pinyin: 'líng', jyutping: 'ling4', set: 2, showMandarinAudio: true },
      { char: '伶', pinyin: 'líng', jyutping: 'ling4', set: 3, showMandarinAudio: true },
      { char: '萍', pinyin: 'píng', jyutping: 'ping4', set: 3, showMandarinAudio: true },
      { char: '翎', pinyin: 'líng', jyutping: 'ling4', set: 3, showMandarinAudio: true },
      { char: '钉', pinyin: 'dīng', jyutping: 'ding1', set: 3, showMandarinAudio: true },
      { char: '暝', pinyin: 'míng', jyutping: 'ming4', set: 3, showMandarinAudio: true },
      { char: '螟', pinyin: 'míng', jyutping: 'ming4', set: 3, showMandarinAudio: true },
      { char: '泠', pinyin: 'líng', jyutping: 'ling4', set: 4, showMandarinAudio: true },
      { char: '宁', pinyin: 'níng', jyutping: 'ning4', set: 4, showMandarinAudio: true },
      { char: '茎', pinyin: 'jīng', jyutping: 'ging1', set: 4, showMandarinAudio: true },
      { char: '棂', pinyin: 'líng', jyutping: 'ling4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '自作',
      title: '送别',
      text: '柳丝郁郁雾溟溟，置酒长亭人未醒。\n泪眼迷离魂已去，参星强笑劝商星。',
      rhymingCharacters: [
        { char: '溟', jyutping: 'ming4', pinyin: 'míng' },
        { char: '醒', jyutping: 'sing2', pinyin: 'xǐng' },
        { char: '星', jyutping: 'sing1', pinyin: 'xīng' },
      ],
      gloss:
        'Willow strands hang heavy in mist that thickens to gloom. Wine set out at ' +
        'the long pavilion, but the traveler will not wake. Tears blur the gaze, the ' +
        'soul is already gone — Shen and Shang in the sky, two parted stars, force a ' +
        'final smile.',
    },
    mnemonic:
      '柳絲霧溟, 參星商星 — 九青一韻, 主 -eng/-ing 之深邈, 送別孤情之韻。',
    teachingNote:
      '九青與八庚、十蒸為 -eng/-ing 系三鄰韻。注意「萍」「經」字兼屬八庚、九青 ' +
      '(Type A 跨韻); 「聽」字平仄兩讀 (平九青 / 仄二十五徑), 為 Type B 平仄之例。',
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
    modernRime: '-eng / -ing',
    seedCharacters: [
      { char: '澄', pinyin: 'chéng', jyutping: 'cing4', set: 1, showMandarinAudio: true },
      { char: '升', pinyin: 'shēng', jyutping: 'sing1', set: 1, showMandarinAudio: true },
      { char: '罾', pinyin: 'zēng', jyutping: 'zang1', set: 1, showMandarinAudio: true },
      { char: '蒸', pinyin: 'zhēng', jyutping: 'zing1', set: 1, showMandarinAudio: true },
      { char: '冰', pinyin: 'bīng', jyutping: 'bing1', set: 1, showMandarinAudio: true },
      { char: '凭', pinyin: 'píng', jyutping: 'pang4', set: 1, showMandarinAudio: true },
      { char: '称', pinyin: 'chēng', jyutping: 'cing1', set: 1, showMandarinAudio: true },
      { char: '兴', pinyin: 'xīng', jyutping: 'hing1', set: 1, showMandarinAudio: true },
      { char: '灯', pinyin: 'dēng', jyutping: 'dang1', set: 1, showMandarinAudio: true },
      { char: '增', pinyin: 'zēng', jyutping: 'zang1', set: 1, showMandarinAudio: true },
      { char: '登', pinyin: 'dēng', jyutping: 'dang1', set: 1, showMandarinAudio: true },
      { char: '僧', pinyin: 'sēng', jyutping: 'zang1', set: 1, showMandarinAudio: true },
      { char: '鹰', pinyin: 'yīng', jyutping: 'jing1', set: 2, showMandarinAudio: true },
      { char: '凝', pinyin: 'níng', jyutping: 'jing4', set: 2, showMandarinAudio: true },
      { char: '矜', pinyin: 'jīn', jyutping: 'gan1', set: 2, showMandarinAudio: true },
      { char: '仍', pinyin: 'réng', jyutping: 'jing4', set: 2, showMandarinAudio: true },
      { char: '应', pinyin: 'yīng', jyutping: 'jing1', set: 2, showMandarinAudio: true },
      { char: '棱', pinyin: 'léng', jyutping: 'ling4', set: 2, showMandarinAudio: true },
      { char: '腾', pinyin: 'téng', jyutping: 'tang4', set: 2, showMandarinAudio: true },
      { char: '藤', pinyin: 'téng', jyutping: 'tang4', set: 2, showMandarinAudio: true },
      { char: '朋', pinyin: 'péng', jyutping: 'pang4', set: 3, showMandarinAudio: true },
      { char: '弘', pinyin: 'hóng', jyutping: 'wang4', set: 3, showMandarinAudio: true },
      { char: '恒', pinyin: 'héng', jyutping: 'hang4', set: 3, showMandarinAudio: true },
      { char: '膺', pinyin: 'yīng', jyutping: 'jing1', set: 3, showMandarinAudio: true },
      { char: '陵', pinyin: 'líng', jyutping: 'ling4', set: 3, showMandarinAudio: true },
      { char: '兢', pinyin: 'jīng', jyutping: 'ging1', set: 3, showMandarinAudio: true },
      { char: '滕', pinyin: 'téng', jyutping: 'tang4', set: 4, showMandarinAudio: true },
      { char: '缯', pinyin: 'zēng', jyutping: 'zang1', set: 4, showMandarinAudio: true },
      { char: '绫', pinyin: 'líng', jyutping: 'ling4', set: 4, showMandarinAudio: true },
      { char: '惩', pinyin: 'chéng', jyutping: 'cing4', set: 4, showMandarinAudio: true },
    ],
    anchorPoem: {
      author: '自作',
      title: '起罾',
      text: '垂杨芽露汉江澄，雪化冰消旭日升。\n提篓渔翁依树饮，小心翼翼起沉罾。',
      rhymingCharacters: [
        { char: '澄', jyutping: 'cing4', pinyin: 'chéng' },
        { char: '升', jyutping: 'sing1', pinyin: 'shēng' },
        { char: '罾', jyutping: 'zang1', pinyin: 'zēng' },
      ],
      gloss:
        'Willow buds show, the Han River clear; snow melts, ice breaks, the rising ' +
        'sun comes up. The basket-carrying old fisher leans on a tree to drink — and ' +
        'with great care raises a sunken net.',
    },
    mnemonic:
      '漢江澄綠, 沉罾翼翼 — 十蒸一韻, 主 -eng/-ing 之清健, 漁翁春朝之韻。',
    teachingNote:
      '十蒸與八庚、九青同屬 -eng/-ing 系。注意「稱」「興」「應」字平仄兩讀 ' +
      '(平十蒸 / 仄二十五徑), 為 Type B 平仄之例。三韻在現代普通話合流, 平水韻須嚴格分立。',
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
    seedCharacters: [
      { char: '缸', pinyin: 'gāng', jyutping: 'gong1', set: 1 },
      { char: '江', pinyin: 'jiāng', jyutping: 'gong1', set: 1 },
      { char: '窗', pinyin: 'chuāng', jyutping: 'coeng1', set: 1 },
      { char: '双', pinyin: 'shuāng', jyutping: 'soeng1', set: 1 },
      { char: '邦', pinyin: 'bāng', jyutping: 'bong1', set: 1 },
      { char: '降', pinyin: 'xiáng', jyutping: 'hong4', set: 1 },
      { char: '撞', pinyin: 'zhuàng', jyutping: 'zong6', set: 1 },
      { char: '腔', pinyin: 'qiāng', jyutping: 'hong1', set: 1 },
      { char: '扛', pinyin: 'gāng', jyutping: 'gong1', set: 1 },
      { char: '幢', pinyin: 'chuáng', jyutping: 'cong4', set: 1 },
      { char: '桩', pinyin: 'zhuāng', jyutping: 'zong1', set: 1 },
      { char: '杠', pinyin: 'gāng', jyutping: 'gong1', set: 1 },
      { char: '庞', pinyin: 'páng', jyutping: 'pong4', set: 2 },
      { char: '淙', pinyin: 'cóng', jyutping: 'cung4', set: 2 },
      { char: '摐', pinyin: 'chuāng', jyutping: 'cung1', set: 2, showMandarinAudio: true },
      { char: '厖', pinyin: 'páng', jyutping: 'mong4', set: 2 },
      { char: '哤', pinyin: 'máng', jyutping: 'mong4', set: 3, showMandarinAudio: true },
      { char: '釭', pinyin: 'gāng', jyutping: 'gong1', set: 3, showMandarinAudio: true },
      { char: '矼', pinyin: 'jiāng', jyutping: 'gong1', set: 3, showMandarinAudio: true },
      { char: '跫', pinyin: 'qióng', jyutping: 'kung4', set: 4, showMandarinAudio: true },
      { char: '茳', pinyin: 'jiāng', jyutping: 'gong1', set: 4, showMandarinAudio: true },
    ],
    mnemonic:
      '三江與七陽同收 -ang，韻部小但獨立。粵音 江 gong1, 窗 coeng1 與 七陽 -oeng 略異。' +
      '降字平聲讀 hong4（降落 - 三江），仄聲讀 gong3（投降 - 仄/三絳）— Type B 兩讀。' +
      '釭、龐 多韻字（亦見 一東），淙 跨入 二冬 — 跨韻字常見。',
    anchorPoem: {
      author: '荒野霜枫',
      title: '无眠',
      text:
        '无眠凝望旧鱼缸，心绪逡巡过大江。\n难控相思轻若絮，随风曼妙入罗窗。',
      rhymingCharacters: [
        { char: '缸', jyutping: 'gong1', pinyin: 'gāng' },
        { char: '江', jyutping: 'gong1', pinyin: 'jiāng' },
        { char: '窗', jyutping: 'coeng1', pinyin: 'chuāng' },
      ],
      gloss:
        'A contemporary 七絕 平起首句入韻 by 荒野霜枫. The three rhyme positions ' +
        '缸·江·窗 all sit in 上平 三江, the smallest of all 平水韻 平聲 categories. ' +
        'Modern Mandarin retains the -ang ending, distinguishing 三江 from sister ' +
        'rhyme 七陽 only by historical convention.',
    },
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
    seedCharacters: [
      { char: '侵', pinyin: 'qīn', jyutping: 'cam1', set: 1 },
      { char: '襟', pinyin: 'jīn', jyutping: 'kam1', set: 1 },
      { char: '今', pinyin: 'jīn', jyutping: 'gam1', set: 1 },
      { char: '心', pinyin: 'xīn', jyutping: 'sam1', set: 1 },
      { char: '金', pinyin: 'jīn', jyutping: 'gam1', set: 1 },
      { char: '深', pinyin: 'shēn', jyutping: 'sam1', set: 1 },
      { char: '林', pinyin: 'lín', jyutping: 'lam4', set: 1 },
      { char: '琴', pinyin: 'qín', jyutping: 'kam4', set: 1 },
      { char: '音', pinyin: 'yīn', jyutping: 'jam1', set: 1 },
      { char: '沉', pinyin: 'chén', jyutping: 'cam4', set: 1 },
      { char: '吟', pinyin: 'yín', jyutping: 'jam4', set: 1 },
      { char: '寻', pinyin: 'xún', jyutping: 'cam4', set: 1 },
      { char: '阴', pinyin: 'yīn', jyutping: 'jam1', set: 2 },
      { char: '簪', pinyin: 'zān', jyutping: 'zaam1', set: 2 },
      { char: '衾', pinyin: 'qīn', jyutping: 'kam1', set: 2 },
      { char: '禽', pinyin: 'qín', jyutping: 'kam4', set: 2 },
      { char: '斟', pinyin: 'zhēn', jyutping: 'zam1', set: 2 },
      { char: '砧', pinyin: 'zhēn', jyutping: 'zam1', set: 2 },
      { char: '临', pinyin: 'lín', jyutping: 'lam4', set: 2 },
      { char: '任', pinyin: 'rén', jyutping: 'jam4', set: 2 },
      { char: '沈', pinyin: 'chén', jyutping: 'cam4', set: 3, showMandarinAudio: true },
      { char: '喑', pinyin: 'yīn', jyutping: 'jam1', set: 3, showMandarinAudio: true },
      { char: '涔', pinyin: 'cén', jyutping: 'cam4', set: 3, showMandarinAudio: true },
      { char: '谌', pinyin: 'chén', jyutping: 'sam4', set: 3, showMandarinAudio: true },
      { char: '黔', pinyin: 'qián', jyutping: 'kim4', set: 4, showMandarinAudio: true },
      { char: '嶔', pinyin: 'qīn', jyutping: 'ham1', set: 4, showMandarinAudio: true },
    ],
    mnemonic:
      '十二侵收 -im，現代普通話作 -in，粵音猶存（心 sam1, 金 gam1）。' +
      '杜甫《春望》深·心·金·簪 為唐人最熟之 -m 例；今以《无题（七）》侵·襟·今 為當代誦例。' +
      '簪 多韻字（亦見 十三覃）；任 jam4 平聲（責任 - 十二侵）/ jam6 仄聲（任性 - 二十七沁）— Type B 兩讀。',
    anchorPoem: {
      author: '当代',
      title: '无题（七）',
      text:
        '孤衾独枕晓寒侵，幽梦缠绵泪湿襟。\n何必久怀畴昔事，人生屈指去来今。',
      rhymingCharacters: [
        { char: '侵', jyutping: 'cam1', pinyin: 'qīn' },
        { char: '襟', jyutping: 'kam1', pinyin: 'jīn' },
        { char: '今', jyutping: 'gam1', pinyin: 'jīn' },
      ],
      gloss:
        'A contemporary 七絕 平起首句入韻 in 下平 十二侵. The -m ending of classical ' +
        '十二侵 has merged into -n in modern Mandarin (qīn / jīn) but is preserved in ' +
        'Cantonese (cam1 / gam1), making the auditory category boundary teachable through ' +
        'the Cantonese reading. Compare 杜甫《春望》(深·心·金·簪) for the canonical Tang anchor.',
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
    seedCharacters: [
      { char: '潭', pinyin: 'tán', jyutping: 'taam4', set: 1 },
      { char: '龛', pinyin: 'kān', jyutping: 'ham1', set: 1 },
      { char: '蓝', pinyin: 'lán', jyutping: 'laam4', set: 1 },
      { char: '南', pinyin: 'nán', jyutping: 'naam4', set: 1 },
      { char: '男', pinyin: 'nán', jyutping: 'naam4', set: 1 },
      { char: '含', pinyin: 'hán', jyutping: 'ham4', set: 1 },
      { char: '三', pinyin: 'sān', jyutping: 'saam1', set: 1 },
      { char: '参', pinyin: 'cān', jyutping: 'caam1', set: 1 },
      { char: '庵', pinyin: 'ān', jyutping: 'am1', set: 1 },
      { char: '探', pinyin: 'tān', jyutping: 'taam1', set: 1, showMandarinAudio: true },
      { char: '惭', pinyin: 'cán', jyutping: 'caam4', set: 1 },
      { char: '蚕', pinyin: 'cán', jyutping: 'caam4', set: 1 },
      { char: '谭', pinyin: 'tán', jyutping: 'taam4', set: 2 },
      { char: '堪', pinyin: 'kān', jyutping: 'ham1', set: 2 },
      { char: '涵', pinyin: 'hán', jyutping: 'ham4', set: 2 },
      { char: '谙', pinyin: 'ān', jyutping: 'am1', set: 2 },
      { char: '耽', pinyin: 'dān', jyutping: 'daam1', set: 2 },
      { char: '岚', pinyin: 'lán', jyutping: 'laam4', set: 2 },
      { char: '贪', pinyin: 'tān', jyutping: 'taam1', set: 2 },
      { char: '酣', pinyin: 'hān', jyutping: 'ham4', set: 3, showMandarinAudio: true },
      { char: '篮', pinyin: 'lán', jyutping: 'laam4', set: 3, showMandarinAudio: true },
      { char: '婪', pinyin: 'lán', jyutping: 'laam4', set: 3, showMandarinAudio: true },
      { char: '媅', pinyin: 'dān', jyutping: 'daam1', set: 4, showMandarinAudio: true },
      { char: '蚶', pinyin: 'hān', jyutping: 'ham1', set: 4, showMandarinAudio: true },
    ],
    mnemonic:
      '十三覃收 -am，與 十二侵 -im / 十四鹽 -iam / 十五咸 -aam 同屬 -m 韻族。' +
      '粵音 龕 ham1, 潭 taam4 清楚保留 -m 收。' +
      '探 taam1 平聲（探手 - 十三覃），taam3 仄聲（探病 - 二十八勘）— Type B 兩讀，' +
      '現代普通話 tàn 已併入仄義。',
    anchorPoem: {
      author: '当代',
      title: '龙潭谒佛',
      text:
        '山僧邀我访龙潭，四壁青山尽佛龛。\n袅袅香烟禅韵润，慈悲入水映天蓝。',
      rhymingCharacters: [
        { char: '潭', jyutping: 'taam4', pinyin: 'tán' },
        { char: '龛', jyutping: 'ham1', pinyin: 'kān' },
        { char: '蓝', jyutping: 'laam4', pinyin: 'lán' },
      ],
      gloss:
        'A contemporary 七絕 平起首句入韻 in 下平 十三覃. The -am ending preserved in ' +
        'Cantonese (taam4 / ham1 / laam4) collapses into -an in modern Mandarin. ' +
        '龕 (ham1 in Cantonese) is the rarer of the three high-frequency Set 1 chars; ' +
        'its inclusion in the anchor anchors the Buddhist-imagery context typical of ' +
        '十三覃 compositions.',
    },
  },

  {
    id: 'xiaping-14-yan',
    ordinal: 14,
    label: '十四鹽',
    rhymeCharacter: '盐',
    tone: 'ping',
    half: 'xiaping',
    tier: 3,
    family: 'm-endings-family',
    confusables: ['xiaping-12-qin', 'xiaping-13-tan', 'xiaping-15-xian'],
    modernRime: '-an / -ian (was -iam)',
    seedCharacters: [
      { char: '甜', pinyin: 'tián', jyutping: 'tim4', set: 1 },
      { char: '帘', pinyin: 'lián', jyutping: 'lim4', set: 1 },
      { char: '严', pinyin: 'yán', jyutping: 'jim4', set: 1 },
      { char: '盐', pinyin: 'yán', jyutping: 'jim4', set: 1 },
      { char: '廉', pinyin: 'lián', jyutping: 'lim4', set: 1 },
      { char: '兼', pinyin: 'jiān', jyutping: 'gim1', set: 1 },
      { char: '添', pinyin: 'tiān', jyutping: 'tim1', set: 1 },
      { char: '占', pinyin: 'zhān', jyutping: 'zim1', set: 1 },
      { char: '沾', pinyin: 'zhān', jyutping: 'zim1', set: 1 },
      { char: '谦', pinyin: 'qiān', jyutping: 'him1', set: 1 },
      { char: '拈', pinyin: 'niān', jyutping: 'nim1', set: 1 },
      { char: '蟾', pinyin: 'chán', jyutping: 'sim4', set: 1 },
      { char: '簽', pinyin: 'qiān', jyutping: 'cim1', set: 2 },
      { char: '詹', pinyin: 'zhān', jyutping: 'zim1', set: 2 },
      { char: '渐', pinyin: 'jiān', jyutping: 'zim1', set: 2 },
      { char: '檐', pinyin: 'yán', jyutping: 'jim4', set: 2 },
      { char: '髯', pinyin: 'rán', jyutping: 'jim4', set: 2 },
      { char: '厌', pinyin: 'yān', jyutping: 'jim1', set: 2, showMandarinAudio: true },
      { char: '砭', pinyin: 'biān', jyutping: 'bim1', set: 2 },
      { char: '黏', pinyin: 'nián', jyutping: 'nim1', set: 3, showMandarinAudio: true },
      { char: '歼', pinyin: 'jiān', jyutping: 'cim1', set: 3, showMandarinAudio: true },
      { char: '籤', pinyin: 'qiān', jyutping: 'cim1', set: 3, showMandarinAudio: true },
      { char: '阎', pinyin: 'yán', jyutping: 'jim4', set: 3, showMandarinAudio: true },
      { char: '嫌', pinyin: 'xián', jyutping: 'jim4', set: 3, showMandarinAudio: true },
      { char: '燖', pinyin: 'xún', jyutping: 'cim4', set: 3, showMandarinAudio: true },
      { char: '鹣', pinyin: 'jiān', jyutping: 'gim1', set: 4, showMandarinAudio: true },
      { char: '鬑', pinyin: 'lián', jyutping: 'lim4', set: 4, showMandarinAudio: true },
      { char: '韱', pinyin: 'xiān', jyutping: 'cim1', set: 4, showMandarinAudio: true },
      { char: '苫', pinyin: 'shān', jyutping: 'sim1', set: 4, showMandarinAudio: true },
    ],
    mnemonic:
      '十四鹽收 -iam，現代併入 -ian。粵音 甜 tim4, 帘 lim4 清楚保留 -m 收。' +
      '渐 zim1 平聲為流入·浸染 義（廣韻 子廉切），zim6 仄聲為逐漸 義（仄/二十八琰）— ' +
      '詩律必用平讀 zim1。厌 jim1 平聲為飽足 義（《詩經》「不可饜」），jim3 仄聲為厭惡 義 — 同類 Type B 字。' +
      '簽/籤 此處保留繁體以避免簡體合流為「签」。',
    anchorPoem: {
      author: '当代',
      title: '山寺午钟',
      text:
        '溟蒙细雨惠风甜，黄雀栖身唱画帘。\n捧钵沙尼歌佛号，斋堂肃静亦庄严。',
      rhymingCharacters: [
        { char: '甜', jyutping: 'tim4', pinyin: 'tián' },
        { char: '帘', jyutping: 'lim4', pinyin: 'lián' },
        { char: '严', jyutping: 'jim4', pinyin: 'yán' },
      ],
      gloss:
        'A contemporary 七絕 平起首句入韻 in 下平 十四鹽. The -iam ending of classical ' +
        '十四鹽 is preserved cleanly in Cantonese (tim4 / lim4 / jim4) but collapses into ' +
        '-ian in modern Mandarin. 渐 in this rhyme group is the canonical Type B trap — ' +
        '平聲 jiān (flow into) vs 仄聲 jiàn (gradually); compositions in 十四鹽 require ' +
        'the 平 reading.',
    },
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
    seedCharacters: [
      { char: '衫', pinyin: 'shān', jyutping: 'saam1', set: 1 },
      { char: '岩', pinyin: 'yán', jyutping: 'ngaam4', set: 1 },
      { char: '芟', pinyin: 'shān', jyutping: 'saam1', set: 1 },
      { char: '咸', pinyin: 'xián', jyutping: 'haam4', set: 1 },
      { char: '衔', pinyin: 'xián', jyutping: 'haam4', set: 1 },
      { char: '帆', pinyin: 'fān', jyutping: 'faan4', set: 1 },
      { char: '凡', pinyin: 'fán', jyutping: 'faan4', set: 1 },
      { char: '杉', pinyin: 'shān', jyutping: 'saam1', set: 1 },
      { char: '监', pinyin: 'jiān', jyutping: 'gaam1', set: 1 },
      { char: '缄', pinyin: 'jiān', jyutping: 'gaam1', set: 1 },
      { char: '巉', pinyin: 'chán', jyutping: 'caam4', set: 1 },
      { char: '谗', pinyin: 'chán', jyutping: 'caam4', set: 1 },
      { char: '嵌', pinyin: 'qiān', jyutping: 'haam1', set: 2, showMandarinAudio: true },
      { char: '搀', pinyin: 'chān', jyutping: 'caam1', set: 2 },
      { char: '喃', pinyin: 'nán', jyutping: 'naam4', set: 2 },
      { char: '巖', pinyin: 'yán', jyutping: 'ngaam4', set: 2 },
      { char: '馋', pinyin: 'chán', jyutping: 'caam4', set: 3, showMandarinAudio: true },
      { char: '詀', pinyin: 'zhān', jyutping: 'zaam1', set: 3, showMandarinAudio: true },
      { char: '摻', pinyin: 'chān', jyutping: 'caam1', set: 4, showMandarinAudio: true },
    ],
    mnemonic:
      '十五咸收 -aam，-m 韻族中最稀。粵音 衫 saam1, 岩 ngaam4 清楚保留 -m。' +
      '嵌 haam1 平聲為山深·險峻貌（十五咸），haam3 仄聲為陷入 義（仄/二十八勘）— Type B 兩讀；' +
      '現代 qiàn 已合流仄義。巖 此處保留繁體：簡體 岩 已在 Set 1 為錨字，巖 為其異體變換教學。',
    anchorPoem: {
      author: '当代',
      title: '回归自然',
      text:
        '小隐泉乡衣短衫，芒鞋竹笠宿南岩。\n披星排雾巡田垄，浇水拿虫稗子芟。',
      rhymingCharacters: [
        { char: '衫', jyutping: 'saam1', pinyin: 'shān' },
        { char: '岩', jyutping: 'ngaam4', pinyin: 'yán' },
        { char: '芟', jyutping: 'saam1', pinyin: 'shān' },
      ],
      gloss:
        'A contemporary 七絕 平起首句入韻 in 下平 十五咸. The -aam ending is preserved ' +
        'in Cantonese (saam1 / ngaam4) but lost entirely in modern Mandarin. 十五咸 is ' +
        'the thinnest of the four -m rhyme groups, with most chars surviving into modern ' +
        'usage as Cantonese-only readings. Note: anchor text uses 岩 throughout per 平水 ' +
        'strictness; the 巚 originally written by the poet has been normalized.',
    },
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
