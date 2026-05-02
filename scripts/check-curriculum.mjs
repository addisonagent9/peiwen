// Build-time guardrail: curriculum vs pingshui drift check.
// Compares trainer-curriculum.ts seedCharacters against pingshui.json.
// Exit 0 on zero findings, exit 1 on any drift.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { Converter } from "opencc-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const s2t = Converter({ from: "cn", to: "tw" });

const pingshui = require(path.resolve(__dirname, "../src/data/pingshui.json"));
const curriculumPath = path.resolve(__dirname, "../src/data/pingshui/trainer-curriculum.ts");
const src = fs.readFileSync(curriculumPath, "utf8");

const rhymeBlocks = [];
const blockRe = /\{\s*id:\s*'([^']+)',\s*ordinal:\s*\d+,\s*label:\s*'([^']+)',[\s\S]*?tier:\s*(\d+),[\s\S]*?seedCharacters:\s*(\[[\s\S]*?\])(?:\s*,\s*(?:mnemonic|foundation))/g;
let m;
while ((m = blockRe.exec(src)) !== null) {
  const [, id, label, tier, seedRaw] = m;
  let chars = [];
  const objRe = /char:\s*'([^']+)'/g;
  let om;
  while ((om = objRe.exec(seedRaw)) !== null) chars.push(om[1]);
  if (chars.length === 0) {
    const strRe = /'([^']+)'/g;
    while ((om = strRe.exec(seedRaw)) !== null) chars.push(om[1]);
  }
  rhymeBlocks.push({ id, label, tier: +tier, chars });
}

const findings = [];
let checked = 0;

for (const rhyme of rhymeBlocks) {
  if (rhyme.chars.length === 0) continue;
  for (const ch of rhyme.chars) {
    checked++;
    const trad = s2t(ch);

    const origEntries = pingshui.chars[ch];
    if (origEntries && origEntries.some(e => e.rhyme === rhyme.label)) continue;

    const tradEntries = trad !== ch ? pingshui.chars[trad] : null;
    if (tradEntries && tradEntries.some(e => e.rhyme === rhyme.label)) continue;

    const origDesc = origEntries
      ? origEntries.map(e => `${e.tone}/${e.rhyme}`).join(", ")
      : "ABSENT";
    const tradDesc = trad === ch
      ? "SAME AS ORIGINAL"
      : tradEntries
        ? tradEntries.map(e => `${e.tone}/${e.rhyme}`).join(", ")
        : "ABSENT";

    findings.push({ ch, trad, rhyme: rhyme.label, tier: rhyme.tier, origDesc, tradDesc });
  }
}

if (findings.length > 0) {
  for (let i = 0; i < findings.length; i++) {
    const f = findings[i];
    console.log(`\n=== Drift finding ${i + 1} of ${findings.length} ===`);
    console.log(`Char: ${f.ch} (curriculum simplified form: ${f.ch}; traditional: ${f.trad})`);
    console.log(`Curriculum claim: ${f.rhyme} (Tier ${f.tier})`);
    console.log(`pingshui actual:`);
    console.log(`  - ${f.ch} entries: ${f.origDesc}`);
    console.log(`  - ${f.trad} entries: ${f.tradDesc}`);
    console.log(`Verdict needed: patch curriculum / patch pingshui / ?`);
  }
  console.log(`\nDrift check: FAIL (${findings.length} finding${findings.length > 1 ? "s" : ""}, ${checked} chars verified)`);
  process.exit(1);
} else {
  console.log(`Drift check: PASS (${checked} chars verified)`);
}
