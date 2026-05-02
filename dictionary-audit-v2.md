# Pingshui Dictionary Audit Report v2

Generated: 2026-05-02

## Coverage Statistics

| Metric | Count |
|--------|-------|
| Our dictionary chars | 21863 |
| Consensus chars (union of 3 refs) | 19700 |
| In both | 19303 |
| Only in ours | 2560 |
| Only in consensus | 397 |

## Findings Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 9 |
| HIGH | 375 |
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
| 浾 | default mismatch | default: 平/八庚, consensus: 平/六麻 (charles,jkak) |
| 挦 | default mismatch | default: 平/十三覃, consensus: 平/十四鹽 (charles,jkak) |
| 鳒 | default mismatch | default: 平/十五咸, consensus: 平/十四鹽 (charles,jkak) |
| 崄 | default mismatch | default: 平/十四鹽, consensus: 仄/二十八琰 (charles,jkak) |
| 唏 | default mismatch | default: 平/五微, consensus: 仄/五尾 (charles,jkak) |
| 詛 | default mismatch | default: 仄/七遇, consensus: 仄/六語 (charles,cope); 仄/六御 (charles,jkak) |
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
| 亸 | missing | consensus: 仄/二十哿 (charles, jkak, cope) |
| 柁 | default mismatch | default: 平/五歌, consensus: 仄/二十哿 (charles,jkak) |
| 蠃 | default mismatch | default: 平/五歌, consensus: 仄/二十哿 (charles,jkak) |
| 砢 | default mismatch | default: 平/五歌, consensus: 仄/二十哿 (charles,jkak) |
| 婀 | default mismatch | default: 平/五歌, consensus: 仄/二十哿 (charles,jkak,cope) |
| 縒 | default mismatch | default: 平/四支, consensus: 仄/二十哿 (charles,jkak) |
| 袲 | default mismatch | default: 平/四支, consensus: 仄/二十哿 (charles,jkak) |
| 下 | default mismatch | default: 仄/七麌, consensus: 仄/二十一馬 (charles,jkak,cope); 仄/二十二禡 (charles,jkak,cope) |
| 雅 | default mismatch | default: 平/六麻, consensus: 仄/二十一馬 (charles,jkak,cope) |
| 鲊 | missing | consensus: 仄/二十一馬 (charles, jkak) |
| 槚 | missing | consensus: 仄/二十一馬 (charles, jkak) |
| 扯 | missing | consensus: 仄/二十一馬 (charles, jkak) |
| 癢 | default mismatch | default: 平/七陽, consensus: 仄/二十二養 (charles,jkak,cope) |
| 仰 | default mismatch | default: 平/七陽, consensus: 仄/二十二養 (charles,jkak,cope); 仄/二十三漾 (charles,jkak) |
| 獎 | missing | consensus: 仄/二十二養 (charles, jkak, cope) |
| 崵 | default mismatch | default: 平/七陽, consensus: 仄/二十二養 (charles,jkak) |
| 蕩 | default mismatch | default: 平/七陽, consensus: 仄/二十二養 (charles,jkak,cope); 仄/二十三漾 (charles,jkak) |
| 蚃 | missing | consensus: 仄/二十二養 (charles, jkak) |
| 鯗 | missing | consensus: 仄/二十二養 (charles, jkak, cope) |
| 臟 | missing | consensus: 仄/二十二養, 仄/二十三漾 (charles, jkak, cope) |
| 蚢 | default mismatch | default: 平/七陽, consensus: 仄/二十二養 (charles,jkak) |
| 請 | default mismatch | default: 平/八庚, consensus: 仄/二十三梗 (charles,jkak,cope); 仄/二十四敬 (charles,jkak) |
| 箵 | default mismatch | default: 平/九青, consensus: 仄/二十三梗 (charles,jkak) |
| 埂 | default mismatch | default: 平/八庚, consensus: 仄/二十三梗 (charles,jkak) |
| 颋 | missing | consensus: 仄/二十四迥 (charles, jkak) |
| 诇 | missing | consensus: 仄/二十四迥, 仄/二十四敬 (charles, jkak) |
| 颎 | missing | consensus: 仄/二十四迥 (charles, jkak) |
| 拇 | default mismatch | default: 仄/七麌, consensus: 仄/二十五有 (charles,jkak,cope) |
| 赳 | default mismatch | default: 平/十一尤, consensus: 仄/二十五有 (charles,jkak,cope) |
| 趣 | default mismatch | default: 平/七虞, consensus: 仄/二十五有 (charles,jkak); 仄/七遇 (charles,jkak,cope); 仄/二沃 (charles,jkak) |
| 瞍 | default mismatch | default: 平/二蕭, consensus: 仄/二十五有 (charles,jkak) |
| 嘍 | default mismatch | default: 平/十一尤, consensus: 仄/二十五有 (charles,jkak) |
| 瞫 | default mismatch | default: 平/十三覃, consensus: 仄/二十六寢 (charles,jkak) |
| 罧 | default mismatch | default: 平/十二侵, consensus: 仄/二十七沁 (charles,jkak) |
| 槧 | default mismatch | default: 平/十四鹽, consensus: 仄/二十七感 (charles,jkak,cope); 仄/二十九艷 (charles,jkak) |
| 欿 | default mismatch | default: 平/十三覃, consensus: 仄/二十七感 (charles,jkak) |
| 襑 | default mismatch | default: 平/十二侵, consensus: 仄/二十七感 (charles,jkak) |
| 嘾 | default mismatch | default: 平/十三覃, consensus: 仄/二十七感 (charles,jkak) |
| 濫 | default mismatch | default: 仄/二十八勘, consensus: 仄/二十七感 (charles,jkak) |
| 掩 | default mismatch | default: 仄/二十七感, consensus: 仄/二十八琰 (charles,jkak,cope) |
| 奄 | default mismatch | default: 平/十四鹽, consensus: 仄/二十八琰 (charles,jkak,cope) |
| 飐 | missing | consensus: 仄/二十八琰 (charles, jkak) |
| 慊 | default mismatch | default: 平/十四鹽, consensus: 仄/二十八琰 (charles,jkak) |
| 溓 | default mismatch | default: 平/十五咸, consensus: 仄/二十八琰 (charles,jkak) |
| 黡 | missing | consensus: 仄/二十八琰 (charles, jkak) |
| 蘞 | default mismatch | default: 平/十四鹽, consensus: 仄/二十八琰 (charles,jkak) |
| 譣 | default mismatch | default: 平/十四鹽, consensus: 仄/二十八琰 (charles,jkak) |
| 嬐 | default mismatch | default: 平/十四鹽, consensus: 仄/二十八琰 (charles,jkak) |
| 黯 | default mismatch | default: 平/十五咸, consensus: 仄/二十九豏 (charles,jkak,cope) |
| 滥 | missing | consensus: 仄/二十九豏, 仄/二十八勘 (charles, jkak, cope) |
| 哄 | default mismatch | default: 平/一東, consensus: 仄/一送 (charles,jkak,cope) |
| 赗 | missing | consensus: 仄/一送 (charles, jkak) |
| 統 | default mismatch | default: 仄/一董, consensus: 仄/二宋 (charles,jkak,cope) |
| 疭 | missing | consensus: 仄/二宋 (charles, jkak) |
| 緟 | default mismatch | default: 平/二冬, consensus: 仄/二宋 (charles,jkak) |
| 餌 | default mismatch | default: 仄/四紙, consensus: 仄/四寘 (charles,jkak,cope) |
| 廁 | missing | consensus: 仄/四寘 (charles, jkak, cope) |
| 睟 | default mismatch | default: 仄/十一隊, consensus: 仄/四寘 (charles,jkak) |
| 穊 | default mismatch | default: 仄/五未, consensus: 仄/四寘 (charles,jkak) |
| 赑 | missing | consensus: 仄/四寘 (charles, jkak) |
| 饎 | default mismatch | default: 平/四支, consensus: 仄/四寘 (charles,jkak) |
| 勚 | missing | consensus: 仄/四寘 (charles, jkak) |
| 值 | missing | consensus: 仄/四寘, 仄/十三職 (charles, jkak, cope) |
| 蠔 | default mismatch | default: 平/四豪, consensus: 仄/四寘 (charles,jkak) |
| 塈 | missing | consensus: 仄/四寘, 仄/五未 (charles, jkak) |
| 甀 | default mismatch | default: 平/四支, consensus: 仄/四寘 (charles,jkak) |
| 疐 | default mismatch | default: 仄/八霽, consensus: 仄/四寘 (charles,jkak) |
| 袘 | default mismatch | default: 平/四支, consensus: 仄/四寘 (charles,jkak) |
| 偽 | missing | consensus: 仄/四寘 (charles, jkak, cope) |
| 槜 | missing | consensus: 仄/四寘 (charles, jkak) |
| 屃 | missing | consensus: 仄/四寘 (charles, jkak) |
| 溉 | missing | consensus: 仄/五未, 仄/十一隊 (charles, jkak, cope) |
| 既 | missing | consensus: 仄/五未 (charles, jkak, cope) |
| 禨 | default mismatch | default: 平/五微, consensus: 仄/五未 (charles,jkak) |
| 概 | missing | consensus: 仄/十一隊 (charles, jkak, cope) |
| 慮 | default mismatch | default: 平/六魚, consensus: 仄/六御 (charles,jkak,cope) |
| 滪 | missing | consensus: 仄/六御 (charles, jkak) |
| 瘀 | default mismatch | default: 平/六魚, consensus: 仄/六御 (charles,jkak) |
| 鸒 | default mismatch | default: 平/六魚, consensus: 仄/六御 (charles,jkak) |
| 跗 | default mismatch | default: 平/七虞, consensus: 仄/七遇 (charles,jkak) |
| 作 | default mismatch | default: 仄/六語, consensus: 仄/七遇 (charles,jkak); 仄/二十一箇 (charles,jkak,cope); 仄/十藥 (charles,jkak,cope) |
| 婟 | default mismatch | default: 仄/七麌, consensus: 仄/七遇 (charles,jkak) |
| 銳 | missing | consensus: 仄/八霽 (charles, jkak, cope) |
| 蒂 | missing | consensus: 仄/八霽 (charles, jkak, cope) |
| 轪 | missing | consensus: 仄/八霽, 仄/九泰 (charles, jkak) |
| 鳀 | missing | consensus: 仄/八霽 (charles, jkak) |
| 忕 | default mismatch | default: 仄/九泰, consensus: 仄/八霽 (charles,jkak) |
| 盻 | default mismatch | default: 仄/八薺, consensus: 仄/八霽 (charles,jkak) |
| 裞 | default mismatch | default: 仄/九泰, consensus: 仄/八霽 (charles,jkak) |
| 犡 | default mismatch | default: 仄/九泰, consensus: 仄/八霽 (charles,jkak) |
| 翙 | missing | consensus: 仄/九泰 (charles, jkak) |
| 瞆 | missing | consensus:  (charles, jkak) |
| 攦 | default mismatch | default: 仄/四紙, consensus: 仄/十卦 (charles,jkak) |
| 繢 | default mismatch | default: 平/十灰, consensus: 仄/十一隊 (charles,jkak) |
| ... | ... | (175 more) |

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
