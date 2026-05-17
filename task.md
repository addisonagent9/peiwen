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

### 攏 (lung4 / lung5 Cantonese; lóng 平 / lǒng 仄 Mandarin)
- 平聲 lóng (上平 一東): rare classical attestation.
- 仄聲 lǒng (上聲 一董): modern common usage — 聚集·靠近·梳理 (拉攏, 攏聚).
- Pingshui dual-attested with 一董 primary; 平/一東 is rare/literary.
  Surfaced during #6 一東 cluster audit cleanup.

### 總 (zung1 / zung2 Cantonese; zōng 平 / zǒng 仄 Mandarin)
- 平聲 zōng (上平 一東): rare classical attestation (聚束 義).
- 仄聲 zǒng (上聲 一董): modern common usage — 總計·概括·終究 (總是, 總部).
- Pingshui dual-attested with 一董 primary; 平/一東 is rare/literary.
  Surfaced during #6 audit cleanup.

### 蓊 (jung1 / jung2 Cantonese; wēng 平 / wěng 仄 Mandarin)
- 平聲 wēng (上平 一東): rare classical attestation.
- 仄聲 wěng (上聲 一董): literary usage — 草木茂盛貌 (蓊鬱蒼翠).
- Pingshui dual-attested with 一董 primary; 平/一東 is rare/literary.
  Surfaced during #6 audit cleanup.

### 菶 (bung1 / bung2 Cantonese; bēng 平 / běng 仄 Mandarin)
- 平聲 bēng (上平 一東): rare classical attestation.
- 仄聲 běng (上聲 一董): literary usage — 草盛貌 (菶菶).
- Pingshui dual-attested with 一董 primary; 平/一東 is rare/literary.
  Surfaced during #6 audit cleanup.

### 翪 (zung1 / zung2 / zung3 Cantonese; zōng 平 / zǒng 仄 / zòng 去 Mandarin)
- 平聲 zōng (上平 一東): rare classical attestation — 鳥飛貌.
- 仄聲 zǒng (上聲 一董): primary pingshui placement.
- 去聲 zòng (一送): additional 仄聲 attestation per 廣韻.
- Pingshui triple-attested with 一董 primary; 平/一東 + 仄/一送 are rare.
  Surfaced during #6 audit cleanup.

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

### Pingshui data gap — 曆 missing
Surfaced during #7 implementation: `曆` (simplified `历`) is missing
from `src/data/pingshui.json`. `歷` and `历` are present, both reading
入聲 十二錫. `曆` likely reads identically. Adds nothing to rhyme
analysis but closes a completeness gap. Defer to a future pingshui
sweep. Not blocking.

## Deferred (no scheduled work)

### Audio Review Library perf
At ~200+ approved clips the Library tab becomes sluggish (renders all clips
at once). Pagination or collapse-by-default solution sketched in earlier
briefings; not yet built. Trigger: when audio review page first feels
sluggish, or before the next large TTS batch lands.

### Manual VPS .env TRAINER_BETA_USER_IDS revert
A manual VPS-side `.env` modification was made during early Tier 1 testing;
should be reverted to whatever the canonical state is now that production
has stable beta gating.

### Script: meta.json phase blocks overwrite on re-run

`scripts/build-unique-char-content.mjs` overwrites the entire
phase block in `data/audit/unique-char-content-meta.json` on
every run, rather than merging stats from prior runs. Surfaced
during #17 Part 2 follow-up (re-running 九佳 + 十二文 for 1 char
each erased B1's actual 68/93-char phase stats). Worked around
manually for that commit.

Fix would be: in persistMeta(), read existing phase block (if
any) and ADD deltas rather than replace. ~10 line change in
the build script. Not urgent — sweeps complete in single shots
typically; only matters when a phase is re-run for partial
recovery.

