# Peiwen — Next Session Stacked Prompts

Seven prompts designed to be pasted in order at the start of a fresh Claude
conversation. Each builds on the prior. Pick whichever ticket you want to
tackle first; you don't have to use all seven, but reading them in order
gives the cleanest context buildup.

Tickets covered:
1. **Bootstrap** + #21 (Rocky volume calibration) — easiest, good warmup
2. #22 (Simplified ↔ Traditional UI toggle)
3. #7 (簡↔繁 rhyme-merger annotations)
4. #14 (MOE coverage gap fill)
5. #15 (Unihan-based variant detection)
6. #16 (Multi-tone multi-card library strengthening)
7. #17 (Fill unique word with meaning + 词语)

---
---

# PROMPT 1 — Bootstrap + ticket picker

Hi Claude. I'm Addison, working on **peiwen 佩文 / 詩律析辨**, a classical
Chinese 平水韻 prosody trainer and poem analyzer. Production at
https://pw.truesolartime.com. GitHub: addisonagent9/peiwen. This is a
fresh session; you have no memory of prior work, but I'm bringing you up
to speed.

## What peiwen is

Two surfaces sharing one codebase:

**Analyzer (App.tsx, ~800 lines)** — User pastes a classical poem; the
app validates rhyme/tone/structure against 五律, 七律, 五絕, 七絕, etc.
forms. Slot-based UI; each char gets pingshui lookup and tonal annotation.

**Trainer (PingshuiTrainer + 4 Drill components)** — Three-tier curriculum
covering all 30 平聲 韵部 (上平 1-15 + 下平 1-15). Each tier has 4 drills:
- Drill 1: 識韵 — recognize rhyme group from char
- Drill 2: 回韵 — recall chars from rhyme group
- Drill 3: 辨韵 — distinguish similar-sounding rhymes
- Drill 4: 詞語補齊 — complete a 2-char compound where one char is masked

Tier 1 = 5 most foundational rhymes (一東 七陽 十一尤 六麻 五歌). Tier 2 =
20 more rhymes. Tier 3 = 5 -m-ending rhymes (三江 十二侵 十三覃 十四鹽
十五咸). Trainer is content-complete and end-to-end functional.

## Three actors in this project

- **Me** (Addison) — research-supported user, makes design decisions,
  approves all code changes
- **You** (this Claude conversation) — strategist; we discuss, you draft
  CC tickets, I send to Claude Code, you review reports
- **Claude Code (CC)** — implementer running in my local repo at
  ~/poetry-checker. STOP-and-Report gates: every CC ticket has Part 1
  (investigation, no edits) and Part 2 (implementation after my greenlight).

## Working patterns I want you to follow

- Every deliverable block (bash, CC prompt, etc.) gets a heading above
  naming the target: `## Local`, `## Deploy (VPS)`, `## Send to Claude
  Code`, `## Commit and Push (Claude Code)`. Heading goes ABOVE the
  block, never inside as a comment. Never mix targets in one block.
- Local repo path is `~/poetry-checker` (NOT `~/peiwen` — folder name
  differs from repo name).
- VPS path is `/var/www/pw.truesolartime.com`.
- pingshui.json is **auto-generated** from CSVs at
  `/Users/addisonkang/pw/pingshui_{上平,下平,上聲,去聲,入聲}.csv`. Edit
  via `scripts/build-pingshui.mjs` (rebuild) or `scripts/patch-pingshui.mjs`
  (per-char corrections). Never edit pingshui.json directly.
- dist/ IS committed (production runs the bundled artifacts). VPS does
  NOT run `npm run build`.
- Doc-only commits (task.md / CLAUDE.md / .claude/skills/ changes) skip
  build and drift check. VPS deploy optional.
- Two-file ticket convention: closing commits append "Closes #N. Updates
  task.md → CLAUDE.md." and actually perform BOTH file updates (remove
  open entry from task.md; add closure entry to CLAUDE.md "## Closed
  parked items" → "### Numbered tickets"). Verify the diff includes both.
- "(this commit)" is acceptable SHA placeholder in CLAUDE.md to avoid
  amend churn; backfill in next session-end bookkeeping commit.

## Last session shipped

Wenyan v1 shipped (15 poems, 219 audio approved + 17 watchlist
pending review):
- A: foundation (`78f5028`)
- B: content + reading flow, 5 poems (`08a29f8`)
- C: pairing exercise (`9c31d1e`)
- C-2 through C-5: UX polish + 10-poem expansion + sectioned list view
  (`f594480`, `ed1103a`, `fa72e22`, `059299b`)
- D-1 through D-2.6: audio infrastructure (pilot → endpoint → UI →
  mutex → button restyle) (`13206e5`, `5c1a3e1`, `91d9b59`,
  `571b009`, `bb726bc`)

Plus the docs(skill) commit adding `.claude/skills/next-session.md` +
example template (`343e68a`).

#21 Rocky volume calibration shipped (`d82d871`) — per-voice gain
factor `{ Rocky: 1.2 }` applied client-side via Web Audio API
(MediaElementAudioSourceNode → GainNode → destination). Server
adds `X-Voice-Id` response header so the client can look up gain
per clip. Lossless; no audio regen.

Bundle hash on VPS at session start: `2dec1e97.js` (will have advanced
in subsequent sessions — verify with git log on first VPS interaction).

## Open in task.md (6 tickets)

Per latest task.md "## Deferred / Parked items":
1. **#22 Simplified ↔ Traditional UI toggle** — most user-visible,
   broad surface impact, suggested next ticket
2. **#7 簡↔繁 rhyme-merger annotations** — better after #22 ships
3. **#14 MOE coverage gap fill** — content quality
4. **#15 Unihan-based variant detection** — analyzer fallback
5. **#16 Multi-tone multi-card library** — chars with 2+ 平 readings
6. **#17 Fill unique word with 字義 + 詞語** — capstone, depends on
   #14 + #15

Plus deferred subsection (no scheduled work):
- Audio Review Library perf collapse
- Tier 1 anchor poem unique-constraint bug (~10 min fix)
- Manual VPS .env TRAINER_BETA_USER_IDS revert

## Now: pick a ticket to work on

#21 Rocky volume calibration shipped last session. The remaining
work inventory is above. The full ticket framing for each open
ticket is in subsequent prompts (PROMPT 2 = #22, PROMPT 3 = #7, etc.).

Tell me which ticket you want to start with, and I'll route to the
appropriate prompt.

## Standing by

What I need from you to start:

1. Which ticket to work on (#22 is the suggested next)
2. Or "session-end bookkeeping" if SHAs need backfill

Standing by.

---
---

# PROMPT 2 — #22 Simplified ↔ Traditional UI toggle

Continuing from prompt 1's project context. Don't re-bootstrap; you
already know peiwen.

This prompt picks up the next ticket: **#22 Simplified ↔ Traditional UI
toggle**.

## The motivation

Peiwen's curriculum and pingshui data is canonical-繁 (Traditional). All
char displays in trainer / analyzer / mnemonic prose / drill cards / audio
review library show 繁體 chars. But:

- Many users (esp. mainland China users) read 簡體 more comfortably
- Some Taiwanese / HK users want strict 繁體 only
- A toggle gives both audiences the experience they want without forking
  content

Storage stays canonical 繁體 (don't touch pingshui.json or trainer-curriculum.ts).
The toggle affects only display — convert at render-time.

## Surfaces affected

Per task.md description: "poem display, mnemonic prose, drill 4 corpus,
edit modal, analyzer input/output, /admin views."

That's basically every char-rendering surface. We need a single conversion
utility called from each render path.

## What "simplified" actually means here

繁→簡 mapping is mostly 1-to-1 but has edge cases:
- 1-to-1: 國→国, 學→学, 風→风
- N-to-1 (繁 forms collapse into one 簡): 後/后→后, 髮/發→发
- Variant chars: 内/內 (兩種繁), 為/爲

For a 繁→簡 display toggle, we need a curated mapping that picks the
"common modern simplified" for each canonical 繁. The standard library
choice is `opencc-js` which uses OpenCC dictionaries (TWVariants for
Taiwan-style, HKVariants for HK-style, S2T/T2S for cross-strait).

For peiwen's needs, **t2s.json** (Traditional-to-Simplified) is the
canonical dictionary. Single library call: `Converter({ from: 'tw',
to: 'cn' })` or `Converter({ from: 'hk', to: 'cn' })`.

## Storage / state model

Single boolean preference, persisted per-user:
- `prefersSimplified: boolean` (default false → 繁體)
- Stored in user settings or localStorage
- Read at render-time from a context provider

When toggle flips:
- All rendered chars convert via opencc
- pingshui lookups still use canonical 繁體 (the user-typed simp char gets
  converted UP to 繁 first, then looked up)
- Audio clips still play (TTS uses raw char, not simp/trad annotation;
  but the LABEL displayed on the audio button switches)

## Reverse direction (analyzer)

When user pastes a simplified poem into the analyzer:
- Convert input from 簡 → 繁 BEFORE pingshui lookup
- This is already partially handled in pingshui.json which has both 簡 and
  繁 entries for many chars
- But the toggle would let the analyzer DISPLAY back in simplified after
  analysis, which is friendlier for mainland users

## Surfaces inventory (probable)

1. **Trainer Drill 1-4** — char cards, hint chars, blank-fill cards
2. **Trainer rhyme detail view** — char list per rhyme
3. **Mnemonic prose** — the 30 rhymes' mnemonic descriptions in
   trainer-curriculum.ts
4. **Anchor poems** — the 30 canonical rhyming poems
5. **Analyzer slots** — the analyzed char positions
6. **Analyzer issue messages** — error/warning text mentioning chars
7. **Audio Review Library (/admin)** — char column, voice toggle labels
8. **Edit modal** — when user edits a slot's char
9. **Hint pinyin / jyutping** — these display below the char; the char
   itself is the toggle target, not the pinyin

## Edge case: pingshui's own keys

pingshui.json keys chars by 繁. Converting display ≠ converting keys.
The data layer stays canonical 繁. Only the FINAL rendered string changes.

If user types 简 in analyzer:
1. Convert 简 → 簡 (canonical)
2. Look up 簡 in pingshui.json → gets rhyme info
3. Display the slot back as 简 if user prefers simplified, or 簡 if 繁

This is the cleanest mental model. Don't mix data-layer and display-layer
conversion.

## Special concern: characters where 簡 and 繁 differ in rhyme

Per #7 in task.md (different ticket): some 簡 chars MERGE multiple 繁 with
distinct rhymes. Example: 丰 → 二冬, 豐 → 一東, but they share simplified
form 丰 in some contexts. The toggle needs to display the right CANONICAL
繁 for the rhyme being shown, not just blindly convert.

This is a nuance that #7 will fully address. For #22's toggle, a simpler
rule: convert based on the canonical 繁 that's stored, not based on the
user's input. Display layer reverses cleanly because we KNOW the source 繁.

## What to investigate (Part 1 for CC)

1. **Existing simplified handling in codebase**: grep for "simplified",
   "simp", "繁簡", "OpenCC", "opencc-js". What's already in place? Are
   there any partial implementations to extend?

2. **Char rendering call sites**: how many distinct places render a char
   to the DOM? Inventory the components touching `<span>{char}</span>` or
   similar patterns. Estimate refactor scope.

3. **Settings/preferences storage**: where does peiwen store user prefs
   today? localStorage? DB user_settings table? React Context? Need to
   know where the new boolean lives.

4. **opencc-js bundle size**: what's the dictionary file size? If it's
   ~500KB+, we may want lazy loading for the simplified mode.

5. **Pingshui's 簡↔繁 coverage**: spot-check 5-10 chars where 繁→簡 is
   N-to-1. Does pingshui have entries for both forms? Does it correctly
   redirect 簡 → 繁 for lookup?

### What CC should NOT do in Part 1

- Don't implement anything yet
- Don't install opencc-js
- Don't add toggle UI
- Don't modify trainer or analyzer code
- Just inventory and report

### Decisions I'll need to make after Part 1

- **Settings storage**: localStorage vs DB user_settings (DB lets the pref
  follow user across devices)
- **Default state**: default to 繁體 (current state) or detect user locale?
- **Scope of v1**: ALL surfaces simultaneously, or roll out per-surface?
  Trainer first, analyzer later?
- **opencc dict variant**: TW vs HK vs CN (s2t for input direction)
- **Toggle UI placement**: top-right corner globally? per-surface? in
  settings menu?

### Standing by

Help me think through #22. Draft a CC Part 1 investigation ticket
covering the 5 questions above. Include the project working patterns
from prompt 1 (## Send to Claude Code heading, STOP-and-Report at end of
Part 1, no edits).

The ticket should be ~150-250 lines. Surface effort estimate based on
inventory findings — this could be a 1-session ship if surfaces are <20
or a multi-session project if >40.

---
---

# PROMPT 3 — #7 簡↔繁 rhyme-merger annotations

Continuing from prompts 1-2's context. You know peiwen, the working
patterns, and have just helped scope #22.

This prompt picks up #7, which is closely related to #22 but addresses
a different problem: **rhyme-merger ambiguity** when the same simplified
char maps to multiple traditional forms with DIFFERENT 平水韻 rhyme
classifications.

## The motivating example

Per task.md: "Some 簡 chars merge multiple 繁 forms with classically-
distinct rhymes (丰/豐 pattern: 丰 → 二冬, 豐 → 一東)."

When a user types 丰 in the analyzer:
- pingshui.json's 簡 entry for 丰 might point to BOTH 二冬 and 一東 readings
- But the actual semantics depend on which 繁 the user MEANT
  - 丰 (cǎo盛 etc., 二冬) — the original 丰
  - 豐 (豐收, 一東) — simplified to 丰 in modern usage
- For a given poem, only ONE reading is correct based on context

If the analyzer just shows "丰: 二冬 OR 一東" without explanation, users
get confused. They don't know which to pick.

## What this ticket adds

A **pedagogical annotation layer** — when a 簡 char has merger ambiguity:

1. Display the simplified char as user typed
2. Below, show: "丰 (簡) → 丰 (二冬, 草盛貌) OR 豐 (一東, 豐收·豐富)"
3. Link to a help modal explaining 簡↔繁 mergers
4. Maybe a visual marker (small icon) on the char in the slot

For the trainer (which is canonical 繁), this isn't a problem — it always
shows 繁. But for the analyzer (which accepts user input in either 簡 or
繁), the merger ambiguity is a UX issue.

## Scope of mergers in classical 平水韻

Estimating the corpus:
- ~700-1000 chars where 1 簡 → 2+ 繁 forms exist
- Of those, maybe ~50-100 have rhyme distinctions in 平水韻
- Worth surfacing only those that have RHYME differences (not just
  semantic differences)

Examples beyond 丰/豐:
- 后/後 → 后 (一董 仄/上平·一東 平 OR 候 仄·後 平)
- 髮/發 → 发 (different rhymes)
- 干/乾/幹 → 干 (一寒 OR 元/寒 distinctions)
- 余/餘 → 余 (六魚 OR 六魚 — same rhyme actually, less critical)
- 谷/穀 → 谷 (one is rhyme, one is grain)
- 历/歷/曆 → 历 (different rhymes)

The set worth annotating is probably ~30-50 chars (only those with
classical 平水韻 rhyme distinction).

## What this ticket doesn't do

- Doesn't add any new char to pingshui.json
- Doesn't change how analyzer LOOKS UP rhymes (still uses pingshui)
- Doesn't change trainer (trainer is always 繁)
- Doesn't replace the #22 simp/trad toggle (orthogonal feature)

## Implementation shape

Two layers:

### Layer 1 — Data file: rhyme-mergers.json

```json
{
  "丰": {
    "candidates": [
      { "trad": "丰", "rhyme": "二冬", "gloss": "草盛貌" },
      { "trad": "豐", "rhyme": "一東", "gloss": "豐收·豐富" }
    ]
  },
  "后": {
    "candidates": [
      { "trad": "后", "rhyme": "一董", "gloss": "皇后·君主" },
      { "trad": "後", "rhyme": "上平·一東", "gloss": "前後" }
    ]
  }
}
```

### Layer 2 — Analyzer integration

When pingshui lookup returns a char with merger ambiguity:
- Check rhyme-mergers.json for this char
- If present, show the candidates inline
- User clicks one → analyzer treats poem with that interpretation

### Layer 3 — Editor modal enhancement

When user edits a slot for an ambiguous char, the modal shows:
- "Did you mean..." with each candidate
- User picks; selection persists for that slot

## What to investigate (Part 1 for CC)

1. **Existing rhyme-merger handling**: grep for "merger", "ambiguity",
   "簡繁", "candidates" in src/. Does anything already partially address
   this?

2. **Pingshui.json's current behavior on mergers**: pick 5 known merger
   chars (丰/豐, 后/後, 干/乾/幹, 历/歷/曆, 余/餘) and check what
   pingshui.json currently returns. Are both readings in there? In what
   order?

3. **Analyzer slot rendering**: where in App.tsx does a char's rhyme info
   render? Find the integration point for the new candidates UI.

4. **Editor modal**: where in the codebase is the per-slot edit modal?
   What does it look like? Estimate the effort to add "Did you mean..."

5. **Source for mergers list**: should we curate manually, or extract from
   OpenCC's variants dictionary, or generate from Unihan data? OpenCC's
   `t2s.json` is reverse-direction; we'd need `s2t.json` and filter for
   N-to-1 entries.

### Decisions I'll need to make after Part 1

- **Curation source**: manual list of ~50 known cases vs auto-extracted
  from OpenCC variants vs hybrid (auto + manual review)
- **UI shape**: inline candidates below slot vs modal-on-click vs sidebar
- **Persistence**: does the user's "I meant 豐" choice persist for the
  poem? For all future analyses?
- **Scope of v1**: launch with 10 most-common mergers, or wait for full
  ~50 set?

### Standing by

Help me think through #7. Draft a CC Part 1 investigation ticket covering
the 5 questions above. Like the prior tickets, end with STOP and no edits.

This is a content-heavy ticket — most of the work is the curated mergers
list. The UI integration is small. I want CC to estimate effort split
between (a) data curation (probably my work, not CC's) and (b) UI/code
integration (CC's work).

---
---

# PROMPT 4 — #14 MOE coverage gap fill

Continuing from prompts 1-3. You know peiwen, the working patterns, and
have helped scope #21/#22/#7.

This prompt is **#14 — Fill MOE coverage gap**.

## What MOE is

The peiwen project uses **MOE 重編國語辭典修訂本** (Taiwan Ministry of
Education Mandarin dictionary) as the source for Chinese-language glosses
on chars. This is the dictionary that ships with `moedict-map.json` (the
file CC referenced when investigating #25's drill4 corpus build).

The build pipeline that creates drill4-corpus.json uses MOE to attach
glosses to compound words: e.g., the entry for `中古` includes the gloss
"上古之後…" pulled from MOE.

## The gap

Per task.md (and CC's prior memory): "MOE coverage at ~28%" — meaning
only 28% of the ~12,051 corpus entries have a MOE gloss. The remaining
~72% have no Chinese-language definition shown to the user.

Why the gap:
- MOE focuses on standard modern Mandarin compounds
- Peiwen's corpus draws from CC-CEDICT which has many compounds MOE
  doesn't cover (literary, dialect, technical, archaic)
- Many drill4 compound entries (~70% of them) end up gloss-less

Effect on UX:
- Drill 4 cards show the answer chars + pinyin + jyutping but no
  Chinese-language definition for the compound
- Users have to guess meaning from the chars alone
- Pedagogically weaker than the 28% that do have glosses

## What "fill the gap" means

Two paths:

### Path A: Find a different dictionary source

Candidates:
- **CC-CEDICT** itself has English glosses; could translate to 中文
- **漢語大詞典 (Hanyu Da Cidian)** — comprehensive, but commercial
- **教育部成語典** — for chengyu only
- **维基词典 (zh.wiktionary)** — open, has Chinese definitions for many
  compounds, but quality varies
- **百度漢語 / Baidu Hanyu API** — commercial, requires key

### Path B: Generate glosses from existing data

- Use the chars' MOE definitions to compose a compound gloss
- Example: 中 (中間) + 古 (古代) → 中古 = "中間 + 古代" or LLM-generated
  from MOE entries
- Risk: low quality, doesn't reflect lexicalized meaning

### Path C: LLM batch generation

- Run all gloss-less compounds through an LLM (claude-haiku, claude-sonnet)
- Prompt: "Define this 2-char Chinese compound in 1-2 sentences using
  classical/literary Chinese tone"
- Cost: ~$X for 8500 compounds
- Quality: likely good with sonnet but needs spot-check
- Maintenance: future compounds re-gen automatically

### Path D: Don't fix it

- Accept the 28% coverage
- Focus on quality of the 28% that do have glosses
- Add a UI affordance: "No gloss available — see CC-CEDICT" link

## What's likely the right path

Path C (LLM batch generation) is probably best for peiwen's needs:
- MOE coverage gap is the same gap mainland users would have with any
  Taiwan-focused dictionary; peiwen is meant for both audiences
- LLM cost is one-time; future re-gens are cheap
- Quality is acceptable for pedagogical use; not authoritative academic
  definitions

But Path A (find better source) might be cheaper/safer if a free Chinese-
language dictionary covers 70%+ of the gap.

## What to investigate (Part 1 for CC)

1. **Current MOE coverage exact number**: query drill4-corpus.json:
   - Total entries
   - Entries with `gloss` field non-empty
   - Entries with no gloss
   - By rhyme: which rhymes have lowest coverage (-m chars likely)

2. **MOE source file**: where does moedict-map.json come from? Is it
   updatable? Could we add more entries by extending MOE's source data?

3. **CC-CEDICT alternative**: how many of the gloss-less compounds have
   English glosses in CC-CEDICT? If 90%+, we could ship a Chinese
   translation of those.

4. **LLM gen feasibility**: rough size of the gap × token cost per gloss.
   If ~8500 compounds × ~50 tokens/gloss × $/1M tokens, what's the
   total?

5. **Alternative free sources**: any open-license Chinese definition
   sources we could pull (维基词典 export, OpenCC has any glosses, etc.)?

### Decisions I'll need to make after Part 1

- **Path**: A/B/C/D from above
- **Storage**: extend moedict-map.json or new file (gloss-fallback.json)?
- **Provenance flagging**: mark LLM-generated glosses differently from
  MOE-sourced (transparency for users)?
- **Quality bar**: spot-check what % of LLM glosses are good before
  full batch gen?

### Standing by

Help me think through #14. Draft a CC Part 1 investigation ticket. The
ticket should include actual queries to drill4-corpus.json to confirm
the 28% number and identify the gap distribution.

This ticket has higher uncertainty than the others. The path forward
depends heavily on Part 1's findings (especially the cost estimate for
Path C and CC-CEDICT availability for Path A). Be ready for the Part 1
report to surface additional questions before locking the path.

---
---

# PROMPT 5 — #15 Unihan-based variant detection

Continuing from prompts 1-4. You know peiwen, working patterns, and
prior tickets.

This prompt is **#15 — Unihan-based variant detection**.

## What Unihan is

Unihan is the Unicode database of CJK chars with rich metadata:
- Mandarin pinyin (multiple readings)
- Cantonese jyutping
- Variant relationships (traditional/simplified/semantic variants)
- Frequency rankings
- Stroke counts
- Source dictionaries

It's a free, comprehensive, authoritative dataset maintained by the
Unicode Consortium. Available as `Unihan.zip` from
https://www.unicode.org/Public/UCD/latest/ucd/.

## What variant detection means

Two unicode chars can be:
- **Identical** in display but distinct codepoints (e.g., 攏 U+651F vs
  攟 U+6523 — the char-codepoint ambiguity issue we hit earlier)
- **Visual variants** (some chars have 2+ legitimate forms; one is
  preferred in modern use)
- **Compatibility variants** (CJK Compatibility block has duplicates of
  CJK Unified Ideographs for backward compatibility)
- **Semantic variants** (different chars meaning the same thing in
  classical usage)

Why peiwen needs this:
- pingshui.json may have entries under variant codepoints; lookups can
  miss
- User input might use a compatibility variant; analyzer should normalize
- Audio prewarm manifest assumes one canonical form per char

## The specific use case in peiwen

When pingshui lookup misses:
1. Check Unihan for the input char's variants
2. If a variant is in pingshui, use that
3. Display a transparent note: "Looked up 攏 (variant of 攟; same rhyme)"

Without this, users might paste a char that looks correct but pingshui
doesn't recognize. Currently the analyzer just says "char not found" or
gives no info.

## The gnarly part

Unihan defines several variant relationships:
- `kSimplifiedVariant` — 繁→簡 mapping
- `kTraditionalVariant` — 簡→繁 mapping
- `kZVariant` — z-variant (visual identity, encoding distinction)
- `kSemanticVariant` — semantically equivalent in some contexts
- `kSpecializedSemanticVariant` — context-specific semantic variant

For peiwen's needs, we probably want:
- kZVariant (encoding artifacts shouldn't break lookups)
- kTraditionalVariant + kSimplifiedVariant (already partially handled
  in pingshui, but Unihan is the canonical source)
- kSemanticVariant — maybe (could surface "you might also mean…" but
  semantics matter for rhyme classification)

## What this ticket adds

1. **Build script**: `scripts/build-unihan-variants.mjs` extracts Unihan
   variant relationships into a peiwen-friendly JSON
2. **Lookup utility**: `src/lib/unihan-variants.ts` provides
   `findVariantInPingshui(char)` that walks the variant graph and
   returns the canonical form usable for rhyme lookup
3. **Analyzer integration**: when pingshui returns no entry, fall back
   to variant lookup
4. **Display annotation**: show "(variant of X)" inline when fallback hit

## Scope considerations

Pure win for analyzer correctness. Doesn't affect trainer (trainer always
uses canonical 繁). Doesn't affect audio (audio uses raw char). Mostly
about analyzer robustness on user-pasted poems with variant-form chars.

Effort estimate: 1 session for build script + utility + analyzer
integration. Maybe 1.5 if the variant graph traversal has gnarly cases.

## What to investigate (Part 1 for CC)

1. **Unihan source format**: Unihan.zip contains multiple TSV files
   (Unihan_Variants.txt, Unihan_Readings.txt, etc.). Pick the relevant
   files. Don't download yet — just identify URLs.

2. **Existing variant handling in pingshui**: does pingshui.json already
   have any variant resolution? Spot-check 5 chars known to have variants:
   攏 vs 攟, 内 vs 內, 為 vs 爲, 海 vs 𣲦, 户 vs 戶.

3. **Codebase analyzer fallback**: where in App.tsx does pingshui lookup
   happen? Where would the variant fallback go? Estimate refactor scope.

4. **Bundle size impact**: Unihan_Variants.txt is ~XKB. After filtering
   to z/traditional/simplified variants only, what's the size? Should it
   be lazy-loaded or bundled?

5. **Test cases**: identify 10 chars where variant lookup would help
   (chars NOT in pingshui but with a variant that IS). This is the
   acceptance criterion for the fix.

### Decisions I'll need to make after Part 1

- **Variant types to include**: kZVariant only, or also kSemanticVariant?
- **Display style**: "(variant of 攏)" or just silent normalization?
- **Bundle vs lazy**: include in main bundle or load on-demand?
- **Update cadence**: how often do we re-pull Unihan? (Probably never;
  variant relationships are stable)

### Standing by

Help me think through #15. Draft a CC Part 1 investigation ticket with
the 5 questions above. Don't have CC download Unihan yet — just identify
the file structure and estimate.

After Part 1 we'll decide if this is a quick win (build script + small
utility) or a more substantial integration that touches the analyzer
pipeline meaningfully.

---
---

# PROMPT 6 — #16 Multi-tone multi-card library strengthening

Continuing from prompts 1-5. You know peiwen and prior context.

This prompt is **#16 — Multi-tone must have multi-card (strengthen
Library)**.

## What this ticket addresses

In the trainer, certain chars have multiple readings with different tones
or rhymes (multi-tone / multi-rhyme chars). Examples:
- 重: zhòng (重要, 仄) vs chóng (重複, 平)
- 應: yīng (应该, 平) vs yìng (回应, 仄)
- 數: shù (数量, 仄) vs shǔ (数数, 仄 different rhyme) vs shuò (數 in 平
  reading)

These chars are pedagogically tricky. Users learning Tier 1-3 might
memorize one reading and miss the other. The trainer currently shows ONE
card per char per rhyme, but for multi-readings the user should see
MULTIPLE cards (one per reading).

## Current behavior

Looking at trainer-curriculum.ts seed chars:
- Each rhyme has ~30-40 seed chars
- Each char appears in ONE card per drill
- Multi-tone chars are listed under their PRIMARY rhyme only

So for 重:
- Currently: appears in 二冬 only (chóng reading)
- Missing: should also appear in 一送 / 二宋 (zhòng reading) — but those
  are 仄 rhymes which the trainer currently doesn't cover

Wait — peiwen's trainer is 平聲 only? Let me re-think. Yes, the trainer
covers all 30 平聲 韵部 (上平 1-15, 下平 1-15). 仄聲 (上聲/去聲/入聲) is
out of scope for the v1 trainer.

So for multi-tone chars where one reading is 仄, that reading isn't
trained. Fine — out of scope.

But for multi-tone chars where MULTIPLE READINGS are 平 (different rhymes):
- 蓊 (wēng 一東 vs wěng 一董 — but 一董 is 仄)
- 翪 (zōng 一東 vs zōng 二冬?)
- 攏 (lóng 一東 vs lǒng 一董 — same issue, 一董 is 仄)

Hmm, looking at task.md's Type B cross-tone chars list (which we just
added 5 chars to from #6): all 5 are 平/一東 + 仄/一董. The 仄 reading isn't
in the trainer's domain.

Actually scratch that. The Type B chars in task.md (渐, 厌, 探, 嵌, 降,
砭) include some that are 平/平 (different 平 rhymes). Let me reconsider.

降:
- jiàng (下降, 仄/絳) — 仄, out of trainer
- xiáng (投降, 平/江) — 平/三江, IS in trainer

So 降 should appear in 三江 with the xiáng reading. Does it?

This is exactly what #16 is asking. We need to verify which multi-tone
chars are MISSING cards in their secondary 平 readings.

## What the strengthening looks like

1. Inventory all chars in trainer-curriculum.ts that have a secondary
   平 reading (i.e., they appear in pingshui.json with 2+ 平 entries
   in different rhymes)
2. For each such char, check whether the trainer includes it in BOTH
   rhymes (probably not — most are in one)
3. Add second card (or third, for triple-rhyme chars) where missing
4. Update mnemonic prose to mention the multi-rhyme nature

This expands the trainer's content slightly (adds ~10-30 cards across
all 30 rhymes, my guess). Pedagogically valuable: users see the same
char in two places and learn that it has multiple readings.

## Library aspect

The "Library" mentioned in task.md: I think this refers to the trainer's
char display in rhyme-detail view (browse all chars in a rhyme). Users
who Open a rhyme see ALL 30-40 seed chars; for multi-readings, they
should see a marker indicating "this char has another reading in
[other rhyme]".

So #16 has two components:
- **Curriculum expansion**: add cards for missing readings
- **Library annotation**: add multi-reading markers in rhyme-detail view

## Effort

1 session if the expansion is small (~10-20 chars). 2+ sessions if it's
~50+ chars (audio prewarm + drill regen + library UI all need updating).

## What to investigate (Part 1 for CC)

1. **Multi-平-rhyme char inventory**: query pingshui.json for all chars
   with 2+ entries where tone='平'. Filter to chars where the rhymes are
   in the trainer's 30-rhyme set (i.e., both readings are 平水韻 平聲).
   Report count and list.

2. **Trainer-curriculum coverage**: for each multi-rhyme char, check
   whether trainer-curriculum.ts includes it in ONE rhyme or MULTIPLE.
   The gap is what #16 needs to fill.

3. **Drill 4 corpus impact**: if we add cards for new readings, do those
   cards already exist in drill4-corpus.json? Or does corpus need re-gen?

4. **Audio prewarm**: how does adding a new card affect audio? Each
   card needs the same char's audio (already prewarmed) but the card
   metadata changes (different rhyme context).

5. **Library UI**: where in PingshuiTrainer is the rhyme-detail view?
   What would the multi-reading marker look like? Estimate UI work.

### Decisions I'll need to make after Part 1

- **Scope**: expand to all multi-rhyme chars, or pick top N by frequency?
- **Marker style**: small icon, badge, footnote? per-card or per-list?
- **Drill integration**: does Drill 1 quiz the multi-rhyme char in BOTH
  rhymes (testing user's discrimination)? Or treat each as independent?
- **Mnemonic prose updates**: do we update prose for affected rhymes?

### Standing by

Help me think through #16. Draft a CC Part 1 investigation ticket. The
key surface area question is the inventory: how many multi-平-rhyme chars
exist, how many are already in trainer in one rhyme, how many need a
second card.

If the count is <10, this is a small ticket. If 30+, we may want to
phase the rollout.

---
---

# PROMPT 7 — #17 Fill unique word with meaning + 词语

Continuing from prompts 1-6. Final ticket of the open list.

This prompt is **#17 — Fill unique word with meaning and 词语**.

## What this ticket addresses

Looking at task.md, #17's full description is brief: "Fill unique word
with meaning and 词语."

Reading between the lines: the trainer's char cards currently show a
char + pinyin + jyutping + (sometimes) audio. They might not show:
- The char's standalone meaning (字义)
- Common compound words (词语) using this char

#17 is asking to enrich each char card with these two pieces:
1. **字义** — 1-2 sentence definition of the char in classical usage
2. **词语** — 2-3 example compound words that use this char

This makes each card more informative and pedagogically richer.

## Why this matters

A user studying Tier 1 一東 sees the char 中. Currently maybe they see:
- 中 (zhōng / zung1)

With #17:
- 中 (zhōng / zung1)
- 字义: 中間, 内部, 中央
- 词语: 中央, 中心, 中古

Now the user has context. Especially valuable for rare chars where the
modern usage is unclear (e.g., 嶔 from Tier 3 Set 4 — "山貌"; what does
that even mean? a definition would help).

## Surface inventory

This affects:
1. **Trainer Drill 1 cards** — char display
2. **Trainer Drill 2 cards** — char display + recall
3. **Trainer Drill 3 cards** — char display
4. **Trainer rhyme-detail Library view** — char list with potential
   expansion area
5. **Drill 4 cards** — already has gloss for the COMPOUND; would adding
   字义 for individual chars help?

## Data sources

For 字义 (char meaning):
- **MOE** (already used) — but only ~28% coverage per #14
- **CC-CEDICT** — has English glosses for most chars; could translate
- **Unihan** (per #15) — has kDefinition field, English-language

For 词语 (compound words):
- **Drill 4 corpus** itself! It has 12,051 compound entries. We could
  pick 2-3 highest-quality compounds per char for Library display
- **CC-CEDICT** has many compounds with frequency data

So there's overlap with #14 (MOE coverage) and #15 (Unihan):
- If #14 expands MOE coverage with LLM-gen, those glosses serve #17
- If #15 adds Unihan data, those readings serve #17
- If we already have Drill 4 corpus, those compounds serve #17

#17 is a **consolidation ticket** — it leverages existing data (potentially
expanded by #14 and #15) and presents it in a new UI surface (per-char
expansion in trainer Library).

## Sequencing consideration

Probably best to land #17 AFTER #14 (so we have full MOE/CC-CEDICT
gloss coverage) and AFTER #15 (so Unihan data is available). Then #17
is mostly UI integration work.

If we land #17 first, we ship with the 28% MOE coverage gap visible to
users in 字义 fields. Not ideal.

## Implementation shape (post-#14, post-#15)

1. **Per-char meta**: combine MOE definition + Unihan kDefinition (if MOE
   missing) + Drill 4 corpus top-3 compounds for that char
2. **UI expansion in Library view**: click on a char to expand a panel
   with 字义 + 词语 + audio button
3. **Optional in-drill display**: small affordance during Drill 1-3 to
   peek at 字义 if user wants to learn more (without spoiling the drill)

## What to investigate (Part 1 for CC)

This ticket is more design than data. The "fill" part is straightforward
once data sources land. So Part 1 focuses on UI + scope:

1. **Existing Library UI**: where in PingshuiTrainer is the per-char
   detail view? Does it exist, or do users only see char-list grids?

2. **Scoping the data join**: write a small mental query: for char X,
   show MOE-gloss + top-3-Drill-4-compounds. Verify this works for 5
   sample chars (东, 中, 风, 月, 山).

3. **Effort split**: separate the data layer (combining sources) from
   the UI layer (rendering). Most of #17's work is UI.

4. **#14 / #15 dependency check**: confirm whether #17 makes sense to
   ship pre-#14/15 or only after.

5. **Drill peek affordance**: should drilled chars show 字义 on a tap
   (without spoiling), or is that distracting?

### Decisions I'll need to make after Part 1

- **Sequencing**: ship #17 now with current data (28% MOE) or wait for
  #14/15?
- **Surface scope**: Library view only, or also in-drill peek?
- **词语 source priority**: drill4-corpus (already available) vs CC-CEDICT
  fresh fetch
- **Expansion vs always-shown**: panel that expands on tap vs always-shown
  inline

### Standing by

Help me think through #17. Draft a CC Part 1 investigation ticket. Given
that this depends on #14/15, the ticket should explicitly call out the
dependency and offer a "minimal v1" path that ships #17 with current
data + waits for the other tickets to fill the gaps.

The Part 1 report should help me decide: ship v1 now, or queue #17
behind #14+#15.

---
---

# Closing notes for the new session

When you start the new session and paste prompt 1, the new Claude
conversation will:
- Load full peiwen context
- Understand working patterns (## headings, two-file convention, etc.)
- Know last session's state (commits shipped, current main HEAD)
- Be ready to work on #21

When you continue with prompts 2-7, the new Claude builds incremental
context — each prompt is shorter than prompt 1 because the project
context is already loaded.

Order rationale:
1. **#21 first** — easiest, low-risk, gets you a quick win and warms up
2. **#22 second** — UI feature, scopes the simp/trad infrastructure
3. **#7 third** — closely related to #22, builds on the UI work
4. **#14 fourth** — data quality; complements #7 (mergers) with content
5. **#15 fifth** — Unihan integration; complements analyzer robustness
6. **#16 sixth** — content depth; builds on #14's better glosses
7. **#17 last** — synthesis; pulls together everything from #14/15/16

You don't have to follow this order. Each prompt is self-contained
enough to stand alone if you skip ahead.

The fresh Claude won't have the memory edits from this session (those
follow you across sessions in claude.ai), so the pingshui-source-paths
skill, the two-file convention, the (this commit) placeholder convention,
and the char-codepoint ambiguity warning — all of those carry forward
automatically.

Standing by. Ready to ship more tickets.
