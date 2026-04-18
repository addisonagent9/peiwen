# 平水韻 Dictionary Audit Report

Generated: 2026-04-18T20:32:29.352Z

- **Total characters in dictionary:** 19,623
- **Multi-reading characters (多音字):** 3,851

---

## Section 1: Simplified chars with wrong default tone

These characters exist in the dictionary as simplified forms, but their first (default) entry has a **different tone** than the traditional form's default entry. This means `lookup()` may return the wrong tone for the simplified character, since it checks the simplified entry first (line 17 of `tone.ts`) before falling back to traditional.

**HIGH** = different tone category (平 vs 仄); **MEDIUM** = same tone category but different rhyme group.

| Char | App tone | App rhyme | Traditional | Trad tone | Trad rhyme | Confidence |
|------|----------|-----------|-------------|-----------|------------|------------|
| 种 | 平 | 一東 | 種 | 仄 | 二腫 | HIGH |
| 据 | 平 | 六魚 | 據 | 仄 | 六御 | HIGH |
| 干 | 平 | 十四寒 | 幹 | 仄 | 十五翰 | HIGH |
| 肮 | 平 | 七陽 | 骯 | 仄 | 二十二養 | HIGH |
| 睾 | 平 | 四豪 | 睪 | 入 | 十一陌 | HIGH |
| 宁 | 仄 | 六語 | 寧 | 平 | 九青 | HIGH |
| 听 | 仄 | 十二吻 | 聽 | 平 | 九青 | HIGH |
| 几 | 仄 | 四紙 | 幾 | 平 | 五微 | HIGH |
| 冲 | 平 | 一東 | 衝 | 平 | 二冬 | MEDIUM |
| 丰 | 平 | 二冬 | 豐 | 平 | 一東 | MEDIUM |
| 霉 | 平 | 十灰 | 黴 | 平 | 四支 | MEDIUM |
| 虮 | 平 | 四支 | 蟣 | 平 | 五微 | MEDIUM |
| 征 | 平 | 八庚 | 徵 | 平 | 十蒸 | MEDIUM |
| 苹 | 平 | 八庚 | 蘋 | 平 | 十一真 | MEDIUM |
| 蔘 | 平 | 十二侵 | 參 | 平 | 十三覃 | MEDIUM |
| 牦 | 平 | 四豪 | 犛 | 平 | 四支 | MEDIUM |
| 广 | 仄 | 二十八琰 | 廣 | 仄 | 二十二養 | MEDIUM |
| 伙 | 仄 | 二十哿 | 夥 | 仄 | 九蟹 | MEDIUM |
| 厂 | 仄 | 十四旱 | 廠 | 仄 | 二十二養 | MEDIUM |
| 姹 | 仄 | 七遇 | 奼 | 仄 | 二十一馬 | MEDIUM |
| 蝎 | 入 | 七曷 | 蠍 | 入 | 六月 | MEDIUM |
| 覈 | 入 | 九屑 | 核 | 入 | 六月 | MEDIUM |
| 㐹 | 入 | 五物 | 㑶 | 仄 | 四寘 | MEDIUM |

**Summary:** 8 HIGH-confidence mismatches (wrong tone category), 15 MEDIUM (wrong rhyme group).

### Analysis of HIGH-confidence mismatches

These are the most impactful bugs. When a user types a simplified character, `lookup()` finds the simplified entry directly (before the traditional fallback), and that entry has the **wrong tone**:

- **种** (simplified) → tone=平, rhyme=一東. Traditional **種** → tone=仄, rhyme=二腫. The simplified entry maps to a rare/archaic reading of the character form before simplification.
- **据** (simplified) → tone=平, rhyme=六魚. Traditional **據** → tone=仄, rhyme=六御. The simplified entry maps to a rare/archaic reading of the character form before simplification.
- **干** (simplified) → tone=平, rhyme=十四寒. Traditional **幹** → tone=仄, rhyme=十五翰. The simplified entry maps to a rare/archaic reading of the character form before simplification.
- **肮** (simplified) → tone=平, rhyme=七陽. Traditional **骯** → tone=仄, rhyme=二十二養. The simplified entry maps to a rare/archaic reading of the character form before simplification.
- **睾** (simplified) → tone=平, rhyme=四豪. Traditional **睪** → tone=入, rhyme=十一陌. The simplified entry maps to a rare/archaic reading of the character form before simplification.
- **宁** (simplified) → tone=仄, rhyme=六語. Traditional **寧** → tone=平, rhyme=九青. The simplified entry maps to a rare/archaic reading of the character form before simplification.
- **听** (simplified) → tone=仄, rhyme=十二吻. Traditional **聽** → tone=平, rhyme=九青. The simplified entry maps to a rare/archaic reading of the character form before simplification.
- **几** (simplified) → tone=仄, rhyme=四紙. Traditional **幾** → tone=平, rhyme=五微. The simplified entry maps to a rare/archaic reading of the character form before simplification.

---

## Section 2: Missing simplified forms

These common simplified characters have **no entry** in the dictionary, but their traditional counterparts do. The `lookup()` function handles this via fallback (line 18-19 of `tone.ts`: if `entries.length === 0 && trad !== char`, it looks up the traditional form). So these characters **will still resolve correctly** at runtime. However, their absence means the dictionary is incomplete for direct lookups.

Showing top 50 of 100 missing simplified forms (sorted by traditional entry count):

| Simplified | Traditional | Trad tone | Trad rhyme | # trad readings |
|------------|-------------|-----------|------------|-----------------|
| 娄 | 婁 | 平 | 七虞 | 5 |
| 齐 | 齊 | 平 | 九佳 | 5 |
| 纯 | 純 | 平 | 十一真 | 4 |
| 揾 | 搵 | 平 | 十二文 | 4 |
| 瘅 | 癉 | 平 | 十四寒 | 4 |
| 酂 | 酇 | 平 | 十四寒 | 4 |
| 蓥 | 鎣 | 平 | 九青 | 4 |
| 请 | 請 | 平 | 八庚 | 4 |
| 庼 | 廎 | 平 | 八庚 | 4 |
| 参 | 參 | 平 | 十三覃 | 4 |
| 椠 | 槧 | 平 | 十四鹽 | 4 |
| 着 | 著 | 仄 | 六語 | 4 |
| 笼 | 籠 | 平 | 一東 | 3 |
| 沨 | 渢 | 平 | 一東 | 3 |
| 鲖 | 鮦 | 平 | 一東 | 3 |
| 蒌 | 蔞 | 平 | 七虞 | 3 |
| 龉 | 齬 | 平 | 七虞 | 3 |
| 恶 | 惡 | 平 | 七虞 | 3 |
| 呕 | 嘔 | 平 | 七虞 | 3 |
| 溇 | 漊 | 平 | 七虞 | 3 |
| 瘘 | 瘻 | 平 | 七虞 | 3 |
| 钴 | 鈷 | 平 | 七虞 | 3 |
| 鲑 | 鮭 | 平 | 九佳 | 3 |
| 纵 | 縱 | 平 | 二冬 | 3 |
| 苁 | 蓯 | 平 | 二冬 | 3 |
| 诽 | 誹 | 平 | 五微 | 3 |
| 岿 | 巋 | 平 | 五微 | 3 |
| 欤 | 歟 | 平 | 六魚 | 3 |
| 与 | 與 | 平 | 六魚 | 3 |
| 虑 | 慮 | 平 | 六魚 | 3 |
| 论 | 論 | 平 | 十一真 | 3 |
| 訚 | 誾 | 平 | 十一真 | 3 |
| 贲 | 賁 | 平 | 十三元 | 3 |
| 缊 | 緼 | 平 | 十三元 | 3 |
| 蕴 | 蘊 | 平 | 十三元 | 3 |
| 锟 | 錕 | 平 | 十三元 | 3 |
| 员 | 員 | 平 | 十二文 | 3 |
| 难 | 難 | 平 | 十四寒 | 3 |
| 单 | 單 | 平 | 十四寒 | 3 |
| 谩 | 謾 | 平 | 十四寒 | 3 |
| 罢 | 罷 | 平 | 四支 | 3 |
| 诒 | 詒 | 平 | 四支 | 3 |
| 堕 | 墮 | 平 | 四支 | 3 |
| 键 | 鍵 | 平 | 一先 | 3 |
| 阏 | 閼 | 平 | 一先 | 3 |
| 长 | 長 | 平 | 七陽 | 3 |
| 强 | 強 | 平 | 七陽 | 3 |
| 横 | 橫 | 平 | 七陽 | 3 |
| 抢 | 搶 | 平 | 七陽 | 3 |
| 荡 | 蕩 | 平 | 七陽 | 3 |

> **Note:** These are not bugs per se -- `lookup()` correctly falls back to the traditional form via `toTraditional()`. They are listed for completeness. Adding simplified entries would make lookups marginally faster (skip the fallback) but has no correctness impact.

---

## Section 3: Multi-reading chars with potentially wrong priority

Characters with 2+ readings where the first (default) reading may not be the most common one. The first entry in `PINGSHUI_CHAR[char]` is used as the default by `lookup()` (line 24 of `tone.ts`), and `lookupExpecting()` only overrides when there is a positional expectation.

### Explicitly requested characters

#### 种 (traditional: 種)

- **Entries in dictionary:** 1
- **Default reading:** tone=平, rhyme=一東
- **All entries:** [{"tone":"平","group":"上平","rhyme":"一東"}]
- **Traditional entries:** [{"tone":"仄","group":"上聲","rhyme":"二腫"},{"tone":"仄","group":"去聲","rhyme":"二宋"}]
- **Flag:** explicitly requested

#### 径 (traditional: 徑)

- **Simplified 径 is NOT in the dictionary.**
- `lookup()` falls back to traditional 徑 which has 2 entries:
  - 平 (下平 九青) -- the less common reading (jīng)
  - 仄 (去聲 二十五徑) -- the common reading (jìng, "path")
- **The default reading is 平 (jīng), but the common reading is 仄 (jìng).** This is a multi-reading priority issue on the traditional form.
- **Impact:** When a user types 径 without positional context, it defaults to 平 tone, which is likely wrong for most poetry uses.

#### 研

- **研 is NOT in the dictionary at all** (and `toTraditional('研') === '研'`, so no fallback).
- `lookup('研')` returns `unknown: true`.
- This is a common character (yán, 平聲) that should probably be added to the dictionary.

### MEDIUM confidence (default is 平 but majority of readings are 仄/入)

Showing top 30 of 340 characters:

| Char | # readings | Default tone | Default rhyme | Flag reason |
|------|-----------|-------------|--------------|-------------|
| 帴 | 7 | 平 | 十四寒 | Default is 平 but 5/7 readings are 仄/入 |
| 哆 | 7 | 平 | 六麻 | Default is 平 but 6/7 readings are 仄/入 |
| 唏 | 6 | 平 | 五微 | Default is 平 but 5/6 readings are 仄/入 |
| 梡 | 6 | 平 | 十三元 | Default is 平 but 4/6 readings are 仄/入 |
| 闇 | 6 | 平 | 十三覃 | Default is 平 but 4/6 readings are 仄/入 |
| 啙 | 5 | 平 | 八齊 | Default is 平 but 3/5 readings are 仄/入 |
| 捒 | 5 | 平 | 六魚 | Default is 平 but 3/5 readings are 仄/入 |
| 喛 | 5 | 平 | 十三元 | Default is 平 but 3/5 readings are 仄/入 |
| 楥 | 5 | 平 | 十三元 | Default is 平 but 3/5 readings are 仄/入 |
| 痑 | 5 | 平 | 十四寒 | Default is 平 but 3/5 readings are 仄/入 |
| 睕 | 5 | 平 | 十四寒 | Default is 平 but 4/5 readings are 仄/入 |
| 繟 | 5 | 平 | 十四寒 | Default is 平 but 3/5 readings are 仄/入 |
| 臸 | 5 | 平 | 四支 | Default is 平 but 4/5 readings are 仄/入 |
| 誃 | 5 | 平 | 四支 | Default is 平 but 4/5 readings are 仄/入 |
| 骲 | 5 | 平 | 三肴 | Default is 平 but 4/5 readings are 仄/入 |
| 鋞 | 5 | 平 | 九青 | Default is 平 but 3/5 readings are 仄/入 |
| 朾 | 5 | 平 | 九青 | Default is 平 but 3/5 readings are 仄/入 |
| 敫 | 5 | 平 | 二蕭 | Default is 平 but 4/5 readings are 仄/入 |
| 揞 | 5 | 平 | 十五咸 | Default is 平 but 4/5 readings are 仄/入 |
| 肷 | 5 | 平 | 十五咸 | Default is 平 but 3/5 readings are 仄/入 |
| 溓 | 5 | 平 | 十五咸 | Default is 平 but 3/5 readings are 仄/入 |
| 懵 | 4 | 平 | 一東 | Default is 平 but 3/4 readings are 仄/入 |
| 懜 | 4 | 平 | 一東 | Default is 平 but 3/4 readings are 仄/入 |
| 趣 | 4 | 平 | 七虞 | Default is 平 but 3/4 readings are 仄/入 |
| 捗 | 4 | 平 | 七虞 | Default is 平 but 3/4 readings are 仄/入 |
| 掜 | 4 | 平 | 九佳 | Default is 平 but 3/4 readings are 仄/入 |
| 棑 | 4 | 平 | 九佳 | Default is 平 but 3/4 readings are 仄/入 |
| 刏 | 4 | 平 | 五微 | Default is 平 but 3/4 readings are 仄/入 |
| 霓 | 4 | 平 | 八齊 | Default is 平 but 3/4 readings are 仄/入 |
| 猰 | 4 | 平 | 八齊 | Default is 平 but 3/4 readings are 仄/入 |

---

## Recommendations

1. **Fix Section 1 HIGH entries immediately.** These 8 characters return the **wrong tone** when entered as simplified Chinese. The simplified form in the dictionary maps to an archaic/rare reading that predates simplification. Fix by either:
   - Removing the simplified entry so `lookup()` falls through to the traditional form, or
   - Updating the simplified entry to match the traditional form's most common reading.

2. **Review Section 1 MEDIUM entries.** Same tone category but different rhyme group. May or may not be bugs depending on whether the simplified form intentionally represents a different character.

3. **Section 2 is informational only.** The fallback logic in `lookup()` correctly handles these cases. No action needed unless you want faster lookups.

4. **Review Section 3 for common characters.** Most multi-reading characters are handled well by `lookupExpecting()`, but the default (position-independent) tone may be surprising for some characters.
