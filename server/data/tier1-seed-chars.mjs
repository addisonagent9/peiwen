/**
 * Tier 1 seed characters — flat array for drill queue generation.
 * Mirrors src/data/pingshui/trainer-curriculum.ts Tier 1 seedCharacters.
 */

export const TIER1_SEED_CHARS = [
  // 一东 (shangping-01-dong)
  { char: '东', rhymeId: 'shangping-01-dong', pinyin: 'dōng', jyutping: 'dung1' },
  { char: '风', rhymeId: 'shangping-01-dong', pinyin: 'fēng', jyutping: 'fung1' },
  { char: '空', rhymeId: 'shangping-01-dong', pinyin: 'kōng', jyutping: 'hung1' },
  { char: '中', rhymeId: 'shangping-01-dong', pinyin: 'zhōng', jyutping: 'zung1' },
  { char: '红', rhymeId: 'shangping-01-dong', pinyin: 'hóng', jyutping: 'hung4' },
  { char: '同', rhymeId: 'shangping-01-dong', pinyin: 'tóng', jyutping: 'tung4' },
  { char: '通', rhymeId: 'shangping-01-dong', pinyin: 'tōng', jyutping: 'tung1' },
  { char: '翁', rhymeId: 'shangping-01-dong', pinyin: 'wēng', jyutping: 'jung1' },
  { char: '弓', rhymeId: 'shangping-01-dong', pinyin: 'gōng', jyutping: 'gung1' },
  { char: '宫', rhymeId: 'shangping-01-dong', pinyin: 'gōng', jyutping: 'gung1' },
  { char: '功', rhymeId: 'shangping-01-dong', pinyin: 'gōng', jyutping: 'gung1' },
  { char: '虹', rhymeId: 'shangping-01-dong', pinyin: 'hóng', jyutping: 'hung4' },

  // 七阳 (xiaping-07-yang)
  { char: '阳', rhymeId: 'xiaping-07-yang', pinyin: 'yáng', jyutping: 'joeng4' },
  { char: '光', rhymeId: 'xiaping-07-yang', pinyin: 'guāng', jyutping: 'gwong1' },
  { char: '霜', rhymeId: 'xiaping-07-yang', pinyin: 'shuāng', jyutping: 'soeng1' },
  { char: '乡', rhymeId: 'xiaping-07-yang', pinyin: 'xiāng', jyutping: 'hoeng1' },
  { char: '香', rhymeId: 'xiaping-07-yang', pinyin: 'xiāng', jyutping: 'hoeng1' },
  { char: '长', rhymeId: 'xiaping-07-yang', pinyin: 'cháng', jyutping: 'coeng4' },
  { char: '常', rhymeId: 'xiaping-07-yang', pinyin: 'cháng', jyutping: 'soeng4' },
  { char: '场', rhymeId: 'xiaping-07-yang', pinyin: 'chǎng', jyutping: 'coeng4' },
  { char: '章', rhymeId: 'xiaping-07-yang', pinyin: 'zhāng', jyutping: 'zoeng1' },
  { char: '羊', rhymeId: 'xiaping-07-yang', pinyin: 'yáng', jyutping: 'joeng4' },
  { char: '方', rhymeId: 'xiaping-07-yang', pinyin: 'fāng', jyutping: 'fong1' },
  { char: '凉', rhymeId: 'xiaping-07-yang', pinyin: 'liáng', jyutping: 'loeng4' },

  // 十一尤 (xiaping-11-you)
  { char: '尤', rhymeId: 'xiaping-11-you', pinyin: 'yóu', jyutping: 'jau4' },
  { char: '忧', rhymeId: 'xiaping-11-you', pinyin: 'yōu', jyutping: 'jau1' },
  { char: '秋', rhymeId: 'xiaping-11-you', pinyin: 'qiū', jyutping: 'cau1' },
  { char: '楼', rhymeId: 'xiaping-11-you', pinyin: 'lóu', jyutping: 'lau4' },
  { char: '流', rhymeId: 'xiaping-11-you', pinyin: 'liú', jyutping: 'lau4' },
  { char: '舟', rhymeId: 'xiaping-11-you', pinyin: 'zhōu', jyutping: 'zau1' },
  { char: '留', rhymeId: 'xiaping-11-you', pinyin: 'liú', jyutping: 'lau4' },
  { char: '收', rhymeId: 'xiaping-11-you', pinyin: 'shōu', jyutping: 'sau1' },
  { char: '头', rhymeId: 'xiaping-11-you', pinyin: 'tóu', jyutping: 'tau4' },
  { char: '愁', rhymeId: 'xiaping-11-you', pinyin: 'chóu', jyutping: 'sau4' },
  { char: '游', rhymeId: 'xiaping-11-you', pinyin: 'yóu', jyutping: 'jau4' },
  { char: '州', rhymeId: 'xiaping-11-you', pinyin: 'zhōu', jyutping: 'zau1' },

  // 六麻 (xiaping-06-ma)
  { char: '麻', rhymeId: 'xiaping-06-ma', pinyin: 'má', jyutping: 'maa4' },
  { char: '家', rhymeId: 'xiaping-06-ma', pinyin: 'jiā', jyutping: 'gaa1' },
  { char: '花', rhymeId: 'xiaping-06-ma', pinyin: 'huā', jyutping: 'faa1' },
  { char: '霞', rhymeId: 'xiaping-06-ma', pinyin: 'xiá', jyutping: 'haa4' },
  { char: '华', rhymeId: 'xiaping-06-ma', pinyin: 'huá', jyutping: 'waa4' },
  { char: '沙', rhymeId: 'xiaping-06-ma', pinyin: 'shā', jyutping: 'saa1' },
  { char: '斜', rhymeId: 'xiaping-06-ma', pinyin: 'xié', jyutping: 'ce4' },
  { char: '茶', rhymeId: 'xiaping-06-ma', pinyin: 'chá', jyutping: 'caa4' },
  { char: '涯', rhymeId: 'xiaping-06-ma', pinyin: 'yá', jyutping: 'ngaai4' },
  { char: '鸦', rhymeId: 'xiaping-06-ma', pinyin: 'yā', jyutping: 'aa1' },
  { char: '加', rhymeId: 'xiaping-06-ma', pinyin: 'jiā', jyutping: 'gaa1' },
  { char: '瓜', rhymeId: 'xiaping-06-ma', pinyin: 'guā', jyutping: 'gwaa1' },

  // 五歌 (xiaping-05-ge)
  { char: '歌', rhymeId: 'xiaping-05-ge', pinyin: 'gē', jyutping: 'go1' },
  { char: '多', rhymeId: 'xiaping-05-ge', pinyin: 'duō', jyutping: 'do1' },
  { char: '何', rhymeId: 'xiaping-05-ge', pinyin: 'hé', jyutping: 'ho4' },
  { char: '河', rhymeId: 'xiaping-05-ge', pinyin: 'hé', jyutping: 'ho4' },
  { char: '过', rhymeId: 'xiaping-05-ge', pinyin: 'guò', jyutping: 'gwo3' },
  { char: '波', rhymeId: 'xiaping-05-ge', pinyin: 'bō', jyutping: 'bo1' },
  { char: '磨', rhymeId: 'xiaping-05-ge', pinyin: 'mó', jyutping: 'mo4' },
  { char: '罗', rhymeId: 'xiaping-05-ge', pinyin: 'luó', jyutping: 'lo4' },
  { char: '娥', rhymeId: 'xiaping-05-ge', pinyin: 'é', jyutping: 'ngo4' },
  { char: '蛾', rhymeId: 'xiaping-05-ge', pinyin: 'é', jyutping: 'ngo4' },
  { char: '哥', rhymeId: 'xiaping-05-ge', pinyin: 'gē', jyutping: 'go1' },
  { char: '柯', rhymeId: 'xiaping-05-ge', pinyin: 'kē', jyutping: 'o1' },
];

export const TIER1_RHYME_IDS = [
  'shangping-01-dong',
  'xiaping-07-yang',
  'xiaping-11-you',
  'xiaping-06-ma',
  'xiaping-05-ge',
];
