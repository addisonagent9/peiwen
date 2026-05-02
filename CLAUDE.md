# CLAUDE.md

**佩文・詩律析辨 (Peiwen Shilü Xibiàn) — handoff briefing for Claude sessions.**

Read this before making any non-trivial change to the repository. This is a
live production app at https://pw.truesolartime.com, operated by a single
developer (addisonagent9). No team, no tickets — just this document, the git
log, and the user's running mental model of what needs to happen next.

---

## 1. What the app does

Users paste or type a classical Chinese poem (近體詩 — 絕句 or 律詩). The app:

1. **Auto-detects the 詩體** (poem form): 七絕, 七律, 五絕, or 五律 by line
   and character count.
2. **Scores the poem against all 4 格** (variant patterns) of that 詩體:
   - 平起首句入韻 / 平起首句不入韻 / 仄起首句入韻 / 仄起首句不入韻
   - Each 格 gets a combined score (平仄 accuracy + 押韻 accuracy).
3. **Picks the best-fit 格** and renders a grid with per-character
   tone/rhyme annotations color-coded against the expected pattern.
4. **Reports violations** in a 校驗結果 panel: 出律, 三平尾, 三仄尾, 孤平,
   失對, 失粘, 押韻 mismatches.
5. **Supports live editing**: click a character cell → EditModal opens →
   typing a replacement re-runs the whole analysis.
6. **Reference page**: clicking the "平水韻 106 部" subtitle opens a 佩文詩韻
   reference showing all 106 rhyme groups and their characters.

Users are classical Chinese poets — hobbyists and serious practitioners.
They know prosody deeply. Never correct them on classical conventions
unless verified via authoritative sources (廣韻, 康熙字典, 搜韻, 佩文詩韻,
52shici).

---

## 2. Architecture

### Tech stack

**Frontend**
- React 18 + TypeScript
- Tailwind CSS with custom tokens: `ink-bg`, `ink-line`, `cream`,
  `creamDim`, `gold`, `teal`, `amber`, `rose`
- Parcel bundler (not Vite, not Webpack, not Next.js)
- pinyin-pro for Hanyu Pinyin
- No routing library — view state is a simple `useState<View>`
- No Redux/Zustand — everything is `useState` + `useMemo`

**Backend**
- Express.js (Node.js)
- SQLite for user accounts + saved poems
- Google OAuth
- systemd service `poetry-checker`

### Repo structure

```
poetry-checker/
├── src/
│   ├── App.tsx                      main component, view state, pills
│   ├── i18n.ts                      bilingual 繁/簡
│   ├── analysis/
│   │   ├── tone.ts                  lookup, lookupExpecting, withChosen
│   │   ├── validate.ts              analyzeAgainst, computeLiveIssues, checkNianDui
│   │   ├── detect.ts                detectBest
│   │   ├── rhyme.ts                 rhymesOf, charsInRhyme
│   │   └── moedict.ts               external dictionary lookup
│   ├── data/
│   │   ├── pingshui.json            106 rhyme groups, ~19,600 chars
│   │   ├── pingshui.ts              exports PINGSHUI_RHYME etc.
│   │   └── ambiguous-readings.ts    per-char annotations
│   ├── patterns/
│   │   ├── patterns.ts              patternsForForm, 16 patterns
│   │   └── types.ts                 pattern types, slot kinds (P/Z/f/c)
│   └── ui/
│       ├── Grid.tsx                 main poem display
│       ├── CharCell.tsx             individual character cell
│       ├── EditModal.tsx            character edit modal
│       ├── RhymeDrawer.tsx          rhyme browsing drawer
│       └── RhymeReference.tsx       佩文詩韻 reference page
├── scripts/
│   ├── build-pingshui.mjs           builds pingshui.json from CSV
│   ├── patch-pingshui.mjs           post-build corrections (15 entries)
│   └── audit-pingshui/              triangulation audit pipeline
├── data/
│   ├── references/                  external dict data
│   └── audit/                       audit outputs
├── server/                          Express backend
├── dist/                            built output (COMMITTED)
└── package.json
```

### Deployment pipeline

GitHub: https://github.com/addisonagent9/peiwen
VPS: Ubuntu, `/var/www/pw.truesolartime.com`

**`dist/` is committed.** The VPS does not run `npm run build` — it
serves what's in `dist/`. Every deploy must rebuild locally and commit
both `src/` and `dist/`.

**Build**
```bash
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```
(Large heap because Parcel occasionally OOMs on pingshui data.)

**Deploy cycle**
```bash
# local
NODE_OPTIONS="--max-old-space-size=8192" npm run build
git status                       # verify dist/*.js modified
git add -A && git commit -m "..." && git push

# on VPS
cd /var/www/pw.truesolartime.com
git pull origin main
sudo systemctl restart poetry-checker
```

**If you amended a pushed commit** (divergent branches on VPS):
```bash
cd /var/www/pw.truesolartime.com
git fetch origin
git reset --hard origin/main
sudo systemctl restart poetry-checker
```
`reset --hard` is always safe on the VPS — the VPS never commits, only
pulls. `origin/main` is the source of truth.

**Cache-busting**: browsers cache the bundle aggressively. When verifying,
use `https://pw.truesolartime.com/?v=feature-name` — any changing query
param forces a fresh load.

---

## 3. Core analysis pipeline

```
user types poem
     ↓
lines: string[][]                    raw state in App.tsx
     ↓
analysisResult                       FROZEN at 析辨 click time
     ↓
liveRanked (useMemo)                 re-scores against lines on every edit
     ↓
selectedPattern (useMemo)            combines lockedPattern + liveRanked
     ↓
Grid renders CharAnalysis[][]        tones, rhymes, mismatches
     ↓
校驗結果 panel                         live via computeLiveIssues
```

### Invariants (do not break)

1. **analysisResult is frozen.** Locks in detected 詩體 and the 4 格. Does
   not update on edits. Deliberate — a single-char edit shouldn't jarringly
   re-detect "now it's 五律 instead of 七絕."

2. **liveRanked re-runs on every edit.** Runs `analyzeAgainst(lines, p)`
   for each of the 4 格. Keeps pill percentages live.

3. **selectedPattern sources from liveRanked, not analysisResult.** This
   is why the selected pill's % always matches 校驗結果 by construction.
   If a refactor accidentally routes through analysisResult, the user
   notices within seconds.

### Key functions

**`src/analysis/tone.ts`**
- `lookup(char)` — all readings, `entries[0]` as default. Primary identity.
- `lookupExpecting(char, expected)` — iterates all entries, snaps to
  whichever matches `expected`. Implements **多音字入兩韻** — poets may use
  whichever reading fits their pattern. If `expected` is null or no match,
  falls back to `entries[0]`.
- `withChosen(char, entries, chosen)` — produces a ToneInfo with a specific
  entry chosen. Sets `ambiguous: entries.length > 1` (changed from old
  `hasPing && hasZe` so same-tone multi-readings like 徘 平-平 and
  暖 仄-仄-仄 also trigger the dot).

**`src/analysis/validate.ts`**
- `analyzeAgainst(lines, pattern)` — core scoring. Returns `combined`,
  `toneScore`, `rhymeScore`, `chars`, `issues`, `rhyme`, `nianDuiOk`.
- `computeLiveIssues(chars, pattern)` — runs validation over resolved
  chars. Position-specific messages like "第3、4句失對（第4字）", never
  blanket enumerations.
- `checkNianDui(chars, pattern)` — 粘 (lines 2-3, 4-5, 6-7 MATCH at
  2/4/6) and 對 (lines 1-2, 3-4, 5-6, 7-8 OPPOSE at 2/4/6). Iterates
  per-position via `toneAt()` that skips nulls. Do **NOT** revert to the
  old `v && b[i]` short-circuit that flagged whole couplets.

---

## 4. Dictionary internals

### pingshui.json structure

```typescript
{
  chars: { [char: string]: PSEntry[] },       // "暖" → [{tone,group,rhyme}, ...]
  rhymes: { [rhymeName: string]: PSEntry[] }, // "十四旱" → [{...chars}]
  rhymeOrder: string[]                         // canonical 106-group order
}
```

- Keys in `chars`: traditional characters. First entry is default.
- Keys in `rhymes`: **short names** without tone prefix ("一東", "十四旱",
  "二十九艷"). NOT "上平一東" — that's display-only in RhymeReference.
- `PINGSHUI_RHYME_ORDER` is authoritative. Don't re-sort.

### ambiguous-readings.ts

```typescript
type ReadingNote = {
  rhyme: string;                     // e.g. "九屑"
  note_zh_tw: string;
  note_zh_cn: string;
  status: "attested" | "retained_legacy";
};

type AmbiguousReading = {
  note_zh_tw?: string;
  note_zh_cn?: string;
  per_reading_notes?: ReadingNote[];
};
```

12 entries total:
- **Char-level notes (8)**: 茍, 妳, 圯, 晁, 婧, 拼, 柿, 暖
- **Per-reading notes (4)**: 嚙, 徘, 濫, 臒

### Patterns

```typescript
type SlotKind = "P" | "Z" | "f" | "c";
// P = required 平 | Z = required 仄 | f = free | c = constrained (rhymable)

interface PoemPattern {
  id: string;
  lines: LineTemplate[];
  rhymeTone: "平" | "仄";            // 仄韻 rare but supported
  // ...
}
```

**16 patterns total** (4 詩體 × 4 格). In `patterns.ts`. 仄韻 variants
returned by `patternsForForm(form, "仄韻")` when `allowZe: true`.

### Never edit pingshui.json directly

- Edit the source CSV, OR
- Add a patch to `scripts/patch-pingshui.mjs`.

The `data` npm script runs build-pingshui.mjs then patch-pingshui.mjs.

### Patch script ordering invariant

Operations in `patch-pingshui.mjs` run sequentially. One critical rule:

**ADDs first, reorders last.**

`reorderToRhyme` silently no-ops if the char doesn't exist in `entries[]`
yet (`entries.length < 2` guard). If you ADD a char and then reorder it
later, that's fine. But if you reorder before adding (or before
tc2sc/Group D propagation creates the char), the reorder produces no
error and no log — the call just returns `undefined`.

This bit batch 5: 鹔 + 箓 had `reorderToRhyme` calls placed in a
"corrections" block that ran before the `addMultiReading` section. The
chars didn't exist yet at reorder time, so the reorders silently
no-oped. The subsequent ADDs created them with the wrong default. Fixed
in batch 7 by adding post-ADD reorder calls at the end of the script.

Standard order in `patch-pingshui.mjs`:

1. Source-supplement IIFEs (mutate variant source readings before Group D
   loop reads them)
2. Dedup IIFEs (clean duplicate entries before mirrors copy them)
3. Group D `variantPairs` additions (variant pair mirroring; runs once
   when array is iterated)
4. Reorders (mechanical + watch-list + 簡 mirrors) — chars must exist
5. Single-reading ADDs
6. Multi-reading ADDs
7. Post-ADD reorders (rare — for chars created by ADDs in step 5–6 that
   need re-defaulting)

### IIFE patterns (escape hatches)

When the DSL helpers (`addReading`, `reorderToRhyme`, `addMultiReading`)
can't express what you need, drop into a direct-mutation IIFE. Three
patterns are established:

**Source supplement** — variant source has fewer readings than audit
expects:

```javascript
(function supplement髒() {
  const existing = d.chars["髒"];
  if (!existing) { console.warn("髒 missing"); return; }
  if (existing.some(e => e.rhyme === "二十三漾")) { return; }
  existing.push({ tone: "仄", group: "去聲", rhyme: "二十三漾" });
  ensureBucket("髒", existing[existing.length - 1]);
  console.log("髒 supplemented → " + existing.map(e => e.tone + " " + e.rhyme).join(" | "));
})();
```

Used when source variant in a Group D pair (case C) needs additional
readings before the mirror loop runs. Examples: 撏 (batch 4), 嶮
(batch 4), 値 (batch 5), 髒 (batch 7).

**Dedup** — `entries[]` has duplicate `(tone, rhyme)` pairs:

```javascript
(function dedup請() {
  const entries = d.chars["請"];
  if (!entries) return;
  const seen = new Set();
  d.chars["請"] = entries.filter(e => {
    const key = e.tone + "|" + e.rhyme;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  // Also dedup 簡 form if applicable
  if (d.chars["请"]) { /* same filter */ }
  console.log("請 deduped → " + d.chars["請"].map(e => e.tone + " " + e.rhyme).join(" | "));
})();
```

Used when CSV import or earlier patches left duplicate readings.
Examples: 蝍 (batch 5), 楥 (batch 5), 請 (batch 7). Must run BEFORE
Group D so mirrors copy clean arrays.

**N-th reading addition** — char has 3 readings, audit confirms a 4th:

```javascript
(function add角4thReading() {
  const existing = d.chars["角"];
  if (!existing) { console.warn("角 missing"); return; }
  if (existing.some(e => e.rhyme === "十一尤")) { return; }
  existing.push({ tone: "平", group: "下平", rhyme: "十一尤" });
  ensureBucket("角", existing[existing.length - 1]);
  console.log("角 4th reading added → " + existing.map(e => e.tone + " " + e.rhyme).join(" | "));
})();
```

Used when `addReading` would create a 2nd entry but you want a specific
position, or when the DSL doesn't support multi-reading appends to
existing chars. Examples: 角 (batch 5, +平/十一尤 jiǎo sense), 矜
(batch 3, +平/十二文).

Style conventions for IIFEs: idempotent (`existing.some(...)` before
mutating), warn on missing chars, log final state, name the IIFE after
the affected char.

---

## 5. Classical prosody primer

### Basics

**近體詩** (regulated Tang verse) has 4 詩體:

| 詩體 | lines × chars | total |
|------|---------------|-------|
| 五絕 | 4 × 5         | 20    |
| 七絕 | 4 × 7         | 28    |
| 五律 | 8 × 5         | 40    |
| 七律 | 8 × 7         | 56    |

Each 詩體 has 4 格 from (平起/仄起) × (首句入韻/不入韻).

### 平 and 仄

Middle Chinese had 4 tones: 平, 上, 去, 入. Classical prosody groups:
- **平聲** = 平 (上平 vols 1-15 + 下平 vols 16-30, identical for prosody)
- **仄聲** = 上 + 去 + 入

**入聲 is the trap.** Disappeared from Mandarin but persists in Cantonese,
Hakka, Min. Stored literally as `tone: "入"`, normalized to 仄 for 平仄
comparisons. Modern Mandarin 一 ("yī") sounds 平 but is 入聲 → 仄. App
color-codes 入 in amber vs other 仄 in rose.

### The 106 平水韻 groups

平水韻 = Southern Song codification. 佩文詩韻 = Kangxi Qing edition,
functionally equivalent for poetry.

- 上平聲: 15 (一東 … 十五刪)
- 下平聲: 15 (一先 … 十五咸)
- 上聲: 29 (一董 … 二十九豏)
- 去聲: 30 (一送 … 三十陷)
- 入聲: 17 (一屋 … 十七洽)

Total 106. Canonical order hardcoded in `src/ui/RhymeReference.tsx`.

**Naming**: full form 上平一東, 上聲十四旱, 入聲九屑. Short form (data
keys) 一東, 十四旱, 九屑. `shortName()` helper strips prefix.

### What rhyming means

Two chars rhyme iff they share a 平水韻 group. NOT Mandarin similarity.
東 vs 冬 sound identical in Mandarin but are 一東 vs 二冬 — do NOT rhyme
classically. 家 vs 花 sound different but both 六麻 and rhyme fine.

**Rhyming line positions**:
- 五絕/七絕: lines 2, 4 always rhyme. Line 1 optional (首句入韻).
- 五律/七律: lines 2, 4, 6, 8 always rhyme. Line 1 optional.

All rhyming chars must be one group. 換韻 (switching) is 古體詩, out of
scope.

### Violation types

- **出律**: wrong tone at required slot.
- **三平尾**: last 3 chars all 平. Forbidden.
- **三仄尾**: last 3 chars all 仄. Generally avoided (less strict).
- **孤平**: isolated 平 flanked by 仄s in specific position. Contested
  definitions (王力 narrow vs 啟功 broader). Ask before extending logic.
- **失對**: lines 1-2, 3-4, 5-6, 7-8 must OPPOSE at positions 2, 4, 6.
- **失粘**: lines 2-3, 4-5, 6-7 must MATCH at positions 2, 4, 6.
- **押韻 mismatch**: rhyming line doesn't end in dominant group.

Messages are position-specific. Do not revert to blanket "第2字、第4字、第6字".

### Multi-reading (多音字) — permissive convention

Many chars have multiple classical readings. Examples:
- **暖**: 仄 十四旱 (nuǎn) | 仄 十三阮 | 仄 十一隊 (ài, 曖 variant) | 平 十三元 (xuān, rare)
- **种**: 平 一東 (Chóng) | 仄 二腫 (zhǒng) | 仄 二宋 (zhòng, plant)
- **干**: 平 十四寒 (gān) | 仄 十五翰 (gàn, 幹 variant)

Poets may use whichever reading fits their pattern (多音字入兩韻). App
implements via `lookupExpecting` — if ANY reading matches the slot, accept.

**Don't "fix" this to default-only scoring.** It would break classically
valid usage. The amber dot + EditModal pills exist so poets can SEE the
ambiguity and optionally pin an intended reading.

### Authoritative sources

- **搜韻** (sou-yun.cn) — comprehensive, Middle Chinese reconstructions
- **52shici.com** — decent, not definitive
- **康熙字典** — most authoritative Qing classical dictionary
- **廣韻** — Song rhyme dictionary, ancestor of 平水韻
- **教育部重編國語辭典** (moe.edu.tw) — Taiwan's official, contemporary 繁
- **百度百科 / 維基文庫** — historical texts

**Never use pinyin-pro alone for prosody decisions.** Middle Chinese
determines 平仄, not Mandarin.

---

## 6. Dictionary patching history

### Group A — 10 early patches (user + heuristic)

In `scripts/patch-pingshui.mjs`:

1. **种** — was only 平 一東 (Chóng). Added 仄 二腫 (zhǒng), 仄 二宋 (zhòng, plant). Default 仄 二腫.
2. **据** — was only 平 六魚 (jū, archaic). Added 仄 六御 (jù, 據). Default 仄.
3. **干** — was only 平 十四寒. Added 仄 十五翰 (gàn, 幹). Default 仄.
4. **肮** — classical 骯. Was 平. Corrected to 仄 二十二養 as default.
5. **睾** — variant of 睪. Added to 入 十一陌.
6. **宁/寧** — 簡 宁 had no entry. Added 平 九青.
7. **听** — 簡 听. Added 平 九青 (matches 聽).
8. **几/幾** — 簡 几. Added 平 五微.
9. **徑** — reordered so 仄 二十五徑 is default.
10. **研** — had NO entry. Added 平 一先 (yán).

### Group B — triangulation audit (13 CRITICAL)

Compared against charlesix59 / jkak / cope. Consensus rule: ≥2 of 3
sources agreeing on a missing/wrong reading flags CRITICAL. 13 CRITICAL,
593 HIGH. Only CRITICAL reviewed this session.

Of 13:
- **5 data-patched** (correct as default, old preserved as secondary):
  暖, 臒, 嚙, 徘, 濫
- **7 kept as-is** (external wrong, genuinely multi-reading, or too
  ambiguous): 茍 (confused with 苟), 妳, 圯, 晁, 婧, 拼, 柿
- **1 expanded later**: 暖 got a 4th reading

### Group C — 暖 曖-variant expansion

User flagged via 搜韻. Verified. Added 仄 十一隊 as third secondary.
Current readings:

1. 仄 十四旱 (default, nuǎn, "warm")
2. 仄 十三阮 (nuǎn, alt 上聲)
3. 仄 十一隊 (ài, 曖 variant)
4. 平 十三元 (xuān, rare)

### Per-reading annotations

For 嚙, 徘, 濫, 臒, we kept dictionary-error readings as secondaries and
added `per_reading_notes`:

- **嚙**: 九屑 attested (康熙字典, 廣韻), 十八巧 retained_legacy
- **徘**: 十灰 attested, 九佳 retained_legacy
- **濫**: 二十八勘 attested, 二十七感 attested, 二十九豏 retained_legacy
- **臒**: 七虞 attested (臞 variant), 十藥 attested (jkak confirmed)

Rendered in EditModal:
- ✓ teal = attested
- ⓘ amber = retained_legacy

The older 8 chars have char-level notes only.

### Group D — alternate-繁 variant mirroring

Group D handles variant pairs that `tc2sc.json` doesn't cover:
alternate-繁 forms where two traditional variants exist for the same
character (e.g. 恆/恒, 旣/既, 寛/寬). These pairs aren't `tc2sc.json`
mappings (which is trad↔simp), so build-time mirroring misses them.
`patch-pingshui.mjs` has a `variantPairs` array that explicitly mirrors
these.

Pair classification (A/B/C/D/E framework, established across batches):

- **A. Clean mirror** — src has expected readings; dst absent. Default
  action.
- **B. Multi-reading mirror** — src has multiple readings; dst absent.
  Same as A — `variantPairs` loop transparently handles multi-reading
  sources.
- **C. Source partially missing** — src exists but lacks some
  audit-expected readings. Source-supplement IIFE (see §4) runs BEFORE
  Group D loop. Examples: 撏 (batch 4), 嶮 (batch 4), 値 (batch 5),
  髒 (batch 7).
- **D. Source absent entirely** — neither src nor dst exists. Plain ADD
  on dst, no Group D entry needed.
- **E. dst already exists** — halt and surface; data drift, may indicate
  a pair already shipped via different route.

Group D inheritance: when src has a multi-reading default that doesn't
match audit's primary, the dst inherits the wrong default. Fix is a
post-mirror `reorderToRhyme` call. Examples: 楦 (batch 5, source 楥 had
十三元 first but audit primary was 十四願), 尚 (batch 5, source 尙 had
七陽 first but audit primary was 二十三漾).

Detection: ad-hoc per batch via user pattern-matching of common chars in
the audit's "missing" list. The ±5 codepoint-proximity heuristic
produces ~99% false positives for this class. A systematic source
(Unihan `kCompatibilityVariant` / `kTraditionalVariant`) would replace
pattern-matching but isn't currently sourced. (Parked as #15.)

Total Group D pairs shipped through May 2026 sweep: ~50 across 7
batches.

### Audit sweep summary (May 2026)

Seven-batch audit-driven sweep ran across one extended session, closing
518 of 530 baseline HIGH-tier audit findings. Final state: 12 HIGH
(10 KEEPs + 2 SKIPs, all intentional), 9 CRITICAL stable (unchanged
from baseline), MEDIUM/LOW unchanged.

| Batch | Commit | Patches | KEEPs added | HIGH after |
|---|---|---|---|---|
| Setup (一東 + initial Group D) | fb6c378, 3e85ad3, ed9f177 | 17 | — | 530 |
| Batch 2 | ab54ac5 | 46 | 殷 | 469 |
| Batches 3+4 | 166ec40 | 100 | 唏, 詛 | 375 |
| Batch 5 | 5cfed7a | 147 | 佐 | 228 |
| Batch 6 | 051c5e5 | 105 | 圈 | 123 |
| Batch 7 (final) | 044db7a | 111 | — | 12 |

KEEPs (10 chars, audit will continue flagging — pingshui correct per
user classical verdict):

- 茸 (batch 1, 平/一東 default — 草初生 sense)
- 殷 (batch 2, 平/十一真 default — 殷商 sense)
- 唏 (batch 4, 平/五微 per 《唐韻》虛豈切)
- 詛 (batch 4, 仄/七遇 per 《廣韻》莊助切)
- 佐 (batch 5, 仄/二十哿 default)
- 圈 (batch 6, 平/一先 default — quān 環形物 sense)
- 浾 (batch 4, 平/八庚 default — chēng 棠棗汁 sense)
- 挦 (batch 4 reconstruction, 平/十三覃 per 《廣韻》昨含切)
- 鳒 (batch 4 Group D from 鰜, 平/十五咸 — jiān 比目鱼 sense)
- 崄 (batch 4 Group D from 嶮, 平/十四鹽 — xiǎn 高峻 sense)

SKIPs (2 chars, no source triangulation): 瞆, 跼.

After this sweep, further audit-driven progress would require pipeline
support for `per_reading_notes`-style annotations to suppress KEEP-class
flags. The 12 remaining flags are documentation, not bugs.

---

## 7. UI & state

### Component hierarchy

```
App.tsx
├── Header (clickable "平水韻 106 部" → view = "rhyme-reference")
├── Poem input textarea
├── 析辨 button
├── (after detection)
│   ├── 4 格 pill buttons (source: liveRanked)
│   ├── Grid.tsx → CharCell.tsx (amber dot if multi-reading)
│   ├── 校驗結果 panel (live)
│   └── RhymeDrawer
├── EditModal
│   ├── char input
│   ├── readonly info (繁/簡, pinyin, 字義, English)
│   ├── clickable reading pills with ✓/ⓘ
│   ├── char-level note (if in AMBIGUOUS_READINGS)
│   └── per-reading notes list
└── RhymeReference.tsx (view === "rhyme-reference")
    ├── Back arrow + "佩文詩韻" title
    ├── Tabs: 平聲 | 仄聲
    ├── Inline checkboxes: 顯示漢語拼音, 顯示僻字
    └── RhymeGroupList
```

### State management

Everything in App.tsx, props-drilled. Works because tree is shallow
(~4 levels). `useMemo` for derivations. Key state:

- `raw: string` — raw textarea
- `lines: string[][]` — parsed
- `analysisResult` — frozen detect result
- `lockedPattern: string | null` — explicit pill selection
- `liveRanked` — useMemo re-scoring
- `selectedPattern` — useMemo combining
- `editCell: {li, pos} | null`
- `drawerRhyme: string | null`
- `locale: "繁" | "簡"`
- `view: "main" | "rhyme-reference"`
- `user: User | null` — OAuth

### Styling (Tailwind)

Custom colors:
- `ink-bg` dark bg, `ink-line` divider
- `cream` primary text, `creamDim` muted
- `gold` accent / active tabs
- `teal` 平 / attested ✓
- `amber` 入 / retained_legacy ⓘ / multi-reading dot
- `rose` 仄
- `serif` Chinese display, `sans` UI

Stub-card dots:
- Center top ◉/◎ — slot flexibility (可平可仄)
- Top-right amber — multi-reading (`entries.length > 1`)

EditModal pill badges:
- ✓ teal = attested
- ⓘ amber = retained_legacy

### i18n

All user-facing strings through `t.someKey` from `T[locale]` in `i18n.ts`.
繁 is primary; 簡 mostly auto-derived but manually curated for classical
terms (佩文詩韻 → 佩文诗韵). Add BOTH locales when adding strings.

---

## 8. Working style

### Communication contract

The user is a senior technical collaborator, practicing classical poet,
sole operator. Treat as a peer. Push back when wrong. Ask clarifying
questions when genuinely unsure. Cut to the point when confident.

Quirks:
- Mixes 繁/簡/English freely
- Terse, context-dependent requests
- Screenshots are primary bug reports
- "ship it" / "done" / "good" over verbose confirmation
- Pivots topics without warning
- Prefers momentum over perfection

Don't pad. No "Great question!" preambles.

### Typical exchange patterns

**Pattern A — feature/fix**
User describes → ask clarification if needed (`ask_user_input_v0`,
1-3 Q max) → state lean → user picks → write Claude Code prompt →
user runs, pastes output → review → deploy → verify via Chrome tool →
user confirms.

**Pattern B — bug**
User reports → investigate via Chrome tool (cache-bust URL, DOM, JS exec)
→ diagnose ROOT cause, not symptom → propose fix → Claude Code prompt →
deploy → verify.

**Pattern C — domain question**
User asks → search authoritative source if uncertain → concise answer with
source → user decides.

### Writing Claude Code prompts

Template:

```markdown
# [Title]

## Context
[Why this change exists. 1-2 paragraphs.]

## Goal
[1 paragraph: the outcome.]

## Part N: [specific area]
[CONCRETE, UNAMBIGUOUS instructions. File paths, line numbers when known,
exact old/new snippets when helpful.]

## Rules
- DO NOT change X
- DO NOT refactor Y
- Keep Z unchanged

## Deliverables
1. [specific file(s) changed]
2. Build succeeds (`NODE_OPTIONS="--max-old-space-size=8192" npm run build`)
3. [visual/functional verification]
```

Habits:
- **Never ambiguous.** "Replace line 304: `...old...` with `...new...`"
  beats "update the relevant section."
- **Always include Rules.** Claude Code refactors unprompted; Rules
  prevent scope creep.
- **Always include build step.** CC should verify it compiles.
- **Request verification** — visual, file listing, or specific behavior.
- **Keep focused.** 5 unrelated tasks = 5 prompts, not one.

### Chrome browser tool

Get tab id via `tabs_context_mcp`. Navigate with cache-bust:
```
https://pw.truesolartime.com/?v=newfeature
```

Useful JS snippets:

```javascript
// Verify deployed bundle
const scripts = Array.from(document.scripts).map(s=>s.src)
  .filter(s=>s.includes('poetry-checker'));
fetch(scripts[0]).then(r=>r.text()).then(t=>({
  bundle: scripts[0], hasFix: t.includes('expected-string')
}))

// Type test poem into textarea (respects React controlled input)
const ta = document.querySelector('textarea');
const setter = Object.getOwnPropertyDescriptor(
  window.HTMLTextAreaElement.prototype, 'value').set;
setter.call(ta, '...poem...');
ta.dispatchEvent(new Event('input', { bubbles: true }));

// Walk React fiber for app state
const root = document.querySelector('#root') || document.body.children[0];
const key = Object.keys(root).find(k => k.startsWith('__reactContainer$'));
let fiber = root[key].stateNode.current;
```

Text dump by default. Screenshot only for visual issues.

### ask_user_input_v0

For **decisions**, not info-gathering. If you can answer via browser
inspection or web search, do that first. Max 3 Q, 2-4 short distinct
options. Give your lean after the user answers, unless they've decided.

### When to disagree

- Request contradicts a classical convention user probably forgot
- Fix is surface-level while bug is architectural
- About to deploy something untested

Format: "Before we do X, I want to flag Y. [reason]. Would you want
[alternative] instead?"

Don't disagree on:
- Stylistic preferences
- Subjective classical judgments the user is more qualified on
- Their product decisions

### Uncertainty

"I don't know, let me check." Don't hedge with "I believe" when you
mean "I'm guessing." Own mistakes quickly and specifically.

---

## 9. Common pitfalls

1. **Forgetting to rebuild `dist/`.** VPS serves stale bundle. Always
   `npm run build` after source edits.
2. **Variant character keys** (豔/艷, 眞/真). Grep the bundle to verify
   data keys match label strings.
3. **Assuming default-reading-only scoring.** It's not — `lookupExpecting`
   iterates all readings. Intentional.
4. **Breaking liveRanked → selectedPattern.** Pill % diverges from
   校驗結果. User notices immediately.
5. **Over-formatting EditModal content.** It's packed. Keep concise.
6. **Reverting checkNianDui** to `v && b[i]` short-circuit. Re-creates
   whole-couplet false positive.
7. **Hardcoded Chinese strings.** Always route through `t.someKey`.

---

## 10. What's currently shipped

### Correctness fixes
- 校驗結果 live-updates after edits (`computeLiveIssues`)
- checkNianDui position-specific messages (toneAt skip-null)
- liveRanked pill rescoring (pill % ≡ 校驗結果 %)

### Dictionary
- 15 post-build patches via patch-pingshui.mjs
- Triangulation audit infrastructure (13 CRITICAL reviewed, 593 HIGH pending)
- per_reading_notes on 嚙, 徘, 濫, 臒

### UI
- Amber dot on all multi-reading chars (`entries.length > 1`)
- ⓘ integrated into EditModal (removed from stubs); △ replaced by ⓘ
- 佩文詩韻 reference page (106 groups, tabs, pinyin/僻字 toggles)

### Bug catches
- 去聲二十九艷 silent drop: label 豔 (U+8C54) vs data 艷 (U+8277) variant
  mismatch → fixed

---

## 11. Open threads / roadmap

### A. 593 HIGH-tier audit findings
Pattern established. Ask what batch size to tackle. Offer to prioritize
by classical-corpus frequency.

### B. Reference page performance
~19,600 chars in one scroll. React.memo per group currently. If slow on
mobile: IntersectionObserver lazy mount, react-window, or aggressive
僻字 filter by default. Don't preemptively optimize.

### C. Reference char interaction
Currently display-only. Could open a lightweight EditModal variant on
click. Not yet built.

### D. Simplified reference variants
Rhyme names are 繁 even in 簡 locale. 佩文詩韻 is canonically 繁. Could
add 簡 mapping but left for now.

### E. Claude Code beeper
User mentioned once; no resolution. Diagnostics exist in earlier
conversation (`npm ls -g`, `brew list`, `~/.claude/settings.json` hooks,
macOS notification permissions / Focus mode / volume).

### F. Cross-char variant consistency audit
Compare ZE_SECTIONS/PING_GROUPS label strings vs PINGSHUI_RHYME keys
programmatically. Simple defensive investment.

### G. 粘/對 edge cases
Standard cases handled. Rare 仄韻 variants might have exceptions. Verify
against canonical sources before changing logic.

### Ideas floated but not built
- Export poem as image/PDF
- AI-assisted line suggestions
- Corpus browser (big scope)
- Pinyin toggle on main grid
- Beginner mode (educational walkthrough)
- Public share links

---

## 12. Things NOT to do

- **Don't edit pingshui.json directly.** Patches only.
- **Don't change lookupExpecting's iteration** without explicit sign-off
  (foundation of multi-reading permissiveness).
- **Don't break liveRanked → selectedPattern.**
- **Don't drop retained_legacy readings** — annotate instead.
- **Don't remove 繁 primary reference form.** 佩文詩韻 is canonically 繁.
- **Don't add tests without asking.** User prefers manual prosody
  verification.
- **Don't refactor for aesthetics.** Functional refactors only.
- **Don't rely on pinyin-pro for prosody decisions.** Middle Chinese
  determines 平仄, not Mandarin.

---

## 13. First actions in a new session

1. Brief hello, acknowledge this doc is read.
2. Ask what to work on.
3. Before non-trivial work: `git log` locally, visit live site with
   cache-bust, confirm latest is deployed. Then plan.

Most changes will be incremental — UI polish, dictionary corrections,
new reference content, small features. Rarely rewrite core analysis logic.

The user values momentum over perfection. Multi-day threads without
shipping frustrate them. Thread-ending deploys are celebrated. Aim for
"what can I ship in the next 30 minutes" over "what perfect design would
take a week."

Trust the data they know. When they say "暖 has a 曖-variant at 仄 十一隊,"
they've likely already verified via 搜韻. Don't waste time demanding
citations — acknowledge, incorporate, ship. If you suspect an error, say
so specifically ("that might conflict with X, can you double-check?")
rather than stonewalling.

You have the context. Go build.

---

## 14. Admin & premium access: three gates, read DB live

### The three gates (check all three when changing access)

The trainer module has THREE independent gates. Missing any of them
means a user passes one layer and fails another — producing confusing
symptoms like a visible nav link that 404s when clicked.

1. **Frontend nav link** — `src/App.tsx:355`. Uses `hasPremiumAccess(user)`
   (returns true for `is_admin === 1 || is_premium === 1`). Hides the
   韻部訓練 button when false.

2. **Frontend view guard** — `src/App.tsx:477`, same helper. Checked
   again when `view === "pingshui-trainer"` so unauthorized programmatic
   access (stale state, devtools) redirects to home.

3. **Backend beta gate** — `server/middleware/trainer-beta.mjs`.
   `requireTrainerBeta` first bypasses for `is_admin === 1` or
   `is_premium === 1`. Otherwise reads `TRAINER_BETA_USER_IDS` from
   `server/.env` and returns **404 (not 403)** for anyone not in the
   allowlist — the route appears nonexistent. Env var behavior:
   - **Unset** → gate disabled, all authed users pass
   - **Set but empty** → nobody passes *except admins/premium*
   - **Set with IDs** → listed IDs pass, plus admins/premium

   The allowlist is lazy-initialized (parsed on first request, not
   module load) so dotenv has time to run first. Boot log:
   `journalctl -u poetry-checker | grep "trainer.*gate"` reports gate
   status at startup via `describeTrainerGate()`.

   `requireAuth` always runs before `requireTrainerBeta` in the
   composedGate chain (`server/trainer/index.mjs:39-54`), so
   `req.user` is guaranteed populated when the beta gate runs.

### 404-instead-of-403 is a debugging trap

If the same URL returns 200 for one authenticated user and 404 for
another, it is almost certainly a hidden allowlist — not a missing
route. Check backend middleware before assuming the route is broken
or the deploy is stale.

### Session state is read live from DB per request

`passport.deserializeUser` in `server/index.mjs:64-66` does a fresh
SELECT on every request. So `req.user.is_admin` and `req.user.is_premium`
always reflect current DB state — no logout required after role changes.

One historical bug broke this: the OAuth callback was overwriting
`is_admin` back to 0 on every login (derived from email). Fixed in
commit `7631e14` — existing users now preserve their DB flags across
logins, only NEW signups get email-based defaults (addison.k@gmail.com
→ admin+premium, all others → 0). See `server/index.mjs:83-92`.

### DB and .env file locations on VPS

- App DB: `/var/www/pw.truesolartime.com/server/data.db`
  — users, poems, audio_clips, srs_state, etc.
  Code uses `path.join(__dirname, "data.db")` so the path is relative
  to `server/` working directory.
- Session DB: `/var/www/pw.truesolartime.com/server/sessions.db`
  — separate file managed by `connect-sqlite3`
- `.env`: `/var/www/pw.truesolartime.com/server/.env`
  — loaded by `dotenv.config()` in `server/index.mjs:19` at startup,
  NOT by systemd `EnvironmentFile`. Service restart is still required
  after `.env` edits because dotenv runs once at process start.

### Editing .env on the VPS

Typing `FOO=bar` at the shell prompt sets that shell's environment —
it does NOT append to `.env`, and the Node process does not see it.
The service reads `.env` on startup only.

Correct pattern for a key that already exists:

    # VPS
    sudo sed -i 's/^KEY_NAME=.*/KEY_NAME=newvalue/' /var/www/pw.truesolartime.com/server/.env
    grep KEY_NAME /var/www/pw.truesolartime.com/server/.env   # verify
    sudo systemctl restart poetry-checker

Correct pattern for appending a new key:

    # VPS
    echo 'NEW_KEY=value' | sudo tee -a /var/www/pw.truesolartime.com/server/.env
    sudo systemctl restart poetry-checker

Always `grep` to confirm the file actually changed before restarting.

### Cache-busting after deploy

When verifying a deploy, append a query string to force a fresh HTML
fetch: `https://pw.truesolartime.com/?v=<feature-name>`. Without this,
the browser may serve cached HTML pointing to an old bundle hash —
making a successful deploy look like it failed. JS/CSS bundles are
hash-named (e.g. `poetry-checker.51e49383.js`) so they're safe to
long-cache; only the HTML layer caches problematically.

### Debugging checklist — "new admin/user can't access X"

In order, fastest to slowest:

1. Cache-bust browser: open `?v=check` — rules out stale HTML
2. In the affected user's console, run
   `fetch('/api/auth/me',{credentials:'include'}).then(r=>r.json())`
   — confirms their session sees is_admin / is_premium correctly
3. Try the failing API call directly from their console — if they
   get 404 where others get 200, it's a hidden allowlist, not a
   missing route
4. On VPS: `sqlite3 server/data.db "SELECT id,email,is_admin,is_premium FROM users;"`
   — confirm DB truth for that user
5. Grep middleware: `grep -rn "req.user" server/middleware/ server/routes/`
   — enumerate every gate

### Relevant commits

- `73db241` — admin toggle UI + PATCH /api/admin/users/:id
- `7631e14` — OAuth callback preserves is_admin/is_premium on login
- `cec3abe` — `hasPremiumAccess` helper + premium toggle in admin UI
- `c1005ef` — 韻部訓練 nav + view guard use `hasPremiumAccess`
- `af49416` — `requireTrainerBeta` bypasses for admins/premium

---

## 15. Trainer pedagogy canon

### The 4 drills (same definitions across all tiers)

**Drill 1 — 字→韵部 Recognition.** Show a character, pick its 韵部 from
4 options. Flashcard format. Sets 1–4 grade by character rarity.
*(Skill: "I recognize this char's category.")*

**Drill 2 — 韵部→字 Recall.** Show a 韵部 label + 8 characters. Learner
picks the 4 that belong to that 韵部. Distractors drawn from other tier
rhymes (Tier 1 distractors are safe by design; Tier 2 distractors are
within-family and cruel). Sets 1–4 grade by char rarity among the 4
correct answers.
*(Skill: "I can produce chars from this category.")*

**Drill 3 — 辨韵 Discrimination.** Show two characters side by side,
binary: "do these rhyme in 平水韵?" Within-family pairs in Tier 2 are
the pedagogical core — 一东 vs 二冬 has no fair way to be guessed and
must be memorized. Wrong answer surfaces the family grouping,
teachingNote, mnemonic, and anchor poem link from `trainer-curriculum.ts`
(currently unused data, activated here). Sets 1–4 grade by pair
confusability.
*(Skill: "I know where category boundaries lie.")*

**Drill 4 — 押韵应用 Application.** Real Tang poem with rhyme position
blanked. Learner picks correct char from 4 options: 1 real, 3 distractors
that rhyme in modern Mandarin but are 出韵 in 平水韵. Wrong answer shows
both 韵部 and why the distractor is a trap. **10 seed poems per tier**
hardcoded, plus admin dashboard to generate more. Sets 1–4 grade by
distractor plausibility (how convincingly Mandarin-rhymes it is).
*(Skill: "I can apply this in composition.")*

### Gates — low barriers, self-paced

- **Between drills within a tier**: learner completes Drill N once (any
  accuracy) → Drill N+1 unlocks. No threshold. No repetition requirement.
  The rationale is self-pacing for advanced learners who already know
  what they're doing.
- **Between tiers**: learner completes Drill 4 of Tier N once → Tier N+1
  unlocks.
- **Admin override**: admin console has "Unlock all for user X" that
  bypasses gates entirely. Used for self-learning and dogfooding new
  tier content before the previous tier is mastered.

### Two "开始练习" bars

Once multiple tiers are unlocked, two session-start entry points:

- **Green bar** (trainer home) — "开始综合练习". Pulls chars from ALL
  unlocked tiers, interleaved via Bjork template across the global pool.
  Active only after Tier 2 Drill 1 is unlocked; before that it's
  identical to the tier-scoped bar so it's hidden.
- **Plain bar** (inside each tier view) — "开始本层练习". Scoped to the
  current tier only. Shortcut for that tier's Drill 1.

Inside each tier view, 4 drill cards (Drill 1 / 2 / 3 / 4) render with
lock icons for drills not yet unlocked.

### Data model (target state)

- `drill_sessions` — per completed session: user_id, tier, drill_number,
  rhyme_id (nullable for cross-rhyme drills), size, correct_count,
  wrong_count, completed_at.
- `tier_drill_unlocks` — user_id, tier, drill_number, unlocked_at. Set
  when user finishes the previous drill once.
- `tier_unlocks` — user_id, tier, unlocked_at. Set when user finishes
  Drill 4 of previous tier once.
- `drill4_poems` — admin-created poems supplementing the hardcoded 10
  seed poems per tier. Runtime reads both and merges.

Existing `srs_state` table stays as-is (tracks Drill 1 per-char correct/
wrong). Other drills use the new `drill_sessions` table.

### State of play (as of 2026-11-01)

The trainer module ships Tier 1 fully (4 drills, 5 rhymes:
一東/七陽/十一尤/六麻/五歌). Tier 2 and Tier 3 are locked behind
content prep + TTS batch generation; admin can override via the admin
console.

**Drills shipped:**
- **Drill 1 (识韵)**: Recognition. Bjork interleave templates for
  5/10/20-card sessions.
- **Drill 2 (回韵)**: Recall. 4-of-8 selection from a 韵部 prompt.
- **Drill 3 (辨韵)**: Discrimination. Pair judgment with
  WrongAnswerPanel showing family + teaching note + mnemonic + anchor
  poem.
- **Drill 4 (词语补齐)**: Word completion. 2-char compound with one
  char blanked. Round-robin distribution + Bjork tier filtering
  (post-`8e19693`, `3157d90`). Chinese glosses from MOE (72% coverage);
  English fallback for 28% (parked ticket #14).

**Post-curriculum 韵部库:**
- Read-only dashboard showing collected chars per rhyme (auto-filled by
  Drill 4).
- Per-rhyme 温韵默考 button launches pure-recall self-test
  (post-`adf137b`).

**Analyzer:**
- 字境 (admin-only AI char suggestion): three-skill dispatch, MOE +
  few-shot anchoring, suppressed contradictory "暫無建議"
  (post-`9c19932`).
- Multi-tone (多音字) user pinning: full feature shipped across 4
  phases (see §21).
- Auto-rhyme-match for rhyme-position cells (post-`6bc476e`).
- `checkRhymes` uses chosen rhyme + requiredRhyme (post-`e52cdb0`,
  Issue B resolved).

**Tier 1 audit batch**: 4 of 14 一東 findings reviewed. 10 一東
findings remain (烽, 蘢, 谾, 漎, 逄, 攏, 總, 蓊, 菶, 翪). ~519
findings remain across other rhymes (530 total HIGH-tier per
dictionary-audit-v2.md).

### Parked queue (as of 2026-11-01)

**Active backlog (real work to do):**

- **#6**: Audit pipeline batch. 一東 cluster paused at 4 of 14 findings
  (10 remain: 烽, 蘢, 谾, 漎, 逄, 攏, 總, 蓊, 菶, 翪). ~519 findings
  across other rhymes (530 total HIGH-tier per dictionary-audit-v2.md).
- **#7**: 簡↔繁 rhyme-merger annotations. Some 簡 chars merge multiple
  繁 forms with classically-distinct rhymes (丰/豐 pattern: 丰 → 二冬,
  豐 → 一東). Pedagogical content addition; surfaces during audit work.
- **#8**: Build-time guardrail. Automated check that fails if
  curriculum-vs-pingshui drift. Closes the bug class behind `31de576`
  (Tier 1 audit, 8 chars) and `fb6c378` (一東 audit batch, 茸 misseed).
- **#10**: CLAUDE.md docs sweep. Phases 1+2 shipped; this commit closes
  #10.
- **#14**: Fill MOE coverage gap. Source additional classical Chinese
  dictionaries (漢語大詞典, 中華語文知識庫, Wiktionary Chinese, manual
  curation) for the 28% of Drill 4 corpus 词语 not covered by MOE.
  Until shipped, those 词语 display English CC-CEDICT glosses as
  temporary fallback.
- **#16**: Multi-tone must have multi-card (need strengthen Library).
  Today the popup card on the rhyme reference page (§11.C, shipped
  in `7a37b8a` + `0dbe9b2`) shows a single card per char with shared
  字義 / 词语 across all readings. For multi-音字 chars where each
  reading is historically a distinct word (种 chóng/zhǒng/zhòng,
  殷 yīn/yān/yǐn, 中 zhōng/zhòng), the meaning shown contradicts
  whichever reading pill is currently ring-highlighted. Pedagogically
  wrong: each reading SHOULD be its own card with its own 字義,
  pinyin/jyutping, and 词语 (compound list filtered by the reading's
  pinyin).
  Blocking work: per-reading 字義 source. MOE returns one entry
  per char-key, not per (char, rhyme, pinyin). Three approaches
  considered: (1) AI-generated `reading-glosses.json` with user
  verdict pipeline, similar shape to the dictionary-audit-v2
  triangulation flow — multi-session. (2) Source from 漢語大詞典 /
  康熙字典 / Wiktionary multi-reading sections — highest quality,
  slowest, overlaps with #17 (popup card coverage gap). (3) Hybrid:
  AI seed + user verdict, classical-source triangulation only when AI
  is uncertain.
  UI work after data lands: swap RhymeCharCard from "share content
  across pills" to "swap content per pill" — re-derive 字義, py, jyut,
  compounds based on currentRhyme's reading. Pill click already wires
  through `onRhymeChange`; just need the data plumbing.
  Library work needed: probably a new `src/data/reading-glosses.json`
  (or `.ts` if curated by hand) keyed by `{char}__{rhyme}__{pinyin}`
  with `{gloss_zh, gloss_en, notes}` shape. Builds alongside the
  existing `ambiguous-readings.ts` per-reading-notes infra (currently
  14 chars).
  Multi-session arc. Likely sequence: data-source decision → seed
  generation → verdict pipeline → UI swap → deploy.
- **#17**: Fill unique word with meaning and 词语. The popup card on
  the rhyme reference page (§11.C, shipped in `7a37b8a`) shows empty
  字義 row and empty 词语 section for chars where MOE has no entry
  AND CC-CEDICT has no 2-char compounds containing the char. Most
  visible on rare/archaic chars surfaced via the 显示僻字 toggle
  (e.g. 簽 in 一東 area shows char + pinyin only — no meaning, no
  compounds). Affected surface is the popup card; affected chars are
  the long tail of pingshui's ~19,600-char corpus that modern
  dictionaries don't cover.
  Distinct from #14 — #14 scopes to Drill 4's `drill4-corpus.json`
  (compound glosses for the trainer corpus). #17 scopes to per-char
  meaning + compound coverage on the reference page. Same family of
  "fill the dictionary gap" work; different surfaces, different
  remediation deliverables.
  Distinct from #16 — #16 is per-reading content for multi-音字 chars
  with multiple meanings. #17 is single-meaning chars that simply
  lack any meaning entry today.
  Sources to evaluate (overlap with #14 + #16): 康熙字典 OCR/digital
  corpus, 漢語大詞典, Wiktionary Chinese, 教育部異體字字典, 中華語文
  知識庫. Pipeline: per-char triangulation across sources, user
  verdict on disagreements, auto-merge on consensus, ship as a
  patch file consumed by the reference card's lookup chain
  (probably extends moedict.ts to fall back to a supplement table
  when MOE returns empty).
  CC tooling angle: have CC search candidate sources online per char,
  surface findings in audit-batch-N.md format (current readings vs
  candidate gloss vs source per source), user verdicts, batch-patch.
  Same shape as the dictionary-audit-v2 sweep that closed in May 2026.
  Multi-session arc. Likely sequence: source-candidate evaluation →
  pilot batch (~20 chars) → verdict-pipeline shape settles → corpus-
  wide sweep.

**Older parked items (pre-November 2026):**

- Audio Review Library perf: at ~200+ approved clips the Library tab
  becomes sluggish (renders all clips at once). Pagination or
  collapse-by-default solution sketched in earlier briefings; not yet
  built. Trigger: when audio review page first feels sluggish, or
  before the Tier 2 TTS batch lands.
- Revert manual `.env` TRAINER_BETA_USER_IDS edit on VPS: a manual
  VPS-side `.env` modification was made during early Tier 1 testing;
  should be reverted to whatever the canonical state is now that
  production has stable beta gating.

**Recently shipped (closed this session):**

- ~~#3 Bjork tier filtering inside Drill 4 round-robin~~ → `8e19693` +
  `3157d90` (corpus re-grading activated the queue logic)
- ~~#4 Multi-tone (多音字) user selection~~ → 4-phase ship (`e61ccfc` →
  `9c19932`; see §21)
- ~~#5 Issue B: line-2-canonical analyzer change~~ → `e52cdb0` (resolved
  as part of multi-tone work)
- ~~#9 Per-card char count restore~~ → `fb6c378`
- ~~#11 Drill 4 corpus rare_set re-grading~~ → `3157d90`
- ~~Drop 疴 from curriculum~~ → done (commit `6ba3b9b`)
- ~~Delete `src/config/trainer-beta.ts`~~ → done (same commit)

### Lessons learned during Drill 2 implementation

- **Nested `<button>` is invalid.** A `<button disabled>` parent
  disables ALL nested interactive elements, including child buttons
  meant to remain active. If a card has a primary action (whole-tile
  click) AND secondary actions (audio play), wrap the card in a
  `<div role="button" tabIndex>` with onClick + onKeyDown, and keep
  the inner buttons as real `<button>` elements. The audio bug in
  Drill 2 (commit f213bb2) was exactly this.
- **Back button routing must be explicit per subView.** Nested
  ternaries quickly drift wrong. Use a switch/case or a lookup map
  keyed on subView. Drill 2 shipped with a bug where every back
  button went to home; fixed in 5b18e79.
- **Drill completion should return to tier view, not trainer home.**
  The learner started from tier view, just unlocked the next drill —
  they should see the unlock take effect on the same screen. Don't
  jump them up two layers.
- **"开始本层练习" bar was vestigial after drill cards shipped.**
  When the new pattern (drill cards) supersedes the old (single
  start button), delete the old. Don't leave both — users get
  confused which is the "real" entry point. Removed in 0331adc.
- **Once drill cards become the sole entry, promote them visually.**
  They were neutral border-only; learners didn't perceive them as the
  primary CTA. Switched to emerald in 7395da3.

### Relevant files

- `src/data/pingshui/trainer-curriculum.ts` — 3-tier, 30-rhyme curriculum.
  Families, teaching notes, mnemonics, anchor poems all live here.
- `src/components/trainer/` — all trainer UI components.
- `server/routes/drill.mjs` — drill queue/response endpoints, interleave
  templates.
- `server/data/tier1-seed-chars.mjs` — flat char array mirroring
  seedCharacters, with rhymeId + set fields for the drill API.
- `server/trainer/index.mjs` — mounts trainer routes, composedGate.
- `server/middleware/trainer-beta.mjs` — beta allowlist (bypasses for
  admins/premium per commit `af49416`).

---

## 16. 字境 — AI character-suggestion feature

Admin-only AI assistant in EditModal that suggests replacement characters
under prosodic constraints. Invoked via a gold "字境" pill button that
renders whenever `isAdmin && val` (any cell with a character).

### Three skills

Dispatched deterministically from cell position × char state:

```
| Position                    | Char state     | Skill |
|-----------------------------|----------------|-------|
| Line 2 last char            | any            | 3     |
| Other rhyme-position last   | 韵部 mismatch  | 2     |
| Other rhyme-position last   | matched        | 3     |
| Non-rhyme position          | tone mismatch  | 1     |
| Non-rhyme position          | tone matched   | 3     |
```

- **Skill 1** (tone fix): current char as semantic anchor, asks Claude for
  similar-meaning chars with the corrected tone. Prompt: "「X」讀Y聲，現需
  替換為Z聲字..."
- **Skill 2** (tone+韵部 fix): like Skill 1 plus a rhyme constraint clause.
  Prompt appends "且必須屬於平水韻「R」韻部".
- **Skill 3** (exploration): no mismatch. User types freely in the cell
  (multi-char for compound seeds), taps 字境. Prompt: "請列出15個意思與
  「seed」相近、可用於古典詩詞的Z聲字..."

### requiredRhyme (App.tsx)

Sourced dynamically from line 2's current last char's first 平 reading:

```tsx
const entries = lookup(line2LastChar).entries;
const pingReading = entries.find(e => e.tone === '平');
return pingReading?.rhyme ?? null;
```

This follows the line-2-canonical principle: line 2 defines the poem's
rhyme. Editing line 2 dynamically updates what 字境 suggests for other
rhyme positions. The analyzer's red-coloring (checkRhyme majority vote)
is separate — visible inconsistency is acknowledged (Issue B, parked).

### Server

`POST /api/suggest` in `server/index.mjs`. Gated by `requireAdmin`
(not premium). Proxies to Anthropic Messages API:
- Model: `claude-sonnet-4-5` (hardcoded)
- Temperature: 0
- Max tokens: 2048
- No rate limiting, no cost monitoring (each tap = one billed API call)

### Post-filter pipeline

Results are parsed line-by-line, deduped, then filtered:
1. Tone filter: `lookup(char).entries.some(e => tone matches expectedTone)`
2. Rhyme filter (if requiredRhyme): `rhymesOf(char).includes(requiredRhyme)`
3. prevSeen dedup across pagination batches

Stale-fetch guard: `fetchReqId` ref counter incremented per fetch; callbacks
bail if their captured ID doesn't match current. Bumped on modal open and
← 返回 to invalidate in-flight requests.

**Few-shot prompt anchoring (post-`9c19932`)**: when requiredRhyme is
set, the prompt includes 7 high-frequency chars from
PINGSHUI_RHYME[requiredRhyme].chars as concrete example anchors
("「一先」韻部包括以下字（僅作示例）：年、天、然、前、邊、仙、船。"). The
"（僅作示例）" parenthetical is non-negotiable — without it, the model
regurgitates the few-shot chars as suggestions instead of using them
as references. Applied uniformly to mismatch (Skill 1/2) and
non-mismatch (Skill 3) prompts when requiredRhyme is truthy.

**Suppressed contradictory "暫無建議" (post-`9c19932`)**: when AI
suggestions are filtered to empty AND the rhyme-fallback grid is
rendering, the "暫無建議" text is suppressed via guard
`!(exhausted && requiredRhyme)`. The fallback grid's own heading
("「一先」韻部所有平聲字：") makes clear what's being shown — saying
"no suggestions" while visibly listing chars contradicts itself.

### Key commits

字境 cluster spans 16+ commits. Major categories:
- Feature: `ffcadf0` (Skill 3 + always-show + 🙏→字境 rename)
- requiredRhyme fixes: `dc63ae0` (pin to frozen analysisResult),
  `ff15444` (position check — last char only), `53faa99` (dynamic
  from line 2), `47a9906` (flexible-tone support)
- Rhyme-mismatch detection: `7cb744c` (show button for 韵部 mismatches)
- IME: `0b6ce42`, `5d57fe4` (DOM-value-as-source-of-truth)
- Stale fetch: `ac920a4` (request-ID guard)

---

## 17. Trainer Drills 3 and 4 (post-§15 changes)

### Drill 3 — 辨韵 (pair discrimination)

Show two chars side by side, binary "do these rhyme in 平水韵?". Tier 1
pairs are deliberately easy (rhymes are distinctive, no family overlap);
the UI was hardened here for Tier 2 where within-family pairs (一東/二冬)
become the core challenge.

**Pair generation per Set:**
- Set 1: same-rhyme, both from per-char Set 1 (common+common, `rhymes: true`)
- Set 2: cross-rhyme, both from per-char Set 1 (common+common, `rhymes: false`)
- Set 3: same-rhyme, one common + one rare (Set 3∪4, `rhymes: true`)
- Set 4: cross-rhyme, both rare (Set 3∪4, `rhymes: false`)

Bounded retry (5 attempts) on collision; redraw if `left.char === right.char`.

**Wrong-answer panel** surfaces curriculum data:
1. Answer reveal: both chars' 韵部 labels
2. Family name (null in Tier 1; populated for Tier 2+)
3. teachingNote from FAMILIES (separate from mnemonic)
4. Mnemonic from the rhyme entry (italic, softer weight)
5. Anchor poem(s) with rhyming chars highlighted in gold

Relevant commits: `be2c394` (initial), `dfb88c5` (field mapping fix),
`f213bb2` (audio button fix in feedback), `7395da3` (green styling).

### Drill 4 v2 — 词语补齐

**Design pivot:** §15's original Drill 4 spec ("Tang poem with rhyme
position blanked, 10 hardcoded poems per tier") was abandoned. Reason:
hardcoding 10 seed poems per tier requires classical-poet content review
that no one has done. The v2 design uses algorithmically-derived 2-char
词语 from CC-CEDICT.

**Corpus pipeline** (`scripts/build-drill4-corpus.mjs`):
1. Parse CC-CEDICT (124K entries, 62K 2-char compounds)
2. Filter: 2-char trad only, all chars in pingshui.json, no Extension B+
3. Junk filter: skip proper nouns (capitalized pinyin), modern tech/science
   terms (regex on English gloss + Chinese terms)
4. Tier classification: "classical" (literary/poetic markers) or "neutral"
5. Multi-平-reading skip: chars with >1 distinct 平 rhyme cannot be
   honestly taught as belonging to a single rhyme
6. Curriculum cap: answer char must be in Tier 1 seedCharacters (165 chars)
7. Per-rhyme cap: 500 entries per rhyme, classical-first

Output: `src/data/pingshui/drill4-corpus.json` (committed, ~2500 entries).

**Glosses (post-`3157d90`)**: Chinese definitions from MOE 重編國語辭典
(`src/data/moedict-map.json`, 162K entries). Coverage: 72% of corpus 词语
(1808 of 2500). Remaining 28% (mostly modern compounds + rare literary
terms) keep English CC-CEDICT gloss as TEMPORARY fallback until parked
ticket #14 sources additional classical Chinese dictionaries.

**rare_set algorithm (post-`3157d90`)**: `computeRareSet` inherits each
answer char's curriculum `SeedCharacter.set` (1-4) from
`trainer-curriculum.ts`. Replaces the original algorithm that graded by
position in the full pingshui rhyme bucket (which put all curriculum chars
in Set 1 because they're high-frequency).

**Card UX:** 2-char word displayed with one char blanked (inline `<input>`
matching surrounding 48px serif font). Free Chinese IME input. Submit
validates exact match against expected char. Auto-advance on correct
(1500ms, admin-tunable via app_settings). Manual 下一题 on wrong.

**Round-robin distribution:** word-queue allocates per-rhyme slots.
5-card = 1 per rhyme; 10-card = 2; 20-card = 4. Rhyme order shuffled per
session; queue returned in Bjork-template tier order (per
INTERLEAVE_TEMPLATES) — warm-up → stretch → settle preserved.

**Bjork tier filtering (post-`8e19693`, `3157d90`)**: per-position tier
comes from INTERLEAVE_TEMPLATES. Char selection within each (rhyme,
rare_set) bucket is random; if the bucket is empty, lenient fallback
descends through tiers (Set 4 → 3 → 2 → 1) before ascending. The
rare_set field inherits each answer char's curriculum SeedCharacter.set
(1-4) from trainer-curriculum.ts — Drill 1 and Drill 4 share Bjork tier
per char (pedagogical consistency). Entry-count skew within rhymes
(Set 1 dominant) is expected: high-frequency Set 1 chars generate many
CC-CEDICT compounds; rare Set 4 chars generate few. Per-answer-char set
assignment is correct; the skew is a property of the compound distribution,
not the grading algorithm.

### 韵部库 (user_rhyme_library)

Per-user persistent collection of chars earned through Drill 4. Schema:

```sql
CREATE TABLE user_rhyme_library (
  user_id TEXT NOT NULL,
  rhyme_id TEXT NOT NULL,
  char TEXT NOT NULL,
  source TEXT NOT NULL,  -- 'drill4' | 'manual' (manual unwired in v1)
  added_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, rhyme_id, char)
);
```

Auto-filled: `/word-response` handler INSERTs on correct answer.
Dashboard view: `RhymeLibrary.tsx` at subView `'library'`.

**温韵默考 (post-curriculum self-test, commits `adf137b`, `5f11655`)**:
dashboard's per-rhyme button launches a pure-recall session. The user
types chars from memory matching the rhyme; no scaffolding (no hints,
no difficulty labels, no answer-target chars). Justification: the
library is post-Drill-4 territory — users have already been taught
these chars; this exercise is for retrieval, not first-encounter
learning.

**Single entry surface**: dashboard's per-rhyme "温韵默考" button.
RhymeDetail's "开始练习" was removed in `5f11655` — single entry,
single mental model.

**Wrong-answer feedback**: manual "下一题" advance (no auto-advance);
error message names the actual rhyme via `/library/add`'s extended
422 response ("「龙」属于二冬韵部，不属于一東").

**Session-scoped back**: "← 退出" top-left of session header returns
to the 我的韵部库 dashboard (NOT trainer home — the trainer's global
"<" header button does its own job).

`LibraryAddButton.tsx` and `/library/add` are no longer the path for
this feature; the route remains hardened from `527afaf` + `f2b8d43`
and could be reused for a different future feature.

Relevant commits: `8760fdf` (initial), `c26dc83` (Bjork queue + button
wiring, later reverted), `4487dcb` (multi-reading fix + hint pinyin),
`52ac63b` (five-bug round), `2bbdaf3` (繁 label fix).

### Endpoint hardening (post-7cf4416)

Three commits tightened the Drill 4 write paths after the §17 prose
above was written:

- **62f1e18** — `/word-response` corpus-lookup forge gate. Before
  62f1e18, any authenticated user could POST `(rhyme, expected, answer)`
  with arbitrary values and forge "correct in Drill 4" rows in their
  own `user_rhyme_library`. The fix verifies `(rhyme, expected)` appears
  in the actual drill4 corpus before running the correctness check.
  New 422 reason code: `unknown_prompt`.
- **e6f3e7a + c6a39b2** — variant tolerance in `/word-response`. The
  answer-equality check widened from strict `===` to a variant-
  equivalence Set membership test (繁↔簡 via tc2sc.json plus alt-繁
  pairs from `patch-pingshui.mjs` Group D, with union-find for
  transitive triples like 鈎/鉤/钩). c6a39b2 was a deploy hotfix
  tracking `tc2sc.json` in the repo — it had been gitignored, and
  e6f3e7a's runtime `readFileSync` crashed the service on startup
  with ENOENT.
- **527afaf + f2b8d43** — server-side validation in `/library/add`.
  `rhyme_id` must be in the 30-rhyme curriculum (not just the broader
  106 平水韻 set); `char` must have a 平 reading in that rhyme. Three
  reason codes: `missing_field`, `unknown_rhyme_id`, `char_not_in_rhyme`.

§20(b) carries the full treatment of both library-write paths and
their validation contracts.

---

## 18. app_settings — admin-tunable runtime config

Generic key-value store for runtime configuration. Schema:

```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  updated_by TEXT
);
```

**Endpoints:**
- `GET /api/settings` — public, returns only whitelisted keys
- `GET /api/admin/settings` — admin-only, all rows with audit metadata
- `PATCH /api/admin/settings/:key` — admin-only, updates value + audit trail

**Frontend:** `src/hooks/useAppSettings.ts` — no caching (each call fetches
fresh). Drill components call `fetchAppSettings()` once on session start.
Admin console shows a "训练设置" tab with per-row editing.

**Current settings:**
- `drill3_correct_advance_ms` (default 700)
- `drill3_wrong_advance_ms` (default 1400)
- `drill4_correct_advance_ms` (default 1500)

Note: `drill4_correct_advance_ms` is in the DB and editable from the
admin UI, but is NOT in `PUBLIC_SETTINGS_WHITELIST` — `/api/settings`
(public) does not return it, so `DrillWordSession` falls back to its
hardcoded 1500ms default regardless of what the admin sets. Adding it
to the whitelist is a small follow-up; until then the admin edit
doesn't propagate.

**Adding a new setting:** INSERT row in a migration → add to
`PUBLIC_SETTINGS_WHITELIST` in `server/index.mjs` if user-readable →
admin UI row appears automatically.

Relevant commit: `0a98523`.

---

## 19. Operational lessons learned (post-§15)

### IME compositionEnd: read DOM value, don't accumulate

`onCompositionEnd` and `onChange` both fire during IME input. Accumulating
via `prev + newVal` double-writes (onChange already updated prev). Fix:
both handlers read `e.currentTarget.value` as source of truth.
Commits: `0b6ce42`, `5d57fe4`.

### Module-level fetch caches break admin propagation

`useAppSettings` originally had `let cachedSettings = null` at module
scope — never invalidated. Admin edits to settings values didn't take
effect until page reload. Fix: drop the cache; each call fetches fresh.
Commit: `2b13b6e`.

### 簡↔繁 label mismatches cause silent 0-result lookups

`server/data/trainer-curriculum.mjs` had 7 rhyme labels in 簡 form while
pingshui.json/drill4-corpus.json keys are 繁 throughout. Lookups like
`drill4Corpus['一东']` returned undefined (key is `'一東'`). User saw 60%
short-delivery. Fix: correct all labels to 繁. Commit: `2bbdaf3`.

### Stale-fetch race: request-ID guard pattern

When user navigates away mid-fetch then starts a new fetch, the old
promise's `.then()` can overwrite the new state. Fix: `useRef` counter
incremented per fetch; callbacks check captured ID. Commit: `ac920a4`.

### Tailwind opacity-modifier may not compile for custom colors

`text-gold/70` didn't produce a CSS rule because the custom `gold` color
lacks alpha-channel mapping. Fix: use `text-gold opacity-70` (two separate
utilities). Commit: `9380318`.

### Variant-key bidirectional mirroring in pingshui build

Source CSV uses one 繁 form; common-usage form may differ (牀→床, 畱→留,
眞→真). Additionally, 繁↔簡 variants (涼→凉, 鉤→钩) weren't mirrored.
2063 chars were missing their variant-form entries. Fix: build-time
mirroring via `tc2sc.json` + targeted patches for alternate-繁 pairs
not in tc2sc. Variant-key mismatch count: 2063 → 0. See §6 for the
existing patch-pingshui convention. Commit: `214f533`.

### Poem lock + confirm-delete

Per-poem `is_locked` column (migration 009). Lock is instant; unlock
requires `SlideToConfirm` drag bar (deliberate friction). Locked poems
hide delete button; backend DELETE rejects with 409. All deletes show
`ConfirmDialog` modal. Commit: `5db754f`.

### Composer draft across OAuth round-trip

Typing a poem then clicking sign-in loses the textarea content (full-page
redirect to Google). Fix: stash `raw` to `sessionStorage` key
`peiwen.composer.draft` on auth-button click; restore on next mount.
Commit: `f717d75`.

### Hint toggle pill convention

`HintTogglePill` component + `useHintToggle` hook. Per-drill localStorage
keys (`peiwen.trainer.{drill1|drill2|drill3|drill4}.hint`). Drill 1 has
legacy migration from `drillHintEnabled`. Defaults: Drill 1 on, Drill 2
off, Drill 3 on, Drill 4 on. Commits: `04ffef6`, `848dcd8`, `6a7c2d5`.

### Curriculum-vs-pingshui drift causes silent miseducation

**Symptom**: Drill 1/3/4 teach a char as belonging to a rhyme it doesn't
classically belong to. User typing "correct" answers gets correct feedback
for wrong prosody.

**Cause**: `trainer-curriculum.ts` seedCharacters and `pingshui.json`
char-to-rhyme assignments can disagree without any automated check
catching it. Drift accumulates silently across edits.

**Fix**: per-batch audits comparing the two sources (commit `31de576`
fixed 8 chars in Tier 1; `fb6c378` fixed 茸). A build-time guardrail to
prevent recurrence is parked as a separate ticket.

**Lesson**: data sources that should agree must have automated agreement
checks. Without them, silent drift becomes user-facing miseducation.

### Migration runner wraps in db.transaction(); FK rebuilds need defer_foreign_keys

**Symptom**: migration crashes on deploy with `cannot start a transaction
within a transaction` OR `FOREIGN KEY constraint failed` during DROP TABLE.
Service enters restart loop.

**Cause**: `server/db/migrate.mjs` already wraps each migration in
better-sqlite3's `db.transaction()`. Migration files MUST NOT include
explicit `BEGIN TRANSACTION` / `COMMIT` — the wrapper provides this. For
table-rebuild migrations (CREATE new + INSERT copy + DROP old + RENAME),
`foreign_keys=ON` in production triggers FK validation at DROP TABLE; need
`PRAGMA defer_foreign_keys = ON` inside the migration to defer until COMMIT.

**Fix**: `c2cf4fc` removed BEGIN/COMMIT and added defer_foreign_keys to
migration 012. Both fixes verified by running through actual
`runMigrations()` path before deploy.

**Lesson**: test migrations through the actual runner (not bare
`sqlite3 < file`) before claiming done. Bare CLI doesn't apply the
runner's transaction wrapper or production's FK-on PRAGMA.

### AI hallucination + post-filter rejection produces contradictory UI

**Symptom**: 字境 dialog shows "暫無建議" while simultaneously displaying a
fallback grid of valid chars. User concludes the feature is broken.

**Cause**: AI model hallucinates chars in wrong rhymes; post-filter
correctly rejects them (filtered list goes to zero); UI renders "no
suggestions" alongside the rhyme-fallback grid that's actually showing
valid chars. Two contradictory signals.

**Fix (`9c19932`)**: (a) few-shot the prompt with 7 example chars from
PINGSHUI_RHYME — anchors the model to ground truth. (b) suppress
"暫無建議" when fallback grid renders via `!(exhausted && requiredRhyme)`.

**Lesson**: AI suggestions need ground-truth anchoring (few-shot) AND
graceful UX when post-filter empties results. Don't show "no suggestions"
alongside a working fallback.

### New analyzer behavior surfaces a parked Issue

**Symptom**: auto-rhyme-match (`6bc476e`) shipped; cells correctly
displayed chosen reading post-rhyme-match. But the analyzer's red-coloring
flagged cells whose chosen rhyme actually matched the canonical anchor.

**Cause**: `checkRhymes` computed its own dominant rhyme via `rhymesOf()`
(all-readings iteration), independent of auto-rhyme-match's chosen reading.
Two algorithms disagreed. Documented as Issue B in CLAUDE.md, parked as
"only worth doing if the inconsistency is actually bothering you in
practice."

**Fix (`e52cdb0`)**: `checkRhymes` now takes (chosen rhymes, requiredRhyme)
as parameters. Strict comparison: cell passes IFF `chosen.rhyme ===
requiredRhyme`. Auto-rhyme-match made the disagreement user-visible,
forcing the resolution.

**Lesson**: parked issues can become "actually bothering" the moment a
related feature ships. New behavior shipping atop unresolved parked issues
exposes them. Re-audit parked items when shipping changes that overlap.

### 入→仄 normalization in audit pipeline

When reproducing audit results outside the pipeline, query
`data/audit/ours.json` — not raw `src/data/pingshui.json`.

The audit pipeline's `normalize.mjs` flattens 入聲 to 仄聲 in
`ours.json` before consensus diffing. This means a char with 入/一屋
default in `pingshui.json` shows as 仄/一屋 in `ours.json`. Comparison
scripts that read raw `pingshui.json` will see different tone strings
than the audit and produce false mismatch counts.

This bit batch 5 reconciliation: a verification script reading
`pingshui.json` directly reported 457 chars matching audit consensus,
but the actual audit report showed 517. The 60-char gap was 入聲 chars
where pingshui's `"入"` string didn't match consensus's `"仄"` string
in the raw comparison.

**Rule**: audit-reproduction or count-reconciliation scripts always read
`data/audit/ours.json`. `patch-pingshui.mjs` writes raw 入 in
`pingshui.json` (correct for storage); the normalize step happens at
audit-pipeline read-time.

### Reorder targeting from audit triangulation

When mechanically generating `reorderToRhyme` calls for a batch's
findings, derive the target rhyme from the audit's "Triangulation" row
of the per-finding output, not from heuristics like "first secondary" or
"highest-tone reading."

Batch 5 surfaced this when 24 of 105 reorders went to wrong targets.
The script generating the reorders had picked the entry-list-order or
tone-priority heuristic instead of the actual triangulation primary. The
`audit-batch-N.md` output already lists the consensus target per
finding — the patch script must consume that field directly.

**Workflow rule** baked into Part 1 lockdown: every `reorderToRhyme`
target is verified against the corresponding audit-batch finding's
triangulation primary BEFORE patching. The Part 1 dump produces a
per-char row showing (current default | audit primary | planned target);
zero mismatches required to greenlight Part 2.

---

## 20. April 2026 — schemas, library writes, lessons

This section consolidates reference material and reasoning rules
that emerged from the April 2026 session. Subsections are intended
to be linked from elsewhere in the doc rather than read in order.

### Canonical schemas

These are the trainer-relevant tables, pasted verbatim from their
migrations. Use `sqlite3 server/data.db '.schema <table>'` for
newer tables (migrations ≥012) before trusting any of the below.

**`drill_sessions`** (migration 008)

```sql
CREATE TABLE IF NOT EXISTS drill_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  tier INTEGER NOT NULL,
  drill_number INTEGER NOT NULL,
  rhyme_id TEXT,
  size INTEGER NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Per-completed-drill-session record. One row per session regardless of
drill type.

**`tier_drill_unlocks`** (migration 008)

```sql
CREATE TABLE IF NOT EXISTS tier_drill_unlocks (
  user_id TEXT NOT NULL,
  tier INTEGER NOT NULL,
  drill_number INTEGER NOT NULL,
  unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, tier, drill_number),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Per-user drill unlock state within a tier. Completing drill N unlocks
drill N+1; completing drill 4 unlocks the next tier.

**`tier_unlocks`** (migration 008)

```sql
CREATE TABLE IF NOT EXISTS tier_unlocks (
  user_id TEXT NOT NULL,
  tier INTEGER NOT NULL,
  unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, tier),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Per-user tier-level unlock state. All existing users were backfilled
with Tier 1 unlocked at migration time.

**`app_settings`** (migration 010)

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  updated_by TEXT
);
```

Generic key-value runtime config, admin-editable. See §18.

Seed rows from migrations 010 and 011:

```sql
-- migration 010
INSERT OR IGNORE INTO app_settings (key, value, description) VALUES
  ('drill3_correct_advance_ms', '700', 'Drill 3 auto-advance delay after correct answer (ms)'),
  ('drill3_wrong_advance_ms', '1400', 'Drill 3 auto-advance delay after wrong answer, with countdown bar (ms)');

-- migration 011
INSERT OR IGNORE INTO app_settings (key, value, description) VALUES
  ('drill4_correct_advance_ms', '1500', 'Drill 4 auto-advance delay after correct answer (ms)');
```

**`user_rhyme_library`** (migration 011)

```sql
CREATE TABLE IF NOT EXISTS user_rhyme_library (
  user_id TEXT NOT NULL,
  rhyme_id TEXT NOT NULL,
  char TEXT NOT NULL,
  source TEXT NOT NULL,
  added_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, rhyme_id, char),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Per-user persistent collection of chars earned through Drill 4 or
added manually. `source` is `'drill4'` or `'manual'`. See "Library
write paths" below for the two routes that write to this table.

### Library write paths

Two routes write to `user_rhyme_library`. They solve different
problems and validate against different authoritative sources, but
share the integrity invariant that every `(user_id, rhyme_id, char)`
row corresponds to a real classical pairing.

**`POST /api/trainer/drill/word-response`**

Endpoint signature: POST, gated by `composedGate` (authenticated +
trainer-beta). Request body: `{ answer, expected, rhyme }`.

Validation order:

1. `answer` and `expected` must be truthy strings → 400
   `{ error: 'INVALID_BODY' }`
2. Trim both; corpus-lookup gate: `drill4Corpus[rhyme]` must contain
   an entry where `entry.answer === expected` → 422
   `{ ok: false, reason: 'unknown_prompt' }`
3. Length-1 guard + variant-equivalence correctness:
   `a.length === 1 && e.length === 1 && getVariants(e).has(a)`
4. On correct: INSERT into `user_rhyme_library` with `source = 'drill4'`
   and `char = expected` (server-canonical form, not user-typed variant)

Source of truth: `drill4-corpus.json`. The corpus is the authoritative
record of which prompts the server issues via `/word-queue`. A
successful lookup at step 2 means "this is a card the server would
have given out." The `getVariants` helper (`server/lib/variants.mjs`)
widens the answer-equality check to accept 繁↔簡 and alt-繁 variant
forms of the expected char.

The forge gap (pre-`62f1e18`): any authenticated user could POST
arbitrary `(rhyme, expected, answer)` triples and, by setting
`answer === expected`, forge "correct in Drill 4" rows. The
corpus-lookup gate at step 2 closes this — forged `(rhyme, expected)`
pairs that don't exist in the corpus are rejected before the
correctness check runs.

Commit history: `62f1e18` (corpus-lookup forge gate), `e6f3e7a`
(variant tolerance via `getVariants`), `c6a39b2` (deploy hotfix —
tracked `tc2sc.json` in the repo after e6f3e7a's runtime
`readFileSync` crashed VPS with ENOENT on the gitignored file).

**`POST /api/trainer/drill/library/add`**

Endpoint signature: POST, gated by `composedGate`. Request body:
`{ rhyme_id, char }`.

Validation order:

1. `rhyme_id` and `char` must be truthy strings → 400
   `{ ok: false, reason: 'missing_field' }`
2. `rhyme_id` must be in `VALID_RHYME_LABELS` (the 30 curriculum
   rhymes from `RHYMES_PINGSHENG`) → 422
   `{ ok: false, reason: 'unknown_rhyme_id' }`
3. `pingshuiData.chars[char]` must have a 平 reading in that rhyme
   → 422 `{ ok: false, reason: 'char_not_in_rhyme' }`
4. INSERT into `user_rhyme_library` with `source = 'manual'` and
   `char` as user-supplied

Source of truth: 30-rhyme curriculum (`RHYMES_PINGSHENG`) +
`pingshui.json` char data. For manual adds, the right question is
"is this char classically rhyming in this rhyme?" — not "is this in
the Drill 4 corpus?" — because the manual-add feature is for chars
the user encountered outside Drill 4. The curriculum gate at step 2
ensures only the 30 平声 rhymes the user is learning are accepted
(not the broader 106 平水韻 set), so a 仄 rhyme like '一董' returns
`unknown_rhyme_id` rather than falling through to `char_not_in_rhyme`.

Commit history: `527afaf` (initial server-side validation), `f2b8d43`
(narrowed `VALID_RHYME_LABELS` from 106 to 30 curriculum rhymes).
As of Phase 1+2 of the 韵部库 self-practice feature (`b1bd25e`),
/library/add accepts an optional `source` field — `'manual'`
(default, for direct user adds) or `'practice'` (for the
self-practice exercise). The CHECK constraint added in migration
012 enumerates the three valid source values.

The asymmetry is not a strictness gradient — it is two correct
validations against two different sources. `/word-response` asks "is
this prompt real?" because Drill 4's authority is the corpus.
`/library/add` asks "is this pairing real?" because any manual-add
feature's authority is the rhyme dictionary itself.

Note (post-`5f11655`): the 韵部库 self-practice feature referenced
above pivoted to a pure-recall design that does not use `/library/add`.
See §17's 温韵默考 subsection. The route remains hardened and the
prose here serves as historical context.

### Deploy guards for new disk-resident files

When a code change introduces a module-load `readFileSync` of a new
disk-resident file, verify the file is committed before deploying.
Otherwise the service crashes on startup with ENOENT.

The incident: commit `e6f3e7a` added `server/lib/variants.mjs`, which
calls `readFileSync('data/references/tc2sc.json')` at module load to
build variant-equivalence classes. `tc2sc.json` had always been a
build-time input only — `build-pingshui.mjs` reads it locally, mirrors
entries into `pingshui.json`, and `pingshui.json` IS committed. VPS
received the post-mirror artifact without needing tc2sc.json at runtime.
But `e6f3e7a` introduced the first runtime consumer, and
`data/references/` was gitignored (`.gitignore` line 10). The deploy
crashed VPS on startup. Commit `c6a39b2` fixed it by adding a targeted
`.gitignore` exception (`data/references/*` with
`!data/references/tc2sc.json`) and tracking the file in place.

Before approving any diff that adds a runtime `readFileSync`:

```bash
git ls-files <path>          # must list the file
git check-ignore <path>      # must be empty (file not ignored)
```

VPS deploy block for commits introducing new disk-resident files:

```bash
[ -f <path> ] && systemctl restart poetry-checker || { echo "ABORT: missing file"; exit 1; }
```

This fails fast rather than letting the service crash into a restart
loop.

### Drill 4 corpus integrity (April 2026 audit)

Verified across the full `src/data/pingshui/drill4-corpus.json`:

- **2500 entries** across **5 rhymes** (一東, 七陽, 十一尤, 六麻, 五歌).
- **Cross-rhyme `answer` collisions: 0.** No answer char appears as
  the expected fill in two different rhymes. This means the corpus
  cannot produce contradictory library rows.
- **Within-rhyme variant-equivalent collisions: 0.** No rhyme contains
  both a 繁 and 簡 form of the same char as distinct expected answers.
  Library fragmentation across variant forms cannot occur from
  legitimate Drill 4 play.
- **Intentional `(rhyme, answer)` duplicates: 76.** The same answer
  char fills the blank in many different 词语 within the same rhyme
  (e.g. 中 in 136 different 一東 compounds). The `/word-response`
  corpus-lookup gate (`62f1e18`) uses `(rhyme, answer)` not just
  `answer`, which makes these duplicates safe — any matching entry
  confirms the prompt is real.

Any future "library fragmentation" worries that emerge from variant
forms should be checked against this audit baseline before being
treated as a real problem. The April session's initial worry was
test-induced — synthesized verification calls were the only way to
produce variant-fragmented rows, and the `62f1e18` forge gate closes
that synthesis path.

### DB queries vs. API GETs

When investigating "what's actually in the data," go to sqlite3.
When investigating "what does the UI see," go to the API. Don't
blend.

Endpoints filter, paginate, and project — they are correct for their
purpose but they hide rows that don't match their filters. The
`GET /api/trainer/drill/library` endpoint surfaces only Tier 1 rhymes;
querying it and concluding "library has N entries" hides rows in
non-Tier-1 rhymes.

The April session's specific failure: assistant claimed a user's
library had 2 entries based on the GET endpoint's response. Actual DB
had 3 rows (2 in 十一真, hidden by the Tier-1 filter). The mistake
compounded because subsequent reasoning ran forward from the wrong
baseline.

For "is this row in the DB?" questions:

```bash
sqlite3 server/data.db 'SELECT * FROM user_rhyme_library WHERE user_id = ?' <id>
```

For unfamiliar tables, get the schema first:

```bash
sqlite3 server/data.db '.schema <table>'
```

§20's "Canonical schemas" subsection above contains verbatim schemas
for all trainer-relevant tables; for newer migrations (≥012) always
`.schema` before writing SQL.

### Tools deferred via tool_search

The visible tool list in a Claude.ai session is partial. Many tools
(Chrome extension, MCP integrations, calendar/email, etc.) load via
`tool_search` and don't appear in the initial set. Before claiming a
capability is unavailable, run `tool_search` with relevant keywords.
"Not in my list" does not mean "unavailable."

The April session's specific case: the assistant offered a curl-based
workaround for live-site verification, claiming Chrome tools weren't
available. The user flagged that they should be deferred-loaded.
`tool_search` retrieved the full Chrome toolset on first call. If
`tool_search` returns nothing relevant, the tool is genuinely
unavailable and the user can decide on a workaround.

---

## 21. Multi-tone (多音字) user selection

Some classical Chinese chars have multiple (tone, rhyme) readings. 暖
has 4 readings spanning 仄/仄/仄/平 across 4 different rhymes. Per
CLAUDE.md §5, the analyzer's `lookupExpecting` is permissive: any
reading matching the slot's expected pattern is accepted (多音字入兩韻
convention).

This feature lets the user explicitly pin a reading per cell, declaring
compositional intent. The pin overrides auto-match and flows through to
scoring, display, 字境 suggestions, and requiredRhyme computation.

### Architecture

Pin storage shape (per poem):

```json
{
  "1,6": { "tone": "平", "rhyme": "一先" },
  "3,6": { "tone": "平", "rhyme": "一先" }
}
```

Keys are composite "lineIdx,pos" strings. Values identify the reading
by (tone, rhyme) pair. Stored as TEXT in poems table's
`intended_readings` column (migration 013).

### Override hierarchy

The chosen reading for a cell is determined by:

  pin > auto-rhyme-match > first-tone-match

1. **Pin (if present)**: search ALL char readings for one matching
   pin's (tone, rhyme). User pin can declare a tone violation (pinning
   仄 reading on 平 slot is valid intent — slot mismatch surfaces via
   downstream tone violation detection).
2. **Auto-rhyme-match (if at rhyme position with requiredRhyme)**:
   prefer reading whose rhyme matches the canonical anchor.
3. **First-tone-match (default)**: first reading whose tone matches
   the slot's expected pattern.

If pin is invalid (stale after data update — the (tone, rhyme) no
longer matches any reading), fall back to auto-rhyme-match defensively.

### requiredRhyme + line-1 affinity

`computeRequiredRhyme(lines, pins)`:

1. **Anchor pin override**: if line 2's last char is pinned, return
   `pin.rhyme` regardless of tone. The user's anchor declaration is
   authoritative.
2. **Single 平 reading**: line 2 last char's only 平 reading.
3. **Multi-平 with line-1 affinity**: if line 2 has multiple 平
   readings, find one shared with line 1's last char's 平 readings.
   Line 1 is corroboration, not authority — only consulted when line 2
   is ambiguous.
4. **Fallback**: line 2 first 平 reading.

Line 1's pin is NOT consulted for the anchor calculation. Only line 2's
pin can drive requiredRhyme.

### 字境 integration

字境's prompt includes pinned tone instead of slot tone:

```ts
const effectiveTone: Tone | null = pinnedReading
  ? (pinnedReading.tone === '平' ? '平' : '仄') as Tone
  : expectedTone;
```

`/api/suggest` request and post-filter both use `effectiveTone`.
Suggestions match user-declared intent, not slot template.

### Phases shipped

The feature shipped across 4 phases plus 4 prerequisite/follow-up
commits:

- **Phase 1** (`e61ccfc`): schema + persistence. Migration 013 adds
  `intended_readings TEXT NOT NULL DEFAULT '{}'` column. New
  `PATCH /api/poems/:id/readings` route with optimistic update +
  rollback on non-2xx. Locked poems reject pin writes (409).
- **Phase 2** (`d274a31`): picker UI in EditModal. Tone/rhyme pills
  become tappable. Pinned pill shows `ring-2 ring-gold` highlight.
  Tap pinned pill = no-op (no unpin per locked decision; opening
  picker IS the commit). Char change cascades the pin clear.
- **Pre-Phase 3 fix** (`c0bee68`): CharCell rhyme display. Pre-existing
  bug where rhyme label rendered `c.entries[0].rhyme` regardless of
  which reading was chosen. Fixed to use `c.chosen?.rhyme`.
- **Pre-Phase 3** (`6bc476e`): auto-rhyme-match. `lookupExpecting`
  extended with optional `requiredRhyme` + `isRhymePosition` params.
  When at rhyme position with requiredRhyme set and char has multiple 平
  readings, prefer the rhyme-matching reading. `computeRequiredRhyme` +
  line-1-affinity introduced here.
- **Pre-Phase 3** (`e52cdb0`): Issue B fix. `checkRhymes` refactored to
  use (chosen rhymes, requiredRhyme) instead of independent `rhymesOf()`
  iteration. Strict comparison: cell passes IFF `chosen.rhyme ===
  requiredRhyme`. 孤雁出群格 line-1 neighbor tolerance preserved.
- **Phase 3** (`0a55c1f`): pinned reading drives chosen.
  `lookupExpecting` gains optional `pin` param. Pin path searches ALL
  entries (not just tone-matching) — pin can override tone. `ToneInfo`
  gains `pinned?: boolean` field. CharCell suppresses amber-dot
  ambiguity indicator when `c.pinned` (pin resolves ambiguity).
- **Phase 4** (`8b3acc8`): 字境 integration + anchor pin overrides
  requiredRhyme. `computeRequiredRhyme` consults line-2 pin first.
  EditModal computes `effectiveTone` from `pinnedReading.tone` for
  字境 prompt + post-filter.
- **Phase 4 follow-up** (`9c19932`): few-shot 字境 prompt + suppress
  contradictory "暫無建議" (see §16).

### Backwards compat

Poems with empty `intended_readings = '{}'` (the default for new poems
and all pre-feature poems) score and display IDENTICALLY to pre-feature
behavior. The override hierarchy degenerates to auto-rhyme-match →
first-tone-match, both of which existed before.

The pin-overrides-tone behavior is intentional: a user pinning a 仄
reading on a 平 slot declares an intentional tone violation (possibly
for 仄韻 forms, possibly for explicit edge-case exploration). Form
ranking re-evaluates against pinned values; if the user truly intended
a 仄韻 form, that form ranks higher in liveRanked.

### Cell-index encoding

Composite "lineIdx,pos" string keys. Phase 1's validator regex was
loosened from `/^\d+$/` to `/^\d+,\d+$/` in Phase 2 to support this.
2D coordinates avoid the brittleness of flat-index encoding (which
would shift if charsPerLine changed across edits or form changes).

### Tap semantics

- Tap unpinned pill → pin that reading
- Tap pinned pill → no-op (per locked decision: opening picker is the
  commit; "no opinion" state is unreachable post-pick)
- Tap different pill → switch pin to that reading

Justification: forces the user to declare intent rather than oscillate
between "kind of meaning this" and "no opinion." The visual ring
highlight communicates which reading is committed.

### Cascade-clear on char change

When a cell's char changes (user replaces it via EditModal's input),
the cell's pin is removed:

```ts
if (oldChar !== ch) {
  const key = `${li},${pos}`;
  if (key in intendedReadings) {
    const { [key]: _, ...rest } = intendedReadings;
    patchReadings(rest);  // optimistic update, PATCH if saved poem
  }
}
```

State + PATCH if poem is saved. State-only if unsaved draft.

---

## 22. Drill 4 corpus build pipeline

`scripts/build-drill4-corpus.mjs` generates `src/data/pingshui/drill4-corpus.json`
(2500 entries) from multiple sources. The pipeline runs at build time,
not runtime — corpus is committed.

### Input sources

- **CC-CEDICT** (`src/data/cedict_ts.u8`): 124K bilingual entries.
  Provides the 2-char compound pool plus English glosses (used as
  fallback when MOE doesn't cover).
- **MOE 重編國語辭典** (`src/data/moedict-map.json`): 162K entries.
  Provides Chinese definitions. Coverage: 72% of Tier 1 corpus 词语
  (1808 of 2500).
- **tier1-seed-chars.mjs** (`server/data/`): 156 Tier 1 seed chars
  with rhymeId, jyutping, and curriculum `SeedCharacter.set` (1-4).
  Used for jyutping lookup and `rare_set` inheritance.
- **pingshui.json** (`src/data/`): authoritative classical rhyme data.
  Used to filter to chars in scope and for the curriculum cap.

### Processing stages

1. **Parse CC-CEDICT** to 2-char compound entries with trad, simp,
   pinyin, English gloss.
2. **Junk filter**: regex on English gloss + Chinese terms to skip
   proper nouns (capitalized pinyin) and modern tech/science compounds.
3. **Tier classification**: each entry tagged `tier: 'classical' |
   'neutral'` based on classical markers in gloss text ("literary",
   "ancient", etc.).
4. **Multi-平-reading skip**: chars with multiple distinct 平 readings
   across different rhymes are excluded — the drill can't honestly
   teach a single rhyme assignment for them (commit `4487dcb`). The
   exclusion check uses pingshui's full readings list per char.
5. **Curriculum cap**: answer chars must appear in Tier 1
   seedCharacters (~30 chars per rhyme). Caps the corpus to the
   curriculum's pedagogical scope.
6. **MOE gloss lookup**: for each entry, look up trad form in
   moedict-map. If found, use first MOE definition as gloss. Otherwise
   fall back to first CC-CEDICT English gloss.
7. **rare_set inheritance**: each entry's `rare_set` field = the answer
   char's curriculum `SeedCharacter.set` value (1-4) from
   `trainer-curriculum.ts`. Replaces an earlier algorithm that graded by
   position in the full pingshui rhyme bucket (which put all curriculum
   chars in Set 1 because they're high-frequency).
8. **Per-rhyme cap**: 500 entries per Tier 1 rhyme, classical-first
   ordering.

### Entry shape

```json
{
  "word": "中古",
  "blank_pos": 0,
  "answer": "中",
  "answer_pinyin": "zhong1",
  "answer_jyutping": "zung1",
  "hint_char": "古",
  "hint_pinyin": "gu3",
  "hint_jyutping": null,
  "rhyme": "一東",
  "pinyin": "zhong1 gu3",
  "gloss": "上古之後，近代之前的時代。",
  "tier": "classical",
  "rare_set": 1
}
```

### Known gaps

- **hint_jyutping**: 96% null (2400 of 2500 entries). The jyutping
  lookup table only covers Tier 1 seed chars (~156); hint chars are
  typically not seed chars. No broader jyutping dictionary is currently
  sourced. The frontend hides empty jyutping rows gracefully.
- **English gloss fallback**: 28% of entries (692) display English
  glosses where MOE doesn't cover the 词语. Tracked as parked ticket
  #14 (source additional classical Chinese dictionaries).

### Rebuild

The corpus is committed; rebuild only when:
- pingshui.json changes (variant mirroring, char additions)
- `trainer-curriculum.ts` seedCharacters change
- Junk filter or classification rules change
- New gloss source integrated

```bash
node scripts/build-drill4-corpus.mjs
```

Output is overwritten in place. Commit the regenerated JSON alongside
the script change.
