// Read the 5 per-tone 平水韻 CSVs and emit src/data/pingshui.json + a thin TS wrapper.
// A character can appear in multiple (tone, rhyme) pairs — 多音字.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PW = "/Users/addisonkang/pw";

const files = [
  { path: "pingshui_上平.csv", tone: "平", group: "上平" },
  { path: "pingshui_下平.csv", tone: "平", group: "下平" },
  { path: "pingshui_上聲.csv", tone: "仄", group: "上聲" },
  { path: "pingshui_去聲.csv", tone: "仄", group: "去聲" },
  { path: "pingshui_入聲.csv", tone: "入", group: "入聲" }
];

const charToEntries = new Map();
const rhymeToBucket = new Map();

for (const f of files) {
  const raw = fs.readFileSync(path.join(PW, f.path), "utf8");
  const lines = raw.split(/\r?\n/).slice(1);
  for (const line of lines) {
    if (!line.trim()) continue;
    const [rhymeRaw, wordRaw] = line.split(",");
    const rhyme = rhymeRaw.replace(/^\uFEFF/, "").trim();
    const word = (wordRaw || "").trim();
    if (!rhyme || !word) continue;
    const arr = charToEntries.get(word) ?? [];
    arr.push({ tone: f.tone, group: f.group, rhyme });
    charToEntries.set(word, arr);
    const bucket = rhymeToBucket.get(rhyme) ?? { tone: f.tone, group: f.group, chars: [] };
    bucket.chars.push(word);
    rhymeToBucket.set(rhyme, bucket);
  }
}

const charObj = Object.fromEntries(charToEntries);
const rhymeObj = Object.fromEntries(rhymeToBucket);

const outDir = path.join(ROOT, "src/data");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "pingshui.json"),
  JSON.stringify({ chars: charObj, rhymes: rhymeObj }));

const ts = `// AUTO-GENERATED wrapper for src/data/pingshui.json. Do not edit.
import data from "./pingshui.json";

export type ToneKind = "平" | "仄" | "入";
export interface PSEntry { tone: ToneKind; group: string; rhyme: string; }
export interface PSRhymeBucket { tone: ToneKind; group: string; chars: string[]; }

export const PINGSHUI_CHAR = data.chars as unknown as Record<string, PSEntry[]>;
export const PINGSHUI_RHYME = data.rhymes as unknown as Record<string, PSRhymeBucket>;
`;
fs.writeFileSync(path.join(outDir, "pingshui.ts"), ts);

console.log(`wrote pingshui.json: ${charToEntries.size} chars, ${rhymeToBucket.size} rhymes`);
