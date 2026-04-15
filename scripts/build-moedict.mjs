import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(here, "../src/data/moedict.json");
const outPath = resolve(here, "../src/data/moedict-map.json");

console.log("reading moedict.json...");
const data = JSON.parse(readFileSync(srcPath, "utf8"));

const out = {};
for (const entry of data) {
  const title = entry.title;
  if (!title || typeof title !== "string") continue;
  const defs = [];
  for (const h of entry.heteronyms ?? []) {
    for (const d of h.definitions ?? []) {
      if (d.def && typeof d.def === "string") defs.push(d.def);
    }
  }
  if (!defs.length) continue;
  if (out[title]) out[title].push(...defs);
  else out[title] = defs;
}

writeFileSync(outPath, JSON.stringify(out));
console.log(`wrote ${outPath}: ${Object.keys(out).length} titles`);
