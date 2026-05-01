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

fs.writeFileSync(jsonPath, JSON.stringify(d));
console.log("Done — patching complete.");
