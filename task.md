# Multi-tone Reading Notes & Pedagogical Trackers (#19 corpus)

This file tracks classical multi-tone attestations and pedagogical notes that
don't yet have a dedicated home in the codebase. Started during Tier 3 ship.
Expected to grow as Addison provides more entries.

## Type B cross-tone chars (平/仄 split with classical attestation)

### 渐 (zim1 / zim6 Cantonese; jiān / jiàn Mandarin)
- 平聲 zim1 (子廉切, 廣韻): 流入·浸染 義. 下平 十四鹽.
  Classical usage: 渐染, 渐渍.
- 仄聲 zim6 (上聲): 逐漸 義. 上聲 二十八琰.
- High pedagogical value: composition in 十四鹽 requires 平 reading;
  modern learners' default is 仄.

### 厌 (jim1 / jim3 Cantonese; yān / yàn Mandarin)
- 平聲 jim1: 飽足·安貌 義. 下平 十四鹽.
- 仄聲 jim3: 厭惡 義. 仄聲 二十九豔.
- Type B parallel to 渐. Both in Set 2 of 十四鹽 curriculum.

### 探 (taam1 / taam3 Cantonese; tān / tàn Mandarin)
- 平聲 taam1: 探手·探身 義. 下平 十三覃.
- 仄聲 taam3: 探測·探望 義. 仄聲 二十八勘.
- Curriculum entry in Set 1 of 十三覃 (taam1).

### 嵌 (haam1 / haam3 Cantonese; qiàn modern Mandarin)
- 平聲 haam1: 山深貌·險峻 義. 下平 十五咸.
- 仄聲 haam3: 岸峻·陷入 義. 仄聲 二十八勘.
- Curriculum entry in Set 2 of 十五咸 (haam1).

### 降 (hong4 / gong3 Cantonese; xiáng / jiàng Mandarin)
- 平聲 hong4: 降落 義. 上平 三江.
- 仄聲 gong3: 投降 義. 仄聲 二十三絳.
- Curriculum entry in Set 1 of 三江 (hong4).

### 砭 (bim1 / bin1 Cantonese; biān Mandarin)
- 文讀 bim1 (classical literary, preserves -m): 廣韻 卑廉切. 下平 十四鹽.
- 白讀 bin1 (modern colloquial, lost -m): 現代粵語日常讀音.
- Pedagogical: example of Cantonese -m erosion in colloquial vs classical.

## Cross-rhyme chars (same tone, different rhyme group)

### 簪 (zaam1 only)
- 平聲 zaam1 in BOTH 十三覃 AND 十二侵 (廣韻 子林切 vs 子含切 — both 平聲).
- 杜甫《春望》usage assigns to 十二侵.
- Curriculum places in Set 2 of 十二侵.

### 黔 (kim4)
- 平聲 kim4 with multi-rhyme attestation. Modern Mandarin reads -ian which
  phonetically aligns with 十四鹽 -iam family rather than 十二侵 -im.
- 廣韻 巨淹切 places in 鹽韻 group; pingshui.json places in 十二侵.
- Set 4 of 十二侵 per pingshui authoritative.

### 沈 (cam4 platform; multi-rhyme with 仄 readings)
- 平聲 cam4: 十二侵.
- 仄聲: 二十六寢 / 二十七沁.
- Set 3 of 十二侵 (cam4).

## Pedagogical notes (not in any current curriculum entry)

### 嶺 / 岭 (lǐng / archaic líng)
- 仄聲 lǐng (正音): 上聲 二十三梗. Used in modern reading and in 近體詩 格律.
- 平聲 líng: archaic; not used in 近體詩 格律 per 平水韻 strict reading.
- Pedagogical warning: do not mistake 嶺 for 平聲 char in composition.
- Tracked here because it surfaced during Tier 3 framework discussion.

## -m diagnostic chars (Cantonese-preserved, Mandarin-merged)

The -m endings of 十二侵 / 十三覃 / 十四鹽 / 十五咸 collapsed into -n in modern
Mandarin. Cantonese preserves them. The following chars from each rhyme's
Set 1 carry the strongest pedagogical value as audio teaching points:

### 十二侵 -im
心 sam1 / xīn · 金 gam1 / jīn · 林 lam4 / lín · 沉 cam4 / chén · 吟 jam4 / yín · 寻 cam4 / xún

### 十三覃 -am
潭 taam4 / tán · 龛 ham1 / kān · 藍 laam4 / lán · 南 naam4 / nán · 含 ham4 / hán

### 十四鹽 -iam
甜 tim4 / tián · 帘 lim4 / lián · 严 jim4 / yán · 廉 lim4 / lián · 拈 nim1 / niān

### 十五咸 -aam
衫 saam1 / shān · 岩 ngaam4 / yán · 芟 saam1 / shān · 咸 haam4 / xián

## Deferred / Parked items

### #21 — Matching Rocky volume to WanLung
zh-HK-HiuGaaiNeural / Rocky TTS clips are noticeably quieter than
zh-HK-WanLungNeural clips. Apply +20% volume gain (or calibrated value
after A/B test) to all existing Rocky .mp3 files on VPS, plus modify
prewarm-audio.mjs to apply gain on future generation. Test on 3-5 sample
clips first.

### #22 — Simplified ↔ Traditional UI toggle
User-facing setting that switches all displayed Chinese text between
simplified and traditional forms across trainer + analyzer + admin.
Curriculum data continues to be stored simplified-by-default (per Tier 1/2
convention); UI converts on render via opencc when user prefers traditional.
Effort: 1-2 sessions of focused work. Scope: trainer drill cards, anchor
poem display, mnemonic prose, drill 4 corpus, edit modal, analyzer input/
output, /admin views. Storage stays canonical simplified.

### #6 — Audit pipeline batch
一東 cluster paused at 4 of 14 findings (10 remain: 烽, 蘢, 谾, 漎, 逄, 攏,
總, 蓊, 菶, 翪). ~519 findings across other rhymes (530 total HIGH-tier per
dictionary-audit-v2.md).

### #7 — 簡↔繁 rhyme-merger annotations
Some 簡 chars merge multiple 繁 forms with classically-distinct rhymes
(丰/豐 pattern: 丰 → 二冬, 豐 → 一東). Pedagogical content addition;
surfaces during audit work.

### #14 — Fill MOE coverage gap
Source additional classical Chinese dictionaries (漢語大詞典, 中華語文知識庫,
Wiktionary Chinese, manual curation) for the 28% of Drill 4 corpus 词语 not
covered by MOE. Until shipped, those 词语 display English CC-CEDICT glosses
as temporary fallback.

### #15 — Unihan-based variant detection
A systematic source (Unihan `kCompatibilityVariant` / `kTraditionalVariant`)
would replace pattern-matching but isn't currently sourced. Surfaces in §6
of CLAUDE.md (Group D variant-mirror sweep) where ad-hoc per-batch user
pattern-matching produces ~99% false positives without a systematic source.

### #16 — Multi-tone must have multi-card (need strengthen Library)
Today the popup card on the rhyme reference page (§11.C, shipped in
`7a37b8a` + `0dbe9b2`) shows a single card per char with shared 字義 / 词语
across all readings. For multi-音字 chars where each reading is historically
a distinct word (种 chóng/zhǒng/zhòng, 殷 yīn/yān/yǐn, 中 zhōng/zhòng), the
meaning shown contradicts whichever reading pill is currently ring-
highlighted. Pedagogically wrong: each reading SHOULD be its own card with
its own 字義, pinyin/jyutping, and 词语 (compound list filtered by the
reading's pinyin).

Blocking work: per-reading 字義 source. MOE returns one entry per char-key,
not per (char, rhyme, pinyin). Three approaches considered:
  1. AI-generated `reading-glosses.json` with user verdict pipeline, similar
     shape to the dictionary-audit-v2 triangulation flow. Multi-session.
  2. Source from 漢語大詞典 / 康熙字典 / Wiktionary multi-reading sections.
     Highest quality, slowest. Overlaps with #17.
  3. Hybrid: AI seed + user verdict, classical-source triangulation only
     when AI is uncertain.

UI work after data lands: swap RhymeCharCard from "share content across
pills" to "swap content per pill" — re-derive 字義, py, jyut, compounds
based on currentRhyme's reading. Pill click already wires through
`onRhymeChange`; just need the data plumbing.

Library work needed: probably a new `src/data/reading-glosses.json` (or
`.ts` if curated by hand) keyed by `{char}__{rhyme}__{pinyin}` with
`{gloss_zh, gloss_en, notes}` shape. Builds alongside the existing
`ambiguous-readings.ts` per-reading-notes infra (currently 14 chars).

Multi-session arc. Likely sequence: data-source decision → seed generation
→ verdict pipeline → UI swap → deploy.

### #17 — Fill unique word with meaning and 词语
The popup card on the rhyme reference page (§11.C, shipped in `7a37b8a`)
shows empty 字義 row and empty 词语 section for chars where MOE has no
entry AND CC-CEDICT has no 2-char compounds containing the char. Most
visible on rare/archaic chars surfaced via the 显示僻字 toggle (e.g. 簽 in
一東 area shows char + pinyin only — no meaning, no compounds). Affected
surface is the popup card; affected chars are the long tail of pingshui's
~19,600-char corpus that modern dictionaries don't cover.

Distinct from #14 — #14 scopes to Drill 4's `drill4-corpus.json` (compound
glosses for the trainer corpus). #17 scopes to per-char meaning + compound
coverage on the reference page. Same family of "fill the dictionary gap"
work; different surfaces, different remediation deliverables.

Distinct from #16 — #16 is per-reading content for multi-音字 chars with
multiple meanings. #17 is single-meaning chars that simply lack any meaning
entry today.

Sources to evaluate (overlap with #14 + #16): 康熙字典 OCR/digital corpus,
漢語大詞典, Wiktionary Chinese, 教育部異體字字典, 中華語文知識庫. Pipeline:
per-char triangulation across sources, user verdict on disagreements,
auto-merge on consensus, ship as a patch file consumed by the reference
card's lookup chain (probably extends moedict.ts to fall back to a
supplement table when MOE returns empty).

CC tooling angle: have CC search candidate sources online per char, surface
findings in audit-batch-N.md format (current readings vs candidate gloss vs
source per source), user verdicts, batch-patch. Same shape as the
dictionary-audit-v2 sweep that closed in May 2026.

Multi-session arc. Likely sequence: source-candidate evaluation → pilot
batch (~20 chars) → verdict-pipeline shape settles → corpus-wide sweep.

### #23 — Audio Review Library: sort latest-approved-first + Undo button

Two related UI improvements to the Audio Review Library at /admin:

**A. Sort latest-approved-first**
Approved clips currently render in unspecified order (likely DB row insertion
order, which doesn't match human review chronology). Change sort to:
- Approved tab: latest-approved at top (ORDER BY review_approved_at DESC)
- "All" filter: approved subset sorted latest-first within its group;
  pending order unchanged
- Any other approved-clip list views: same sort

**B. Undo button**
Place between the two existing "All" filter buttons (see screenshot in
session record).

Behavior:
- Reverts the single most recent review action (approve / reject / delete)
- Confirmation dialog before each revert: "Revert approval of [char]
  [voiceKind]?" or similar context-appropriate text
- After confirm, action reverts and Undo points to next-most-recent action
- Multi-press supported: walk back through history one action at a time
- Disabled (grayed out) when no history to revert
- Cap: last 20 actions per user. Older actions cannot be undone.

Implementation notes:
- Need a review_action_log table or column to track action history with
  timestamp + actor + before/after state
- For "undo delete": investigation needed during ticket open to determine
  whether delete is soft (DB flag), hard (row removed), or hard-with-backup
  (.mp3 in trash dir). Each requires different undo path:
  * Soft: just unmark
  * Hard: requires re-TTS (Azure cost) — flag as out-of-scope for v1?
  * Hard-with-backup: restore from trash dir
  Decide v1 scope based on current delete behavior

Effort estimate: 1 session for UI + DB column changes; possibly 2 if
undo-delete requires audio_clips schema migration.

Surfaced: post-Tier 3 audio review session (May 2026), based on UX friction
during ~1192-clip pending queue review.

## Deferred (no scheduled work)

### Audio Review Library perf
At ~200+ approved clips the Library tab becomes sluggish (renders all clips
at once). Pagination or collapse-by-default solution sketched in earlier
briefings; not yet built. Trigger: when audio review page first feels
sluggish, or before the next large TTS batch lands.

### Tier 1 anchor poem unique-constraint bug

The prewarm-audio.mjs script reports UNIQUE constraint failures on each run
for already-inserted Tier 1/2/3 anchor poem rows. As manifest grows, error
count grows: ~8 in early Tier 1, 14 after Tier 2 二冬/四支, 41 after Tier 3.
All errors share the same SQL signature:
`UNIQUE constraint failed: audio_clips.text, audio_clips.voice_kind, audio_clips.provider, audio_clips.voice_id`

Fix: change script's INSERT path to `INSERT OR IGNORE` (SQLite) or
equivalent ON CONFLICT DO NOTHING.

Effort: ~10 minute fix + verification on next prewarm run.

Not blocking; errors are categorically benign (same signature every time =
parked bug, per audio batch Lesson 2).

### Manual VPS .env TRAINER_BETA_USER_IDS revert
A manual VPS-side `.env` modification was made during early Tier 1 testing;
should be reverted to whatever the canonical state is now that production
has stable beta gating.

## Future entries
(Addison to add more multi-tone classical attestations as they arise during
ongoing curriculum work.)
