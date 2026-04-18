#!/usr/bin/env node
// Run the full pingshui audit pipeline: fetch → normalize → consensus → diff
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptDir = __dirname;

const steps = ['fetch.mjs', 'normalize.mjs', 'consensus.mjs', 'diff.mjs'];

for (const step of steps) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running ${step}...`);
  console.log('='.repeat(60));
  try {
    execSync(`node "${resolve(scriptDir, step)}"`, {
      stdio: 'inherit',
      cwd: resolve(scriptDir, '../..'),
      timeout: 60000,
    });
  } catch (e) {
    console.error(`\nFATAL: ${step} failed: ${e.message}`);
    process.exit(1);
  }
}

console.log('\n' + '='.repeat(60));
console.log('Pipeline complete!');
console.log('='.repeat(60));
