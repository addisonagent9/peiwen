// #14 — drill4-corpus coverage tests.
//
// Asserts that LLM-generated glosses (source: 'llm-v1') and MOE-sourced
// glosses (no source field) coexist with metadata counts that match the
// actual corpus shape.
//
// Run: `node --test src/data/__tests__/drill4-corpus-coverage.test.ts`

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import data from '../pingshui/drill4-corpus.json' with { type: 'json' };
import meta from '../pingshui/drill4-corpus-meta.json' with { type: 'json' };

type Entry = { gloss?: string; source?: string };

// drill4-corpus.json shape: object keyed by rhyme group → array of entries.
const allEntries: Entry[] = Array.isArray(data)
  ? (data as Entry[])
  : Object.values(data as Record<string, Entry[]>).flat();

describe('drill4-corpus coverage', () => {
  it('has both MOE and LLM-v1 entries', () => {
    const moe = allEntries.filter(e => !e.source);
    const llm = allEntries.filter(e => e.source === 'llm-v1');
    assert.ok(moe.length > 0, 'expected MOE entries');
    assert.ok(llm.length > 0, 'expected LLM-v1 entries');
  });

  it('every LLM entry has a non-empty Chinese gloss', () => {
    const llm = allEntries.filter(e => e.source === 'llm-v1');
    for (const entry of llm) {
      const g = entry.gloss ?? '';
      assert.match(g, /.{2,}/);
      assert.match(g, /[一-鿿㐀-䶿]/, `non-Chinese gloss: ${g}`);
    }
  });

  it('metadata counts match corpus', () => {
    // MOE entries: no source field AND have a Chinese gloss. Entries that are
    // still English-only after merge are LLM fetch-failures, counted in
    // llm_v1_failures rather than moe_count.
    const isChineseGloss = (g?: string) =>
      !!g && !/^[^一-鿿㐀-䶿]+$/.test(g.trim());
    const moe = allEntries.filter(e => !e.source && isChineseGloss(e.gloss)).length;
    const llm = allEntries.filter(e => e.source === 'llm-v1').length;
    const fails = allEntries.filter(e => !e.source && !isChineseGloss(e.gloss)).length;
    const m = meta as { moe_count: number; llm_v1_count: number; llm_v1_failures: number };
    assert.equal(moe, m.moe_count);
    assert.equal(llm, m.llm_v1_count);
    assert.equal(fails, m.llm_v1_failures);
  });
});
