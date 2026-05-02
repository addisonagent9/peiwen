# Pingshui Dictionary Audit Report v2

Generated: 2026-05-02

## Coverage Statistics

| Metric | Count |
|--------|-------|
| Our dictionary chars | 21807 |
| Consensus chars (union of 3 refs) | 19700 |
| In both | 19247 |
| Only in ours | 2560 |
| Only in consensus | 453 |

## Findings Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 9 |
| HIGH | 469 |
| MEDIUM | 5 |
| LOW | 2560 |

## CRITICAL Findings

Default reading disagrees with consensus AND consensus reading not even in our secondary readings.

| Char | Our Readings | Consensus | Issue |
|------|-------------|-----------|-------|
| 拼 | 平/八庚 | 平/十四寒 (charles,cope); 仄/十三問 (charles,cope) | default disagrees with consensus, not even in secondary readings |
| 圯 | 平/四支 | 仄/四紙 (charles,cope) | default disagrees with consensus, not even in secondary readings |
| 妳 | 仄/九蟹 | 仄/四紙 (charles,jkak,cope) | default disagrees with consensus, not even in secondary readings |
| 晁 | 平/二蕭 | 仄/十七筱 (charles,cope) | default disagrees with consensus, not even in secondary readings |
| 婧 | 仄/二十四敬 | 仄/二十三梗 (charles,cope) | default disagrees with consensus, not even in secondary readings |
| 茍 | 仄/十三職, 仄/十三職 | 仄/二十五有 (charles,jkak,cope) | default disagrees with consensus, not even in secondary readings |
| 陜 | 仄/十七洽 | 仄/二十八琰 (charles,jkak,cope) | default disagrees with consensus, not even in secondary readings |
| 柿 | 仄/四紙 | 仄/十一隊 (charles,jkak) | default disagrees with consensus, not even in secondary readings |
| 樣 | 平/七陽 | 仄/二十三漾 (charles,jkak,cope) | default disagrees with consensus, not even in secondary readings |

## HIGH Findings

Default reading wrong (but may exist in secondary), or char in consensus but missing from ours.

| Char | Issue | Details |
|------|-------|---------|
| 茸 | default mismatch | default: 平/一東, consensus: 平/二冬 (charles,jkak,cope); 仄/二腫 (charles,jkak) |
| 殷 | default mismatch | default: 平/十一真, consensus: 平/十二文 (charles,jkak,cope); 平/十五刪 (charles,jkak,cope); 仄/十二吻 (charles,jkak) |
| 煴 | missing | consensus: 平/十二文 (charles, jkak) |
| 豮 | missing | consensus: 平/十二文 (charles, jkak) |
| 涢 | missing | consensus: 平/十二文 (charles, jkak) |
| 筼 | missing | consensus: 平/十二文 (charles, jkak) |
| 辒 | missing | consensus: 平/十三元 (charles, jkak) |
| 玟 | default mismatch | default: 平/十一真, consensus: 平/十二文 (charles,jkak) |
| 汶 | default mismatch | default: 平/十三元, consensus: 平/十二文 (charles,jkak,cope); 仄/十三問 (charles,jkak) |
| 裈 | missing | consensus: 平/十三元 (charles, jkak) |
| 論 | default mismatch | default: 平/十一真, consensus: 平/十三元 (charles,jkak,cope); 仄/十四願 (charles,jkak,cope) |
| 鹓 | missing | consensus: 平/十三元 (charles, jkak, cope) |
| 圈 | default mismatch | default: 平/一先, consensus: 平/十三元 (charles,cope); 仄/十三阮 (charles,jkak); 仄/十四願 (charles,jkak,cope) |
| 寬 | missing | consensus: 平/十四寒 (charles, jkak, cope) |
| 鉆 | missing | consensus: 平/十四寒, 仄/十五翰 (charles, jkak, cope) |
| 啴 | missing | consensus: 平/十四寒, 仄/十六銑 (charles, jkak) |
| 襕 | missing | consensus: 平/十四寒 (charles, jkak) |
| 梡 | default mismatch | default: 平/十三元, consensus: 平/十四寒 (charles,jkak); 仄/十四旱 (charles,jkak) |
| 鳣 | missing | consensus: 平/一先 (charles, jkak) |
| 阛 | missing | consensus: 平/十五刪 (charles, jkak) |
| 镮 | missing | consensus: 平/十五刪 (charles, jkak) |
| 顏 | missing | consensus: 平/十五刪 (charles, jkak, cope) |
| 鷴 | missing | consensus: 平/十五刪 (charles, jkak, cope) |
| 巔 | missing | consensus: 平/一先 (charles, jkak, cope) |
| 妍 | missing | consensus: 平/一先 (charles, jkak, cope) |
| 氈 | missing | consensus: 平/一先 (charles, jkak, cope) |
| 脧 | default mismatch | default: 平/十灰, consensus: 平/一先 (charles,jkak) |
| 媊 | default mismatch | default: 平/四支, consensus: 平/一先 (charles,jkak) |
| 磌 | default mismatch | default: 平/十一真, consensus: 平/一先 (charles,jkak) |
| 篯 | missing | consensus: 平/一先 (charles, jkak) |
| 鹯 | missing | consensus: 平/一先 (charles, jkak) |
| 钘 | missing | consensus: 平/九青 (charles, jkak) |
| 梿 | missing | consensus: 平/一先 (charles, jkak) |
| 漹 | default mismatch | default: 平/十五刪, consensus: 平/一先 (charles,jkak) |
| 嬛 | default mismatch | default: 平/十五刪, consensus: 平/一先 (charles,jkak); 平/八庚 (charles,jkak) |
| 峣 | missing | consensus: 平/二蕭 (charles, jkak, cope) |
| 謠 | missing | consensus: 平/二蕭 (charles, jkak, cope) |
| 鸮 | missing | consensus: 平/二蕭 (charles, jkak, cope) |
| 侥 | missing | consensus: 平/二蕭, 仄/十七筱 (charles, jkak, cope) |
| 飖 | missing | consensus: 平/二蕭 (charles, jkak) |
| 蟏 | missing | consensus: 平/二蕭 (charles, jkak) |
| 剿 | missing | consensus: 平/三肴, 仄/十七筱 (charles, jkak, cope) |
| 鸼 | missing | consensus: 平/三肴, 平/十一尤 (charles, jkak) |
| 绦 | missing | consensus: 平/四豪 (charles, jkak, cope) |
| 艘 | default mismatch | default: 平/十一尤, consensus: 平/四豪 (charles,jkak,cope) |
| 绹 | missing | consensus: 平/四豪 (charles, jkak) |
| 鱽 | missing | consensus: 平/四豪 (charles, jkak) |
| 梼 | missing | consensus: 平/四豪 (charles, jkak) |
| 匋 | default mismatch | default: 平/二蕭, consensus: 平/四豪 (charles,jkak) |
| 嗥 | missing | consensus: 平/四豪 (charles, jkak, cope) |
| 嘮 | default mismatch | default: 平/三肴, consensus: 平/四豪 (charles,jkak,cope) |
| 癆 | default mismatch | default: 平/二蕭, consensus: 平/四豪 (charles,jkak,cope) |
| 驒 | default mismatch | default: 平/十四寒, consensus: 平/五歌 (charles,jkak) |
| 啰 | missing | consensus: 平/五歌 (charles, jkak) |
| 浾 | default mismatch | default: 平/十一真, consensus: 平/六麻 (charles,jkak) |
| 铔 | missing | consensus: 平/六麻 (charles, jkak) |
| 靴 | missing | consensus: 平/六麻, 平/五歌 (charles, jkak, cope) |
| 鲿 | missing | consensus: 平/七陽 (charles, jkak) |
| 飏 | missing | consensus: 平/七陽, 仄/二十三漾 (charles, jkak) |
| 旸 | missing | consensus: 平/七陽 (charles, jkak) |
| 铓 | missing | consensus: 平/七陽 (charles, jkak) |
| 筜 | missing | consensus: 平/七陽 (charles, jkak) |
| 珰 | missing | consensus: 平/七陽 (charles, jkak, cope) |
| 贓 | missing | consensus: 平/七陽 (charles, jkak, cope) |
| 骦 | missing | consensus: 平/七陽 (charles, jkak) |
| 鸧 | missing | consensus: 平/七陽 (charles, jkak) |
| 螀 | missing | consensus: 平/七陽 (charles, jkak) |
| 钖 | missing | consensus: 平/七陽 (charles, jkak) |
| 玱 | missing | consensus: 平/七陽 (charles, jkak) |
| 玚 | missing | consensus: 平/七陽 (charles, jkak) |
| 锽 | missing | consensus: 平/七陽, 平/八庚 (charles, jkak) |
| 韁 | missing | consensus: 平/七陽 (charles, jkak, cope) |
| 橫 | default mismatch | default: 平/七陽, consensus: 平/八庚 (charles,jkak,cope); 仄/二十四敬 (charles,jkak,cope) |
| 纮 | missing | consensus: 平/八庚 (charles, jkak) |
| 貞 | default mismatch | default: 平/十一真, consensus: 平/八庚 (charles,jkak,cope) |
| 令 | default mismatch | default: 平/九青, consensus: 平/八庚 (charles,jkak,cope); 仄/二十四敬 (charles,jkak,cope) |
| 並 | missing | consensus: 平/八庚, 仄/二十三梗, 仄/二十四敬, 仄/二十四迥 (charles, jkak, cope) |
| 鹒 | missing | consensus: 平/八庚 (charles, jkak) |
| 硁 | missing | consensus: 平/八庚 (charles, jkak) |
| 繃 | missing | consensus: 平/八庚 (charles, jkak, cope) |
| 赪 | missing | consensus: 平/八庚 (charles, jkak, cope) |
| 鯖 | default mismatch | default: 平/九青, consensus: 平/八庚 (charles,jkak,cope) |
| 骍 | missing | consensus: 平/八庚 (charles, jkak) |
| 狌 | default mismatch | default: 平/九青, consensus: 平/八庚 (charles,jkak) |
| 铏 | missing | consensus: 平/九青 (charles, jkak) |
| 鸰 | missing | consensus: 平/九青 (charles, jkak) |
| 瓶 | missing | consensus: 平/九青 (charles, jkak, cope) |
| 屏 | missing | consensus: 平/九青, 仄/二十三梗 (charles, jkak, cope) |
| 瞑 | default mismatch | default: 平/一先, consensus: 平/九青 (charles,jkak,cope); 仄/十七霰 (charles,jkak); 仄/二十五徑 (charles,jkak) |
| 菱 | missing | consensus: 平/十蒸 (charles, jkak, cope) |
| 塍 | missing | consensus: 平/十蒸 (charles, jkak, cope) |
| 矜 | default mismatch | default: 平/十一真, consensus: 平/十蒸 (charles,jkak,cope) |
| 薨 | default mismatch | default: 平/八庚, consensus: 平/十蒸 (charles,jkak,cope) |
| 恒 | missing | consensus: 平/十蒸 (charles, jkak, cope) |
| 榴 | missing | consensus: 平/十一尤 (charles, jkak, cope) |
| 辀 | missing | consensus: 平/十一尤 (charles, jkak, cope) |
| 陬 | default mismatch | default: 平/七虞, consensus: 平/十一尤 (charles,jkak,cope) |
| 镠 | missing | consensus: 平/十一尤 (charles, jkak) |
| 鹠 | missing | consensus: 平/十一尤 (charles, jkak) |
| 瘤 | missing | consensus: 平/十一尤, 仄/二十六宥 (charles, jkak, cope) |
| 鹙 | missing | consensus: 平/十一尤 (charles, jkak) |
| 赒 | missing | consensus: 平/十一尤 (charles, jkak) |
| 媮 | missing | consensus: 平/十一尤 (charles, jkak) |
| 紑 | default mismatch | default: 平/七虞, consensus: 平/十一尤 (charles,jkak) |
| 緅 | default mismatch | default: 平/七虞, consensus: 平/十一尤 (charles,jkak) |
| 頄 | default mismatch | default: 平/四支, consensus: 平/十一尤 (charles,jkak) |
| 诪 | missing | consensus: 平/十一尤 (charles, jkak) |
| 廔 | default mismatch | default: 平/七虞, consensus: 平/十一尤 (charles,jkak) |
| 泑 | default mismatch | default: 平/三肴, consensus: 平/十一尤 (charles,jkak); 仄/二十五有 (charles,jkak) |
| 骎 | missing | consensus: 平/十二侵 (charles, jkak, cope) |
| 纴 | missing | consensus: 平/十二侵, 仄/二十七沁 (charles, jkak) |
| 嵚 | missing | consensus: 平/十二侵 (charles, jkak, cope) |
| 喑 | default mismatch | default: 平/十三覃, consensus: 平/十二侵 (charles,jkak,cope); 仄/二十七沁 (charles,jkak,cope) |
| 椮 | missing | consensus: 平/十二侵, 仄/二十七感 (charles, jkak) |
| 楠 | missing | consensus: 平/十三覃 (charles, jkak, cope) |
| 髯 | missing | consensus: 平/十四鹽 (charles, jkak, cope) |
| 铦 | missing | consensus: 平/十四鹽 (charles, jkak) |
| 挦 | missing | consensus: 平/十四鹽 (charles, jkak) |
| 鳒 | missing | consensus: 平/十四鹽 (charles, jkak) |
| 崄 | missing | consensus: 仄/二十八琰 (charles, jkak) |
| 黚 | default mismatch | default: 平/十二侵, consensus: 平/十四鹽 (charles,jkak); 仄/二十八勘 (charles,jkak) |
| 镵 | missing | consensus: 平/十五咸, 仄/三十陷 (charles, jkak) |
| 唝 | missing | consensus: 仄/一董 (charles, jkak) |
| 蓯 | default mismatch | default: 平/二冬, consensus: 仄/一董 (charles,jkak) |
| 垄 | missing | consensus: 仄/二腫 (charles, jkak) |
| 否 | default mismatch | default: 平/十一尤, consensus: 仄/四紙 (charles,jkak,cope); 仄/七麌 (charles,jkak,cope); 仄/二十五有 (charles,jkak,cope) |
| 蟻 | default mismatch | default: 仄/二十哿, consensus: 仄/四紙 (charles,jkak,cope); 仄/五尾 (charles,jkak) |
| 跂 | default mismatch | default: 平/四支, consensus: 仄/四紙 (charles,jkak,cope); 仄/四寘 (charles,jkak) |
| 薳 | default mismatch | default: 仄/十三阮, consensus: 仄/四紙 (charles,jkak) |
| 鞞 | default mismatch | default: 平/八齊, consensus: 仄/四紙 (charles,jkak) |
| 阤 | default mismatch | default: 平/五歌, consensus: 仄/四紙 (charles,jkak) |
| 被 | default mismatch | default: 平/四支, consensus: 仄/四紙 (charles,jkak); 仄/四寘 (charles,jkak,cope) |
| 巋 | default mismatch | default: 平/五微, consensus: 仄/四紙 (charles,jkak); 仄/四寘 (charles,jkak) |
| 誃 | default mismatch | default: 平/四支, consensus: 仄/四紙 (charles,jkak) |
| 惢 | default mismatch | default: 平/四支, consensus: 仄/四紙 (charles,jkak) |
| 旖 | default mismatch | default: 平/四支, consensus: 仄/四紙 (charles,jkak,cope) |
| 仳 | default mismatch | default: 平/四支, consensus: 仄/四紙 (charles,jkak) |
| 呰 | default mismatch | default: 平/四支, consensus: 仄/四紙 (charles,jkak) |
| 蟣 | default mismatch | default: 平/五微, consensus: 仄/五尾 (charles,jkak,cope) |
| 蜚 | default mismatch | default: 平/五微, consensus: 仄/五尾 (charles,jkak); 仄/五未 (charles,jkak,cope) |
| 蜰 | default mismatch | default: 平/五微, consensus: 仄/五尾 (charles,jkak) |
| 唏 | default mismatch | default: 平/五微, consensus: 仄/五尾 (charles,jkak) |
| 纻 | missing | consensus: 仄/六語 (charles, jkak) |
| 敘 | missing | consensus: 仄/六語 (charles, jkak, cope) |
| 詛 | default mismatch | default: 仄/七遇, consensus: 仄/六語 (charles,cope); 仄/六御 (charles,jkak) |
| 齟 | default mismatch | default: 平/六麻, consensus: 仄/六語 (charles,jkak) |
| 嶁 | default mismatch | default: 平/十一尤, consensus: 仄/七麌 (charles,jkak); 仄/二十五有 (charles,jkak) |
| 冔 | default mismatch | default: 平/七虞, consensus: 仄/七麌 (charles,jkak) |
| 瞴 | default mismatch | default: 平/七虞, consensus: 仄/七麌 (charles,jkak) |
| 蔖 | default mismatch | default: 平/五歌, consensus: 仄/七麌 (charles,jkak) |
| 豎 | missing | consensus: 仄/七麌 (charles, jkak, cope) |
| 莆 | default mismatch | default: 平/七虞, consensus: 仄/七麌 (charles,jkak) |
| 喣 | default mismatch | default: 平/七虞, consensus: 仄/七麌 (charles,jkak) |
| 窶 | default mismatch | default: 平/十一尤, consensus: 仄/七麌 (charles,jkak,cope) |
| 啟 | missing | consensus: 仄/八薺 (charles, jkak, cope) |
| 柢 | default mismatch | default: 平/八齊, consensus: 仄/八薺 (charles,jkak,cope); 仄/八霽 (charles,jkak) |
| 欐 | default mismatch | default: 平/四支, consensus: 仄/八薺 (charles,jkak); 仄/八霽 (charles,jkak) |
| 奶 | missing | consensus: 仄/九蟹 (charles, jkak) |
| 餵 | missing | consensus: 仄/十賄, 仄/四寘 (charles, jkak) |
| 櫑 | default mismatch | default: 平/十灰, consensus: 仄/十賄 (charles,jkak) |
| 廆 | default mismatch | default: 平/十灰, consensus: 仄/十賄 (charles,jkak) |
| 闿 | missing | consensus: 仄/十賄 (charles, jkak, cope) |
| 娞 | default mismatch | default: 平/四支, consensus: 仄/十賄 (charles,jkak) |
| 叆 | missing | consensus: 仄/十一隊 (charles, jkak) |
| 叇 | missing | consensus: 仄/十一隊 (charles, jkak) |
| 纼 | missing | consensus: 仄/十一軫 (charles, jkak) |
| 湣 | default mismatch | default: 平/十一真, consensus: 仄/十一軫 (charles,jkak) |
| 讱 | missing | consensus: 仄/十二震 (charles, jkak) |
| 馻 | default mismatch | default: 平/十一真, consensus: 仄/十一軫 (charles,jkak); 仄/十六銑 (charles,jkak) |
| 弅 | default mismatch | default: 平/十二文, consensus: 仄/十二吻 (charles,jkak) |
| 韞 | default mismatch | default: 平/十三元, consensus: 仄/十二吻 (charles,jkak,cope) |
| 醞 | missing | consensus: 仄/十三問 (charles, jkak, cope) |
| 揾 | missing | consensus: 仄/十二吻, 仄/十四願 (charles, jkak, cope) |
| 壸 | missing | consensus: 仄/十三阮 (charles, jkak) |
| 焜 | default mismatch | default: 平/十三元, consensus: 仄/十三阮 (charles,jkak) |
| 滚 | missing | consensus: 仄/十三阮 (charles, jkak, cope) |
| 齦 | default mismatch | default: 平/十二文, consensus: 仄/十三阮 (charles,jkak,cope) |
| 睕 | default mismatch | default: 平/十四寒, consensus: 仄/十三阮 (charles,jkak) |
| 愃 | default mismatch | default: 平/十三元, consensus: 仄/十三阮 (charles,jkak) |
| 緩 | default mismatch | default: 仄/十三阮, consensus: 仄/十四旱 (charles,jkak,cope) |
| 繵 | default mismatch | default: 平/十四寒, consensus: 仄/十四旱 (charles,jkak) |
| 捖 | default mismatch | default: 平/十四寒, consensus: 仄/十四旱 (charles,jkak) |
| 裋 | default mismatch | default: 仄/七麌, consensus: 仄/十四旱 (charles,jkak); 仄/七遇 (charles,jkak) |
| 產 | missing | consensus: 仄/十五潸 (charles, jkak, cope) |
| 浐 | missing | consensus: 仄/十五潸 (charles, jkak) |
| 舛 | default mismatch | default: 仄/十一軫, consensus: 仄/十六銑 (charles,jkak,cope) |
| 狝 | missing | consensus: 仄/十六銑 (charles, jkak) |
| 鄟 | default mismatch | default: 平/一先, consensus: 仄/十六銑 (charles,jkak) |
| 繾 | default mismatch | default: 仄/十一軫, consensus: 仄/十六銑 (charles,jkak,cope); 仄/十七霰 (charles,jkak) |
| 諞 | default mismatch | default: 平/一先, consensus: 仄/十六銑 (charles,jkak) |
| 謰 | default mismatch | default: 平/一先, consensus: 仄/十六銑 (charles,jkak) |
| 沇 | default mismatch | default: 仄/十一軫, consensus: 仄/十六銑 (charles,jkak) |
| 剪 | missing | consensus: 仄/十六銑 (charles, jkak, cope) |
| 殍 | default mismatch | default: 平/七虞, consensus: 仄/十七筱 (charles,jkak,cope) |
| 憭 | default mismatch | default: 平/二蕭, consensus: 仄/十七筱 (charles,jkak) |
| 茆 | default mismatch | default: 平/三肴, consensus: 仄/十八巧 (charles,jkak,cope); 仄/二十五有 (charles,jkak) |
| 繰 | default mismatch | default: 平/二蕭, consensus: 仄/十九皓 (charles,jkak) |
| 轑 | default mismatch | default: 平/四豪, consensus: 仄/十九皓 (charles,jkak) |
| 芺 | default mismatch | default: 仄/十七筱, consensus: 仄/十九皓 (charles,jkak) |
| 舸 | default mismatch | default: 平/五歌, consensus: 仄/二十哿 (charles,jkak,cope) |
| ... | ... | (269 more) |

## MEDIUM Findings

Our default not matching any single-source reference reading.

| Char | Our Default | Ref Readings |
|------|------------|-------------|
| 濔 | 仄/八薺 | 仄/四紙 (charles) |
| 寧 | 平/九青 | 仄/二十五徑 (charles) |
| 挖 | 仄/八黠 | 仄/七曷 (jkak) |
| 㩻 | 平/四支 | 仄/四寘 (jkak) |
| 煖 | 平/十三元 | 仄/十四旱 (jkak) |

## LOW Findings

2560 chars in our dictionary but not in any reference.

Sample (first 30):

```
葱 冲 曨 渢 种 囱 鮦 鶲 吁 涂 癯 楡 污 于 兪 菰 嬃 闍 喩 鵐 漊 瘻 鸏 秸 凶 穠 衝 鎔 顒 丰
```

## Appendix: Previously Patched Characters

Cross-referencing our 10 previously-patched chars against consensus.

| Char | Our Readings | Consensus | Status |
|------|-------------|-----------|--------|
| 种 | 仄/二腫, 仄/二宋, 平/一東 | not in any reference | unique to us |
| 据 | 仄/六御, 平/六魚 | not in any reference | unique to us |
| 干 | 仄/十五翰, 平/十四寒 | not in any reference | unique to us |
| 肮 | 仄/二十二養, 平/七陽 | not in any reference | unique to us |
| 睾 | 仄/十一陌, 平/四豪 | not in any reference | unique to us |
| 宁 | 平/九青, 仄/六語 | 平/九青 (charles,jkak,cope); 仄/六語 (charles,jkak); 仄/二十五徑 (jkak,cope) | OK |
| 听 | 平/九青, 仄/十二吻 | not in any reference | unique to us |
| 几 | 平/五微, 仄/五尾, 仄/四寘, 仄/四紙 | not in any reference | unique to us |
| 徑 | 仄/二十五徑, 平/九青 | 仄/二十五徑 (charles,jkak,cope) | OK |
| 研 | 平/一先 | 平/一先 (charles,jkak,cope); 仄/十七霰 (charles,jkak,cope) | OK |
| 種 | 仄/二腫, 仄/二宋 | 平/一東 (charles,jkak); 仄/二腫 (charles,jkak,cope); 仄/二宋 (charles,jkak,cope) | OK |
| 據 | 仄/六御 | 平/六魚 (charles,jkak,cope); 仄/六御 (charles,jkak,cope) | OK |
| 幹 | 仄/十五翰 | 平/十四寒 (charles,jkak,cope); 仄/十五翰 (charles,jkak,cope) | OK |
| 骯 | 仄/二十二養 | 仄/二十二養 (jkak,cope) | OK |
| 寧 | 平/九青 | 仄/二十五徑 (charles) [unconfirmed] | no consensus |
| 聽 | 平/九青 | 平/九青 (charles,jkak,cope); 仄/十二吻 (charles,jkak); 仄/二十五徑 (charles,jkak,cope) | OK |
| 幾 | 平/五微, 仄/五尾, 仄/四寘 | 平/五微 (charles,jkak,cope); 仄/四紙 (charles,jkak,cope); 仄/五尾 (charles,jkak,cope); 仄/四寘 (charles,jkak) | OK |
