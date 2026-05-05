# pingshui.json source paths

`pingshui.json` is the canonical 平水韻 char→rhyme dictionary for the
peiwen project. **It is auto-generated; never edit directly** (changes
will be lost on next build).

## Source layout

CSV files live OUTSIDE the repo, in user's home directory:
- `/Users/addisonkang/pw/pingshui_上平.csv`
- `/Users/addisonkang/pw/pingshui_下平.csv`
- `/Users/addisonkang/pw/pingshui_上聲.csv`
- `/Users/addisonkang/pw/pingshui_去聲.csv`
- `/Users/addisonkang/pw/pingshui_入聲.csv`

## Build pipeline

1. `scripts/build-pingshui.mjs` — reads CSVs, emits `src/data/pingshui.json`
2. `scripts/patch-pingshui.mjs` — post-processes the generated JSON to
   apply char-level corrections

Workflow: `node scripts/build-pingshui.mjs && node scripts/patch-pingshui.mjs`
(or just patch if CSVs unchanged)

## Patch helpers in patch-pingshui.mjs

- `fixSimplified(simp, trad)` — replace simp's entries with trad's
- `reorder(char, preferTone)` — reorder so preferred tone is first
- `reorderToRhyme(char, targetRhyme)` — reorder so target rhyme is first
- `addReading(char, tone, group, rhyme)` — add new entry
- `addMultiReading(char, entries)` — add multiple

No `removeRhymeEntry` helper exists. A true MOVE (remove + add) requires
writing one — but in practice, dual-attestation is usually preferred over
removal because the rare-rhyme attestation supports analyzer correctness
on classical poems.

## Common pitfalls

- Editing `pingshui.json` directly works once but regenerating from CSVs
  via `npm run build` (which doesn't run the patch script in some configs)
  may revert the change
- The patch script is large (~1200 lines); search via
  `grep -n "char_in_question" scripts/patch-pingshui.mjs` to find existing
  patches before adding new ones
- Char codepoints sometimes look identical across fonts (攏 U+651F vs
  攟 U+6523, etc.) — always verify via `cat` and visible codepoint, not
  just visual inspection in the IDE
