# SKILL.md — How to work in this codebase with Addison

Paired with CLAUDE.md. CLAUDE.md documents the codebase (architecture,
features, data, operational lessons). SKILL.md documents how to work
in this codebase with this user — workflow rhythms, communication
preferences, behavioral rules baked from real mistakes.

SKILL.md is durable. CLAUDE.md is current-state. Different lifespans.

---

## 1. Roles and workflow

Three actors, distinct responsibilities:

**User (Addison)** — product owner, classical prosody domain expert,
deployer. Makes all design decisions, reviews all diffs, approves all
commits. Deploys via SSH to VPS. Runs live verification in browser.
Has classical reference sources (康熙字典, 廣韻, 集韻) that outrank any
automated audit pipeline.

**Claude.ai** — strategist, planner, reviewer. Operates in
conversation context only (no file system). Reads code via web_fetch
(raw GitHub URLs). Drafts Claude Code prompts, reviews diffs the user
pastes back, makes architectural decisions. Handles multi-step
reasoning that benefits from back-and-forth discussion before
committing to implementation.

**Claude Code** — implementer. Has file system access, runs commands,
edits code, commits and pushes. Receives structured prompts with
explicit investigation → implementation → verification steps. Never
commits without explicit user approval.

The user switches between Claude.ai and Claude Code depending on the
task. Feature design and multi-commit planning happen in Claude.ai.
Single-ticket implementation happens in Claude Code. The boundary
isn't rigid — some sessions run entirely in one surface.

---

## 2. Communication preferences

**Terse, peer-level.** No "Great question!" preamble. No padding.
Push back when the user is wrong. Ask max 1-3 clarifying questions
before proceeding. If something is ambiguous, propose a default and
state the assumption rather than asking.

**Deliverable block headings.** When a Claude.ai session produces work
for Claude Code, format the handoff with clear section headers:
`## Send to Claude Code`, `## Deploy (VPS)`, `## Local`, `## Commit
and Push`. Each block is self-contained.

**Decision questions.** When surfacing decisions that need user input,
frame with concrete options (2-4 choices). Don't open-end it. State
your lean if you have one.

**"You decide" is durable.** When the user delegates a decision, treat
it as a standing preference for the remainder of the conversation. Don't
re-ask later.

**Aggressive corrections become permanent rules.** If the user corrects
something sharply, bake it into behavior for the rest of the session.
Don't test the boundary again.

**Don't narrate tool calls.** User-facing text should communicate
results and decisions, not running commentary on "I'm about to read
this file" or "Let me check that." State what you found, not what
you're doing.

---

## 3. Project orientation

佩文・詩律析辨 (Peiwen Shilü Xibian) is a Classical Chinese poetry
prosody analyzer deployed at pw.truesolartime.com. Two product
surfaces: the Analyzer (mature — auto-detects form, scores against
4 格 patterns, renders tone/rhyme grid, reports violations) and the
Trainer (newer — 4-drill curriculum teaching 平水韻 rhyme categories
via spaced-repetition-inspired Bjork interleaving).

Stack: React 18 + TypeScript + Tailwind (Parcel bundler) frontend,
Express.js + SQLite (better-sqlite3) backend, single VPS deployment.
Google OAuth for auth. dist/ is committed (no build on VPS).

The trainer uses a 3-tier x 4-drill curriculum structure. Tier 1 (5
distinctive rhymes) is fully shipped. Tier 2 (20 confusable-family
rhymes) and Tier 3 (5 rare/historical rhymes) are locked behind
content prep + TTS batch generation.

For full architecture, see CLAUDE.md §1-§7. For pedagogy, see §15.
For the multi-tone pinning feature, see §21.

---

## 4. Working with Claude Code

### Prompt structure

Claude Code prompts follow a consistent template:

1. **Context** — what exists, what shipped recently, why this ticket
2. **Part 1 — Investigation (STOP and report)** — read files, check
   data, surface discrepancies. NO writes. The user reviews findings
   before greenlighting implementation.
3. **Part 2+ — Implementation** — code changes, with explicit specs.
   Each part may have its own STOP gate.
4. **Rules — DO NOT** — explicit boundaries. List files/endpoints/
   features that must not be touched.
5. **Deliverables** — what to report at each STOP.
6. **Commit message draft** — pre-written, sometimes adjusted after
   implementation reveals details.

### Investigation-first pattern

Never implement before investigating. Part 1 reads files, checks
schemas, runs diagnostic queries. The user reviews findings and may
change the implementation plan based on what Part 1 surfaces. This
pattern has caught multiple design-breaking assumptions (e.g., the
curriculum-audit ticket where investigation found 8 wrong chars
instead of the expected 1).

### Verification-first pattern

Show data before classifying it. When investigating a bug, dump the
raw data (pingshui entries, corpus stats, DB rows) before stating a
diagnosis. The user's classical expertise may interpret the data
differently than automated heuristics would.

### Full diffs before commit

Never commit without showing the full diff in chat first. The user
reads diffs — don't summarize what changed; show what changed. Code
walks ("I changed line 42 to do X") are insufficient; the diff is
the artifact.

---

## 5. Working with Claude.ai

Claude.ai operates in conversation context — no file system, no git.
It reads code via web_fetch against raw GitHub URLs.

**Raw URLs only.** Never use GitHub blob/HTML view URLs — they truncate
large files. Always use:
`https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>`

**First fetch may fail.** The first raw fetch to a new repo sometimes
returns PERMISSIONS_ERROR. Seed the URL space by fetching the repo root
or README first, then retry the target file.

**Token cap can truncate.** web_fetch has a default token cap that can
silently truncate large files. When reading CLAUDE.md (~2000 lines),
check the final lines of the response to confirm you received the full
file. If truncated, fetch specific line ranges.

**tool_search before claiming missing.** The visible tool list in a
Claude.ai session is partial. Many tools (Chrome extension, MCP
integrations) load via tool_search and don't appear initially. Run
tool_search with relevant keywords before declaring a capability
unavailable.

**Browser verification via cross-session prompt.** When this Claude.ai
session lacks Chrome extension access (often the case in project-scoped
conversations), the user may have a separate Claude session with browser
tool access. The pattern: write a verification prompt for the OTHER
session as a copy-pasteable block (URL + navigation steps + DOM/network
inspection task + report-back format). The user pastes it there, the
other Claude drives the browser, and the user pastes results back here.
This worked concretely during multi-tone Phase 4 verification — the live
`/api/suggest` payload was captured this way and proved CC's "code-trace
says fine" diagnosis right (and surfaced an additional bug). When live
verification is needed and the local session can't drive Chrome, structure
the prompt explicitly for cross-session use rather than asking the user
to walk through the steps themselves.

**In-conversation memory only.** Claude.ai doesn't persist across
sessions. CLAUDE.md and this file are the durable cross-session
knowledge stores. Don't assume Claude.ai remembers prior conversations.

---

## 6. Behavioral rules baked from this session

Each rule has a concrete trigger — the failure mode that produced it.

**sed-with-backticks corrupts files.**
Running sed substitution where the replacement text contains backticks
(e.g., commit hashes wrapped in markdown backticks) treats the
backticks as shell command substitution, which can truncate the file to
zero bytes. Use the Edit tool or a script with proper quoting; never
sed-with-backticks for markdown/code edits.

**Commit-then-amend produces unreachable hashes.**
When a commit message or file references its own commit hash
(self-referential), the commit-then-amend pattern changes the hash,
leaving the reference pointing to a hash that doesn't exist on origin.
Use a two-commit pattern instead: first commit with placeholder text,
second commit backfilling the actual hash.

**Verify briefing claims against the repo.**
Onboarding briefings describe intended state, not necessarily shipped
state. A briefing claiming "§16-§19 landed in commit X" may be wrong
(the commit message said so, but the diff didn't apply). Always verify
with `grep`, `git log`, or file reads before treating a briefing claim
as a TODO.

**Show data before classifying it.**
When investigating a bug, dump the raw data first (DB rows, JSON
entries, pingshui readings), then state the diagnosis. Don't classify
before the data is visible — the user's domain expertise may interpret
the data differently than the assistant's heuristic.

**State diagnoses as hypotheses until evidence lands.**
Use "suspected cause" or "likely" when the evidence is indirect. Use
"confirmed" only after running a diagnostic that produces the specific
data point. The user reads carefully and will call out false certainty.

**DB queries vs API GETs answer different questions.**
When the question is "what's in the database," go to sqlite3. When the
question is "what does the UI see," go to the API. Endpoints filter,
paginate, and project — they hide rows. Don't query the API and
conclude "the DB has N rows."

**Test migrations through the actual runner path.**
bare `sqlite3 < file.sql` doesn't apply the runner's transaction
wrapper or production's `foreign_keys=ON` PRAGMA. Both of these caused
deploy crashes that local testing missed. Always test via
`runMigrations()` with `db.pragma('foreign_keys = ON')` before claiming
a migration works.

**Never include explicit BEGIN/COMMIT in migration files.**
The migration runner (`server/db/migrate.mjs`) wraps each migration in
`db.transaction()`. An explicit `BEGIN TRANSACTION` inside the SQL
causes `SqliteError: cannot start a transaction within a transaction`.

**Use PRAGMA defer_foreign_keys for table rebuilds.**
When a migration does CREATE new → INSERT copy → DROP old → RENAME
(the standard SQLite table-rebuild pattern), the DROP TABLE triggers FK
validation if `foreign_keys=ON`. `PRAGMA defer_foreign_keys = ON` at
the top of the migration defers validation until COMMIT.

**Composite cell-index keys, not flat indices.**
Pin map keys use `"lineIdx,pos"` (e.g., `"1,6"`), not flat integer
indices. Flat indices shift when charsPerLine changes across edits or
form changes (五絕 → 七絕). Composite 2D keys are stable.

**Pin overrides tone too.**
A user pinning a 仄 reading on a 平 slot is declaring intentional tone
violation. The pin path in lookupExpecting searches ALL entries (not
just tone-matching). Downstream slot-tone mismatch detection surfaces
the violation naturally. Don't gate the pin search on tone match.

**Parked issues surface when related work ships.**
Issue B (checkRhymes using independent rhymesOf iteration) was parked as
"only worth fixing if the inconsistency bothers you." Auto-rhyme-match
(6bc476e) shipped and immediately made the inconsistency user-visible.
Re-audit parked items when shipping changes that overlap their scope.

**AI suggestions need ground-truth anchoring.**
When 字境 asks the LLM for chars in a specific rhyme, the model
hallucinates rhyme assignments. Few-shot the prompt with 5-7 real chars
from PINGSHUI_RHYME as concrete examples. The post-filter correctly
rejects hallucinations, but user-facing UX must not show "no
suggestions" while simultaneously displaying a fallback grid of valid
chars.

**Don't reflexively edit docs for tangential changes.**
A change to feature X doesn't automatically require updating every
CLAUDE.md section that mentions X tangentially. Check whether the
existing prose actually contradicts the new state before editing. If it
doesn't, leave it alone.

---

## 7. Deployment workflow

Production VPS: `/var/www/pw.truesolartime.com`

```bash
# Standard deploy (user runs via SSH)
cd /var/www/pw.truesolartime.com
cp server/data.db /tmp/data-backup-$(date +%Y%m%d-%H%M%S).db
git pull origin main
systemctl restart poetry-checker
```

`dist/` is committed — no build step on VPS. Parcel builds run locally
before commit. The Parcel build produces content-hashed filenames;
stale bundles accumulate and get cleaned up periodically via `git add -A`.

Migrations auto-apply on service restart via `runMigrations()` in
`server/index.mjs`. The runner is idempotent (tracks applied migrations
in `schema_migrations` table).

For commits introducing new disk-resident files read at module load:
verify with `git ls-files <path>` and `git check-ignore <path>` before
pushing. A gitignored file that's read at runtime will crash the service
on VPS with ENOENT (this happened with tc2sc.json in commit e6f3e7a;
fixed in c6a39b2 via .gitignore exception).

---

## 8. Subject matter

平水韻 is a mediaeval Chinese rhyme dictionary organizing ~21,000 chars
into 106 categories (30 平声, 59 仄声, 17 入声). The trainer curriculum
covers the 30 平声 categories across 3 tiers. Tier 1 (5 distinctive
rhymes: 一東, 七陽, 十一尤, 六麻, 五歌) is fully shipped.

The prosody standard throughout is 王力-orthodox. Not 中华新韵 (modern
simplified rhyme system), not 启功's loose standards. When in doubt
about a classical reading, the user's references (康熙字典, 廣韻, 集韻)
are authoritative — they outrank any automated audit pipeline or AI
suggestion.

For the full pedagogy canon (drill definitions, tier unlock logic,
Bjork interleave rationale, Cantonese-as-evidence approach), see
CLAUDE.md §15.

---

## 9. Locked decisions / sealed work

These decisions are final. Don't reopen them in future sessions.

- **3-tier x 4-drill structure.** No Tier 4, no Drill 5. The
  curriculum scope is fixed.
- **Drill 4 = 词语补齐.** The original "Tang poem with rhyme position
  blanked" design was abandoned (see CLAUDE.md §17). The v2 design
  (2-char CC-CEDICT compounds) is settled.
- **韵部库 = pure recall.** The scaffolded design (hints, difficulty
  labels, seed examples) was shipped and then removed (commits
  adf137b, 5f11655). The current design is pure recall with no
  scaffolding. The exercise is post-curriculum territory.
- **温韵默考 naming.** The per-rhyme self-test button on the dashboard.
- **Multi-tone pin hierarchy: pin > auto-rhyme-match > first-tone-match.**
  Pins override tone too (see §21). No unpin affordance — tap-pinned-pill
  is a no-op.
- **Issue B resolved.** checkRhymes uses chosen.rhyme + requiredRhyme
  (commit e52cdb0). The old rhymesOf()-based majority vote is gone.
- **字境 = admin-only.** Not premium-tier. Cost is unbounded (each tap
  = one billed Anthropic API call).
- **Composite cell-index keys** ("lineIdx,pos"). Not flat indices.
- **No-unpin tap semantics.** Opening the picker is the commit. The
  user must declare intent; "no opinion" is unreachable post-pick.

---

## 10. Quick reference: files that move together

When editing one of these, check whether the others need mirroring:

| Primary | Mirror(s) | Notes |
|---------|-----------|-------|
| `src/data/pingshui/trainer-curriculum.ts` | `server/data/tier1-seed-chars.mjs` | Tier 1 only; 二冬+ chars don't propagate to server mirror |
| `scripts/build-pingshui.mjs` | `scripts/patch-pingshui.mjs` | Build runs first, then patch |
| `scripts/build-drill4-corpus.mjs` | `src/data/pingshui/drill4-corpus.json` | Rebuild corpus after script changes |
| `server/db/migrations/*.sql` | `CLAUDE.md §20(a)` canonical schemas | If migration ≥012, verify with `.schema` |
| `.gitignore` | Any new `readFileSync` at module load | Verify `git ls-files` + `git check-ignore` |
