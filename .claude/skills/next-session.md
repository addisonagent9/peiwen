# next-session — Generating session-handoff prompts

## When to use this skill

Read this file when the user says any of:
- "We're migrating to a new session"
- "Prepare prompts for the next session"
- "Read next-session.md and generate handoff prompts"
- Or similar phrasing indicating the current session is wrapping and a
  fresh Claude conversation needs context to pick up the work

This file teaches you (the current Claude) HOW to generate stacked
handoff prompts. After reading it, you should be able to draft a
project-specific prompts file that the user pastes into a fresh session.

## The pattern

Generate a **stacked sequence** of prompts that the user pastes IN ORDER
at the start of a fresh Claude conversation:

- **Prompt 1 (bootstrap)** — heaviest. Loads project orientation, working
  patterns, last-session state, then opens with the FIRST ticket to work
  on.
- **Prompts 2-N (stacked)** — progressively shorter. Each opens with
  "Continuing from prompts 1-N's context. You know <project>, working
  patterns, and prior tickets." Then dives into the next ticket without
  re-bootstrapping.

This avoids re-explaining the project N times. Context accumulates as
the user pastes each prompt in sequence.

## Anatomy of a bootstrap prompt (Prompt 1)

The first prompt must include enough that a fresh Claude (no memory) can
work productively. Sections:

1. **Project orientation** (1-2 paragraphs)
   - What the project is
   - Production URL / repo URL
   - Key surfaces / components
2. **Three actors** (or however many)
   - User's role
   - This Claude's role (strategist? implementer?)
   - Other actors (Claude Code, etc.)
3. **Working patterns**
   - Heading conventions for deliverable blocks
   - Repo paths (local + production)
   - File source paths (esp. auto-generated files)
   - Build/deploy conventions
   - Ticket conventions (two-file workflow, SHA placeholders, etc.)
4. **Last session shipped**
   - Table of commits with SHAs and scopes
   - Bundle hash / current build state
5. **Open work inventory**
   - All open tickets with one-line descriptions
6. **This prompt's ticket** (the actual ask)
   - Motivation
   - Scope
   - Investigation questions for CC Part 1
   - Decisions to make after Part 1
7. **Standing by** — clear ask of what the new Claude should do first

Length: 150-200 lines for the bootstrap prompt. More if the project has
unusual conventions worth documenting.

## Anatomy of a stacked prompt (Prompts 2-N)

Each subsequent prompt:

1. **Opener** — single line: "Continuing from prompts 1-N's context. You
   know <project>, working patterns, and prior tickets."
2. **This prompt's ticket**
   - Same structure as bootstrap's ticket section
   - Motivation → scope → investigation questions → decisions →
     standing by

Length: 100-160 lines per prompt. Vary by ticket complexity.

## Order rationale

Sequence the prompts so each one builds on prior context where possible:

- **Easiest / lowest-risk first** — gets a quick win, warms the new
  conversation
- **Independent tickets next** — anything that doesn't depend on others
- **Dependent tickets last** — tickets that benefit from prior tickets
  shipping (e.g., synthesis tickets that consume newly-built data)
- **Optional ordering note in the closing** — tell the user the order is
  a suggestion, not a requirement

## Common pitfalls

- **Over-specifying implementation in the prompt** — leave Part 2 details
  to the CC ticket drafted DURING the work. The prompt should set up
  THINKING, not predetermine the fix.
- **Forgetting dependencies** — when ticket B benefits from ticket A
  shipping first, mention it in B's prompt. Don't make the user reverse-
  engineer the dependency.
- **Skipping "standing by"** — every prompt should end with a clear ask.
  Without it, the new Claude doesn't know whether to draft a CC ticket,
  ask a question, or just acknowledge.
- **Pasting verbatim chars between session and prompts** — if any prompts
  reference specific Chinese chars, technical identifiers, or codepoints
  with potential rendering ambiguity, instruct the new Claude to read
  them verbatim from source files (task.md, etc.) rather than copying
  from chat.
- **Re-bootstrapping in stacked prompts** — wastes lines. Trust the
  stacking convention. The new Claude has loaded the prior context
  because the user pasted prompts in order.
- **Drifting on facts** — when regenerating prompts in a fresh
  conversation (no original session memory), Claude may invent or
  misremember project specifics (e.g., wrong rhyme lists, wrong commit
  SHAs). Always read source files (task.md, CLAUDE.md, recent commits)
  rather than relying on memory or a prior summary.

## Length guidance

- Bootstrap prompt: 150-200 lines
- Stacked prompts: 100-160 lines per
- Tight focused tickets can run shorter (down to ~80 lines) if scope is
  genuinely small
- Total file: depends on number of tickets; budget ~150 lines per
  ticket on average

## Output format

Write all prompts to a single .md file. Section markers between prompts:
use `---` triple-dashes between, plus `# PROMPT N — <title>` headings.

## Workflow (when invoked)

When the user says "read next-session.md and prepare prompts" or similar:

1. **Read this file** to load the pattern
2. **Read the existing example** at
   `.claude/examples/peiwen-next-session-prompts.md` for reference (this
   shows what the previous handoff looked like — useful template)
3. **Confirm scope with user** — which tickets, in what order, any
   special context worth bootstrapping?
4. **Inventory current state**:
   - Read `task.md` for open tickets
   - Read `CLAUDE.md` for project history and recent closures
   - Run `git log --oneline -10` to see recent commits
   - Check current bundle hash if relevant
5. **Sequence the tickets** — apply the order rationale above
6. **Draft prompts** — bootstrap first (longest), then stacked (shorter)
7. **Save to file**:
   - Write to `/mnt/user-data/outputs/peiwen-next-session-prompts.md`
   - Use `present_files` to surface as downloadable artifact
8. **Update the committed example file** — this is critical:
   - The file at `.claude/examples/peiwen-next-session-prompts.md` is a
     **rolling artifact**: it always reflects the LATEST session's
     handoff content
   - After generating new prompts, draft a CC ticket to overwrite
     `.claude/examples/peiwen-next-session-prompts.md` with the new
     content
   - Commit message pattern: `docs(handoff): refresh
     peiwen-next-session-prompts.md for [date] session-end`
   - This keeps the in-repo example always-current; future "read
     next-session.md" invocations see the most recent template
9. **Report to user** — per-prompt line counts, total length, file
   location

## Two-file lifecycle reminder

| File | Lifecycle | When to update |
|------|-----------|----------------|
| `.claude/skills/next-session.md` (this file) | Mostly stable | Only when the workflow pattern itself evolves |
| `.claude/examples/peiwen-next-session-prompts.md` | Rolling | EVERY session-end handoff overwrites this |

Don't conflate the two. The skill is the meta-instruction; the example
is the latest output. They serve different purposes and update at
different cadences.

## Project-specific notes (peiwen)

The example file's name is `peiwen-next-session-prompts.md` because the
canonical use of this pattern is for the peiwen project. If applying the
pattern to a different project on this same codebase (or another repo),
use a parallel naming convention: `<project>-next-session-prompts.md`.

For peiwen specifically:
- Open tickets typically live in `task.md` "## Deferred / Parked items"
- Closed tickets in `CLAUDE.md` "## Closed parked items" → "### Numbered
  tickets"
- Each ticket is numbered (#N); some are non-numbered metadata fixes
- Working patterns include the two-file convention (task.md +
  CLAUDE.md), heading conventions for deliverable blocks (## Local, ##
  Deploy (VPS), etc.), and CC's STOP-and-Report gates between Part 1 +
  Part 2
- See `.claude/examples/peiwen-next-session-prompts.md` for a worked
  example of these patterns applied
