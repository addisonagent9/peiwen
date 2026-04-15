import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(here, "../src/data/cedict_ts.u8");
const outPath = resolve(here, "../src/data/cedict.json");

const text = readFileSync(srcPath, "utf8");
const lineRe = /^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/\s*$/;
const out = {};

let parsed = 0;
for (const line of text.split("\n")) {
  if (!line || line.startsWith("#")) continue;
  const m = line.match(lineRe);
  if (!m) continue;
  const [, trad, simp, py, defs] = m;
  const definitions = defs.split("/").filter(Boolean);
  const existing = out[trad];
  if (existing) {
    existing.definitions.push(...definitions);
  } else {
    out[trad] = { simplified: simp, pinyin: py, definitions };
  }
  parsed++;
}

writeFileSync(outPath, JSON.stringify(out));
console.log(`wrote ${outPath}: ${parsed} entries, ${Object.keys(out).length} unique traditional keys`);
