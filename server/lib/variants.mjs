// Variant equivalence sources:
// - data/references/tc2sc.json (繁→簡, 2351 pairs, bidirectional via reverse map)
// - GROUP_D_PAIRS below (alternate-繁 forms; mirrors scripts/patch-pingshui.mjs Group D)
// If Group D pairs are added/changed in patch-pingshui.mjs, update GROUP_D_PAIRS here too.

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __variants_dirname = dirname(fileURLToPath(import.meta.url));

const GROUP_D_PAIRS = [
  ['牀', '床'],
  ['畱', '留'],
  ['眞', '真'],
  ['鈎', '鉤'],
  ['鈎', '钩'],
];

const classes = new Map();

function merge(a, b) {
  const setA = classes.get(a) ?? new Set([a]);
  const setB = classes.get(b) ?? new Set([b]);
  const merged = new Set([...setA, ...setB]);
  for (const c of merged) classes.set(c, merged);
}

const tc2scPath = resolve(__variants_dirname, '../../data/references/tc2sc.json');
const tc2sc = JSON.parse(readFileSync(tc2scPath, 'utf8'));

for (const [trad, simp] of Object.entries(tc2sc)) {
  merge(trad, simp);
}

for (const [a, b] of GROUP_D_PAIRS) {
  merge(a, b);
}

export function getVariants(char) {
  return classes.get(char) ?? new Set([char]);
}
