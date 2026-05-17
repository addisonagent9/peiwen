# Peiwen — Next Session Bootstrap

Paste this whole file (or just the bootstrap prompt below) into a fresh
Claude conversation to load context for the next peiwen working session.

The structure: one bootstrap section (project state + working conventions),
then a queue of small follow-up tickets to choose from. Each ticket is
self-contained; pick whichever fits the time budget.

---

# Bootstrap prompt

Hi Claude. I'm Addison, working on **peiwen 佩文 / 詩律析辨**, a classical
Chinese 平水韻 prosody trainer and poem analyzer. Production at
https://pw.truesolartime.com. GitHub: addisonagent9/peiwen.

Fresh session; no memory of prior work. Bringing you up to speed.

## What peiwen is

Two surfaces sharing one codebase:

**Analyzer (App.tsx, ~800 lines)** — User pastes a classical poem; the
app validates rhyme/tone/structure against 五律 / 七律 / 五絕 / 七絕 forms.
Slot-based UI; each char gets pingshui lookup and tonal annotation.
EditModal opens for editing; RhymeCharCard surfaces for rhyme browsing.

**Trainer (PingshuiTrainer + 4 Drill components)** — Three-tier
curriculum covering all 30 平聲 韵部. Each tier has 4 drills (識韵 /
回韵 / 辨韵 / 詞語補齊). Content-complete and end-to-end functional.

**Wenyan module (#26)** — 文言教材 study module (15-poem corpus, audio
playback, vocab pairing exercises). Mounted at /wenyan, admin-gated.

## Three actors

- **Me** (Addison) — design decisions, approves changes
- **You** (Claude conversation) — strategist; we discuss, you draft CC
  tickets, I send to Claude Code, you review CC's reports
- **Claude Code (CC)** — implementer running in my local repo at
  ~/poetry-checker

## Working conventions (load these)

- **Every deliverable block gets a heading naming the target**, above
  the block:
  - `## Send to Claude Code` — CC ticket / instructions
  - `## Local` — bash for me to run in my Mac terminal
  - `## Deploy (VPS)` — bash for me to run on VPS via SSH
  - `## Commit and Push (Claude Code)` — git operations for CC
  - Never mix targets in one block. Never put the heading as a comment
    INSIDE the block.

- **Repo paths**:
  - Local: `~/poetry-checker` (NOT `~/peiwen` — folder name differs
    from repo name; the GitHub repo is `peiwen` but Mac folder is
    `poetry-checker`)
  - VPS: `/var/www/pw.truesolartime.com`
  - Service: `poetry-checker.service` (NOT `peiwen.service` or `pw.service`)
  - CSV staging on Mac (NOT in repo): `~/pw/pingshui_*.csv`

- **pingshui.json is auto-generated** from CSVs at `~/pw/pingshui_*.csv`.
  Edit via `scripts/build-pingshui.mjs` (full rebuild) or
  `scripts/patch-pingshui.mjs` (per-char corrections). Never edit
  pingshui.json directly.

- **dist/ IS committed** (production runs the bundled artifacts).
  VPS does NOT run `npm run build` in the normal deploy path.
  Standard deploy: `git pull` + `sudo systemctl restart poetry-checker`.

- **Doc-only commits** (task.md / CLAUDE.md changes) skip build and
  drift check. VPS deploy optional.

- **Two-file workflow convention**: closing commits append `Closes #N.
  Updates task.md → CLAUDE.md.` and actually update BOTH files in the
  same commit (remove open entry from task.md; add closure entry to
  CLAUDE.md `## Closed parked items` → `### Numbered tickets`). Verify
  the diff includes both.

- **SHA placeholders**: `(this commit)` is acceptable in CLAUDE.md for
  the current commit's SHA; backfill in next session-end bookkeeping
  commit. Recoverable via `git log --grep "#N"`.

- **Commit conventions**:
  - NO 🤖 / `Co-Authored-By: Claude` trailers (Addison dropped these)
  - Doc-only commits use one-line first line; closing commits use
    multi-line body with stats
  - Reference SHAs of prior commits in the multi-part arc when relevant

- **API key safety**: only safe existence check is Node-side
  `node -e "console.log(!!process.env.ANTHROPIC_API_KEY)"`. NEVER
  shell echo the variable's value or substring-mask it.

- **Codepoint hazards**: when passing chars between this chat and CC
  tickets, instruct CC to read verbatim from source files
  (`src/data/pingshui.json`, `task.md`, etc.) rather than copying from
  chat history. Multiple chars look visually identical across font
  families (筱/篠, 艷/豔, 殻/㱿). Tickets that involve specific chars
  must include a "use verbatim chars from [source file]" rule.

- **Cache-lag check**: `/mnt/project/` is a snapshot of repo files that
  may lag behind `origin/main` by hours. If the next session needs
  precise current state of `task.md` or `CLAUDE.md`, fetch the GitHub
  raw URLs and diff against `/mnt/project/` cache before editing. Or
  have CC run `git show HEAD:task.md` locally as authoritative.

- **Visual verification**: the Claude conversation cannot load the dev
  server visually. Addison must run `npm run start` in browser for any
  visual check. Established this in #17 Part 5.

- **VPS deploy nuance**: `npm run data` (which chains into
  `npm run build`) hardcodes Mac-only CSV paths and fails on VPS. For
  builds that need to regenerate the bundle (e.g. inline-bundle.mjs
  config changes), deploy manually:

      cd /var/www/pw.truesolartime.com
      git pull
      rm -rf dist
      npx parcel build src/index.html --public-url ./ --no-source-maps --dist-dir dist
      node scripts/inline-bundle.mjs
      sudo systemctl restart poetry-checker

  For pure code-only commits (no bundle change), just git pull +
  systemctl restart.

## Last session shipped (16 commits, May 16-17 2026)

Major arc: **#17 multi-part (#17 + #27)** — fill per-(char, rhyme)
文言/今義 content for all 11,727 gap chars across 106 pingshui rhymes,
then wire the data into EditModal + RhymeCharCard's lookup cascade.

| SHA | Scope |
|-----|-------|
| 254fb03 | Bootstrap-doc hygiene |
| 73498d9 | #27 prewarm-audio INSERT OR IGNORE |
| 0e22437 | #17 Part 1 (一東 pilot, 218 chars) |
| 6852805 | #17 Part 2 B1 (上平 14 rhymes, 2,212 chars) |
| cd7ad05 | #17 Part 2 follow-up (Wiktionary extractor fix) |
| d709ca2 | #17 Part 2 B2 (下平 15 rhymes, 2,308 chars) |
| f11fa08 | #17 Part 3 C1 (上聲 29 rhymes, 2,245 chars) |
| 02cb4ea | #17 Part 3 C2 (去聲 30 rhymes, 2,383 chars) |
| c8af9d9 | #17 Part 4 (入聲 17 rhymes, 2,361 chars) |
| 84baace | #17 Part 5 (UI consumer, closes #17) |
| 75384f5 | #17 Part 5 follow-up (CEDICT short-circuit fix) |

HEAD on origin/main as of last session end: **75384f5**.

**Two numbered tickets closed**: #27 + #17 (multi-part).

**Cumulative #17 data**: 11,727 entries across 106 rhymes (99.30%
extraction rate); USD ~0.481 LLM spend; ~262 min cumulative wall time
across 6 batches.

Production deployed and visually verified (崧 in 一東 renders correctly
with 文言/今義 sub-rows + CEDICT English below).

## Open in task.md

After #17 closure, `task.md` `## Active multi-part tickets` section
is empty (no active multi-part tickets). All remaining items are in
`## Deferred (no scheduled work)`:

Standing deferred items (older):
- Audio Review Library perf collapse (at 200+ clips)
- Tier 1 anchor poem unique-constraint bug
- Manual VPS .env TRAINER_BETA_USER_IDS revert
- Pingshui data gap: 曆 missing (歷/历 present)
- Script: meta.json phase blocks overwrite on re-run
  (scripts/build-unique-char-content.mjs design issue)
- 22 fetch-failure retry from #14 LLM gloss generation
- Group D variantPairs cleanup in patch-pingshui.mjs

New from #17 session:
- VPS npm run data hardcoded Mac path (workaround documented)
- Wiktionary cascade in build-unique-char-content.mjs is dead code
  (0/11,727 entries shipped)
- Part 0 audit-script gap counts diverge from build script
- Post-Part-4 audit-batch triage (83 LOW entries)

---

# Suggested next-session tickets

These are queued from #17's closeout. None urgent; pick whichever
fits the session's time budget and energy level.

## Ticket A — Post-Part-4 audit-batch triage (small, focused)

83 LOW-confidence entries from #17 Parts 2-4 sit in
`data/audit/unique-char-audit-batch-*.md` across ~50 rhymes. Each
entry has the char + rhyme + zdic raw content (often single-line
字書 fragment) + Wiktionary raw (almost always empty) + Haiku LLM
output with uncertain:true or empty citation.

Triage: verdict-stamp each entry as one of:
1. Ship LLM wenyan content (no citation needed — variant glyph,
   俗字, name-use char where Haiku correctly refused to fabricate)
2. Skip (genuinely uninformative — bare 反切 fragment with no
   semantic content)
3. Manual gloss needed (rare — would require separate enrichment)

Then write a small script that reads the verdicts and applies them:
adds the "ship" entries to src/data/unique-char-content.json, leaves
"skip" entries out, flags "manual" entries to a separate file.

Expected outcome: 50-70 new entries added to the data file (the
"ship" verdicts), bringing cumulative coverage closer to 100%.

Estimated effort: 60-90 min (most of it is triage judgment, not code).

## Ticket B — Wiktionary cascade cleanup (small, mechanical)

scripts/build-unique-char-content.mjs includes a Wiktionary fallback
between zdic and Haiku LLM rescue. After Parts 1-4 (11,727 chars
processed), the Wiktionary path produced ZERO ship-grade entries.
The path is architecturally sound but empirically dead code for this
corpus.

Cleanup: remove the Wiktionary fetch + extraction + validation logic
from the script. The cascade becomes zdic → Haiku → audit-batch.

Verify by running a dry-run on a small rhyme; confirm zero behavior
change since Wiktionary never fired anyway.

Estimated effort: 30 min (small script edit + verification dry-run).

This isn't urgent — keeping dead code costs nothing. But if you want
the script cleaner, this is the ticket.

## Ticket C — VPS data-build path issue (small, structural)

scripts/build-pingshui.mjs (line 24 area) reads CSVs from a
hardcoded Mac-only path: /Users/addisonkang/pw/pingshui_*.csv. This
breaks npm run build on the VPS, which is why we deploy by running
the build sub-steps manually.

Two fix options:
- (a) Make the CSV path configurable via env var (`PINGSHUI_CSV_DIR=...`)
  with a sensible default for Mac
- (b) Copy the CSVs to a path on the VPS and adjust the script to
  check multiple paths

Option (a) is cleaner. After the fix, npm run build should work on
both Mac and VPS without modification.

Estimated effort: 30 min.

## Ticket D — Script meta-overwrite design issue

scripts/build-unique-char-content.mjs overwrites the entire phase
block in data/audit/unique-char-content-meta.json on every run,
rather than merging stats from prior runs. Surfaced during #17 Part 2
follow-up when re-running 九佳 + 十二文 for 1 char each erased B1's
actual 68/93-char phase stats. Worked around manually for that
commit.

Fix: in persistMeta(), read existing phase block (if any) and ADD
deltas rather than replace. ~10 line change.

Estimated effort: 20 min.

Not urgent — sweeps typically complete in single shots; only matters
when a phase is re-run for partial recovery.

## Ticket E — Group D variantPairs cleanup

Per task.md's deferred section, there's a Group D variantPairs
cleanup pending in scripts/patch-pingshui.mjs from the post-#15
audit. Was deferred pending a broader pingshui sweep.

Status: Addison needs to look back at this and remember what the
specific cleanup was. Probably worth starting with CC reading the
relevant section of patch-pingshui.mjs and surfacing the current
variantPairs state.

Estimated effort: unknown until investigation.

---

# How to start the next session

1. Open a fresh Claude conversation.
2. Paste the bootstrap section above (everything from "Hi Claude" to
   the end of "Open in task.md").
3. Then say what you want to work on (or paste one of the ticket
   sections A-E above).
4. The fresh Claude will load context + start drafting CC tickets.

If you're not sure where to start, **Ticket A (audit-batch triage)
is the natural next step** — it closes a loop from this session and
adds value (more chars get content) without introducing new design
work.
