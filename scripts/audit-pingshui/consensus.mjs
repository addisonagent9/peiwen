#!/usr/bin/env node
// Build consensus from 3 reference datasets
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const auditDir = resolve(root, 'data/audit');

function load(name) {
  try {
    return JSON.parse(readFileSync(resolve(auditDir, name), 'utf8'));
  } catch {
    console.warn(`[consensus] could not load ${name}, using empty`);
    return {};
  }
}

const sources = {
  charles: load('ref_charles.json'),
  jkak: load('ref_jkak.json'),
  cope: load('ref_cope.json'),
};

// Collect all chars across all sources
const allChars = new Set();
for (const src of Object.values(sources)) {
  for (const ch of Object.keys(src)) allChars.add(ch);
}

const consensus = {};

for (const ch of allChars) {
  const readingVotes = {}; // key: "tone|rhyme" -> set of source names
  const presentIn = [];

  for (const [srcName, srcData] of Object.entries(sources)) {
    if (!srcData[ch]) continue;
    presentIn.push(srcName);
    for (const r of srcData[ch]) {
      const key = `${r.tone}|${r.rhyme}`;
      if (!readingVotes[key]) readingVotes[key] = new Set();
      readingVotes[key].add(srcName);
    }
  }

  const readings = [];
  for (const [key, voters] of Object.entries(readingVotes)) {
    const [tone, rhyme] = key.split('|');
    readings.push({
      tone,
      rhyme,
      sources: [...voters],
      confirmed: voters.size >= 2,
    });
  }

  consensus[ch] = {
    presentIn,
    readings,
  };
}

writeFileSync(resolve(auditDir, 'consensus.json'), JSON.stringify(consensus, null, 2));
console.log(`[consensus] ${allChars.size} chars processed`);
console.log('[consensus] done');
