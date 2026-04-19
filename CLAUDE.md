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
