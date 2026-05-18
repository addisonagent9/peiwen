# Triage batch — all 104 LOW entries from #17 LOW audit batch

Generated 2026-05-17T12:33:20.834Z.

Supersedes pilot sidecar at `data/audit/triage-pilot-2026-05-17.md` (kept on disk as audit history).

## Summary
- Total processed: 104
- Distribution: (a) 31 / (b) 11 / (c) 49 / (d) 1 / (e) 11 / (f) 1
- Ship: 94
- Skip: 10
- Estimated cost: $1.5839  (haiku=$0.7739, web_search=$0.8100)
- Tokens: in=902350 out=12993; web_searches=81
- Wall time: 209.9s
- Fix B firings: 7 triggered, 7 succeeded
- P2 (d-web-fallback) firings: 1 triggered, 1 succeeded
- Existing-entry citation migration: 803 entries had 《》 stripped

## Entry 1 — 奾 / 一先 — sub-case (b)

### Original audit-batch entry (verbatim)

```
## 奾 / 一先

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】相然切，音先。女字。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"女字，一作「先」。《集韻》記載為女性之意。","modern":"","uncertain":true,"citation":"《集韻》"}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [x] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (b)
- Sources tried: audit-zdic-raw
- Pipeline path:
  - B1: name-use label=女字
  - B2: citation=集韻

### Proposed entry

```json
{
  "char": "奾",
  "rhyme": "一先",
  "wenyan": "女字",
  "modern": "女字",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E5%A5%BE",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:29:50.919Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 2 — 䳿 / 一先 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䳿 / 一先

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【玉篇】【集韻】𠀤如延切，音然。鳥名。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"鳥名。《玉篇》《集韻》作「䳿」，音如「然」。","modern":"","uncertain":true,"citation":"《玉篇》《集韻》"}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [x] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (c)
- Sources tried: audit-zdic-raw
- Pipeline path:
  - C1: citation=玉篇、集韻
  - C2: designation=鳥名, modern="一種鳥類"

### Proposed entry

```json
{
  "char": "䳿",
  "rhyme": "一先",
  "wenyan": "【玉篇】【集韻】𠀤如延切，音然。鳥名。",
  "modern": "一種鳥類",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%B3%BF",
  "citation": "玉篇、集韻",
  "extracted_at": "2026-05-17T12:29:50.921Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 3 — 㮍 / 一先 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㮍 / 一先

**Reason**: LLM uncertain or empty

**zdic raw**:

> 同椾。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同椾。木名，一種喬木。","modern":"","uncertain":true}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [x] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[椾] → moedict-map[椾] → Haiku+web_search(漢語大詞典+教育部異體字字典) → Haiku+web_search(formal + non-official fallback)
- Pipeline path:
  - A1: extracted X=椾 (U+693e) frame=variant → preamble="椾之異體"
  - A2a: MISS in unique-char-content.json
  - A2b: MISS in moedict-map
  - A2c: invoking Haiku+web_search for X (trigger=moe-miss)
  - A2c: MISS (3 searches)
  - A4: falling through to (e) pipeline for original char
  - E1: confirmed both zdic and Wiktionary empty
  - E2: invoking Haiku+web_search with two-tier fallback
  - E2: MISS in both tiers (3 searches)

### SKIPPED

Reason: No source found in formal or non-official

### Verdict (auto-applied by script)

- [ ] Ship
- [x] Skip (auto-skipped — no source found)
- [ ] Override / discussion needed: ___________

---

## Entry 4 — 㮵 / 一先 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㮵 / 一先

**Reason**: LLM no citation

**zdic raw**:

> 同栴。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同栴。栴為香木，即檀香。","modern":"檀香木","uncertain":false,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [x] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[栴] → moedict-map[栴] → Haiku+web_search(漢語大詞典+教育部異體字字典)
- Pipeline path:
  - A1: extracted X=栴 (U+6834) frame=variant → preamble="栴之異體"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT but cross-ref ("參見「檀香」、「栴檀」等條。…") → falling through to web
  - A2c: invoking Haiku+web_search for X (trigger=crossref)
  - A2c: HIT via web_search (3 searches)

### Proposed entry

```json
{
  "char": "㮵",
  "rhyme": "一先",
  "wenyan": "栴之異體。栴，栴檀香木。紫色香檀之樹也。",
  "modern": "栴檀木，一種香木，產於扶南，色紫。",
  "source": "audit-web",
  "source_url": "https://hy.httpcn.com/Html/zi/27/pwtbtbmetbtbxvkoil/",
  "citation": "网：集韻、類篇、正韻",
  "extracted_at": "2026-05-17T12:30:18.366Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 5 — 㑐 / 一屋 — sub-case (b)

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

- [x] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (b)
- Sources tried: audit-zdic-raw
- Pipeline path:
  - B1: name-use label=人名
  - B2: citation=篇海類篇

### Proposed entry

```json
{
  "char": "㑐",
  "rhyme": "一屋",
  "wenyan": "人名",
  "modern": "人名",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%91%90",
  "citation": "篇海類篇",
  "extracted_at": "2026-05-17T12:30:18.367Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 6 — 㯈 / 一屋 — sub-case (a)

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
- [x] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[樕] → moedict-map[樕] → Haiku+web_search(漢語大詞典+教育部異體字字典) → Haiku+web_search(formal + non-official fallback)
- Pipeline path:
  - A1: extracted X=樕 (U+6a15) frame=variant → preamble="樕之異體"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT but cross-ref ("參見「樸樕」條。…") → falling through to web
  - A2c: invoking Haiku+web_search for X (trigger=crossref)
  - A2c: MISS (3 searches)
  - A4: falling through to (e) pipeline for original char
  - E1: confirmed both zdic and Wiktionary empty
  - E2: invoking Haiku+web_search with two-tier fallback
  - E2: MISS in both tiers (3 searches)

### SKIPPED

Reason: No source found in formal or non-official

### Verdict (auto-applied by script)

- [ ] Ship
- [x] Skip (auto-skipped — no source found)
- [ ] Override / discussion needed: ___________

---

## Entry 7 — 㮋 / 一屋 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㮋 / 一屋

**Reason**: LLM no citation

**zdic raw**:

> 同栯。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同栯。木製的槳或櫓，用於划船。","modern":"船槳","uncertain":false,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [x] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[栯]
- Pipeline path:
  - A1: extracted X=栯 (U+682f) frame=variant → preamble="栯之異體"
  - A2a: HIT in unique-char-content.json (3 rhyme entries; using first)

### Proposed entry

```json
{
  "char": "㮋",
  "rhyme": "一屋",
  "wenyan": "栯之異體。【廣韻】栯李也。【唐本草】栯李一名雀李，一名車下李，一名棣子。小如櫻桃，五月熟。【詩詁】卽赤棣。",
  "modern": "古书上说的一种树：“（泰室之山）其上有木焉，叶状如梨而赤理，其名曰～木，服者不妒。”；〔～李〕现在写作“郁李”。落叶小灌木，春季开花，淡红色，可供观赏。果实小而圆，暗红色，可以吃。种子叫郁李仁，可以入药。",
  "source": "audit-deref",
  "source_url": "internal:char-栯-uccontent",
  "extracted_at": "2026-05-17T12:30:29.004Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 8 — 茣 / 七虞 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 茣 / 七虞

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【玉篇】五姑切，音吳。草名。　【直音】同䓊。。【申集上】【艸】 茣·康熙筆画：13　·部外筆画：7。【直音】俗茣字。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"草名。《玉篇》記載為一種植物，音吳。","modern":"一种草本植物","uncertain":true,"citation":"《玉篇》"}

**Addison's verdict** (fill in):

- [x] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (c)
- Sources tried: audit-zdic-raw
- Pipeline path:
  - C1: citation=玉篇、直音、申集上、艸、直音
  - C2: designation=草名, modern="一種草本植物"

### Proposed entry

```json
{
  "char": "茣",
  "rhyme": "七虞",
  "wenyan": "【玉篇】五姑切，音吳。草名。　【直音】同䓊。。【申集上】【艸】 茣·康熙筆画：13　·部外筆画：7。【直音】俗茣字。",
  "modern": "一種草本植物",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E8%8C%A3",
  "citation": "玉篇、直音、申集上、艸、直音",
  "extracted_at": "2026-05-17T12:30:29.004Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 9 — 㲎 / 七虞 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㲎 / 七虞

**Reason**: LLM uncertain or empty

**zdic raw**:

> 與氀同。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"與氀同，皆指毛織品或絨毛。","modern":"毛織品；絨毛","uncertain":true,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [x] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[氀] → moedict-map[氀]
- Pipeline path:
  - A1: extracted X=氀 (U+6c00) frame=variant → preamble="氀之異體"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT (1 unique def)

### Proposed entry

```json
{
  "char": "㲎",
  "rhyme": "七虞",
  "wenyan": "氀之異體。毛織的氈類。",
  "modern": "同氀",
  "source": "audit-deref",
  "source_url": "internal:char-氀-moedict",
  "citation": "重編國語辭典",
  "extracted_at": "2026-05-17T12:30:29.005Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 10 — 䴣 / 七虞 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䴣 / 七虞

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【字彙】荒胡切，音呼。獸名。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"獸名，荒胡切音呼。一種野獸。","modern":"","uncertain":true,"citation":"《字彙》"}

**Addison's verdict** (fill in):

- [x] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (c)
- Sources tried: audit-zdic-raw
- Pipeline path:
  - C1: citation=字彙
  - C2: designation=獸名, modern="一種獸類"

### Proposed entry

```json
{
  "char": "䴣",
  "rhyme": "七虞",
  "wenyan": "【字彙】荒胡切，音呼。獸名。",
  "modern": "一種獸類",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%B4%A3",
  "citation": "字彙",
  "extracted_at": "2026-05-17T12:30:29.005Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 11 — 㑽 / 七陽 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㑽 / 七陽

**Reason**: LLM uncertain or empty

**zdic raw**:

> 同傏。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同傏。傏為古字，義未詳。","modern":"","uncertain":true}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[傏]
- Pipeline path:
  - A1: extracted X=傏 (U+508f) frame=variant → preamble="傏之異體"
  - A2a: HIT in unique-char-content.json (1 rhyme entries; using first)

### Proposed entry

```json
{
  "char": "㑽",
  "rhyme": "七陽",
  "wenyan": "傏之異體。傏𠊲，不遜也。",
  "modern": "《廣韻》徒郎切，平唐，定。唐突，冒失。",
  "source": "audit-deref",
  "source_url": "internal:char-傏-uccontent",
  "extracted_at": "2026-05-17T12:30:29.005Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 12 — 丬 / 七陽 — sub-case (e)

### Original audit-batch entry (verbatim)

```
## 丬 / 七陽

**Reason**: LLM uncertain or empty

**zdic raw**:

> (no content)

**Wiktionary raw**:

> [编辑]

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

### Verdict (auto-applied by script)

- [ ] Ship
- [x] Skip (auto-skipped — no source found)
- [ ] Override / discussion needed: ___________

---

## Entry 13 — 倵 / 七麌 — sub-case (b)

### Original audit-batch entry (verbatim)

```
## 倵 / 七麌

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【字彙補】微補切，音武。三國人名。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"三國時期人名用字，音同「武」。","modern":"","uncertain":true}

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
  - B2: citation=字彙補

### Proposed entry

```json
{
  "char": "倵",
  "rhyme": "七麌",
  "wenyan": "人名",
  "modern": "人名",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E5%80%B5",
  "citation": "字彙補",
  "extracted_at": "2026-05-17T12:30:35.423Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 14 — 㕩 / 三絳 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㕩 / 三絳

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】匹絳切，音脹。反聲。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"反聲，即聲調相反。","modern":"","uncertain":true,"citation":"《集韻》"}

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
  - C1: citation=集韻
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "㕩",
  "rhyme": "三絳",
  "wenyan": "【集韻】匹絳切，音脹。反聲。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%95%A9",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:30:35.424Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 15 — 㠂 / 三肴 — sub-case (e)

### Original audit-batch entry (verbatim)

```
## 㠂 / 三肴

**Reason**: LLM uncertain or empty

**zdic raw**:

> (no content)

**Wiktionary raw**:

> [编辑]

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
  - E2: HIT tier=web (3 searches)

### Proposed entry

```json
{
  "char": "㠂",
  "rhyme": "三肴",
  "wenyan": "平水韻三肴字，見韻圖，具體釋義未獲。",
  "modern": "平水韻三肴平聲字。具體含義待考。",
  "source": "audit-web",
  "source_url": "https://sou-yun.cn/QR.aspx?ct=%E8%82%B4&lang=t",
  "citation": "网：搜韻平水韻資料庫",
  "extracted_at": "2026-05-17T12:30:43.414Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 16 — 殻 / 三覺 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 殻 / 三覺

**Reason**: LLM no citation

**zdic raw**:

> 與㱿同。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"殼的異體字。外殼、貝殼等。","modern":"外壳；贝壳等硬质外层","uncertain":false,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[㱿]
- Pipeline path:
  - A1: extracted X=㱿 (U+3c7f) frame=variant → preamble="㱿之異體"
  - A2a: HIT in unique-char-content.json (1 rhyme entries; using first)

### Proposed entry

```json
{
  "char": "殻",
  "rhyme": "三覺",
  "wenyan": "㱿之異體。【說文】从上擊下也。一曰素也。",
  "modern": "从上击下。《説文•殳部》：“㱿，从上擊下也。” 坚硬的外皮。后作“殻”。《説文•殳部》：“㱿，素也。”《玉篇•殳部》：“㱿，物皮空。”《廣韻•覺韻》：“㱿，皮甲。” 皮制盛兵器的盒子或袋子。《字彙•殳部》：“㱿，盛兵器之具，以皮為之。” 通…",
  "source": "audit-deref",
  "source_url": "internal:char-㱿-uccontent",
  "extracted_at": "2026-05-17T12:30:43.414Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 17 — 㙸 / 三覺 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㙸 / 三覺

**Reason**: LLM uncertain or empty

**zdic raw**:

> 俗墣字。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"墣字的俗體寫法。墣為土堆、土丘之義。","modern":"土堆；土丘","uncertain":true,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[墣] → moedict-map[墣]
- Pipeline path:
  - A1: extracted X=墣 (U+58a3) frame=vulgar → preamble="墣之俗字"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT (1 unique def)

### Proposed entry

```json
{
  "char": "㙸",
  "rhyme": "三覺",
  "wenyan": "墣之俗字。土塊。",
  "modern": "同墣",
  "source": "audit-deref",
  "source_url": "internal:char-墣-moedict",
  "citation": "重編國語辭典",
  "extracted_at": "2026-05-17T12:30:43.415Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 18 — 㗍 / 九佳 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㗍 / 九佳

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【字彙補】之皆切，音榸。

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

- Sub-case classified: (c)
- Sources tried: audit-zdic-raw
- Pipeline path:
  - C1: citation=字彙補
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "㗍",
  "rhyme": "九佳",
  "wenyan": "【字彙補】之皆切，音榸。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%97%8D",
  "citation": "字彙補",
  "extracted_at": "2026-05-17T12:30:43.415Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 19 — 䟙 / 九屑 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䟙 / 九屑

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【廣韻】千結切，音切。䟙趺。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"足部的样子，或指足部的某种状态。見於《廣韻》記載的'䟙趺'一詞","modern":"","uncertain":true,"citation":"《廣韻》"}

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
  - C1: citation=廣韻
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "䟙",
  "rhyme": "九屑",
  "wenyan": "【廣韻】千結切，音切。䟙趺。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%9F%99",
  "citation": "廣韻",
  "extracted_at": "2026-05-17T12:30:43.415Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 20 — 㞭 / 九泰 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㞭 / 九泰

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【字彙補】度柰切，音代。島名。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"島嶼名稱。","modern":"","uncertain":true,"citation":""}

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
  - C1: citation=字彙補
  - C2: designation=島名, modern="古地名（島）"

### Proposed entry

```json
{
  "char": "㞭",
  "rhyme": "九泰",
  "wenyan": "【字彙補】度柰切，音代。島名。",
  "modern": "古地名（島）",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%9E%AD",
  "citation": "字彙補",
  "extracted_at": "2026-05-17T12:30:43.415Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 21 — 㙰 / 九蟹 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㙰 / 九蟹

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】下買切，音解。地名。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"地名。","modern":"","uncertain":true,"citation":""}

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
  - C1: citation=集韻
  - C2: designation=地名, modern="古地名"

### Proposed entry

```json
{
  "char": "㙰",
  "rhyme": "九蟹",
  "wenyan": "【集韻】下買切，音解。地名。",
  "modern": "古地名",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%99%B0",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:30:43.416Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 22 — 㯪 / 九青 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㯪 / 九青

**Reason**: LLM no citation

**zdic raw**:

> 同櫺。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同櫺，窗户的棂条（竖木条）。","modern":"窗户的木制框架或棂条","uncertain":false,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[櫺] → moedict-map[櫺]
- Pipeline path:
  - A1: extracted X=櫺 (U+6afa) frame=variant → preamble="櫺之異體"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT (2 unique defs)

### Proposed entry

```json
{
  "char": "㯪",
  "rhyme": "九青",
  "wenyan": "櫺之異體。門或窗檻、欄杆上雕花的格子。；屋檐。",
  "modern": "同櫺",
  "source": "audit-deref",
  "source_url": "internal:char-櫺-moedict",
  "citation": "重編國語辭典",
  "extracted_at": "2026-05-17T12:30:43.416Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 23 — 䙥 / 九青 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䙥 / 九青

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】郞丁切，音靈。同𧟙。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同𧟙，義不詳","modern":"","uncertain":true}

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
  - C1: citation=集韻
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "䙥",
  "rhyme": "九青",
  "wenyan": "【集韻】郞丁切，音靈。同𧟙。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%99%A5",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:30:43.416Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 24 — 㜡 / 二冬 — sub-case (b)

### Original audit-batch entry (verbatim)

```
## 㜡 / 二冬

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【五音篇海】七容切。女字。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"女性的名字用字。","modern":"","uncertain":true,"citation":""}

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
  - B2: citation=五音篇海

### Proposed entry

```json
{
  "char": "㜡",
  "rhyme": "二冬",
  "wenyan": "女字",
  "modern": "女字",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%9C%A1",
  "citation": "五音篇海",
  "extracted_at": "2026-05-17T12:30:43.416Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 25 — 尮 / 二十一箇 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 尮 / 二十一箇

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】都唾切，音刴。尮𡯁也。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"尮𡯁，指物體突出或凸起的樣子。見《集韻》","modern":"","uncertain":true,"citation":"《集韻》"}

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
  - C1: citation=集韻
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "尮",
  "rhyme": "二十一箇",
  "wenyan": "【集韻】都唾切，音刴。尮𡯁也。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E5%B0%AE",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:30:43.417Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 26 — 爦 / 二十七感 — sub-case (e)

### Original audit-batch entry (verbatim)

```
## 爦 / 二十七感

**Reason**: LLM uncertain or empty

**zdic raw**:

> (no content)

**Wiktionary raw**:

> [编辑]

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

### Verdict (auto-applied by script)

- [ ] Ship
- [x] Skip (auto-skipped — no source found)
- [ ] Override / discussion needed: ___________

---

## Entry 27 — 㲜 / 二十七感 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㲜 / 二十七感

**Reason**: LLM no citation

**zdic raw**:

> 同毯。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"毯的異體字。毛製的織物，用以鋪地或蓋身。","modern":"毛毯；地毯","uncertain":false,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[毯] → moedict-map[毯]
- Pipeline path:
  - A1: extracted X=毯 (U+6bef) frame=variant → preamble="毯之異體"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT (1 unique def)

### Proposed entry

```json
{
  "char": "㲜",
  "rhyme": "二十七感",
  "wenyan": "毯之異體。一種可以鋪陳開來的棉毛織物。用來保暖或裝飾。",
  "modern": "同毯",
  "source": "audit-deref",
  "source_url": "internal:char-毯-moedict",
  "citation": "重編國語辭典",
  "extracted_at": "2026-05-17T12:30:49.248Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 28 — 䭗 / 二十三梗 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䭗 / 二十三梗

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】於境切，音影。與䭘同。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"與䭘同義，具體義未詳","modern":"","uncertain":true}

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
  - C1: citation=集韻
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "䭗",
  "rhyme": "二十三梗",
  "wenyan": "【集韻】於境切，音影。與䭘同。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%AD%97",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:30:49.248Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 29 — 䬺 / 二十三漾 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䬺 / 二十三漾

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【字彙】余亮切，音樣。䬺餌。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"食物名稱，䬺餌指某種飲食。見《字彙》。","modern":"","uncertain":true,"citation":"《字彙》"}

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
  - C1: citation=字彙
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "䬺",
  "rhyme": "二十三漾",
  "wenyan": "【字彙】余亮切，音樣。䬺餌。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%AC%BA",
  "citation": "字彙",
  "extracted_at": "2026-05-17T12:30:49.248Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 30 — 䀅 / 二十二禡 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䀅 / 二十二禡

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【玉篇】神夜切，音射。器也。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> n/a

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
  - C1: citation=玉篇
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "䀅",
  "rhyme": "二十二禡",
  "wenyan": "【玉篇】神夜切，音射。器也。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%80%85",
  "citation": "玉篇",
  "extracted_at": "2026-05-17T12:30:49.248Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 31 — 䒎 / 二十二養 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䒎 / 二十二養

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】母朗切，音莽。註詳䒍。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"字形異體，詳見䒍字。義同\"莽\"，廣大貌","modern":"","uncertain":true,"citation":"《集韻》"}

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
  - C1: citation=集韻
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "䒎",
  "rhyme": "二十二養",
  "wenyan": "【集韻】母朗切，音莽。註詳䒍。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%92%8E",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:30:49.249Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 32 — 苃 / 二十五有 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 苃 / 二十五有

**Reason**: LLM uncertain or empty

**zdic raw**:

> 〔古文〕𢇬【字彙補】以久切，音友。草名。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"草名，一種植物。","modern":"","uncertain":true,"citation":""}

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
  - C1: citation=字彙補
  - C2: designation=草名, modern="一種草本植物"

### Proposed entry

```json
{
  "char": "苃",
  "rhyme": "二十五有",
  "wenyan": "〔古文〕𢇬【字彙補】以久切，音友。草名。",
  "modern": "一種草本植物",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E8%8B%83",
  "citation": "字彙補",
  "extracted_at": "2026-05-17T12:30:49.249Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 33 — 凁 / 二十六宥 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 凁 / 二十六宥

**Reason**: LLM no citation

**zdic raw**:

> 【字彙補】心奏切，音漱。冷凍。

**Wiktionary raw**:

> (no content)

**LLM output**:

> {"wenyan":"冷凍，寒冷貌。","modern":"寒冷；冻结","uncertain":false,"citation":""}

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
  - C1: citation=字彙補
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "凁",
  "rhyme": "二十六宥",
  "wenyan": "【字彙補】心奏切，音漱。冷凍。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E5%87%81",
  "citation": "字彙補",
  "extracted_at": "2026-05-17T12:30:49.249Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 34 — 㽬 / 二十六宥 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㽬 / 二十六宥

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】敷救切，音覆貳也。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"覆，翻転する。《集韻》に「敷救切、音覆貳也」と見える","modern":"","uncertain":true,"citation":"《集韻》"}

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
  - C1: citation=集韻
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "㽬",
  "rhyme": "二十六宥",
  "wenyan": "【集韻】敷救切，音覆貳也。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%BD%AC",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:30:49.249Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 35 — 熘 / 二十六宥 — sub-case (e)

### Original audit-batch entry (verbatim)

```
## 熘 / 二十六宥

**Reason**: LLM uncertain or empty

**zdic raw**:

> (no content)

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"炙烤。煨烹之法，使食物受热。","modern":"快速炒菜或短时间烹饪的方法","uncertain":true,"citation":""}

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
  - E2: HIT tier=web (3 searches)

### Proposed entry

```json
{
  "char": "熘",
  "rhyme": "二十六宥",
  "wenyan": "烹調之法，類炒而異。調料中加澱粉，使汁液濃稠裹食物。",
  "modern": "一種快速炒制的烹飪方法，在調料中加澱粉使湯汁濃稠。",
  "source": "audit-web",
  "source_url": "https://www.zdic.net/hans/%E7%86%98",
  "citation": "网：漢典",
  "extracted_at": "2026-05-17T12:30:55.697Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 36 — 㤛 / 二十六寢 — sub-case (a)

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
  - A1: extracted X=恁 (U+6041) frame=variant → preamble="恁之異體"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT (6 unique defs)

### Proposed entry

```json
{
  "char": "㤛",
  "rhyme": "二十六寢",
  "wenyan": "恁之異體。第二人稱。；思、念。；哪。；什麼、何。；如此、這樣。；怎麼。",
  "modern": "同恁",
  "source": "audit-deref",
  "source_url": "internal:char-恁-moedict",
  "citation": "重編國語辭典",
  "extracted_at": "2026-05-17T12:30:55.698Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 37 — 㔤 / 二十六寢 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㔤 / 二十六寢

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】思沈切，音審。㔤𠢱。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"深，引申为沉思貌。《集韻》思沈切，音審。","modern":"","uncertain":true,"citation":"《集韻》"}

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
  - C1: citation=集韻
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "㔤",
  "rhyme": "二十六寢",
  "wenyan": "【集韻】思沈切，音審。㔤𠢱。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%94%A4",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:30:55.698Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 38 — 㰙 / 二十哿 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㰙 / 二十哿

**Reason**: LLM uncertain or empty

**zdic raw**:

> 同橠。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同橠。木名，一種樹木。","modern":"樹木名稱","uncertain":true}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[橠]
- Pipeline path:
  - A1: extracted X=橠 (U+6a60) frame=variant → preamble="橠之異體"
  - A2a: HIT in unique-char-content.json (2 rhyme entries; using first)

### Proposed entry

```json
{
  "char": "㰙",
  "rhyme": "二十哿",
  "wenyan": "橠之異體。𣘨橠，木盛貌。【詩·檜風】猗儺其枝。【正字通】作𣘨、橠。又【集韻】郞可切，音𥗴。義同。又【集韻】囊何切，音那。枝弱貌。",
  "modern": "〔𣘨（ě）～〕树枝细长而柔软的样子。",
  "source": "audit-deref",
  "source_url": "internal:char-橠-uccontent",
  "extracted_at": "2026-05-17T12:30:55.698Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 39 — 㙲 / 二宋 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㙲 / 二宋

**Reason**: LLM uncertain or empty

**zdic raw**:

> 同壅。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同壅。堵塞、阻塞之意。","modern":"堵塞；阻塞","uncertain":true,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[壅] → moedict-map[壅]
- Pipeline path:
  - A1: extracted X=壅 (U+58c5) frame=variant → preamble="壅之異體"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT (4 unique defs)

### Proposed entry

```json
{
  "char": "㙲",
  "rhyme": "二宋",
  "wenyan": "壅之異體。堵住、阻塞不通。；遮蔽、蒙蔽。；用泥土或肥料培養植物的根部。；(一)之又音。",
  "modern": "同壅",
  "source": "audit-deref",
  "source_url": "internal:char-壅-moedict",
  "citation": "重編國語辭典",
  "extracted_at": "2026-05-17T12:30:55.698Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 40 — 䢪 / 二蕭 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 䢪 / 二蕭

**Reason**: LLM no citation

**zdic raw**:

> 俗橇字。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"橇的俗字。橇為雪上運輸工具，形如板，可在冰雪上滑行。","modern":"雪橇的俗字寫法","uncertain":false,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[橇] → moedict-map[橇]
- Pipeline path:
  - A1: extracted X=橇 (U+6a47) frame=vulgar → preamble="橇之俗字"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT (1 unique def)

### Proposed entry

```json
{
  "char": "䢪",
  "rhyme": "二蕭",
  "wenyan": "橇之俗字。在泥地上行走或雪地裡滑行的工具。",
  "modern": "同橇",
  "source": "audit-deref",
  "source_url": "internal:char-橇-moedict",
  "citation": "重編國語辭典",
  "extracted_at": "2026-05-17T12:30:55.699Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 41 — 戓 / 五歌 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 戓 / 五歌

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【佩觽集】各何切，音歌。地名。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"地名。《佩觽集》作'各何切，音歌'，指某處地名。","modern":"","uncertain":true,"citation":"《佩觽集》"}

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
  - C1: citation=佩觽集
  - C2: designation=地名, modern="古地名"

### Proposed entry

```json
{
  "char": "戓",
  "rhyme": "五歌",
  "wenyan": "【佩觽集】各何切，音歌。地名。",
  "modern": "古地名",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E6%88%93",
  "citation": "佩觽集",
  "extracted_at": "2026-05-17T12:30:55.699Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 42 — 㰙 / 五歌 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㰙 / 五歌

**Reason**: LLM uncertain or empty

**zdic raw**:

> 同橠。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同橠。木名，即橡樹，可製器具。","modern":"橡树（一种树木）","uncertain":true,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[橠]
- Pipeline path:
  - A1: extracted X=橠 (U+6a60) frame=variant → preamble="橠之異體"
  - A2a: HIT in unique-char-content.json (2 rhyme entries; using first)

### Proposed entry

```json
{
  "char": "㰙",
  "rhyme": "五歌",
  "wenyan": "橠之異體。𣘨橠，木盛貌。【詩·檜風】猗儺其枝。【正字通】作𣘨、橠。又【集韻】郞可切，音𥗴。義同。又【集韻】囊何切，音那。枝弱貌。",
  "modern": "〔𣘨（ě）～〕树枝细长而柔软的样子。",
  "source": "audit-deref",
  "source_url": "internal:char-橠-uccontent",
  "extracted_at": "2026-05-17T12:30:55.699Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 43 — 㚳 / 五歌 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㚳 / 五歌

**Reason**: LLM uncertain or empty

**zdic raw**:

> 同妿。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"","modern":"","uncertain":true}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[妿]
- Pipeline path:
  - A1: extracted X=妿 (U+59bf) frame=variant → preamble="妿之異體"
  - A2a: HIT in unique-char-content.json (1 rhyme entries; using first)

### Proposed entry

```json
{
  "char": "㚳",
  "rhyme": "五歌",
  "wenyan": "妿之異體。【說文】女師也。【杜林】加敎于女也。又【廣韻】古俄切【集韻】居何切，𠀤音歌。義同。",
  "modern": "古代以妇道教人的女教师。",
  "source": "audit-deref",
  "source_url": "internal:char-妿-uccontent",
  "extracted_at": "2026-05-17T12:30:55.699Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 44 — 嬫 / 八庚 — sub-case (b)

### Original audit-batch entry (verbatim)

```
## 嬫 / 八庚

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】于平切，音榮。女字。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"女字，音榮。女名用字。","modern":"","uncertain":true}

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
  - B2: citation=集韻

### Proposed entry

```json
{
  "char": "嬫",
  "rhyme": "八庚",
  "wenyan": "女字",
  "modern": "女字",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E5%AC%AB",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:30:55.699Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 45 — 婛 / 八庚 — sub-case (b)

### Original audit-batch entry (verbatim)

```
## 婛 / 八庚

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】居卿切，音京。女字。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"女字，音京，古代用字。","modern":"","uncertain":true,"citation":"《集韻》"}

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
  - B2: citation=集韻

### Proposed entry

```json
{
  "char": "婛",
  "rhyme": "八庚",
  "wenyan": "女字",
  "modern": "女字",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E5%A9%9B",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:30:55.700Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 46 — 䣐 / 八庚 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䣐 / 八庚

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】於驚切，音英。地名。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"地名，音英。","modern":"","uncertain":true,"citation":"《集韻》"}

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
  - C1: citation=集韻
  - C2: designation=地名, modern="古地名"

### Proposed entry

```json
{
  "char": "䣐",
  "rhyme": "八庚",
  "wenyan": "【集韻】於驚切，音英。地名。",
  "modern": "古地名",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%A3%90",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:30:55.700Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 47 — 㯇 / 八薺 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㯇 / 八薺

**Reason**: LLM uncertain or empty

**zdic raw**:

> 俗梐字。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"梐字的俗寫。梐為木名，用材製器。","modern":"（舊字形）","uncertain":true}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[梐] → moedict-map[梐] → Haiku+web_search(漢語大詞典+教育部異體字字典) → Haiku+web_search(formal + non-official fallback)
- Pipeline path:
  - A1: extracted X=梐 (U+6890) frame=vulgar → preamble="梐之俗字"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT but cross-ref ("參見「梐枑」、「梐梱」等條。…") → falling through to web
  - A2c: invoking Haiku+web_search for X (trigger=crossref)
  - A2c: MISS (3 searches)
  - A4: falling through to (e) pipeline for original char
  - E1: confirmed both zdic and Wiktionary empty
  - E2: invoking Haiku+web_search with two-tier fallback
  - E2: MISS in both tiers (3 searches)

### SKIPPED

Reason: No source found in formal or non-official

### Verdict (auto-applied by script)

- [ ] Ship
- [x] Skip (auto-skipped — no source found)
- [ ] Override / discussion needed: ___________

---

## Entry 48 — 㭽 / 八薺 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㭽 / 八薺

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【類篇】典禮切，音底。㰅也。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同㰅。《類篇》作「典禮切，音底」，指某種木製器物或木質物品","modern":"","uncertain":true,"citation":"《類篇》"}

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
  - C1: citation=類篇
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "㭽",
  "rhyme": "八薺",
  "wenyan": "【類篇】典禮切，音底。㰅也。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%AD%BD",
  "citation": "類篇",
  "extracted_at": "2026-05-17T12:31:08.932Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 49 — 蓕 / 八霽 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 蓕 / 八霽

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】涓惠切，音桂。草名。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"草的一種。《集韻》：涓惠切，音桂，草名。","modern":"一種植物（具體物種不詳）","uncertain":true,"citation":"《集韻》"}

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
  - C1: citation=集韻
  - C2: designation=草名, modern="一種草本植物"

### Proposed entry

```json
{
  "char": "蓕",
  "rhyme": "八霽",
  "wenyan": "【集韻】涓惠切，音桂。草名。",
  "modern": "一種草本植物",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E8%93%95",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:31:08.932Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 50 — 䗟 / 八霽 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䗟 / 八霽

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】壹計切，音翳。蟲名。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"蟲名，一種昆蟲。《集韻》記載為壹計切，音翳。","modern":"一种昆虫的名称","uncertain":true,"citation":"《集韻》"}

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
  - C1: citation=集韻
  - C2: designation=蟲名, modern="一種昆蟲"

### Proposed entry

```json
{
  "char": "䗟",
  "rhyme": "八霽",
  "wenyan": "【集韻】壹計切，音翳。蟲名。",
  "modern": "一種昆蟲",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%97%9F",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:31:08.932Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 51 — 㰀 / 八齊 — sub-case (c)

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
  - C1: citation=集韻
  - C2: designation=木名, modern="一種樹木"

### Proposed entry

```json
{
  "char": "㰀",
  "rhyme": "八齊",
  "wenyan": "【集韻】憐題切，音棃。木名。",
  "modern": "一種樹木",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%B0%80",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:31:08.932Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 52 — 㯇 / 八齊 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㯇 / 八齊

**Reason**: LLM uncertain or empty

**zdic raw**:

> 俗梐字。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"梐字的俗字","modern":"梐的异体字或俗写","uncertain":true}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[梐] → moedict-map[梐] → Haiku+web_search(漢語大詞典+教育部異體字字典)
- Pipeline path:
  - A1: extracted X=梐 (U+6890) frame=vulgar → preamble="梐之俗字"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT but cross-ref ("參見「梐枑」、「梐梱」等條。…") → falling through to web
  - A2c: invoking Haiku+web_search for X (trigger=crossref)
  - A2c: HIT via web_search (3 searches)

### Proposed entry

```json
{
  "char": "㯇",
  "rhyme": "八齊",
  "wenyan": "梐之俗字。梐，梐枑，古代官府門前阻攔人馬通行之木架，亦作牢獄",
  "modern": "行馬（古代官府門前的木欄），牢籠",
  "source": "audit-web",
  "source_url": "https://kx.chacd.com/1391/",
  "citation": "网：康熙字典",
  "extracted_at": "2026-05-17T12:31:15.017Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 53 — 鏣 / 六御 — sub-case (c)

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
  - C1: citation=集韻
  - C2: designation=器名, modern="一種器具"

### Proposed entry

```json
{
  "char": "鏣",
  "rhyme": "六御",
  "wenyan": "【集韻】商署切，音恕。器名。",
  "modern": "一種器具",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E9%8F%A3",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:31:15.018Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 54 — 䂗 / 六月 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䂗 / 六月

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【字彙補】口骨切，音窟。用心也。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"用心。專注用力之意。","modern":"","uncertain":true}

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
  - C1: citation=字彙補
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "䂗",
  "rhyme": "六月",
  "wenyan": "【字彙補】口骨切，音窟。用心也。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%82%97",
  "citation": "字彙補",
  "extracted_at": "2026-05-17T12:31:15.018Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 55 — 鷠 / 六魚 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 鷠 / 六魚

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【字彙補】五魚切，音魚。鳥名。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"鳥名。一種鳥類。","modern":"鸟的一种","uncertain":true,"citation":""}

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
  - C1: citation=字彙補
  - C2: designation=鳥名, modern="一種鳥類"

### Proposed entry

```json
{
  "char": "鷠",
  "rhyme": "六魚",
  "wenyan": "【字彙補】五魚切，音魚。鳥名。",
  "modern": "一種鳥類",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E9%B7%A0",
  "citation": "字彙補",
  "extracted_at": "2026-05-17T12:31:15.018Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 56 — 䬔 / 六魚 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䬔 / 六魚

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【正字通】芋劬切，音余。註見䬓。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"同䬓。《正字通》芋劬切，音余。","modern":"","uncertain":true,"citation":"《正字通》"}

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
  - C1: citation=正字通
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "䬔",
  "rhyme": "六魚",
  "wenyan": "【正字通】芋劬切，音余。註見䬓。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%AC%94",
  "citation": "正字通",
  "extracted_at": "2026-05-17T12:31:15.018Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 57 — 㧧 / 六魚 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㧧 / 六魚

**Reason**: LLM no citation

**zdic raw**:

> 俗梳字。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"俗字，梳的異體。梳：理髮之具，用以整理頭髮","modern":"梳（comb；俗寫或異體字形）","uncertain":false,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[梳] → moedict-map[梳]
- Pipeline path:
  - A1: extracted X=梳 (U+68b3) frame=vulgar → preamble="梳之俗字"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT (2 unique defs)

### Proposed entry

```json
{
  "char": "㧧",
  "rhyme": "六魚",
  "wenyan": "梳之俗字。整理頭髮的用具。；用梳子整理頭髮。",
  "modern": "同梳",
  "source": "audit-deref",
  "source_url": "internal:char-梳-moedict",
  "citation": "重編國語辭典",
  "extracted_at": "2026-05-17T12:31:15.019Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 58 — 煱 / 六麻 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 煱 / 六麻

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【字彙補】古誇切，音瓜。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"火熾貌，煜煜然。","modern":"","uncertain":true,"citation":""}

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
  - C1: citation=字彙補
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "煱",
  "rhyme": "六麻",
  "wenyan": "【字彙補】古誇切，音瓜。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E7%85%B1",
  "citation": "字彙補",
  "extracted_at": "2026-05-17T12:31:15.019Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 59 — 哞 / 十一尤 — sub-case (f)

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
  "wenyan": "擬聲詞。狀低沉粗厲之聲。",
  "modern": "象聲詞，模擬低沉粗厲之鳴聲。",
  "source": "audit-external",
  "source_url": "https://dict.mini.moe.edu.tw/SearchIndex/searchResult?searchType=one&dictSearchField=%E5%93%9E",
  "citation": "教育部國語小字典",
  "extracted_at": "2026-05-17T12:31:22.308Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 60 — 媹 / 十一尤 — sub-case (b)

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
  - B2: citation=集韻

### Proposed entry

```json
{
  "char": "媹",
  "rhyme": "十一尤",
  "wenyan": "女字",
  "modern": "女字",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E5%AA%B9",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:31:22.309Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 61 — 㚭 / 十一尤 — sub-case (b)

### Original audit-batch entry (verbatim)

```
## 㚭 / 十一尤

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【篇海類編】于求切，音尤。女字。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"女性。","modern":"女子","uncertain":true,"citation":""}

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
  - B2: citation=篇海類編

### Proposed entry

```json
{
  "char": "㚭",
  "rhyme": "十一尤",
  "wenyan": "女字",
  "modern": "女字",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%9A%AD",
  "citation": "篇海類編",
  "extracted_at": "2026-05-17T12:31:22.309Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 62 — 㭌 / 十一尤 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㭌 / 十一尤

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】【類篇】𠀤迷浮切，音矛。器名。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"器名，音同矛。一種器具，見於《集韻》、《類篇》。","modern":"","uncertain":true,"citation":"《集韻》《類篇》"}

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
  - C1: citation=集韻、類篇
  - C2: designation=器名, modern="一種器具"

### Proposed entry

```json
{
  "char": "㭌",
  "rhyme": "十一尤",
  "wenyan": "【集韻】【類篇】𠀤迷浮切，音矛。器名。",
  "modern": "一種器具",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%AD%8C",
  "citation": "集韻、類篇",
  "extracted_at": "2026-05-17T12:31:22.309Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 63 — 䵸 / 十一尤 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䵸 / 十一尤

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【廣韻】七由切【集韻】雌由切，𠀤音秋。與𪓰同。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"與𪓰同。𪓰為獸名，似鼠。《廣韻》引此字作同義字。","modern":"一種鼠類動物的古代異體字","uncertain":true,"citation":"《廣韻》"}

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
  - C1: citation=廣韻、集韻
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "䵸",
  "rhyme": "十一尤",
  "wenyan": "【廣韻】七由切【集韻】雌由切，𠀤音秋。與𪓰同。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%B5%B8",
  "citation": "廣韻、集韻",
  "extracted_at": "2026-05-17T12:31:22.309Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 64 — 橁 / 十一真 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 橁 / 十一真

**Reason**: LLM uncertain or empty

**zdic raw**:

> 同杶。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"同杶。木名，或為木製工具。","modern":"","uncertain":true}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[杶] → moedict-map[杶] → Haiku+web_search(漢語大詞典+教育部異體字字典)
- Pipeline path:
  - A1: extracted X=杶 (U+6776) frame=variant → preamble="杶之異體"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT but cross-ref ("植物名。楝科香椿屬，「香椿」之古稱，參見「香椿」條。…") → falling through to web
  - A2c: invoking Haiku+web_search for X (trigger=crossref)
  - A2c: HIT via web_search (3 searches)

### Proposed entry

```json
{
  "char": "橁",
  "rhyme": "十一真",
  "wenyan": "杶之異體。杶，植物名，即椿木也。落葉喬木，木材可製琴。",
  "modern": "一種植物，即椿樹，俗稱香椿，落葉喬木。",
  "source": "audit-web",
  "source_url": "https://dict.variants.moe.edu.tw/variants/rbt/word_attribute.rbt?educode=B01629",
  "citation": "网：教育部異體字字典",
  "extracted_at": "2026-05-17T12:31:30.411Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 65 — 橶 / 十一陌 — sub-case (e)

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

### Verdict (auto-applied by script)

- [ ] Ship
- [x] Skip (auto-skipped — no source found)
- [ ] Override / discussion needed: ___________

---

## Entry 66 — 㛭 / 十一陌 — sub-case (b)

### Original audit-batch entry (verbatim)

```
## 㛭 / 十一陌

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【字彙補】思積切，音昔。女字。

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
  - B2: citation=字彙補

### Proposed entry

```json
{
  "char": "㛭",
  "rhyme": "十一陌",
  "wenyan": "女字",
  "modern": "女字",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%9B%AD",
  "citation": "字彙補",
  "extracted_at": "2026-05-17T12:31:38.216Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 67 — 㲼 / 十一隊 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㲼 / 十一隊

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【唐韻】魚肺切【集韻】魚刈切，𠀤音乂。水名。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"水名，唐韻記載為魚肺切音。","modern":"","uncertain":true,"citation":"《唐韻》"}

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
  - C1: citation=唐韻、集韻
  - C2: designation=水名, modern="古地名（水）"

### Proposed entry

```json
{
  "char": "㲼",
  "rhyme": "十一隊",
  "wenyan": "【唐韻】魚肺切【集韻】魚刈切，𠀤音乂。水名。",
  "modern": "古地名（水）",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%B2%BC",
  "citation": "唐韻、集韻",
  "extracted_at": "2026-05-17T12:31:38.217Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 68 — 澲 / 十七洽 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 澲 / 十七洽

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【唐韻】魚怯切【集韻】逆怯切，𠀤音業。橫水大版。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"橫亘的大水流，水勢湍急貌","modern":"","uncertain":true,"citation":""}

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
  - C1: citation=唐韻、集韻
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "澲",
  "rhyme": "十七洽",
  "wenyan": "【唐韻】魚怯切【集韻】逆怯切，𠀤音業。橫水大版。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E6%BE%B2",
  "citation": "唐韻、集韻",
  "extracted_at": "2026-05-17T12:31:38.217Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 69 — 㰱 / 十七洽 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㰱 / 十七洽

**Reason**: LLM no citation

**zdic raw**:

> 俗歃字。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"俗字，歃的異體。歃為割臂歃血之義，表示盟誓。","modern":"","uncertain":false,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[歃] → moedict-map[歃] → Haiku+web_search(漢語大詞典+教育部異體字字典)
- Pipeline path:
  - A1: extracted X=歃 (U+6b43) frame=vulgar → preamble="歃之俗字"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT but cross-ref ("參見「歃血」條。…") → falling through to web
  - A2c: invoking Haiku+web_search for X (trigger=crossref)
  - A2c: HIT via web_search (3 searches)

### Proposed entry

```json
{
  "char": "㰱",
  "rhyme": "十七洽",
  "wenyan": "歃之俗字。歃，盟會時，以牲血塗口旁或含於口中，以示誓言之誠意",
  "modern": "古代盟誓儀式，將牲畜血涂在嘴邊以示誠心立盟",
  "source": "audit-web",
  "source_url": "https://www.zdic.net/hant/%E6%AD%83",
  "citation": "网：漢典（zdic.net）",
  "extracted_at": "2026-05-17T12:31:47.379Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 70 — 昍 / 十三元 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 昍 / 十三元

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】許元切，音暄。明也。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> n/a

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
  - C1: citation=集韻
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "昍",
  "rhyme": "十三元",
  "wenyan": "【集韻】許元切，音暄。明也。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E6%98%8D",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:31:47.380Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 71 — 䓂 / 十三元 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䓂 / 十三元

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【唐韻】語軒切，音言。草名。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"草名，唐韻記載為語軒切音言。","modern":"","uncertain":true,"citation":"《唐韻》"}

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
  - C1: citation=唐韻
  - C2: designation=草名, modern="一種草本植物"

### Proposed entry

```json
{
  "char": "䓂",
  "rhyme": "十三元",
  "wenyan": "【唐韻】語軒切，音言。草名。",
  "modern": "一種草本植物",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%93%82",
  "citation": "唐韻",
  "extracted_at": "2026-05-17T12:31:47.380Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 72 — 㥁 / 十三職 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㥁 / 十三職

**Reason**: LLM no citation

**zdic raw**:

> 同悳。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同「德」。品德、道德之意。","modern":"道德、品德","uncertain":false,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[悳] → moedict-map[悳] → Haiku+web_search(漢語大詞典+教育部異體字字典)
- Pipeline path:
  - A1: extracted X=悳 (U+60b3) frame=variant → preamble="悳之異體"
  - A2a: MISS in unique-char-content.json
  - A2b: MISS in moedict-map
  - A2c: invoking Haiku+web_search for X (trigger=moe-miss)
  - A2c: HIT via web_search (3 searches)

### Proposed entry

```json
{
  "char": "㥁",
  "rhyme": "十三職",
  "wenyan": "悳之異體。悳，外得於人，內得於己也。直心為德行。",
  "modern": "得到、獲得，亦為德字之古體，指品德、道德。",
  "source": "audit-web",
  "source_url": "https://www.shuowen.org/view/6677",
  "citation": "网：說文解字",
  "extracted_at": "2026-05-17T12:31:56.757Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 73 — 媅 / 十三覃 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 媅 / 十三覃

**Reason**: LLM uncertain or empty

**zdic raw**:

> 同妉。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同妉。女子名用字。","modern":"","uncertain":true}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[妉] → moedict-map[妉] → Haiku+web_search(漢語大詞典+教育部異體字字典)
- Pipeline path:
  - A1: extracted X=妉 (U+5989) frame=variant → preamble="妉之異體"
  - A2a: MISS in unique-char-content.json
  - A2b: MISS in moedict-map
  - A2c: invoking Haiku+web_search for X (trigger=moe-miss)
  - A2c: HIT via web_search (3 searches)

### Proposed entry

```json
{
  "char": "媅",
  "rhyme": "十三覃",
  "wenyan": "妉之異體。妉，樂也。本作媅。",
  "modern": "樂；快樂。同媅字。",
  "source": "audit-web",
  "source_url": "https://zidian.bmcx.com/e5a689__zidianchaxun/",
  "citation": "网：爾雅",
  "extracted_at": "2026-05-17T12:32:06.082Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 74 — 䳓 / 十九皓 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䳓 / 十九皓

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【字彙補】力倒切，音老。頹鶖也。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"頹鶖，一種衰老的鳥。","modern":"","uncertain":true,"citation":""}

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
  - C1: citation=字彙補
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "䳓",
  "rhyme": "十九皓",
  "wenyan": "【字彙補】力倒切，音老。頹鶖也。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%B3%93",
  "citation": "字彙補",
  "extracted_at": "2026-05-17T12:32:06.082Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 75 — 噷 / 十二侵 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 噷 / 十二侵

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【五音篇海】許淫切。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"嘆息聲。許淫切，音近欣。","modern":"","uncertain":true,"citation":"《五音篇海》"}

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
  - C1: citation=五音篇海
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "噷",
  "rhyme": "十二侵",
  "wenyan": "【五音篇海】許淫切。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E5%99%B7",
  "citation": "五音篇海",
  "extracted_at": "2026-05-17T12:32:06.083Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 76 — 鈝 / 十二侵 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 鈝 / 十二侵

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【篇海】夷斟切，音淫。見釋典。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"器物名，見於佛教典籍。","modern":"","uncertain":true}

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
  - C1: citation=篇海
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "鈝",
  "rhyme": "十二侵",
  "wenyan": "【篇海】夷斟切，音淫。見釋典。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E9%88%9D",
  "citation": "篇海",
  "extracted_at": "2026-05-17T12:32:06.083Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 77 — 䋕 / 十二侵 — sub-case (e)

### Original audit-batch entry (verbatim)

```
## 䋕 / 十二侵

**Reason**: LLM uncertain or empty

**zdic raw**:

> (no content)

**Wiktionary raw**:

> [编辑]

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

### Verdict (auto-applied by script)

- [ ] Ship
- [x] Skip (auto-skipped — no source found)
- [ ] Override / discussion needed: ___________

---

## Entry 78 — 㕴 / 十二侵 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㕴 / 十二侵

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【龍龕】長林切，音沈。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"深沈貌，或作沈。《龍龕》音義為沈。","modern":"深沉的样子","uncertain":true,"citation":"《龍龕》"}

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
  - C1: citation=龍龕
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "㕴",
  "rhyme": "十二侵",
  "wenyan": "【龍龕】長林切，音沈。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%95%B4",
  "citation": "龍龕",
  "extracted_at": "2026-05-17T12:32:12.940Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 79 — 㥹 / 十二吻 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㥹 / 十二吻

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【字彙補】甫本切，音粉。動也。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"動作；活動。","modern":"","uncertain":true,"citation":""}

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
  - C1: citation=字彙補
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "㥹",
  "rhyme": "十二吻",
  "wenyan": "【字彙補】甫本切，音粉。動也。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%A5%B9",
  "citation": "字彙補",
  "extracted_at": "2026-05-17T12:32:12.940Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 80 — 嚑 / 十二文 — sub-case (e)

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

### Verdict (auto-applied by script)

- [ ] Ship
- [x] Skip (auto-skipped — no source found)
- [ ] Override / discussion needed: ___________

---

## Entry 81 — 㯓 / 十五合 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㯓 / 十五合

**Reason**: LLM no citation

**zdic raw**:

> 同榻。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同榻，即床榻。與「榻」字義相同，指臥具。","modern":"床榻","uncertain":false,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[榻] → moedict-map[榻]
- Pipeline path:
  - A1: extracted X=榻 (U+69bb) frame=variant → preamble="榻之異體"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT (1 unique def)

### Proposed entry

```json
{
  "char": "㯓",
  "rhyme": "十五合",
  "wenyan": "榻之異體。狹長的矮床。",
  "modern": "同榻",
  "source": "audit-deref",
  "source_url": "internal:char-榻-moedict",
  "citation": "重編國語辭典",
  "extracted_at": "2026-05-17T12:32:20.486Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 82 — 㡴 / 十五合 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㡴 / 十五合

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】落合切，音拉。屋聲。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"屋聲，音如「拉」。","modern":"","uncertain":true}

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
  - C1: citation=集韻
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "㡴",
  "rhyme": "十五合",
  "wenyan": "【集韻】落合切，音拉。屋聲。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%A1%B4",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:32:20.487Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 83 — 㚽 / 十八巧 — sub-case (b)

### Original audit-batch entry (verbatim)

```
## 㚽 / 十八巧

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【篇海類編】苦絞切，音巧。女字。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"女字。苦絞切，音巧。","modern":"","uncertain":true}

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
  - B2: citation=篇海類編

### Proposed entry

```json
{
  "char": "㚽",
  "rhyme": "十八巧",
  "wenyan": "女字",
  "modern": "女字",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%9A%BD",
  "citation": "篇海類編",
  "extracted_at": "2026-05-17T12:32:20.487Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 84 — 㑤 / 十八巧 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㑤 / 十八巧

**Reason**: LLM uncertain or empty

**zdic raw**:

> 同媌。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"與媌同。媌，美好貌","modern":"","uncertain":true,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[媌]
- Pipeline path:
  - A1: extracted X=媌 (U+5a8c) frame=variant → preamble="媌之異體"
  - A2a: HIT in unique-char-content.json (2 rhyme entries; using first)

### Proposed entry

```json
{
  "char": "㑤",
  "rhyme": "十八巧",
  "wenyan": "媌之異體。【說文】目裏好也。【揚子·方言】凡好而輕者謂之娥，關東河濟之閒謂之媌。【註】今關西人亦呼美好爲媌，閩人謂妓女爲媌。",
  "modern": "眉目美好：“简郑卫之处子娥～靡曼者，施芳泽，正蛾眉。”妓女。",
  "source": "audit-deref",
  "source_url": "internal:char-媌-uccontent",
  "extracted_at": "2026-05-17T12:32:20.487Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 85 — 㤐 / 十六葉 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㤐 / 十六葉

**Reason**: LLM uncertain or empty

**zdic raw**:

> 同怗。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"同怗。心不安貌。","modern":"","uncertain":true,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[怗] → moedict-map[怗] → Haiku+web_search(漢語大詞典+教育部異體字字典)
- Pipeline path:
  - A1: extracted X=怗 (U+6017) frame=variant → preamble="怗之異體"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT but cross-ref ("平服、平定。；安靜。；參見「怗懘」條。…") → falling through to web
  - A2c: invoking Haiku+web_search for X (trigger=crossref)
  - A2c: HIT via web_search (3 searches)

### Proposed entry

```json
{
  "char": "㤐",
  "rhyme": "十六葉",
  "wenyan": "怗之異體。怗，平定，安靜；或樂音不和諧",
  "modern": "平服、平定或安寧；樂音不和諧",
  "source": "audit-web",
  "source_url": "https://pedia.cloud.edu.tw/Entry/Detail?title=%E6%80%97&search=%E6%80%96",
  "citation": "网：教育部異體字字典",
  "extracted_at": "2026-05-17T12:32:32.961Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 86 — 䢾 / 十六銑 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䢾 / 十六銑

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】蘇典切，音跣。國名。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"國名。","modern":"","uncertain":true,"citation":""}

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
  - C1: citation=集韻
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "䢾",
  "rhyme": "十六銑",
  "wenyan": "【集韻】蘇典切，音跣。國名。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%A2%BE",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:32:32.963Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 87 — 㫨 / 十四寒 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㫨 / 十四寒

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【川篇】音安，又女亮切。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"","modern":"","uncertain":true}

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
  - C1: citation=川篇
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "㫨",
  "rhyme": "十四寒",
  "wenyan": "【川篇】音安，又女亮切。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%AB%A8",
  "citation": "川篇",
  "extracted_at": "2026-05-17T12:32:32.964Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 88 — 叺 / 十四緝 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 叺 / 十四緝

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【五音篇海】丑入切，音尺。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"尺的異體字或古字。據《五音篇海》，音尺，用於量度。","modern":"尺（长度单位）","uncertain":true,"citation":"《五音篇海》"}

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
  - C1: citation=五音篇海
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "叺",
  "rhyme": "十四緝",
  "wenyan": "【五音篇海】丑入切，音尺。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E5%8F%BA",
  "citation": "五音篇海",
  "extracted_at": "2026-05-17T12:32:32.965Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 89 — 㜛 / 十四願 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㜛 / 十四願

**Reason**: LLM uncertain or empty

**zdic raw**:

> 俗媆字。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"媆字的俗寫異體。媆，女子名字用字。","modern":"","uncertain":true}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[媆]
- Pipeline path:
  - A1: extracted X=媆 (U+5a86) frame=vulgar → preamble="媆之俗字"
  - A2a: HIT in unique-char-content.json (2 rhyme entries; using first)

### Proposed entry

```json
{
  "char": "㜛",
  "rhyme": "十四願",
  "wenyan": "媆之俗字。【廣韻】【集韻】【正韻】𠀤奴困切，同嫩。弱也。一曰少好貌。又【集韻】乳兗切，音軟。【說文】好貌。",
  "modern": "柔美貌。；同“嫩”。",
  "source": "audit-deref",
  "source_url": "internal:char-媆-uccontent",
  "extracted_at": "2026-05-17T12:32:32.965Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 90 — 㥃 / 十四願 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㥃 / 十四願

**Reason**: LLM uncertain or empty

**zdic raw**:

> 俗悶字。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"悶的俗字，煩悶、鬱悶之意","modern":"烦闷、郁闷","uncertain":true,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[悶] → moedict-map[悶]
- Pipeline path:
  - A1: extracted X=悶 (U+60b6) frame=vulgar → preamble="悶之俗字"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT (8 unique defs)

### Proposed entry

```json
{
  "char": "㥃",
  "rhyme": "十四願",
  "wenyan": "悶之俗字。空間密閉、空氣不流通。；聲音不響亮。；形容不靈活或不作聲的樣子。；密閉使不透氣。；長時間待在一處。；藏放。；心中不愉快。；不暢快的心緒。",
  "modern": "同悶",
  "source": "audit-deref",
  "source_url": "internal:char-悶-moedict",
  "citation": "重編國語辭典",
  "extracted_at": "2026-05-17T12:32:32.965Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 91 — 諚 / 十四鹽 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 諚 / 十四鹽

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【五音篇海】毗潛切。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"言語相和；應答。《廣韻》毗潛切，與潛韻相通，意為言辭相諧和。","modern":"應答；相和","uncertain":true,"citation":"《廣韻》"}

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
  - C1: citation=五音篇海
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "諚",
  "rhyme": "十四鹽",
  "wenyan": "【五音篇海】毗潛切。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E8%AB%9A",
  "citation": "五音篇海",
  "extracted_at": "2026-05-17T12:32:32.966Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 92 — 鮰 / 十灰 — sub-case (e)

### Original audit-batch entry (verbatim)

```
## 鮰 / 十灰

**Reason**: LLM uncertain or empty

**zdic raw**:

> (no content)

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"鱸魚的一種，身體扁長。","modern":"鮰魚，一種淡水魚","uncertain":true,"citation":""}

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
  - E2: HIT tier=web (3 searches)

### Proposed entry

```json
{
  "char": "鮰",
  "rhyme": "十灰",
  "wenyan": "一種魚，北人呼鳠，南人呼鮠，音相近，通稱鮰魚。",
  "modern": "鮠魚的同義詞，鮰 huí。",
  "source": "audit-web",
  "source_url": "https://www.zdic.net/hans/%E9%AE%B0",
  "citation": "网：本草纲目",
  "extracted_at": "2026-05-17T12:32:40.455Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 93 — 䤤 / 十灰 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䤤 / 十灰

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【五音集韻】苦哀切，音開。器名。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"器物名稱，具體指何物已不詳。《五音集韻》記載為苦哀切音開的器名。","modern":"","uncertain":true,"citation":"《五音集韻》"}

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
  - C1: citation=五音集韻
  - C2: designation=器名, modern="一種器具"

### Proposed entry

```json
{
  "char": "䤤",
  "rhyme": "十灰",
  "wenyan": "【五音集韻】苦哀切，音開。器名。",
  "modern": "一種器具",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%A4%A4",
  "citation": "五音集韻",
  "extracted_at": "2026-05-17T12:32:40.456Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 94 — 㮎 / 十灰 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㮎 / 十灰

**Reason**: LLM no citation

**zdic raw**:

> 同杯。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"同杯。器物，盛飲之具","modern":"杯子，饮水或饮酒的器具","uncertain":false,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[杯] → moedict-map[杯]
- Pipeline path:
  - A1: extracted X=杯 (U+676f) frame=variant → preamble="杯之異體"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT (3 unique defs)

### Proposed entry

```json
{
  "char": "㮎",
  "rhyme": "十灰",
  "wenyan": "杯之異體。一種盛酒、水、茶等液體的器皿。；競賽優勝的獎品，也借指競賽。如：「獎杯」、「世界杯」。今多用「盃」字。；量詞。計算杯裝物的單位。",
  "modern": "同杯",
  "source": "audit-deref",
  "source_url": "internal:char-杯-moedict",
  "citation": "重編國語辭典",
  "extracted_at": "2026-05-17T12:32:40.457Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 95 — 䀃 / 十灰 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䀃 / 十灰

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】徒回切，音頹。器名。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"器物名稱，具體名目不詳。《集韻》作'徒回切，音頹'，為某類器具。","modern":"","uncertain":true,"citation":"《集韻》"}

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
  - C1: citation=集韻
  - C2: designation=器名, modern="一種器具"

### Proposed entry

```json
{
  "char": "䀃",
  "rhyme": "十灰",
  "wenyan": "【集韻】徒回切，音頹。器名。",
  "modern": "一種器具",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%80%83",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:32:40.457Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 96 — 嵭 / 十蒸 — sub-case (d)

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
- Sources tried: Haiku+web_search(formal:漢語大詞典+教育部異體字字典+廣韻+集韻+康熙字典) → Haiku+web_search(web:百度百科+Wiktionary EN+general)
- Pipeline path:
  - D1: confirmed 義闕 in zdic
  - D2: formal-tier Haiku+web_search
  - D2: formal MISS (3 searches)
  - D3: web-tier Haiku+web_search (P2 fallback)
  - D3: web HIT (3 searches)

### Proposed entry

```json
{
  "char": "嵭",
  "rhyme": "十蒸",
  "wenyan": "山部字。本義崩塌。",
  "modern": "bēng (Mountain radical character; primary meaning: collapse/crumble)",
  "source": "audit-web",
  "source_url": "https://baike.baidu.com/item/%E5%B5%AD/243757",
  "citation": "网：百度百科",
  "extracted_at": "2026-05-17T12:32:52.219Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 97 — 㥤 / 十蒸 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㥤 / 十蒸

**Reason**: LLM no citation

**zdic raw**:

> 俗矜字。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"俗字，矜的異體。矜意為自尊自大、不謙虛，或憐憫、同情。","modern":"（已廢棄）矜的俗體字","uncertain":false,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[矜] → moedict-map[矜]
- Pipeline path:
  - A1: extracted X=矜 (U+77dc) frame=vulgar → preamble="矜之俗字"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT (10 unique defs)

### Proposed entry

```json
{
  "char": "㥤",
  "rhyme": "十蒸",
  "wenyan": "矜之俗字。老而無妻的人。；生病、患病。；憐惜、憐憫。；敬慎。；敬重、推崇。；自誇、自負。；莊重自持。；驕傲自大。；禍亂。；矛或戟的木柄。",
  "modern": "同矜",
  "source": "audit-deref",
  "source_url": "internal:char-矜-moedict",
  "citation": "重編國語辭典",
  "extracted_at": "2026-05-17T12:32:52.221Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 98 — 㛵 / 十蒸 — sub-case (b)

### Original audit-batch entry (verbatim)

```
## 㛵 / 十蒸

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【集韻】蚩承切，音稱。女字。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"女字。","modern":"女性的名字用字","uncertain":true,"citation":"《集韻》"}

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
  - B2: citation=集韻

### Proposed entry

```json
{
  "char": "㛵",
  "rhyme": "十蒸",
  "wenyan": "女字",
  "modern": "女字",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%9B%B5",
  "citation": "集韻",
  "extracted_at": "2026-05-17T12:32:52.221Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 99 — 糳 / 十藥 — sub-case (e)

### Original audit-batch entry (verbatim)

```
## 糳 / 十藥

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

### Verdict (auto-applied by script)

- [ ] Ship
- [x] Skip (auto-skipped — no source found)
- [ ] Override / discussion needed: ___________

---

## Entry 100 — 嶵 / 十賄 — sub-case (e)

### Original audit-batch entry (verbatim)

```
## 嶵 / 十賄

**Reason**: LLM uncertain or empty

**zdic raw**:

> (no content)

**Wiktionary raw**:

> [编辑]

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

### Verdict (auto-applied by script)

- [ ] Ship
- [x] Skip (auto-skipped — no source found)
- [ ] Override / discussion needed: ___________

---

## Entry 101 — 㤵 / 四支 — sub-case (a)

### Original audit-batch entry (verbatim)

```
## 㤵 / 四支

**Reason**: LLM no citation

**zdic raw**:

> 俗慈字。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"慈的俗字。慈，愛也，親愛之意。","modern":"慈爱（俗写）","uncertain":false,"citation":""}

**Addison's verdict** (fill in):

- [ ] accept zdic raw
- [ ] accept LLM output
- [ ] skip (no shipworthy content)
- [ ] override: ___________
```

### Enrichment process

- Sub-case classified: (a)
- Sources tried: unique-char-content[慈] → moedict-map[慈]
- Pipeline path:
  - A1: extracted X=慈 (U+6148) frame=vulgar → preamble="慈之俗字"
  - A2a: MISS in unique-char-content.json
  - A2b: HIT (6 unique defs)

### Proposed entry

```json
{
  "char": "㤵",
  "rhyme": "四支",
  "wenyan": "慈之俗字。愛憐。；父母對子女的愛稱為「慈」。；深篤的愛。；稱謂。用以尊稱母親。；吸鐵。；姓。如漢代有慈仁。",
  "modern": "同慈",
  "source": "audit-deref",
  "source_url": "internal:char-慈-moedict",
  "citation": "重編國語辭典",
  "extracted_at": "2026-05-17T12:33:13.157Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 102 — 䧶 / 四支 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 䧶 / 四支

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【字彙補】渠追切，音逵。顧貌。

**Wiktionary raw**:

> 漢語[编辑]

**LLM output**:

> {"wenyan":"回顾的样子。","modern":"","uncertain":true,"citation":""}

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
  - C1: citation=字彙補
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "䧶",
  "rhyme": "四支",
  "wenyan": "【字彙補】渠追切，音逵。顧貌。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E4%A7%B6",
  "citation": "字彙補",
  "extracted_at": "2026-05-17T12:33:13.157Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 103 — 㷐 / 四紙 — sub-case (c)

### Original audit-batch entry (verbatim)

```
## 㷐 / 四紙

**Reason**: LLM uncertain or empty

**zdic raw**:

> 【篇海】許委切，音毀。與𤌋同。

**Wiktionary raw**:

> [编辑]

**LLM output**:

> {"wenyan":"火光炫耀的样子。与𤌋同义。","modern":"","uncertain":true}

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
  - C1: citation=篇海
  - C2: designation=(none), modern=""

### Proposed entry

```json
{
  "char": "㷐",
  "rhyme": "四紙",
  "wenyan": "【篇海】許委切，音毀。與𤌋同。",
  "modern": "",
  "source": "audit-zdic-cite",
  "source_url": "https://www.zdic.net/hans/%E3%B7%90",
  "citation": "篇海",
  "extracted_at": "2026-05-17T12:33:13.158Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Entry 104 — 橰 / 四豪 — sub-case (e)

### Original audit-batch entry (verbatim)

```
## 橰 / 四豪

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
  - E2: HIT tier=web (3 searches)

### Proposed entry

```json
{
  "char": "橰",
  "rhyme": "四豪",
  "wenyan": "木名。同槔。一種井戶汲水之木械。",
  "modern": "橰，同槔。古代井戶用於汲水的木製機械，呈槓桿狀。",
  "source": "audit-web",
  "source_url": "https://zhongwenzidian.18dao.cn/zh-hant/zidian/橰",
  "citation": "网：中文字典網",
  "extracted_at": "2026-05-17T12:33:20.828Z"
}
```

### Verdict (auto-applied by script)

- [x] Ship (auto-applied to unique-char-content.json)
- [ ] Skip
- [ ] Override / discussion needed: ___________

---

## Pipeline edge cases observed

- Fix B (Cross-ref/MOE-miss → web_search) fired 7 times; 7 produced ship-worthy content via web
- P2 (d formal-miss → web fallback) fired 1 times; 1 produced ship-worthy content via web
