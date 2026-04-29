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

### Still open

**593 HIGH-tier audit findings unreviewed.** The per_reading_notes infra
scales. User decides when to tackle.

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

### State of play (as of 2026-04-25)

**Shipped:**
- Tier 1 Drill 1 (Recognition). 165 chars across 5 rhymes, graded
  Sets 1–4, interleaved via Bjork template, Cantonese + flagged
  Mandarin TTS.
- Tier 1 Drill 2 (Recall). 4×2 grid, pick 4 of 8 chars belonging to
  target 韵部. Per-tile Cantonese audio playback that stays clickable
  in the feedback phase. Distractors drawn from other Tier 1 rhymes
  (safe by design). Interleave templates govern target-char difficulty.
  Commits: e29d428 (initial), 5b18e79 (nav fix), 0331adc (vestigial
  bar removed), f213bb2 (audio fix in feedback phase), 7395da3 (green
  styling).
- Trainer foundation: data model (drill_sessions, tier_drill_unlocks,
  tier_unlocks), unlock system, admin "解锁训练" override, two-bar
  layout. Commit 0c0442c.
- §15 pedagogy canon. Commit 346bf6f.
- Audio review admin dashboard.
- Trainer home with tier 2/3 locked; green "开始综合练习" hidden until
  Tier 2 unlocked.
- 疴 dropped from curriculum (TTS mispronounce). Commit 6ba3b9b.
- Dead `src/config/trainer-beta.ts` deleted (replaced by
  `hasPremiumAccess`). Same commit.

**Next build order** (one drill at a time, deploy + verify + iterate):

1. **Tier 1 Drill 3** — 辨韵 Discrimination (pair judgment). Show 2
   chars side by side, binary "do these rhyme in 平水韵?". Within
   Tier 1 the pairs are deliberately easy (rhymes are distinctive);
   the UI is being battle-tested for Tier 2 where 一东/二冬 etc. are
   the real test. On wrong answer, surface family grouping + teaching
   note + anchor poem from `trainer-curriculum.ts` (data exists, not
   yet displayed anywhere).
2. **Tier 1 Drill 4** — 押韵应用 Application. 10 hardcoded Tang poems
   per tier with one rhyme position blanked; 4 options (1 correct,
   3 distractors that Mandarin-rhyme but are 出韵 in 平水韵). Shows
   correct rhyme + why distractor is a trap on wrong answer. Admin
   dashboard generator for adding more poems beyond the 10 seeds.
3. **Tier 2 Drill 1** — preparatory phase first: fix Tier 2 char pool
   (~30 chars × 20 rhymes = ~600 chars), grade Sets 1–4, queue TTS
   batch, run audio review. Then drill code is trivial (reuses
   Tier 1 Drill 1 path with `scope=tier2`).

**Subsequent**: Tier 2 Drills 2/3/4 → Tier 3 Drills 1/2/3/4. Same
code paths, reusing infrastructure.

### Parallel cleanup tickets (non-blocking)

- ✅ Drop 疴 from curriculum — done. Orphan clips 520/567 remain in DB
  (harmless, can be purged manually via admin).
- ✅ Delete `src/config/trainer-beta.ts` — done. Dead code since `c1005ef`.
- Audio Review Library perf fix: once pending queue is empty, approved
  list needs pagination or list-collapse. Plan: last 50 approved stay
  as cards, rest collapse to clickable list items to prevent browser
  bloat when Tier 2's ~600 clips ship.
- Revert manual `.env` TRAINER_BETA_USER_IDS edit on VPS — pending
  (user will handle; not a code change).

### Audio Review Library — perf constraint (parked)

Approved clips list will grow. Plan when it hits ~200 clips:
- Most recent 50 approved stay as full cards (with player + waveform)
- Older approved collapse to clickable list rows (char + voice +
  status + timestamp), tapping a row expands to a full card on demand
- Pending queue stays as cards (typically small)
- This unblocks Tier 2's ~600-clip audio review without browser bloat

Trigger: when audio review page first feels sluggish, or before the
Tier 2 TTS batch lands — whichever comes first.

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

**Card UX:** 2-char word displayed with one char blanked (inline `<input>`
matching surrounding 48px serif font). Free Chinese IME input. Submit
validates exact match against expected char. Auto-advance on correct
(1500ms, admin-tunable via app_settings). Manual 下一题 on wrong.

**Round-robin distribution:** word-queue allocates per-rhyme slots.
5-card = 1 per rhyme; 10-card = 2; 20-card = 4. Shuffled before return.

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
Read-only dashboard: `RhymeLibrary.tsx` at subView `'library'`.

`LibraryAddButton.tsx` is unwired in the UI (reserved for a future
韵部库 self-practice feature), but the `/library/add` route itself was
hardened with full server-side validation in preparation
(`527afaf`, `f2b8d43`). See "Endpoint hardening" below.

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
`/library/add` asks "is this pairing real?" because the upcoming
self-practice feature's authority is the rhyme dictionary itself.

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
