# Next session handover

## How to bootstrap a new session

Read these files in this order. Each has a different role; don't skip.

1. **`next-session.md`** (THIS FILE) — start here. Last session's
   shipped tickets, open tickets, parked observations, active
   conventions, next-session candidates. Authoritative for "what state
   is the project in right now."

2. **`task.md`** — current open ticket queue with full prose. The "##
   Deferred / Parked items" section lists numbered tickets and parked
   observations not yet started. Authoritative for "what could we work
   on next."

3. **`CLAUDE.md`** — project memory + closed-ticket archive. Read the
   `## Closed parked items` → `### Numbered tickets` section near the
   bottom for context on recently shipped work; read `## Known Gaps`
   for outstanding caveats. Authoritative for "how does the project
   work" and "what's been done."

4. **`SKILL.md`** — project conventions and three-actor workflow rules.
   Authoritative for "how should I behave in this project."

5. **`README.md`** — minimal high-level pointer; usually skipped.

If files conflict (e.g. `task.md` lists a ticket as open but
`CLAUDE.md` shows it closed): trust `CLAUDE.md`'s closed-tickets
section as the most recent record. Surface the conflict to the user.

Use the `view` tool to read these files directly from `/mnt/project/`
or `project_knowledge_search` for broad queries. The full files are
authoritative; chunked search results are partial.

After reading, confirm understanding by listing:
- Last session's shipped tickets (count + SHAs)
- Open numbered tickets remaining
- Parked observations carried forward (count)
- Active conventions you noticed
- Any questions before starting work

Then the user will tell you which ticket or task this session targets.

### Cache-lag check (do this BEFORE trusting /mnt/project/)

The `/mnt/project/` project-knowledge cache refreshes on a delayed
schedule and may be days old. Symptoms: `next-session.md` doesn't
match this protocol, closed tickets appear open, or ticket SHAs
don't match recent commits.

Before reading the rest of the bootstrap files from `/mnt/project/`,
fetch the GitHub raw URL of this file and diff the first 50 lines
against the `/mnt/project/` copy:

  https://raw.githubusercontent.com/addisonagent9/peiwen/main/next-session.md

If they match: project-knowledge is current; read from
`/mnt/project/` for all bootstrap files.

If they differ: project-knowledge is stale. Read ALL bootstrap
files from GitHub raw URLs instead:

  https://raw.githubusercontent.com/addisonagent9/peiwen/main/next-session.md
  https://raw.githubusercontent.com/addisonagent9/peiwen/main/task.md
  https://raw.githubusercontent.com/addisonagent9/peiwen/main/CLAUDE.md
  https://raw.githubusercontent.com/addisonagent9/peiwen/main/SKILL.md

Note on web_fetch quirks (per SKILL.md §5):
- First fetch to the repo may return PERMISSIONS_ERROR. Seed by
  fetching the README raw URL first, then retry.
- web_fetch has a default token cap that silently truncates large
  files. CLAUDE.md is the usual victim (~2000+ lines). If the tail
  of CLAUDE.md is missing (e.g. no `## Closed parked items` section
  visible), ask Addison to paste the needed section rather than
  guessing.

Generated end of session 2026-05-10.

## Last session shipped

3 numbered tickets closed + 1 bookkeeping commit:

| Ticket | SHA | Description |
|---|---|---|
| #16 v1 multi-tone multi-card — Part 2B (data layer) | `64c2a0d` | New `scripts/build-reading-content.mjs` + `src/data/reading-content.json` (151 chars × per-pingshui-reading entries; 162 KB; tone-mark NFC pinyin; MOE heteronyms + per-pinyin CEDICT compounds). Resolution chain: direct → yiti regex → opencc cn-to-tw. Rule Z for 入. merged_tone Type A flag. |
| #16 v1 multi-tone multi-card — Part 2C (RhymeCharCard consumer) | `32c4bc0` | Per-pill 字義/词语/pinyin swap on the 平水韻 106 部 reference page. New `src/data/reading-content.ts` lazy-load module mirroring `moedict.ts`. redirect_from + merged_tone UI annotations. |
| #18 EditModal per-reading content swap + variant fallback | `4e0277d` | Same swap behavior in the analyzer's char popup. Centralized variant fallback in `readingContentLookup` (toSimplified for 50 redirected curriculum chars). Tri-state pill highlight (pinned ring-gold / current border-gold / neutral). Rule R1 annotation guard (no "via X" when X === user-typed glyph) backported to RhymeCharCard. |
| Session-end bookkeeping | `(this commit)` | SHA backfills + this handover doc. |

No hotfixes this session.

Open question post-#18: operator reported "字義 doesn't swap" but code+data review concluded the swap is correctly wired (`basicZhDefs = readingEntry ? readingEntry.definitions : ...`). Likely browser-cache staleness or testing on Type A merged-tone chars. **Next session may want to ask the operator for a hard-refresh + bundle-hash check** (`curl -s https://pw.truesolartime.com/bundle.html | grep -oE '[a-f0-9]{8}\.js'` should show `4a25ae4c.js`) before any code change.

## Active tickets remaining

- **#17** Fill unique word with meaning + 词语 (parked in task.md). Popup card surface; long-tail rare/archaic chars where MOE has no entry AND CC-CEDICT has no compounds. Likely uses similar Pipeline α + LLM-augmentation pattern from #14/#16; pairs well with the just-shipped data layer.

That's the only open numbered ticket.

## Parked observations (carry forward)

1. **Pingshui data gap — 曆 missing**. Surfaced during #7. `曆` (simp `历`) absent from `pingshui.json` though `歷`/`历` are present (both 入聲 十二錫). Defer to a future pingshui sweep.
2. **Audio Review Library perf collapse** at ~200+ approved clips (renders all clips at once, no pagination/virtualization).
3. **Tier 1 anchor poem UNIQUE-constraint bug** in `prewarm-audio.mjs`. ~10 min fix: switch INSERT path to `INSERT OR IGNORE`. Errors are categorically benign; not blocking.
4. **Manual VPS .env TRAINER_BETA_USER_IDS revert** — early Tier 1 testing-era state to roll back.
5. **Group D `variantPairs` cleanup in `patch-pingshui.mjs`**. With #15's 1,908-entry Unihan map in production, audit which manual mirrors are now subsumed.
6. **22 fetch-failure retry from #14 LLM gloss generation**. Sub-1% gap still showing English fallback (counted in `llm_v1_failures`, not `moe_count`). One cycle of retries against current API would close them; ~$0.01 cost.

No new observations surfaced from #16 / #18 implementation.

## Out-of-scope follow-ups from #16/#18 (not parked-grade, just listed)

- Extending Pipeline α beyond 151 curriculum chars to all 2,118 multi-tone-and-rhyme chars (~110 MB at full corpus scope; would warrant on-demand fetching).
- Example/quote fields from MOE heteronyms (currently emitting def strings only; could enrich the 字義 row with example sentences).
- Classical-source augmentation for sparse-CEDICT readings (e.g. 殷 yān has only 1 compound — could be enriched via 漢語大詞典 / 康熙字典 mining or LLM gen).

## Active conventions (preserved from prior handover)

User-locked, restated for quick context:

- **Target-labeled deliverable blocks**: every bash/CC prompt block has a heading above naming the target (`## Send to Claude Code`, `## Deploy (VPS)`, `## Local`, `## Commit and Push (Claude Code)`). Never mix targets in one block.
- **No Claude-attribution trailers**: drop `🤖 Generated with [Claude Code]` and `Co-Authored-By: Claude` from commit messages.
- **Two-file workflow**: closing commits append "Closes #N. Updates task.md → CLAUDE.md." with BOTH file edits in the diff.
- **API key safety**: only Node-side existence check (`node -e "console.log(!!process.env.ANTHROPIC_API_KEY)"`); never shell echo, never any mask-substring pattern.
- **VPS deploy gating**: data/code commits deploy. Doc-only commits (task.md / CLAUDE.md / .claude/skills) skip deploy.
- **No Parcel dev-server, EVER** — corrupts `dist/bundle.html` → 7.4 MB. Use `npm run build` only.
- **VPS service name**: `poetry-checker` (not `pw`, not `peiwen`).
- **Local repo path**: `~/poetry-checker` (not `~/peiwen` despite the GitHub repo name).
- **Production URL**: `https://pw.truesolartime.com`. VPS deploy path: `/var/www/pw.truesolartime.com`.
- **`(this commit)` SHA placeholder**: acceptable convention; backfill in next session-end commit.
- **Codepoint visual ambiguity**: instruct CC to read verbatim chars from source files rather than copying from chat history when chars matter for correctness (collisions like 攏/攟, 翪/翺).
- **Commit shell escaping**: prefer `<<'EOF'` (single-quoted heredoc) for messages with `$`. Don't escape `$` inside single-quoted heredocs (escape becomes literal).

## Likely next-session candidates

In rough priority order:

1. **#17** Fill unique word with meaning + 词语 — pairs well with the just-shipped reading-content data layer; shares Pipeline α infrastructure.
2. **Tier 1 anchor poem UNIQUE bug** — ~10 min low-risk parked obs; good warm-up.
3. **Group D variantPairs cleanup** — post-#15 audit; cleanup not feature work.
4. **22 fetch-failure retry from #14** — one API cycle, ~$0.01.
5. Pivot to something new (Tier 2 wenyan content, anchor poem expansion, etc.).

User's call.
