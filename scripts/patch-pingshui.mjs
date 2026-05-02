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

// === Audit batch 5: dedup + reconstruction (before Group D) ===

(function dedup蝍() {
  const entries = d.chars["蝍"];
  if (!entries) return;
  const seen = new Set();
  d.chars["蝍"] = entries.filter(e => {
    const key = e.tone + "|" + e.rhyme;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log("  蝍 deduped → " + d.chars["蝍"].map(e => e.tone + " " + e.rhyme).join(" | "));
})();

(function dedup楥() {
  const entries = d.chars["楥"];
  if (!entries) return;
  const seen = new Set();
  d.chars["楥"] = entries.filter(e => {
    const key = e.tone + "|" + e.rhyme;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log("  楥 deduped → " + d.chars["楥"].map(e => e.tone + " " + e.rhyme).join(" | "));
})();

(function reconstruct値() {
  const existing = d.chars["値"];
  if (!existing) { console.warn("  値 missing"); return; }
  if (existing.some(e => e.rhyme === "十三職")) { console.log("  値 already has 十三職"); return; }
  const newEntry = { tone: "入", group: "入聲", rhyme: "十三職" };
  existing.push(newEntry);
  ensureBucket("値", newEntry);
  console.log("  値 supplemented → " + existing.map(e => e.tone + " " + e.rhyme).join(" | "));
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
  // Audit batch 5: 18 variant pairs
  ["旣", "既"],   // 旣 → 既 — 仄/五未
  ["尙", "尚"],   // 尙 → 尚 — multi: 七陽 + 二十三漾
  ["鑑", "鑒"],   // 鑑 → 鑒 — 仄/三十陷
  ["殻", "殼"],   // 殻 → 殼 — 入/三覺
  ["値", "值"],   // 値 (supplemented) → 值 — multi: 四寘 + 十三職
  ["僞", "偽"],   // 僞 → 偽 — 仄/四寘
  ["漑", "溉"],   // 漑 → 溉 — multi: 五未 + 十一隊
  ["槩", "概"],   // 槩 → 概 — 仄/十一隊
  ["鋭", "銳"],   // 鋭 → 銳 — 仄/八霽
  ["蔕", "蒂"],   // 蔕 → 蒂 — 仄/八霽
  ["愼", "慎"],   // 愼 → 慎 — 仄/十二震
  ["楥", "楦"],   // 楥 (deduped) → 楦 — multi: 十三元 + 一先 + 十七霰 + 十四願
  ["贋", "贗"],   // 贋 → 贗 — 仄/十六諫
  ["綫", "線"],   // 綫 → 線 — 仄/十七霰
  ["弔", "吊"],   // 弔 → 吊 — multi: 十八嘯 + 十二錫
  ["駡", "罵"],   // 駡 → 罵 — 仄/二十二禡
  ["蝨", "虱"],   // 蝨 → 虱 — 入/四質
  ["濫", "滥"],   // 濫 → 滥 — multi: 二十八勘 + 二十九豏 + 二十七感
  // Audit batch 6: 12 variant pairs
  ["寛", "寬"],   // 寛 → 寬 — 平/十四寒
  ["顔", "顏"],   // 顔 → 顏 — 平/十五刪
  ["鷳", "鷴"],   // 鷳 → 鷴 — 平/十五刪
  ["巓", "巔"],   // 巓 → 巔 — 平/一先
  ["氊", "氈"],   // 氊 → 氈 — 平/一先
  ["嶢", "峣"],   // 嶢 → 峣 — 平/二蕭
  ["謡", "謠"],   // 謡 → 謠 — 平/二蕭
  ["鑽", "鉆"],   // 鑽 → 鉆 — multi: 十四寒 + 十五翰
  ["啓", "啟"],   // 啓 → 啟 — 仄/八薺
  ["餧", "餵"],   // 餧 → 餵 — multi: 十賄 + 四寘
  ["壼", "壸"],   // 壼 → 壸 — 仄/十三阮
  ["産", "產"],   // 産 → 產 — 仄/十五潸
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

// === Audit batch 5 — reorders (86 繁 + 19 簡 = 105 calls) ===
// → 二十八琰
reorderToRhyme("蘞", "二十八琰"); reorderToRhyme("蔹", "二十八琰");
reorderToRhyme("譣", "二十八琰");
reorderToRhyme("嬐", "二十八琰");
// → 二十九豏
reorderToRhyme("黯", "二十九豏");
// → 一送
reorderToRhyme("哄", "一送");
// → 二宋
reorderToRhyme("統", "二宋"); reorderToRhyme("统", "二宋");
reorderToRhyme("緟", "二宋");
// → 四寘
reorderToRhyme("餌", "四寘"); reorderToRhyme("饵", "四寘");
reorderToRhyme("睟", "四寘");
// → 五未
reorderToRhyme("穊", "四寘");
reorderToRhyme("禨", "五未");
// → 七遇
reorderToRhyme("饎", "四寘");
// → 九泰
reorderToRhyme("蠔", "四寘"); reorderToRhyme("蚝", "四寘");
// → 十卦
reorderToRhyme("甀", "四寘");
reorderToRhyme("攦", "十卦");
// → 十一隊
reorderToRhyme("疐", "四寘");
reorderToRhyme("繢", "十一隊"); reorderToRhyme("缋", "十一隊");
// → 六御
reorderToRhyme("袘", "四寘");
// → 十二震
reorderToRhyme("信", "十二震");
reorderToRhyme("揗", "十二震");
// → 十三問
reorderToRhyme("餫", "十三問");
// → 十四願
reorderToRhyme("硍", "十四願");
reorderToRhyme("焌", "十四願");
// → 十五翰
reorderToRhyme("憚", "十五翰"); reorderToRhyme("惮", "十五翰");
reorderToRhyme("判", "十五翰");
// → 十六諫
reorderToRhyme("繯", "十六諫"); reorderToRhyme("缳", "十六諫");
// → 十七霰
reorderToRhyme("眩", "十七霰");
reorderToRhyme("縓", "十七霰");
// → 十八嘯
reorderToRhyme("僆", "十七霰");
// → 十九效
reorderToRhyme("礉", "十九效");
reorderToRhyme("挍", "十九效");
// → 二十號
reorderToRhyme("媢", "二十號");
reorderToRhyme("耗", "二十號");
// → 二十一箇
reorderToRhyme("侳", "二十一箇");
// → 二十三漾
reorderToRhyme("踼", "二十三漾");
reorderToRhyme("曏", "二十三漾");
// → 二十四敬
reorderToRhyme("凈", "二十四敬"); reorderToRhyme("净", "二十四敬");
reorderToRhyme("璥", "二十四敬");
// → 二十五徑
reorderToRhyme("鐙", "二十五徑"); reorderToRhyme("镫", "二十五徑");
reorderToRhyme("訂", "二十五徑"); reorderToRhyme("订", "二十五徑");
// → 二十六宥
reorderToRhyme("漱", "二十六宥");
reorderToRhyme("糅", "二十六宥");
reorderToRhyme("酘", "二十六宥");
reorderToRhyme("椆", "二十六宥");
// → 二十七沁
reorderToRhyme("蔭", "二十七沁"); reorderToRhyme("荫", "二十七沁");
reorderToRhyme("妗", "二十七沁");
// → 二十九艷
reorderToRhyme("爓", "二十九艷");
// → 一屋
reorderToRhyme("鱐", "一屋");
reorderToRhyme("莤", "一屋");
// → 二沃
reorderToRhyme("澩", "二沃"); reorderToRhyme("泶", "二沃");
reorderToRhyme("洬", "二沃");
// → 三覺
reorderToRhyme("角", "三覺");
reorderToRhyme("濁", "三覺"); reorderToRhyme("浊", "三覺");
reorderToRhyme("齪", "三覺"); reorderToRhyme("龊", "三覺");
// → 四質
reorderToRhyme("佚", "四質");
// → 九屑
reorderToRhyme("覕", "九屑");
// → 十三職
reorderToRhyme("蝍", "四質");
// → 十藥
reorderToRhyme("噣", "三覺");
reorderToRhyme("齱", "三覺");
reorderToRhyme("汋", "十藥");
// → 十一陌
reorderToRhyme("熚", "四質");
// → 八黠
reorderToRhyme("站", "三十陷");
reorderToRhyme("錎", "三十陷");
reorderToRhyme("譀", "三十陷");
// → additional reorders from watch-list / misc
reorderToRhyme("慮", "六御"); reorderToRhyme("虑", "六御");
reorderToRhyme("瘀", "六御");
reorderToRhyme("鸒", "六御");
reorderToRhyme("跗", "七遇");
reorderToRhyme("婟", "七遇");
reorderToRhyme("忕", "八霽");
reorderToRhyme("盻", "八霽");
reorderToRhyme("裞", "八霽");
reorderToRhyme("犡", "八霽");
reorderToRhyme("攛", "十五翰"); reorderToRhyme("撺", "十五翰");
reorderToRhyme("疸", "十五翰");
reorderToRhyme("褑", "十七霰");
reorderToRhyme("抃", "十七霰");
reorderToRhyme("驃", "十八嘯"); reorderToRhyme("骠", "十八嘯");
reorderToRhyme("獥", "十八嘯");
reorderToRhyme("顤", "十八嘯");
reorderToRhyme("蓧", "十八嘯"); reorderToRhyme("莜", "十八嘯");
reorderToRhyme("票", "十八嘯");
reorderToRhyme("宓", "四質");
reorderToRhyme("詄", "四質");
reorderToRhyme("咭", "四質");
reorderToRhyme("鮚", "四質"); reorderToRhyme("鲒", "四質");
reorderToRhyme("欯", "四質");
reorderToRhyme("灸", "二十六宥");

// Batch 5 correction: mis-targeted reorders caught in STEP 2 review
// + missing reorders for watch-list chars 作/佑
// + Group D post-mirror default fixes for 楦/尚
// + 入→仄 reorders for 鹔/箓
reorderToRhyme("作", "二十一箇");   // user verdict: 仄/二十一箇 default
reorderToRhyme("佑", "二十六宥");   // user verdict: 仄/二十六宥 default
reorderToRhyme("楦", "十四願");     // Group D inherited wrong default from 楥
reorderToRhyme("尚", "二十三漾");   // Group D inherited wrong default from 尙
reorderToRhyme("鹔", "一屋");       // 入→仄 normalized target
reorderToRhyme("箓", "二沃");       // 入→仄 normalized target

// 角 4th reading: 平/十一尤 (jiǎo sense, per user classical verdict)
(function add角4thReading() {
  const existing = d.chars["角"];
  if (!existing) { console.warn("  角 missing"); return; }
  if (existing.some(e => e.rhyme === "十一尤")) { console.log("  角 already has 十一尤"); return; }
  const newEntry = { tone: "平", group: "下平", rhyme: "十一尤" };
  existing.push(newEntry);
  ensureBucket("角", newEntry);
  console.log("  角 3rd reading added → " + existing.map(e => e.tone + " " + e.rhyme).join(" | "));
})();

// === Audit batch 5 — single-reading ADDs (in-scope only) ===
// → 仄 rhymes
addReading("黡", "仄", "上聲", "二十八琰");
addReading("赗", "仄", "去聲", "一送");
addReading("疭", "仄", "去聲", "二宋");
addReading("廁", "仄", "去聲", "四寘");
addReading("赑", "仄", "去聲", "四寘");
addReading("勚", "仄", "去聲", "四寘");
addReading("阓", "仄", "去聲", "十一隊");
addReading("硙", "仄", "去聲", "十一隊");
addReading("颣", "仄", "去聲", "十一隊");
addReading("慭", "仄", "去聲", "十二震");
addReading("馂", "仄", "去聲", "十二震");
addReading("闬", "仄", "去聲", "十五翰");
addReading("剁", "仄", "去聲", "二十一箇");
addReading("祃", "仄", "去聲", "二十二禡");
addReading("迸", "仄", "去聲", "二十四敬");
addReading("饤", "仄", "去聲", "二十五徑");
addReading("剩", "仄", "去聲", "二十五徑");
addReading("饾", "仄", "去聲", "二十六宥");
addReading("垫", "仄", "去聲", "二十九艷");
// → 入聲 rhymes
addReading("踘", "入", "入聲", "一屋");
addReading("峃", "入", "入聲", "三覺");
addReading("鸴", "入", "入聲", "三覺");
addReading("唧", "入", "入聲", "四質");
addReading("锧", "入", "入聲", "四質");
addReading("驲", "入", "入聲", "四質");
addReading("铚", "入", "入聲", "四質");
// Batch 5 correction: missing ADDs caught in STEP 2 review
addReading("槜", "仄", "去聲", "四寘");
addReading("屃", "仄", "去聲", "四寘");
addReading("滪", "仄", "去聲", "六御");

// === Audit batch 5 — multi-reading ADDs (in-scope only) ===
addMultiReading("塈", [
  { tone: "仄", group: "去聲", rhyme: "四寘" },
  { tone: "仄", group: "去聲", rhyme: "五未" }
]);
addMultiReading("翙", [
  { tone: "仄", group: "去聲", rhyme: "九泰" },
  { tone: "入", group: "入聲", rhyme: "五物" }
]);
addMultiReading("轪", [
  { tone: "仄", group: "去聲", rhyme: "八霽" },
  { tone: "入", group: "入聲", rhyme: "十二錫" }
]);
addMultiReading("鳀", [
  { tone: "仄", group: "去聲", rhyme: "八霽" },
  { tone: "入", group: "入聲", rhyme: "六月" }
]);
addMultiReading("灩", [
  { tone: "仄", group: "去聲", rhyme: "二十九艷" },
  { tone: "入", group: "入聲", rhyme: "十六葉" }
]);
addMultiReading("箓", [
  { tone: "仄", group: "去聲", rhyme: "七遇" },
  { tone: "入", group: "入聲", rhyme: "二沃" }
]);
addMultiReading("伣", [
  { tone: "仄", group: "去聲", rhyme: "十七霰" },
  { tone: "入", group: "入聲", rhyme: "九屑" }
]);
// 滥 handled by Group D mirror from 濫 — no separate ADD needed
addMultiReading("骕", [
  { tone: "入", group: "入聲", rhyme: "一屋" },
  { tone: "入", group: "入聲", rhyme: "三覺" }
]);
addMultiReading("鹔", [
  { tone: "仄", group: "去聲", rhyme: "七遇" },
  { tone: "入", group: "入聲", rhyme: "一屋" }
]);
addMultiReading("籀", [
  { tone: "仄", group: "去聲", rhyme: "二十六宥" },
  { tone: "入", group: "入聲", rhyme: "一屋" }
]);

// === Audit batch 6 — Group D extensions (12 pairs) ===
// All case A/B per prior investigation — clean mirrors.
// variantPairs additions already in the array above.
// (These 12 pairs were added to the variantPairs array in Part 2.)

// === Audit batch 6 — reorders (51 繁 + 10 簡 = 61 calls) ===
// → 十二文
reorderToRhyme("玟", "十二文");
reorderToRhyme("汶", "十二文");
// → 十三元 (NOT 論 — 論 is user-override to 十四願 below)
// → 十四寒
reorderToRhyme("梡", "十四寒");
// → 一先
reorderToRhyme("脧", "一先"); reorderToRhyme("睃", "一先");
reorderToRhyme("媊", "一先");
reorderToRhyme("磌", "一先");
reorderToRhyme("漹", "一先");
reorderToRhyme("嬛", "一先");
// → 四豪
reorderToRhyme("艘", "四豪");
reorderToRhyme("匋", "四豪");
// → 七麌
reorderToRhyme("莆", "七麌");
reorderToRhyme("喣", "七麌");
reorderToRhyme("窶", "七麌"); reorderToRhyme("窭", "七麌");
// → 八薺
reorderToRhyme("柢", "八薺");
reorderToRhyme("欐", "八薺");
// → 十賄
reorderToRhyme("櫑", "十賄");
reorderToRhyme("廆", "十賄");
reorderToRhyme("娞", "十賄");
// → 十一軫
reorderToRhyme("湣", "十一軫"); reorderToRhyme("愍", "十一軫");
reorderToRhyme("馻", "十一軫");
// → 十二吻
reorderToRhyme("弅", "十二吻");
reorderToRhyme("韞", "十二吻"); reorderToRhyme("韫", "十二吻");
// → 十三阮
reorderToRhyme("焜", "十三阮");
reorderToRhyme("齦", "十三阮"); reorderToRhyme("龈", "十三阮");
reorderToRhyme("睕", "十三阮");
reorderToRhyme("愃", "十三阮");
// → 十四旱
reorderToRhyme("緩", "十四旱"); reorderToRhyme("缓", "十四旱");
reorderToRhyme("繵", "十四旱");
reorderToRhyme("捖", "十四旱");
reorderToRhyme("裋", "十四旱");
// → 十六銑
reorderToRhyme("舛", "十六銑");
reorderToRhyme("鄟", "十六銑");
reorderToRhyme("繾", "十六銑"); reorderToRhyme("缱", "十六銑");
reorderToRhyme("諞", "十六銑"); reorderToRhyme("谝", "十六銑");
reorderToRhyme("謰", "十六銑");
reorderToRhyme("沇", "十六銑");
// → 十七筱
reorderToRhyme("殍", "十七筱");
reorderToRhyme("憭", "十七筱");
// → 十八巧
reorderToRhyme("茆", "十八巧");
// → 十九皓
reorderToRhyme("繰", "十九皓"); reorderToRhyme("缲", "十九皓");
reorderToRhyme("轑", "十九皓");
reorderToRhyme("芺", "十九皓");
// → 二十哿
reorderToRhyme("舸", "二十哿");
reorderToRhyme("柁", "二十哿");
reorderToRhyme("蠃", "二十哿");
reorderToRhyme("砢", "二十哿");
reorderToRhyme("婀", "二十哿");
reorderToRhyme("縒", "二十哿");
reorderToRhyme("袲", "二十哿");
// → 二十一馬
reorderToRhyme("下", "二十一馬");
// Watch-list: 論 → user override to 十四願
reorderToRhyme("論", "十四願"); reorderToRhyme("论", "十四願");

// === Audit batch 6 — single-reading ADDs (47 calls) ===
// → 平 rhymes
addReading("煴", "平", "上平", "十二文");
addReading("豮", "平", "上平", "十二文");
addReading("涢", "平", "上平", "十二文");
addReading("筼", "平", "上平", "十二文");
addReading("辒", "平", "上平", "十三元");
addReading("裈", "平", "上平", "十三元");
addReading("鹓", "平", "上平", "十三元");
addReading("襕", "平", "上平", "十四寒");
addReading("鳣", "平", "下平", "一先");
addReading("阛", "平", "上平", "十五刪");
addReading("镮", "平", "上平", "十五刪");
addReading("妍", "平", "下平", "一先");
addReading("篯", "平", "下平", "一先");
addReading("鹯", "平", "下平", "一先");
addReading("钘", "平", "下平", "九青");
addReading("梿", "平", "下平", "一先");
addReading("飖", "平", "下平", "二蕭");
addReading("蟏", "平", "下平", "二蕭");
addReading("绦", "平", "下平", "四豪");
addReading("绹", "平", "下平", "四豪");
addReading("鱽", "平", "下平", "四豪");
addReading("梼", "平", "下平", "四豪");
addReading("嗥", "平", "下平", "四豪");
// → 仄 rhymes
addReading("豎", "仄", "上聲", "七麌");
addReading("奶", "仄", "上聲", "九蟹");
addReading("闿", "仄", "上聲", "十賄");
addReading("叆", "仄", "去聲", "十一隊");
addReading("叇", "仄", "去聲", "十一隊");
addReading("纼", "仄", "上聲", "十一軫");
addReading("讱", "仄", "去聲", "十二震");
addReading("醞", "仄", "去聲", "十三問");
addReading("滚", "仄", "上聲", "十三阮");
addReading("浐", "仄", "上聲", "十五潸");
addReading("狝", "仄", "上聲", "十六銑");
addReading("剪", "仄", "上聲", "十六銑");
addReading("亸", "仄", "上聲", "二十哿");

// === Audit batch 6 — multi-reading ADDs (7 calls) ===
addMultiReading("侥", [
  { tone: "平", group: "下平", rhyme: "二蕭" },
  { tone: "仄", group: "上聲", rhyme: "十七筱" }
]);
addMultiReading("剿", [
  { tone: "平", group: "下平", rhyme: "三肴" },
  { tone: "仄", group: "上聲", rhyme: "十七筱" }
]);
addMultiReading("鸼", [
  { tone: "平", group: "下平", rhyme: "三肴" },
  { tone: "平", group: "下平", rhyme: "十一尤" }
]);
addMultiReading("啴", [
  { tone: "平", group: "上平", rhyme: "十四寒" },
  { tone: "仄", group: "上聲", rhyme: "十六銑" }
]);
addMultiReading("揾", [
  { tone: "仄", group: "上聲", rhyme: "十二吻" },
  { tone: "仄", group: "去聲", rhyme: "十四願" }
]);
addReading("鸮", "平", "下平", "二蕭");

fs.writeFileSync(jsonPath, JSON.stringify(d));
console.log("Done — patching complete.");
