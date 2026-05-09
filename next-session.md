# Next session handover

Generated end of session 2026-05-09.

## Last session accomplishments

3 numbered tickets closed + 1 hotfix:

| Ticket | SHA | Scope |
|---|---|---|
| #22 | `83f54c7` | Simp↔Trad UI toggle (closed prior session, deployed this one) |
| #7 | `423c2a2` + `aab9070` (hotfix) | 簡↔繁 rhyme-merger annotations |
| #15 | `68a7631` | Unihan-based variant detection (kZVariant + kCompatibility + kSemantic + kSpecialized, rhyme-equivalence filtered) |
| #14 | `28e1081` | LLM-generated MOE coverage gap glosses (v3 prompt, claude-haiku-4-5, $1.99) |

Bookkeeping: SHA backfills + this handover doc.

## Open numbered tickets remaining

- **#16** Multi-tone multi-card (need strengthen Library)
- **#17** Fill empty 字義/词语 on rare chars

Both share dictionary-sourcing infrastructure with the now-closed #14.
Path A (sourcing漢語大詞典 / 中華語文知識庫 / Wiktionary CN) deferred
during #14 in favor of LLM-gen Path C; it remains the right approach
for #16/#17 if Path C quality proves insufficient long-term.

## Carryover observations (parked, not blocking)

1. **Pingshui data gap — 曆 missing**. Surfaced during #7. `曆` (simp `历`) absent from `src/data/pingshui.json` though `歷`/`历` are present (both 入聲 十二錫). `曆` likely reads identically. Defer to a future pingshui sweep.

2. **Group D `variantPairs` cleanup in `patch-pingshui.mjs`**. With #15's 1,908-entry Unihan map in production, audit which manual entries are subsumed. The residual entries are calligraphic / pre-Unicode reconstructions Unihan doesn't cover. Future ticket.

3. **`moedict.ts` variant fallback**. Different data shape than the analyzer; failure mode is "no def" not "wrong rhyme." Separate ticket if needed.

4. **22 fetch-failure entries from #14**. Sub-1% of the gap; still display English CC-CEDICT fallback. Counted in `llm_v1_failures` rather than `moe_count`. Future re-run with the same v3 prompt would close them. ~$0.01 cost.

5. **`scripts/build-pingshui.mjs` Mac-path footgun**. Hardcoded `/Users/addisonkang/pw/pingshui_上平.csv`. Fix is env-var-driven path or `build:prod` script.

6. **`攟` (U+651F) and similar chars where Unihan declares no variant edge at all**. Out of scope for #15 — would need either manual variantPairs entry in patch-pingshui.mjs or a custom variant data file.

## Active conventions (do not drift)

1. Commit message attribution trailers DROPPED entirely. NO `🤖 Generated with [Claude Code]` or `Co-Authored-By: Claude <noreply@anthropic.com>`. Apply to all future commit message templates.

2. Every deliverable bash block has a heading naming target: `## Send to Claude Code`, `## Deploy (VPS)`, `## Local`, `## Commit and Push (Claude Code)`. Heading goes ABOVE the block. Different-target deliverables go in separate labeled blocks; never mix VPS and Local commands in one block.

3. Two-file workflow: every closing commit appends "Closes #N. Updates task.md → CLAUDE.md." Verify the actual diff includes BOTH file updates. Don't trust marker text alone — confirm task.md entry removed AND CLAUDE.md closed-section entry added in the same commit.

4. `(this commit)` SHA placeholder convention: acceptable mid-flight, backfill in next session-end bookkeeping commit. SHAs always recoverable via `git log --grep "#N"` or git blame.

5. Manual smoke test BEFORE production push for any UI banner / analyzer fallback / drill rendering logic. The #7 lookup-key bug taught us this.

6. VPS `npm run build` is bypassed because `dist/` artifacts are committed. The `npm run data` Mac-path bug never matters in production.

7. Migration runner fires automatically on service boot — no explicit `node server/db/migrate.mjs` step needed in deploy blocks.

8. Commit shell escaping: prefer `<<'EOF'` (single-quoted heredoc) for commit messages with `$` characters. Don't escape `$` inside single-quoted heredocs (escape becomes literal). Tonight's #14 commit has a literal `\$1.99` in the body as a result — cosmetic only, not amended.

9. Codepoint visual ambiguity: instruct Claude Code to read verbatim chars from source files rather than copying from chat history when chars matter for correctness. Common visual collisions: 攏/攟, 翪/翺.

10. peiwen project paths:
    - Local repo: `~/poetry-checker` (NOT `~/peiwen` despite GitHub repo name)
    - VPS deploy: `/var/www/pw.truesolartime.com`
    - VPS service: `sudo systemctl restart poetry-checker` (NOT `pw` or `peiwen`)
    - Production URL: `https://pw.truesolartime.com`

11. Doc-only commits (task.md / CLAUDE.md / .claude/skills/ changes) skip `npm run build` and full drift check. VPS deploy optional since production doesn't surface these files to users.

## API key handling — security note

Tonight's session leaked an API key via a buggy `echo` mask (`${VAR:+...$VAR...}` pattern that printed the variable's value). Key was revoked promptly. Total spend on revoked key: $0.47, well under the $5 free credit cap. If the leak was scraped, it cost Anthropic at most ~$4.50 — acceptable.

For future sessions, the only safe API key existence check is:
```bash
node -e "console.log('key set:', !!process.env.ANTHROPIC_API_KEY, 'length:', process.env.ANTHROPIC_API_KEY?.length || 0)"
```
NEVER `echo $VAR`, `echo ${VAR:0:8}...`, or any echo of the variable's content directly.

## Stale state to clear

- This file (`next-session.md`) was previously a stray. Now overwritten with this handover. Treat as ephemeral — overwrite or delete as needed at start of next session.

## Outstanding decisions for next session start

None blocking. Continue with #16 or #17 if user wants more numbered tickets, or pivot to any of the parked observations above.
