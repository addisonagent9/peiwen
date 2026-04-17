# 佩文・詩律析辨 — Project Context for Claude Code

## What this project is
A Classical Chinese poetry prosody analyzer that checks tone patterns (平仄) and rhyme schemes against the 平水韻 (106 rhyme groups). Deployed at pw.truesolartime.com.

## Tech stack
- Frontend: React + TypeScript + Tailwind, bundled with Parcel to `dist/bundle.html`
- Backend: Express server in `server/index.mjs` with Google OAuth, SQLite, Anthropic API proxy
- Dictionaries: CC-CEDICT (English), 萌典 (Chinese), 平水韻 CSV data from /Users/addisonkang/pw/
- VPS: /var/www/pw.truesolartime.com (Ubuntu, systemd service: poetry-checker)
- GitHub: https://github.com/addisonagent9/peiwen

## Build & test workflow
- Build: `NODE_OPTIONS="--max-old-space-size=8192" npm run build` (run from project root)
- Local test: `open dist/bundle.html` or `python3 -m http.server -d dist 8000`
- Playwright + Chromium installed — use for visual UI testing before pushing
- Deploy: `git push` on local, then `git pull origin main && sudo systemctl restart poetry-checker` on VPS
- VPS does NOT rebuild — dist/ is committed to git

## Critical rules (do not violate)
1. The `best` memo in App.tsx: when `detect` exists, ALWAYS use `detect.ranked` or `detect.best`. Never use stub when detect is non-null. Stub only when detect is null.
2. Grid centering: use `width: max-content` + `mx-auto` on grid element, `overflow-x-auto` on outer wrapper. Do not add nested flex-centering wrappers.
3. Never add `PoemPattern` stub code that overwrites real analysis results.
4. Server `.env` is gitignored — never commit API keys.

## Key files
- `src/App.tsx` — main app, auth state, best/detect/patternOptions memos
- `src/ui/Grid.tsx` — card grid layout
- `src/ui/CharCell.tsx` — individual character cards
- `src/ui/EditModal.tsx` — character click modal with dictionary + AI suggestions
- `server/index.mjs` — Express backend (OAuth, poems API, Anthropic proxy)
- `server/db.mjs` — SQLite schema (users, poems)

## Current state (as of last session)
- 詩體 buttons (五絕/五律/七絕/七律) appear above 格 pills on result screen
- 格 pills react when locked pattern is in detect.ranked (same 詩體 as poem)
- Switching 詩體 shows pills but clicking them does not update grid (known issue)
- Grid alignment: selectors appear left, grid floats right — ongoing layout bug

## Domain knowledge
- 詩體 = poem form (七絕/七律/五絕/五律)
- 格 = pattern within form (平起首句入韻 etc.) — 4 per 詩體, universal
- 平水韻 = 106 rhyme groups used in Tang dynasty poetry
- 析辨+ = premium AI feature for character suggestions (admin only for now)
- lockedPattern key format: `${form}·${kind}·${name}` e.g. "七絕·平韻·平起首句入韻"
