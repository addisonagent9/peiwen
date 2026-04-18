#!/usr/bin/env node
// Fetch reference 平水韻 datasets to data/references/
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const refDir = resolve(root, 'data/references');

mkdirSync(refDir, { recursive: true });

const files = [
  {
    name: 'charles.json',
    url: 'https://raw.githubusercontent.com/charlesix59/chinese_word_rhyme/main/data/Pingshui_Rhyme.json',
  },
  {
    name: 'jkak.json',
    url: 'https://raw.githubusercontent.com/jkak/pingShuiYun/master/data/baseCharDict.json',
  },
  {
    name: 'cope.json',
    url: 'https://raw.githubusercontent.com/LingDong-/cope/master/data/rhymebooks.json',
  },
  {
    name: 'tc2sc.json',
    url: 'https://raw.githubusercontent.com/LingDong-/cope/master/data/TC2SC.json',
  },
];

for (const f of files) {
  const dest = resolve(refDir, f.name);
  if (existsSync(dest)) {
    console.log(`[fetch] skip ${f.name} (already exists)`);
    continue;
  }
  console.log(`[fetch] downloading ${f.name} ...`);
  try {
    execSync(`curl -sSL -o "${dest}" "${f.url}"`, { stdio: 'inherit', timeout: 30000 });
    console.log(`[fetch] saved ${f.name}`);
  } catch (e) {
    console.error(`[fetch] FAILED ${f.name}: ${e.message}`);
  }
}

console.log('[fetch] done');
