#!/usr/bin/env node
// Normalize all pingshui datasets to { [char]: Array<{ tone: "平"|"仄", rhyme: string }> }
// All rhyme names are normalized to TRADITIONAL characters to match our dictionary.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const auditDir = resolve(root, 'data/audit');
const refDir = resolve(root, 'data/references');

mkdirSync(auditDir, { recursive: true });

// ─── Load SC→TC character mapping ───
// tc2sc.json maps Traditional→Simplified; we invert to get Simplified→Traditional
let sc2tc = {};
try {
  const tc2sc = JSON.parse(readFileSync(resolve(refDir, 'tc2sc.json'), 'utf8'));
  for (const [trad, simp] of Object.entries(tc2sc)) {
    // Only map if it's a 1:1 mapping (single char to single char)
    if (simp.length === 1 && trad.length === 1) {
      sc2tc[simp] = trad;
    }
  }
  console.log(`[normalize] loaded ${Object.keys(sc2tc).length} SC→TC char mappings`);
} catch (e) {
  console.warn('[normalize] could not load tc2sc.json, proceeding without char conversion');
}

function toTraditionalChar(ch) {
  return sc2tc[ch] || ch;
}

// ─── Simplified → Traditional rhyme name mapping (106 groups) ───
const simpToTrad = {
  // 上平
  '一东': '一東', '四支': '四支', '五微': '五微', '六鱼': '六魚', '七虞': '七虞',
  '八齐': '八齊', '九佳': '九佳', '十灰': '十灰', '十一真': '十一真',
  '十二文': '十二文', '十三元': '十三元', '十四寒': '十四寒', '十五删': '十五刪',
  // 下平
  '一先': '一先', '二萧': '二蕭', '三肴': '三肴', '四豪': '四豪', '五歌': '五歌',
  '六麻': '六麻', '七阳': '七陽', '八庚': '八庚', '九青': '九青', '十蒸': '十蒸',
  '十一尤': '十一尤', '十二侵': '十二侵', '十三覃': '十三覃', '十四盐': '十四鹽',
  '十五咸': '十五咸',
  // 上声
  '一董': '一董', '二肿': '二腫', '三讲': '三講', '四纸': '四紙', '五尾': '五尾',
  '六语': '六語', '七麌': '七麌', '八荠': '八薺', '九蟹': '九蟹', '十贿': '十賄',
  '十一轸': '十一軫', '十二吻': '十二吻', '十三阮': '十三阮', '十四旱': '十四旱',
  '十五潸': '十五潸', '十六铣': '十六銑', '十七筱': '十七筱', '十八巧': '十八巧',
  '十九皓': '十九皓', '二十哿': '二十哿', '二十一马': '二十一馬',
  '二十二养': '二十二養', '二十三梗': '二十三梗', '二十四迥': '二十四迥',
  '二十五有': '二十五有', '二十六寝': '二十六寢', '二十七感': '二十七感',
  '二十八俭': '二十八琰', '二十九豏': '二十九豏',
  // 去声
  '一送': '一送', '二宋': '二宋', '三绛': '三絳', '四寘': '四寘', '五未': '五未',
  '六御': '六御', '七遇': '七遇', '八霁': '八霽', '九泰': '九泰', '十卦': '十卦',
  '十一队': '十一隊', '十二震': '十二震', '十三问': '十三問', '十四愿': '十四願',
  '十五翰': '十五翰', '十六谏': '十六諫', '十七霰': '十七霰', '十八啸': '十八嘯',
  '十九效': '十九效', '二十号': '二十號', '二十一个': '二十一箇',
  '二十二祃': '二十二禡', '二十三漾': '二十三漾', '二十四敬': '二十四敬',
  '二十五径': '二十五徑', '二十六宥': '二十六宥', '二十七沁': '二十七沁',
  '二十八勘': '二十八勘', '二十九艳': '二十九艷', '三十陷': '三十陷',
  // 入声
  '一屋': '一屋', '二沃': '二沃', '三觉': '三覺', '四质': '四質', '五物': '五物',
  '六月': '六月', '七曷': '七曷', '八黠': '八黠', '九屑': '九屑', '十药': '十藥',
  '十一陌': '十一陌', '十二锡': '十二錫', '十三职': '十三職', '十四缉': '十四緝',
  '十五合': '十五合', '十六叶': '十六葉', '十七洽': '十七洽',
};

// Also build identity map for already-traditional names
const tradNames = new Set([
  '一東','二冬','三江','四支','五微','六魚','七虞','八齊','九佳','十灰',
  '十一真','十二文','十三元','十四寒','十五刪',
  '一先','二蕭','三肴','四豪','五歌','六麻','七陽','八庚','九青','十蒸',
  '十一尤','十二侵','十三覃','十四鹽','十五咸',
  '一董','二腫','三講','四紙','五尾','六語','七麌','八薺','九蟹','十賄',
  '十一軫','十二吻','十三阮','十四旱','十五潸','十六銑','十七筱','十八巧',
  '十九皓','二十哿','二十一馬','二十二養','二十三梗','二十四迥','二十五有',
  '二十六寢','二十七感','二十八琰','二十九豏',
  '一送','二宋','三絳','四寘','五未','六御','七遇','八霽','九泰','十卦',
  '十一隊','十二震','十三問','十四願','十五翰','十六諫','十七霰','十八嘯',
  '十九效','二十號','二十一箇','二十二禡','二十三漾','二十四敬','二十五徑',
  '二十六宥','二十七沁','二十八勘','二十九艷','三十陷',
  '一屋','二沃','三覺','四質','五物','六月','七曷','八黠','九屑','十藥',
  '十一陌','十二錫','十三職','十四緝','十五合','十六葉','十七洽',
]);

function normalizeRhyme(r) {
  // Strip BOM, whitespace, and section prefixes like "入声"
  let clean = r.replace(/[\ufeff\s]/g, '');
  // Charles uses "入声一屋" format for 入声 rhymes — strip "入声" prefix
  clean = clean.replace(/^入声/, '');
  if (tradNames.has(clean)) return clean;
  if (simpToTrad[clean]) return simpToTrad[clean];
  return clean; // return as-is if unmapped
}

function mapTone(t) {
  if (t === '平') return '平';
  return '仄'; // 上,去,入 all map to 仄
}

// ─── Our data ───
function normalizeOurs() {
  const raw = JSON.parse(readFileSync(resolve(root, 'src/data/pingshui.json'), 'utf8'));
  const chars = raw.chars;
  const result = {};
  let count = 0;
  for (const [ch, readings] of Object.entries(chars)) {
    result[ch] = readings.map(r => ({
      tone: mapTone(r.tone),
      rhyme: normalizeRhyme(r.rhyme),
    }));
    count++;
  }
  console.log(`[normalize] ours: ${count} chars`);
  return result;
}

// ─── Charles (organized by rhyme group) ───
function normalizeCharles() {
  const raw = JSON.parse(readFileSync(resolve(refDir, 'charles.json'), 'utf8'));
  const result = {};
  let count = 0, skipped = 0;

  const sectionToneMap = {
    '上平声部': '平', '下平声部': '平',
    '上声部': '仄', '去声部': '仄', '入声部': '仄',
    '上平聲部': '平', '下平聲部': '平',
    '上聲部': '仄', '去聲部': '仄', '入聲部': '仄',
  };

  for (const [section, groups] of Object.entries(raw)) {
    const tone = sectionToneMap[section];
    if (!tone) {
      console.log(`[normalize] charles: unknown section "${section}", skipping`);
      skipped++;
      continue;
    }
    for (const [rhymeRaw, chars] of Object.entries(groups)) {
      const rhyme = normalizeRhyme(rhymeRaw);
      for (const chRaw of chars) {
        if (!chRaw || chRaw.length !== 1) { skipped++; continue; }
        const ch = toTraditionalChar(chRaw);
        if (!result[ch]) result[ch] = [];
        const exists = result[ch].some(r => r.tone === tone && r.rhyme === rhyme);
        if (!exists) {
          result[ch].push({ tone, rhyme });
          count++;
        }
      }
    }
  }
  console.log(`[normalize] charles: ${Object.keys(result).length} chars, ${count} readings, ${skipped} skipped`);
  return result;
}

// ─── jkak (per-char) ───
function normalizeJkak() {
  const raw = JSON.parse(readFileSync(resolve(refDir, 'jkak.json'), 'utf8'));
  const result = {};
  let count = 0, skipped = 0;

  const toneMap = { '平': '平', '上': '仄', '去': '仄', '入': '仄' };

  for (const [chRaw, readings] of Object.entries(raw)) {
    const stripped = chRaw.replace(/[\ufeff]/g, '');
    if (!stripped || stripped.length !== 1) { skipped++; continue; }
    const ch = toTraditionalChar(stripped);
    if (!result[ch]) result[ch] = [];
    for (const r of readings) {
      const tone = toneMap[r[0]];
      if (!tone) { skipped++; continue; }
      const rhyme = normalizeRhyme(r[1]);
      const exists = result[ch].some(x => x.tone === tone && x.rhyme === rhyme);
      if (!exists) {
        result[ch].push({ tone, rhyme });
        count++;
      }
    }
    if (result[ch].length === 0) delete result[ch];
  }
  console.log(`[normalize] jkak: ${Object.keys(result).length} chars, ${count} readings, ${skipped} skipped`);
  return result;
}

// ─── cope (rhymebooks.json → 平水韵) ───
function normalizeCope() {
  const raw = JSON.parse(readFileSync(resolve(refDir, 'cope.json'), 'utf8'));
  const ps = raw['平水韵'];
  const result = {};
  let count = 0;

  // 平声韵目 (30 groups) — use simplified, will be normalized
  const pingNames = [
    '一东','二冬','三江','四支','五微','六鱼','七虞','八齐','九佳','十灰',
    '十一真','十二文','十三元','十四寒','十五删',
    '一先','二萧','三肴','四豪','五歌','六麻','七阳','八庚','九青','十蒸',
    '十一尤','十二侵','十三覃','十四盐','十五咸',
  ];

  const shangNames = [
    '一董','二肿','三讲','四纸','五尾','六语','七麌','八荠','九蟹','十贿',
    '十一轸','十二吻','十三阮','十四旱','十五潸',
    '十六铣','十七筱','十八巧','十九皓','二十哿',
    '二十一马','二十二养','二十三梗','二十四迥','二十五有',
    '二十六寝','二十七感','二十八俭','二十九豏',
  ];

  const quNames = [
    '一送','二宋','三绛','四寘','五未','六御','七遇','八霁','九泰','十卦',
    '十一队','十二震','十三问','十四愿','十五翰','十六谏',
    '十七霰','十八啸','十九效','二十号','二十一个',
    '二十二祃','二十三漾','二十四敬','二十五径','二十六宥',
    '二十七沁','二十八勘','二十九艳','三十陷',
  ];

  const ruNames = [
    '一屋','二沃','三觉','四质','五物','六月','七曷','八黠','九屑','十药',
    '十一陌','十二锡','十三职','十四缉','十五合','十六叶','十七洽',
  ];

  const allZeGroups = [...shangNames, ...quNames, ...ruNames];

  // Process 平声
  for (let i = 0; i < ps[0].length; i++) {
    const rhyme = normalizeRhyme(pingNames[i] || `平${i+1}`);
    const chars = ps[0][i];
    for (const chRaw of chars) {
      if (!chRaw || chRaw.trim() === '') continue;
      const ch = toTraditionalChar(chRaw);
      if (!result[ch]) result[ch] = [];
      const exists = result[ch].some(r => r.tone === '平' && r.rhyme === rhyme);
      if (!exists) {
        result[ch].push({ tone: '平', rhyme });
        count++;
      }
    }
  }

  // Process 仄声
  for (let i = 0; i < ps[1].length; i++) {
    const rhyme = normalizeRhyme(allZeGroups[i] || `仄${i+1}`);
    const chars = ps[1][i];
    for (const chRaw of chars) {
      if (!chRaw || chRaw.trim() === '') continue;
      const ch = toTraditionalChar(chRaw);
      if (!result[ch]) result[ch] = [];
      const exists = result[ch].some(r => r.tone === '仄' && r.rhyme === rhyme);
      if (!exists) {
        result[ch].push({ tone: '仄', rhyme });
        count++;
      }
    }
  }

  console.log(`[normalize] cope: ${Object.keys(result).length} chars, ${count} readings`);
  return result;
}

// ─── Run ───
try {
  const ours = normalizeOurs();
  writeFileSync(resolve(auditDir, 'ours.json'), JSON.stringify(ours, null, 2));

  const charles = normalizeCharles();
  writeFileSync(resolve(auditDir, 'ref_charles.json'), JSON.stringify(charles, null, 2));

  const jkak = normalizeJkak();
  writeFileSync(resolve(auditDir, 'ref_jkak.json'), JSON.stringify(jkak, null, 2));

  const cope = normalizeCope();
  writeFileSync(resolve(auditDir, 'ref_cope.json'), JSON.stringify(cope, null, 2));

  console.log('[normalize] done');
} catch (e) {
  console.error('[normalize] error:', e.message);
  process.exit(1);
}
