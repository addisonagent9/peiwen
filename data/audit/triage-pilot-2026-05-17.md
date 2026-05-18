# Triage pilot — 10-char sample from #17 LOW audit batch

Generated 2026-05-17T11:59:48.564Z.

## Summary
- Total processed: 10
- Distribution: (a) 2 / (b) 2 / (c) 2 / (d) 1 / (e) 2 / (f) 1
- Ship: 7
- Skip: 3
- Estimated cost: $0.2173  (haiku=$0.0973, web_search=$0.1200)
- Tokens: in=112510 out=1826; web_searches=12
- Wall time: 25.2s

## Entry 1 — 㯈 / 一屋 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㯈 / 一屋

**Reason**: LLM uncertain or empty

**zdic raw**:

> 同樕。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同樕。樕為木名，即山楂。","modern":"山楂（一種果樹）","uncertain":true,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[樕] → moedict-map[樕]
- Pipeline path:
  - A1: extracted X=樕 (U+6a15)
  - A2a: MISS in unique-char-content.json
  - A2b: HIT in moedict-map (1 defs; using first 2)

### Proposed entry

```json
{
  "char": "㯈",
  "rhyme": "一屋",
  "wenyan": "樕之異體。參見「樸樕」條。",
  "modern": "同樕",
  "source": "audit-deref",
  "source_url": "internal:char-樕-moedict",
  "citation": "《重編國語辭典》",
  "extracted_at": "2026-05-17T11:59:23.315Z"
}
```

### Verdict

- [ ] Ship
- [ ] Skip (no content found after search)
- [ ] Override / discussion needed: ___________

---

## Entry 2 — 㤛 / 二十六寢 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㤛 / 二十六寢

**Reason**: LLM uncertain or empty

**zdic raw**:

> 同恁。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同「恁」。古代方言詞，表示那樣、如此之意","modern":"那样；如此（古代方言用语）","uncertain":true,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[恁] → moedict-map[恁]
- Pipeline path:
  - A1: extracted X=恁 (U+6041)
  - A2a: MISS in unique-char-content.json
  - A2b: HIT in moedict-map (12 defs; using first 2)

### Proposed entry

```json
{
  "char": "㤛",
  "rhyme": "二十六寢",
  "wenyan": "恁之異體。第二人稱。；第二人稱。",
  "modern": "同恁",
  "source": "audit-deref",
  "source_url": "internal:char-恁-moedict",
  "citation": "《重編國語辭典》",
  "extracted_at": "2026-05-17T11:59:23.316Z"
}
```

### Verdict

- [ ] Ship
- [ ] Skip (no content found after search)
- [ ] Override / discussion needed: ___________

---

## Entry 3 — 㑐 / 一屋 — sub-case (b)

### Original audit-batch entry (verbatim)

```
## 㑐 / 一屋

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【篇海類篇】式竹切，音叔。人名。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"人名用字。","modern":"","uncertain":true}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (b)
- Sources tried: audit-zdic-raw
- Pipeline path:
  - B1: name-use label=人名
  - B2: citation=《篇海類篇》

### Proposed entry

```json
{
  "char": "㑐",
  "rhyme": "一屋",
  "wenyan": "人名",
  "modern": "人名",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%91%90",
  "citation": "《篇海類篇》",
  "extracted_at": "2026-05-17T11:59:23.316Z"
}
```

### Verdict

- [ ] Ship
- [ ] Skip (no content found after search)
- [ ] Override / discussion needed: ___________

---

## Entry 4 — 媹 / 十一尤 — sub-case (b)

### Original audit-batch entry (verbatim)

```
## 媹 / 十一尤

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】力求切，音留。女字。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"女子名字用字。","modern":"","uncertain":true,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (b)
- Sources tried: audit-zdic-raw
- Pipeline path:
  - B1: name-use label=女字
  - B2: citation=《集韻》

### Proposed entry

```json
{
  "char": "媹",
  "rhyme": "十一尤",
  "wenyan": "女字",
  "modern": "女字",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E5%AA%B9",
  "citation": "《集韻》",
  "extracted_at": "2026-05-17T11:59:23.316Z"
}
```

### Verdict

- [ ] Ship
- [ ] Skip (no content found after search)
- [ ] Override / discussion needed: ___________

---

## Entry 5 — 㰀 / 八齊 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㰀 / 八齊

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】憐題切，音棃。木名。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"木名，一種樹木。《集韻》記載為憐題切，音棃。","modern":"","uncertain":true,"citation":"《集韻》"}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (c)
- Sources tried: audit-zdic-raw
- Pipeline path:
  - C1: designation=木名
  - C1: 反切=憐題切, 音=棃

### Proposed entry

```json
{
  "char": "㰀",
  "rhyme": "八齊",
  "wenyan": "《集韻》憐題切，音棃。木名。",
  "modern": "一種樹木",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%B0%80",
  "citation": "《集韻》",
  "extracted_at": "2026-05-17T11:59:23.316Z"
}
```

### Verdict

- [ ] Ship
- [ ] Skip (no content found after search)
- [ ] Override / discussion needed: ___________

---

## Entry 6 — 鏣 / 六御 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 鏣 / 六御

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】商署切，音恕。器名。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"器具名稱，具體形狀用途不詳。見於《集韻》","modern":"","uncertain":true,"citation":"《集韻》"}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (c)
- Sources tried: audit-zdic-raw
- Pipeline path:
  - C1: designation=器名
  - C1: 反切=商署切, 音=恕

### Proposed entry

```json
{
  "char": "鏣",
  "rhyme": "六御",
  "wenyan": "《集韻》商署切，音恕。器名。",
  "modern": "一種器具",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E9%8F%A3",
  "citation": "《集韻》",
  "extracted_at": "2026-05-17T11:59:23.317Z"
}
```

### Verdict

- [ ] Ship
- [ ] Skip (no content found after search)
- [ ] Override / discussion needed: ___________

---

## Entry 7 — 嵭 / 十蒸 — sub-case (d)

### Original audit-batch entry (verbatim)

```
## 嵭 / 十蒸

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【玉篇】布耕切，音崩。義闕。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"義闕，音崩。《玉篇》記載此字音義待考。","modern":"","uncertain":true,"citation":"《玉篇》"}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (d)
- Sources tried: Haiku+web_search(漢語大詞典+教育部異體字字典+廣韻+集韻+康熙字典)
- Pipeline path:
  - D1: confirmed 義闕 in zdic
  - D2: MISS (3 searches across formal sources)

### SKIPPED

Reason: No formal source found content

### Verdict

- [ ] Ship
- [ ] Skip (auto-skipped — confirm)
- [ ] Override / discussion needed: ___________

---

## Entry 8 — 橶 / 十一陌 — sub-case (e)

### Original audit-batch entry (verbatim)

```
## 橶 / 十一陌

**Reason**: LLM uncertain or empty

**zdic raw**:

> (no content)

**Wiktionary raw**:

> (no content)

**LLM output**:

> {"wenyan":"","modern":"","uncertain":true}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (e)
- Sources tried: Haiku+web_search(formal + non-official fallback)
- Pipeline path:
  - E1: confirmed both zdic and Wiktionary empty
  - E2: invoking Haiku+web_search with two-tier fallback
  - E2: MISS in both tiers (3 searches)

### SKIPPED

Reason: No source found in formal or non-official

### Verdict

- [ ] Ship
- [ ] Skip (auto-skipped — confirm)
- [ ] Override / discussion needed: ___________

---

## Entry 9 — 嚑 / 十二文 — sub-case (e)

### Original audit-batch entry (verbatim)

```
## 嚑 / 十二文

**Reason**: LLM uncertain or empty

**zdic raw**:

> (no content)

**Wiktionary raw**:

> (no content)

**LLM output**:

> {"wenyan":"","modern":"","uncertain":true}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (e)
- Sources tried: Haiku+web_search(formal + non-official fallback)
- Pipeline path:
  - E1: confirmed both zdic and Wiktionary empty
  - E2: invoking Haiku+web_search with two-tier fallback
  - E2: MISS in both tiers (3 searches)

### SKIPPED

Reason: No source found in formal or non-official

### Verdict

- [ ] Ship
- [ ] Skip (auto-skipped — confirm)
- [ ] Override / discussion needed: ___________

---

## Entry 10 — 哞 / 十一尤 — sub-case (f)

### Original audit-batch entry (verbatim)

```
## 哞 / 十一尤

**Reason**: LLM no citation

**zdic raw**:

> (no content)

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"牛鸣声。象声词，模仿牛叫的声音","modern":"牛叫声，象声词","uncertain":false,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (e) → (f) overlay
- Sources tried: Haiku+web_search(formal + non-official fallback)
- Pipeline path:
  - E1: confirmed both zdic and Wiktionary empty
  - E2: invoking Haiku+web_search with two-tier fallback
  - E2: HIT tier=formal (3 searches)
  - F: onomatopoeia overlay applied (acoustic-character framing)

### Proposed entry

```json
{
  "char": "哞",
  "rhyme": "十一尤",
  "wenyan": "擬聲詞。狀低沉拖長粗厲之聲。",
  "modern": "象聲詞，模擬低沉粗厲悠長之鳴聲。",
  "source": "audit-external",
  "source_url": "https://www.zdic.net/hant/%E5%93%9E",
  "citation": "《漢語大字典》第一卷第624頁",
  "extracted_at": "2026-05-17T11:59:48.562Z"
}
```

### Verdict

- [ ] Ship
- [ ] Skip (no content found after search)
- [ ] Override / discussion needed: ___________

---

## Pipeline edge cases observed

No deviations from sample expectations.
