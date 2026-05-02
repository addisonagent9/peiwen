// Post-build patches for known dictionary issues.
// Run after build-pingshui.mjs to fix specific entries.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.resolve(__dirname, "../src/data/pingshui.json");
const d = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

// Helper: add char to rhyme bucket if not present
function ensureBucket(char, entry) {
  const bucket = d.rhymes[entry.rhyme];
  if (bucket && !bucket.chars.includes(char)) bucket.chars.push(char);
}

// Helper: replace entries for a simplified char with traditional form's entries first
function fixSimplified(simp, trad) {
  const tradEntries = d.chars[trad];
  const simpEntries = d.chars[simp] || [];
  if (!tradEntries) { console.log(`  WARN: no trad entry for ${trad}`); return; }
  const tradKeys = new Set(tradEntries.map(e => e.tone + "|" + e.rhyme));
  const uniqueSimp = simpEntries.filter(e => !tradKeys.has(e.tone + "|" + e.rhyme));
  d.chars[simp] = [...tradEntries, ...uniqueSimp];
  for (const e of d.chars[simp]) ensureBucket(simp, e);
  console.log(`  ${simp} → ${d.chars[simp].map(e => e.tone + " " + e.rhyme).join(" | ")}`);
}

// Helper: reorder entries so the first matching condition comes first
function reorder(char, preferTone) {
  const entries = d.chars[char];
  if (!entries || entries.length < 2) return;
  const idx = entries.findIndex(e => preferTone === "入" ? e.tone === "入" : (e.tone === "仄" || e.tone === "入") === (preferTone === "仄"));
  if (idx > 0) {
    const [preferred] = entries.splice(idx, 1);
    entries.unshift(preferred);
    console.log(`  ${char} reordered → ${entries.map(e => e.tone + " " + e.rhyme).join(" | ")}`);
  }
}

// Helper: reorder entries so the entry matching targetRhyme comes first
function reorderToRhyme(char, targetRhyme) {
  const entries = d.chars[char];
  if (!entries || entries.length < 2) return;
  const idx = entries.findIndex(e => e.rhyme === targetRhyme);
  if (idx > 0) {
    const [preferred] = entries.splice(idx, 1);
    entries.unshift(preferred);
    console.log(`  ${char} reordered → ${entries.map(e => e.tone + " " + e.rhyme).join(" | ")}`);
  }
}

console.log("Patching pingshui.json...");

// Group A: 8 simplified chars with wrong default reading
fixSimplified("种", "種");
fixSimplified("据", "據");
fixSimplified("干", "幹");
fixSimplified("肮", "骯");
fixSimplified("睾", "睪");
fixSimplified("宁", "寧");
fixSimplified("听", "聽");
fixSimplified("几", "幾");

// Group B1: 徑 — reorder so 仄 comes first
reorder("徑", "仄");

// Group B2: 研 — add entry if missing
if (!d.chars["研"]) {
  d.chars["研"] = [{ tone: "平", group: "下平", rhyme: "一先" }];
  ensureBucket("研", d.chars["研"][0]);
  console.log(`  研 added → 平 一先`);
} else {
  console.log(`  研 already exists`);
}

// Group C: 5 entries from triangulation audit (critical-13-review.md)

// 暖: multiple classical readings
//   Default: 仄 十四旱 — nuǎn, "warm" (dominant classical usage)
//   Secondary: 仄 十三阮 — nuǎn, alternate 上聲 placement
//   Secondary: 仄 十一隊 — ài, variant of 曖 (昏暗不明/掩蔽), rare
//   Secondary: 平 十三元 — xuān, "soft/gentle", rare literary
d.chars["暖"] = [
  { tone: "仄", group: "上聲", rhyme: "十四旱" },
  { tone: "仄", group: "上聲", rhyme: "十三阮" },
  { tone: "仄", group: "去聲", rhyme: "十一隊" },
  { tone: "平", group: "上平", rhyme: "十三元" }
];
for (const e of d.chars["暖"]) ensureBucket("暖", e);
console.log(`  暖 → ${d.chars["暖"].map(e => e.tone + " " + e.rhyme).join(" | ")}`);

// 臒: was 入 十藥 (wrong). qú → 平 七虞.
const oldOcr = d.chars["臒"] || [];
d.chars["臒"] = [
  { tone: "平", group: "上平", rhyme: "七虞" },
  ...oldOcr
];
for (const e of d.chars["臒"]) ensureBucket("臒", e);
console.log(`  臒 → ${d.chars["臒"].map(e => e.tone + " " + e.rhyme).join(" | ")}`);

// 嚙: was 仄 十八巧 (wrong rhyme). niè → 入聲 九屑.
const oldNie = d.chars["嚙"] || [];
d.chars["嚙"] = [
  { tone: "入", group: "入聲", rhyme: "九屑" },
  ...oldNie.filter(e => e.rhyme !== "九屑")
];
for (const e of d.chars["嚙"]) ensureBucket("嚙", e);
console.log(`  嚙 → ${d.chars["嚙"].map(e => e.tone + " " + e.rhyme).join(" | ")}`);

// 徘: was 平 九佳 (wrong rhyme). pái → 平 十灰.
const oldPai = d.chars["徘"] || [];
d.chars["徘"] = [
  { tone: "平", group: "上平", rhyme: "十灰" },
  ...oldPai.filter(e => e.rhyme !== "十灰")
];
for (const e of d.chars["徘"]) ensureBucket("徘", e);
console.log(`  徘 → ${d.chars["徘"].map(e => e.tone + " " + e.rhyme).join(" | ")}`);

// 濫: was 仄 二十九豏 (wrong rhyme). làn → 仄 二十八勘.
const oldLan = d.chars["濫"] || [];
d.chars["濫"] = [
  { tone: "仄", group: "去聲", rhyme: "二十八勘" },
  ...oldLan.filter(e => e.rhyme !== "二十八勘"),
  { tone: "仄", group: "上聲", rhyme: "二十七感" }
].filter((e, i, a) => a.findIndex(x => x.tone === e.tone && x.rhyme === e.rhyme) === i);
for (const e of d.chars["濫"]) ensureBucket("濫", e);
console.log(`  濫 → ${d.chars["濫"].map(e => e.tone + " " + e.rhyme).join(" | ")}`);

// === Audit batches 3+4: source reconstruction (before Group D mirror) ===
// These run first so Group D's loop sees the corrected source arrays.

(function reconstruct撏() {
  d.chars["撏"] = [
    { tone: "平", group: "下平", rhyme: "十三覃" },
    { tone: "平", group: "下平", rhyme: "十二侵" },
    { tone: "平", group: "下平", rhyme: "十四鹽" }
  ];
  for (const e of d.chars["撏"]) ensureBucket("撏", e);
  console.log("  撏 reconstructed → 平 十三覃 | 平 十二侵 | 平 十四鹽");
})();

(function reconstruct嶮() {
  d.chars["嶮"] = [
    { tone: "平", group: "下平", rhyme: "十四鹽" },
    { tone: "仄", group: "上聲", rhyme: "二十八琰" }
  ];
  for (const e of d.chars["嶮"]) ensureBucket("嶮", e);
  console.log("  嶮 reconstructed → 平 十四鹽 | 仄 二十八琰");
})();

// Group D: alternate-繁 variant mirroring (not in tc2sc.json)
// These are variant traditional forms where the source CSV used one form
// but the common-usage form is different. Mirror entries bidirectionally.
// NOTE: Also mirrored in server/lib/variants.mjs GROUP_D_PAIRS for runtime equality checks.
const variantPairs = [
  ["牀", "床"],   // 牀 (source) → 床 (common)
  ["畱", "留"],   // 畱 (source) → 留 (common)
  ["眞", "真"],   // 眞 (source) → 真 (common)
  ["鈎", "鉤"],   // 鈎 (source) → 鉤 (common)
  ["鈎", "钩"],   // 鈎 (source) → 钩 (simplified)
  // Audit-batch-2 variant-key sweep (榆/俞/喻 common forms absent,
  // rare alternate-繁 variants 楡/兪/喩 present with correct readings)
  ["楡", "榆"],   // 楡 (source) → 榆 (common)
  ["兪", "俞"],   // 兪 (source) → 俞 (common)
  ["喩", "喻"],   // 喩 (source) → 喻 (common)
  // Audit batch 3: 恆/恒
  ["恆", "恒"],   // 恆 (source) → 恒 (common)
  // Audit batch 4: 16 variant pairs (alternate-繁 forms found via variant-key sweep)
  ["鶖", "鹙"],   // 鶖 (source) → 鹙 (common) — 平/十一尤
  ["賙", "赒"],   // 賙 (source) → 赒 (common) — 平/十一尤
  ["譸", "诪"],   // 譸 (source) → 诪 (common) — 平/十一尤
  ["駸", "骎"],   // 駸 (source) → 骎 (common) — 平/十二侵
  ["紝", "纴"],   // 紝 (source) → 纴 (common) — multi: 十二侵 + 二十七沁
  ["嶔", "嵚"],   // 嶔 (source) → 嵚 (common) — 平/十二侵
  ["槮", "椮"],   // 槮 (source) → 椮 (common) — multi: 十二侵 + 四豪 + 二十七感
  ["枏", "楠"],   // 枏 (source) → 楠 (common) — multi: 十三覃 + 十四鹽
  ["髥", "髯"],   // 髥 (source) → 髯 (common) — 平/十四鹽
  ["銛", "铦"],   // 銛 (source) → 铦 (common) — 平/十四鹽
  ["撏", "挦"],   // 撏 (reconstructed) → 挦 (common) — multi: 十三覃 + 十二侵 + 十四鹽
  ["鰜", "鳒"],   // 鰜 (source) → 鳒 (common) — multi: 十五咸 + 十四鹽 + 二十九艷
  ["嶮", "崄"],   // 嶮 (reconstructed) → 崄 (common) — multi: 十四鹽 + 二十八琰
  ["鑱", "镵"],   // 鑱 (source) → 镵 (common) — multi: 十五咸 + 三十陷
  ["壟", "垄"],   // 壟 (source) → 垄 (common) — 仄/二腫
  ["紵", "纻"],   // 紵 (source) → 纻 (common) — 仄/六語
];
for (const [src, dst] of variantPairs) {
  const srcEntries = d.chars[src];
  const dstEntries = d.chars[dst];
  if (srcEntries && srcEntries.length > 0 && (!dstEntries || dstEntries.length === 0)) {
    d.chars[dst] = [...srcEntries];
    for (const e of d.chars[dst]) ensureBucket(dst, e);
    console.log(`  ${dst} ← ${src}: ${d.chars[dst].map(e => e.tone + " " + e.rhyme).join(" | ")}`);
  } else if (dstEntries && dstEntries.length > 0 && (!srcEntries || srcEntries.length === 0)) {
    d.chars[src] = [...dstEntries];
    for (const e of d.chars[src]) ensureBucket(src, e);
    console.log(`  ${src} ← ${dst}: ${d.chars[src].map(e => e.tone + " " + e.rhyme).join(" | ")}`);
  } else {
    console.log(`  ${src}/${dst}: both present or both missing, skipped`);
  }
}

// Group E: 一東 audit batch (Findings 1-3)
// Chars missing from source CSV, added per 康熙字典/廣韻/集韻 + audit triangulation.

// 鲖 — tóng (鱼名), variant zhòu (地名 鲖陽)
d.chars["鲖"] = [
  { tone: "平", group: "上平", rhyme: "一東" },
  { tone: "仄", group: "上聲", rhyme: "二腫" },
  { tone: "仄", group: "上聲", rhyme: "二十五有" },
];
for (const e of d.chars["鲖"]) ensureBucket("鲖", e);
console.log(`  鲖 → ${d.chars["鲖"].map(e => e.tone + " " + e.rhyme).join(" | ")}`);

// 曨/昽 — lóng (dawn light, dim morning). Not in tc2sc.json; mirror explicitly.
d.chars["曨"] = [{ tone: "平", group: "上平", rhyme: "一東" }];
for (const e of d.chars["曨"]) ensureBucket("曨", e);
d.chars["昽"] = [{ tone: "平", group: "上平", rhyme: "一東" }];
for (const e of d.chars["昽"]) ensureBucket("昽", e);
console.log(`  曨/昽 → 平 一東`);

// 渢/沨 — féng (water sound), fán (左傳), fàn (去聲). Not in tc2sc.json; mirror explicitly.
const fengReadings = [
  { tone: "平", group: "上平", rhyme: "一東" },
  { tone: "平", group: "下平", rhyme: "十五咸" },
  { tone: "仄", group: "去聲", rhyme: "三十陷" },
];
d.chars["渢"] = [...fengReadings];
for (const e of d.chars["渢"]) ensureBucket("渢", e);
d.chars["沨"] = [...fengReadings];
for (const e of d.chars["沨"]) ensureBucket("沨", e);
console.log(`  渢/沨 → ${fengReadings.map(e => e.tone + " " + e.rhyme).join(" | ")}`);

// === 一東 audit batch findings 5–14 — reorder wrong defaults ===
//
// Both readings already exist; entries[0] was 平/一東 but consensus
// (charlesix59 + jkak + cope where present, plus 廣韻/集韻 verification
// from user) puts the primary reading in another rhyme. Reorder only;
// no entry adds. 攏 receives an additional retained_legacy annotation
// in ambiguous-readings.ts (its 平/一東 secondary is dictionary-error
// data — preserved per locked decision "annotate, don't drop").

// Group A — default → 二冬
reorderToRhyme("烽", "二冬");
reorderToRhyme("蘢", "二冬");
reorderToRhyme("茏", "二冬");  // 簡 of 蘢

// Group B — default → 三江
reorderToRhyme("谾", "三江");
reorderToRhyme("漎", "三江");
reorderToRhyme("逄", "三江");

// Group C — default → 仄/一董
reorderToRhyme("攏", "一董");
reorderToRhyme("拢", "一董");  // 簡 of 攏
reorderToRhyme("總", "一董");
reorderToRhyme("总", "一董");  // 簡 of 總
reorderToRhyme("蓊", "一董");
reorderToRhyme("菶", "一董");
reorderToRhyme("翪", "一董");

// === Audit batch 2 — reorder wrong defaults ===
// 17 reorders (+ 4 簡 mirrors = 21 calls). Both readings already exist;
// entries[0] was wrong per audit consensus + user classical verification.

// → 二冬
reorderToRhyme("鬃", "二冬");
reorderToRhyme("噥", "二冬");
reorderToRhyme("哝", "二冬");  // 簡 of 噥

// → 四支
reorderToRhyme("思", "四支");
reorderToRhyme("篩", "四支");
reorderToRhyme("筛", "四支");  // 簡 of 篩
reorderToRhyme("唲", "四支");
reorderToRhyme("崥", "四支");
reorderToRhyme("嗺", "四支");
reorderToRhyme("箄", "四支");
reorderToRhyme("趍", "四支");

// → 六魚
reorderToRhyme("瑹", "六魚");

// → 八齊
reorderToRhyme("齊", "八齊");
reorderToRhyme("齐", "八齊");  // 簡 of 齊

// → 仄/四紙
reorderToRhyme("壘", "四紙");
reorderToRhyme("垒", "四紙");  // 簡 of 壘

// === Audit batch 2 — new entries (ADDs) ===
// 29 chars absent from pingshui. Readings per audit consensus +
// user classical verification for watch-list cases.

function addReading(char, tone, group, rhyme) {
  if (d.chars[char]) {
    console.warn(`  ${char} already exists — skipping ADD`);
    return;
  }
  d.chars[char] = [{ tone, group, rhyme }];
  ensureBucket(char, d.chars[char][0]);
  console.log(`  ${char} added → ${tone} ${rhyme}`);
}

function addMultiReading(char, entries) {
  if (d.chars[char]) {
    console.warn(`  ${char} already exists — skipping multi-ADD`);
    return;
  }
  d.chars[char] = entries;
  for (const e of entries) ensureBucket(char, e);
  console.log(`  ${char} added → ${entries.map(e => e.tone + " " + e.rhyme).join(" | ")}`);
}

// Single-reading ADDs — grouped by destination rhyme
// → 二冬
addReading("镕", "平", "上平", "二冬");
addReading("秾", "平", "上平", "二冬");
addReading("颙", "平", "上平", "二冬");

// → 四支
addReading("媯", "平", "上平", "四支");
addReading("飔", "平", "上平", "四支");
addReading("漓", "平", "上平", "四支");
addReading("鶿", "平", "上平", "四支");
addReading("骙", "平", "上平", "四支");
addReading("摛", "平", "上平", "四支");
addReading("鸤", "平", "上平", "四支");
addReading("祎", "平", "上平", "四支");

// → 五微
addReading("翚", "平", "上平", "五微");

// → 六魚
addReading("玙", "平", "上平", "六魚");
addReading("铻", "平", "上平", "六魚");

// → 七虞
addReading("媭", "平", "上平", "七虞");

// → 八齊
addReading("笄", "平", "上平", "八齊");
addReading("鹥", "平", "上平", "八齊");
addReading("齏", "平", "上平", "八齊");

// → 十灰
addReading("缞", "平", "上平", "十灰");
addReading("頹", "平", "上平", "十灰");
addReading("呆", "平", "上平", "十灰");

// → 十一真
addReading("龂", "平", "上平", "十一真");
addReading("骃", "平", "上平", "十一真");
addReading("訚", "平", "上平", "十一真");

// → 一先
addReading("填", "平", "下平", "一先");

// Multi-reading ADDs
addMultiReading("锜", [
  { tone: "平", group: "上平", rhyme: "四支" },
  { tone: "仄", group: "上聲", rhyme: "四紙" }
]);

addMultiReading("诐", [
  { tone: "平", group: "上平", rhyme: "四支" },
  { tone: "仄", group: "去聲", rhyme: "四寘" }
]);

addMultiReading("犁", [
  { tone: "平", group: "上平", rhyme: "八齊" },
  { tone: "平", group: "上平", rhyme: "四支" }
]);

addMultiReading("谞", [
  { tone: "平", group: "上平", rhyme: "六魚" },
  { tone: "仄", group: "上聲", rhyme: "六語" }
]);

addMultiReading("溇", [
  { tone: "平", group: "上平", rhyme: "七虞" },
  { tone: "仄", group: "上聲", rhyme: "二十五有" }
]);

addMultiReading("阇", [
  { tone: "平", group: "上平", rhyme: "七虞" },
  { tone: "平", group: "下平", rhyme: "六麻" }
]);

addMultiReading("琎", [
  { tone: "平", group: "上平", rhyme: "十一真" },
  { tone: "仄", group: "去聲", rhyme: "十二震" }
]);

addMultiReading("缊", [
  { tone: "平", group: "上平", rhyme: "十二文" },
  { tone: "平", group: "上平", rhyme: "十三元" },
  { tone: "仄", group: "上聲", rhyme: "十二吻" }
]);

// === Audit batch 3 — reorders (13 繁 + 5 簡 = 18 calls) ===
// → 四豪
reorderToRhyme("嘮", "四豪");
reorderToRhyme("唠", "四豪");  // 簡 of 嘮
reorderToRhyme("癆", "四豪");
reorderToRhyme("痨", "四豪");  // 簡 of 癆
// → 五歌
reorderToRhyme("驒", "五歌");
// → 八庚
reorderToRhyme("浾", "八庚");
reorderToRhyme("橫", "八庚");
reorderToRhyme("横", "八庚");  // 簡 of 橫
reorderToRhyme("貞", "八庚");
reorderToRhyme("贞", "八庚");  // 簡 of 貞
reorderToRhyme("令", "八庚");
reorderToRhyme("鯖", "八庚");
reorderToRhyme("鲭", "八庚");  // 簡 of 鯖
reorderToRhyme("狌", "八庚");
// → 九青
reorderToRhyme("瞑", "九青");
// → 十蒸
reorderToRhyme("矜", "十蒸");
reorderToRhyme("薨", "十蒸");
// → 十一尤
reorderToRhyme("陬", "十一尤");

// 矜 4th reading: 平/十二文 (矜哀 sense, per user classical verification)
(function add矜4thReading() {
  const existing = d.chars["矜"];
  if (!existing) { console.warn("  矜 missing — cannot add 4th reading"); return; }
  if (existing.some(e => e.rhyme === "十二文")) { console.log("  矜 already has 平/十二文"); return; }
  const newEntry = { tone: "平", group: "上平", rhyme: "十二文" };
  existing.push(newEntry);
  ensureBucket("矜", newEntry);
  console.log("  矜 4th reading added → " + existing.map(e => e.tone + " " + e.rhyme).join(" | "));
})();

// === Audit batch 4 — reorders (29 繁 + 6 簡 = 35 calls) ===
// → 十一尤
reorderToRhyme("紑", "十一尤");
reorderToRhyme("緅", "十一尤");
reorderToRhyme("頄", "十一尤");
reorderToRhyme("廔", "十一尤");
reorderToRhyme("泑", "十一尤");
// → 十二侵
reorderToRhyme("喑", "十二侵");
// → 十四鹽
reorderToRhyme("黚", "十四鹽");
// → 一董
reorderToRhyme("蓯", "一董");
reorderToRhyme("苁", "一董");  // 簡 of 蓯
// → 二十五有 (user override — NOT audit's 四紙)
reorderToRhyme("否", "二十五有");
// → 四紙
reorderToRhyme("蟻", "四紙");
reorderToRhyme("蚁", "四紙");  // 簡 of 蟻
reorderToRhyme("跂", "四紙");
reorderToRhyme("薳", "四紙");
reorderToRhyme("鞞", "四紙");
reorderToRhyme("阤", "四紙");
reorderToRhyme("被", "四紙");
reorderToRhyme("巋", "四紙");
reorderToRhyme("岿", "四紙");  // 簡 of 巋
reorderToRhyme("誃", "四紙");
reorderToRhyme("惢", "四紙");
reorderToRhyme("旖", "四紙");
reorderToRhyme("仳", "四紙");
reorderToRhyme("呰", "四紙");
// → 五尾
reorderToRhyme("蟣", "五尾");
reorderToRhyme("虮", "五尾");  // 簡 of 蟣
reorderToRhyme("蜚", "五尾");
reorderToRhyme("蜰", "五尾");
// → 六語
reorderToRhyme("齟", "六語");
reorderToRhyme("龃", "六語");  // 簡 of 齟
// → 七麌
reorderToRhyme("嶁", "七麌");
reorderToRhyme("嵝", "七麌");  // 簡 of 嶁
reorderToRhyme("冔", "七麌");
reorderToRhyme("瞴", "七麌");
reorderToRhyme("蔖", "七麌");

// === Audit batch 3 — single-reading ADDs (31 calls) ===
// → 五歌
addReading("啰", "平", "下平", "五歌");
addReading("靴", "平", "下平", "五歌");
// → 六麻
addReading("铔", "平", "下平", "六麻");
// → 七陽 (15 chars)
addReading("鲿", "平", "下平", "七陽");
addReading("旸", "平", "下平", "七陽");
addReading("铓", "平", "下平", "七陽");
addReading("筜", "平", "下平", "七陽");
addReading("珰", "平", "下平", "七陽");
addReading("贓", "平", "下平", "七陽");
addReading("骦", "平", "下平", "七陽");
addReading("鸧", "平", "下平", "七陽");
addReading("螀", "平", "下平", "七陽");
addReading("钖", "平", "下平", "七陽");
addReading("玱", "平", "下平", "七陽");
addReading("玚", "平", "下平", "七陽");
addReading("韁", "平", "下平", "七陽");
// → 八庚 (6 chars)
addReading("纮", "平", "下平", "八庚");
addReading("鹒", "平", "下平", "八庚");
addReading("硁", "平", "下平", "八庚");
addReading("繃", "平", "下平", "八庚");
addReading("赪", "平", "下平", "八庚");
addReading("骍", "平", "下平", "八庚");
// → 九青 (3 chars)
addReading("铏", "平", "下平", "九青");
addReading("鸰", "平", "下平", "九青");
addReading("瓶", "平", "下平", "九青");
// → 十蒸 (2 chars)
addReading("菱", "平", "下平", "十蒸");
addReading("塍", "平", "下平", "十蒸");
// → 十一尤 (4 chars)
addReading("榴", "平", "下平", "十一尤");
addReading("辀", "平", "下平", "十一尤");
addReading("镠", "平", "下平", "十一尤");
addReading("鹠", "平", "下平", "十一尤");

// === Audit batch 3 — multi-reading ADDs (5 calls) ===
addMultiReading("屏", [
  { tone: "平", group: "下平", rhyme: "九青" },
  { tone: "仄", group: "上聲", rhyme: "二十三梗" }
]);
addMultiReading("飏", [
  { tone: "平", group: "下平", rhyme: "七陽" },
  { tone: "仄", group: "去聲", rhyme: "二十三漾" }
]);
addMultiReading("锽", [
  { tone: "平", group: "下平", rhyme: "八庚" },
  { tone: "平", group: "下平", rhyme: "七陽" }
]);
addMultiReading("瘤", [
  { tone: "仄", group: "去聲", rhyme: "二十六宥" },
  { tone: "平", group: "下平", rhyme: "十一尤" }
]);
addMultiReading("並", [
  { tone: "仄", group: "上聲", rhyme: "二十三梗" },
  { tone: "平", group: "下平", rhyme: "八庚" },
  { tone: "仄", group: "去聲", rhyme: "二十四敬" },
  { tone: "仄", group: "上聲", rhyme: "二十四迥" }
]);

// === Audit batch 4 — single-reading ADDs (3 calls) ===
addReading("媮", "平", "下平", "十一尤");
addReading("唝", "仄", "上聲", "一董");
addReading("敘", "仄", "上聲", "六語");

fs.writeFileSync(jsonPath, JSON.stringify(d));
console.log("Done — patching complete.");
