// Tests for #15 — Unihan variant fallback.
//
// Asserts properties of UNIHAN_VARIANTS + its interaction with pingshui
// data. The analyzer wiring (rhymesOf / lookup) is a mechanical 4-line
// fallback that's verified by `tsc` and a manual smoke test in dev;
// node:test can't follow the analyzer's extensionless imports without
// a transpiler dep, so we assert the data layer directly.
//
// Run: `node --test src/analysis/__tests__/variant-fallback.test.ts`

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UNIHAN_VARIANTS } from '../../data/unihan-variants.ts';
import { MERGER_ANNOTATIONS } from '../../data/merger-annotations.ts';
import psData from '../../data/pingshui.json' with { type: 'json' };

const PINGSHUI_CHAR = psData.chars as unknown as Record<
  string,
  Array<{ tone: string; group: string; rhyme: string }>
>;

function rhymesViaFallback(char: string): string[] {
  // Mirrors rhymesOf's data path (without the s2t fallback, which is
  // covered by existing analyzer behavior independent of #15).
  let entries = PINGSHUI_CHAR[char] ?? [];
  if (entries.length === 0) {
    const canonical = UNIHAN_VARIANTS[char];
    if (canonical) entries = PINGSHUI_CHAR[canonical] ?? [];
  }
  return Array.from(new Set(entries.map(e => e.rhyme)));
}

describe('#15 — UNIHAN_VARIANTS positive cases', () => {
  it('爲 (U+7232) → 為 (四支/四寘)', () => {
    assert.equal(UNIHAN_VARIANTS['爲'], '為');
    const r = rhymesViaFallback('爲');
    assert.ok(r.includes('四支'), `expected 四支 in ${r}`);
    assert.ok(r.includes('四寘'), `expected 四寘 in ${r}`);
  });

  it('麵 (U+9EB5) → 麪 (十七霰)', () => {
    assert.equal(UNIHAN_VARIANTS['麵'], '麪');
    assert.ok(rhymesViaFallback('麵').includes('十七霰'));
  });

  it('衞 (U+885E) → 衛 (八霽)', () => {
    assert.equal(UNIHAN_VARIANTS['衞'], '衛');
    assert.ok(rhymesViaFallback('衞').includes('八霽'));
  });

  it('棊 (U+68CA) → 棋 (四支)', () => {
    assert.equal(UNIHAN_VARIANTS['棊'], '棋');
    assert.ok(rhymesViaFallback('棊').includes('四支'));
  });

  it('戸 (U+6238 JP shinjitai) → 戶 (七麌) — kCompatibilityVariant case', () => {
    assert.equal(UNIHAN_VARIANTS['戸'], '戶');
    assert.ok(rhymesViaFallback('戸').includes('七麌'));
  });
});

describe('#15 — UNIHAN_VARIANTS negative cases (already in pingshui, no fallback)', () => {
  it('内 (U+5185) — direct hit at 十一隊', () => {
    assert.ok(PINGSHUI_CHAR['内'], '内 should be in pingshui');
    assert.equal(UNIHAN_VARIANTS['内'], undefined, '内 must not be in fallback map');
  });

  it('恆 (U+6046) — direct hit at 十蒸', () => {
    assert.ok(PINGSHUI_CHAR['恆']);
    assert.equal(UNIHAN_VARIANTS['恆'], undefined);
  });

  it('牀 (Group D entry) — direct hit, no shadow from #15', () => {
    assert.ok(PINGSHUI_CHAR['牀']);
    assert.equal(UNIHAN_VARIANTS['牀'], undefined);
  });

  it('鈎 (Group D entry) — direct hit, no shadow from #15', () => {
    assert.ok(PINGSHUI_CHAR['鈎']);
    assert.equal(UNIHAN_VARIANTS['鈎'], undefined);
  });
});

describe('#15 — verification cases (Unihan declares no kVariant edge)', () => {
  it('攟 (U+651F) — Unihan has no variant declaration; fallback returns empty', () => {
    assert.equal(UNIHAN_VARIANTS['攟'], undefined);
    assert.deepEqual(rhymesViaFallback('攟'), []);
  });
});

describe('#15 — rhyme-equivalence filter regression', () => {
  // Three representatives from the 31 skipped Case-3 entries (Stage 1.2 audit).
  // If Unihan reclassifies these or the filter regresses, we'd silently emit a
  // fallback that drifts the variant into the wrong rhyme group.
  it('扵 (U+6275) — 于/亏/於 span 七虞·六魚·四支; no shared rhyme → skipped', () => {
    assert.equal(UNIHAN_VARIANTS['扵'], undefined);
  });

  it('栢 (U+6822) — 孛/柏 span 十一隊·六月·十一陌; no shared rhyme → skipped', () => {
    assert.equal(UNIHAN_VARIANTS['栢'], undefined);
  });

  it('冣 (U+51A3) — 最/聚 span 九泰·七麌·七遇; no shared rhyme → skipped', () => {
    assert.equal(UNIHAN_VARIANTS['冣'], undefined);
  });
});

describe('#15 — #7 merger-annotation sentinel', () => {
  // #15 must not shadow #7's merger banner. Merger keys are simp forms that by
  // construction have a pingshui direct hit (or trad form) — they shouldn't
  // appear in UNIHAN_VARIANTS, which is keyed only on chars absent from pingshui.
  it('merger-annotation keys are not in UNIHAN_VARIANTS', () => {
    const collisions: string[] = [];
    for (const k of Object.keys(MERGER_ANNOTATIONS)) {
      if (UNIHAN_VARIANTS[k] !== undefined) collisions.push(k);
    }
    assert.deepEqual(collisions, [], `merger keys shadowed by #15: ${collisions.join(', ')}`);
  });

  it('every merger-annotation key resolves via the existing chain', () => {
    // Each merger key must have either a direct pingshui entry or one of its
    // trad forms in pingshui. If neither, the merger banner UI would have
    // nothing to look up and #15 wouldn't be involved.
    for (const k of Object.keys(MERGER_ANNOTATIONS)) {
      const direct = !!PINGSHUI_CHAR[k];
      const ann = MERGER_ANNOTATIONS[k];
      const hasTrad = ann.forms.some(f => !!PINGSHUI_CHAR[f.trad]);
      assert.ok(direct || hasTrad, `merger key ${k} has no pingshui anchor`);
    }
  });
});
