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

fs.writeFileSync(jsonPath, JSON.stringify(d));
console.log("Done — 10 entries patched.");
