# Pingshui Dictionary Audit Report v2

Generated: 2026-05-02

## Coverage Statistics

| Metric | Count |
|--------|-------|
| Our dictionary chars | 21974 |
| Consensus chars (union of 3 refs) | 19700 |
| In both | 19414 |
| Only in ours | 2560 |
| Only in consensus | 286 |

## Findings Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 9 |
| HIGH | 123 |
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
| 圈 | default mismatch | default: 平/一先, consensus: 平/十三元 (charles,cope); 仄/十三阮 (charles,jkak); 仄/十四願 (charles,jkak,cope) |
| 浾 | default mismatch | default: 平/八庚, consensus: 平/六麻 (charles,jkak) |
| 挦 | default mismatch | default: 平/十三覃, consensus: 平/十四鹽 (charles,jkak) |
| 鳒 | default mismatch | default: 平/十五咸, consensus: 平/十四鹽 (charles,jkak) |
| 崄 | default mismatch | default: 平/十四鹽, consensus: 仄/二十八琰 (charles,jkak) |
| 唏 | default mismatch | default: 平/五微, consensus: 仄/五尾 (charles,jkak) |
| 詛 | default mismatch | default: 仄/七遇, consensus: 仄/六語 (charles,cope); 仄/六御 (charles,jkak) |
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
| 瞆 | missing | consensus:  (charles, jkak) |
| 佐 | default mismatch | default: 仄/二十哿, consensus: 仄/二十一箇 (charles,jkak,cope) |
| 跼 | missing | consensus:  (charles, cope) |
| 矞 | default mismatch | default: 仄/九屑, consensus: 仄/四質 (charles,jkak) |
| 韨 | missing | consensus: 仄/五物 (charles, jkak) |
| 熨 | default mismatch | default: 仄/五未, consensus: 仄/五物 (charles,jkak,cope) |
| 歇 | default mismatch | default: 仄/七曷, consensus: 仄/六月 (charles,jkak,cope) |
| 碣 | default mismatch | default: 仄/七曷, consensus: 仄/六月 (charles,jkak,cope); 仄/九屑 (charles,jkak,cope) |
| 龁 | missing | consensus: 仄/六月 (charles, jkak) |
| 麧 | default mismatch | default: 仄/九屑, consensus: 仄/六月 (charles,jkak) |
| 棁 | missing | consensus: 仄/六月, 仄/九屑 (charles, jkak) |
| 抈 | default mismatch | default: 仄/七曷, consensus: 仄/六月 (charles,jkak) |
| 閼 | default mismatch | default: 平/一先, consensus: 仄/六月 (charles,jkak); 仄/七曷 (charles,jkak) |
| 堨 | default mismatch | default: 仄/九泰, consensus: 仄/六月 (charles,jkak); 仄/七曷 (charles,jkak) |
| 阢 | default mismatch | default: 平/十灰, consensus: 仄/六月 (charles,jkak) |
| 達 | default mismatch | default: 仄/八霽, consensus: 仄/七曷 (charles,jkak,cope) |
| 鹖 | missing | consensus: 仄/七曷 (charles, jkak) |
| 袯 | missing | consensus: 仄/七曷 (charles, jkak) |
| 缽 | missing | consensus: 仄/七曷 (charles, jkak, cope) |
| 妲 | default mismatch | default: 仄/十五翰, consensus: 仄/七曷 (charles,jkak) |
| 靼 | default mismatch | default: 仄/十四旱, consensus: 仄/七曷 (charles,jkak) |
| 狚 | default mismatch | default: 仄/十四旱, consensus: 仄/七曷 (charles,jkak) |
| 瘌 | default mismatch | default: 仄/九泰, consensus: 仄/七曷 (charles,jkak,cope) |
| 脟 | default mismatch | default: 平/三肴, consensus: 仄/七曷 (charles,jkak) |
| 汃 | default mismatch | default: 平/十一真, consensus: 仄/八黠 (charles,jkak) |
| 叭 | default mismatch | default: 平/六麻, consensus: 仄/八黠 (charles,jkak,cope) |
| 朳 | default mismatch | default: 仄/九屑, consensus: 仄/八黠 (charles,jkak) |
| 捌 | default mismatch | default: 仄/九屑, consensus: 仄/八黠 (charles,jkak,cope) |
| 絕 | missing | consensus: 仄/九屑 (charles, jkak, cope) |
| 噎 | default mismatch | default: 仄/八霽, consensus: 仄/九屑 (charles,jkak,cope) |
| 閱 | missing | consensus: 仄/九屑 (charles, jkak, cope) |
| 绖 | missing | consensus: 仄/九屑 (charles, jkak) |
| 孽 | missing | consensus: 仄/九屑 (charles, jkak, cope) |
| 猰 | default mismatch | default: 平/八齊, consensus: 仄/九屑 (charles,jkak) |
| 幕 | default mismatch | default: 仄/十二錫, consensus: 仄/十藥 (charles,jkak,cope) |
| 谑 | missing | consensus: 仄/十藥 (charles, jkak, cope) |
| 莫 | default mismatch | default: 仄/七遇, consensus: 仄/十藥 (charles,jkak,cope); 仄/十一陌 (charles,jkak) |
| 饦 | missing | consensus: 仄/十藥 (charles, jkak) |
| 镈 | missing | consensus: 仄/十藥 (charles, jkak) |
| 臛 | default mismatch | default: 仄/二沃, consensus: 仄/十藥 (charles,jkak) |
| 萚 | missing | consensus: 仄/十藥 (charles, jkak) |
| 摸 | default mismatch | default: 平/七虞, consensus: 仄/十藥 (charles,jkak,cope) |
| 婼 | default mismatch | default: 平/六麻, consensus: 仄/十藥 (charles,jkak) |
| 剫 | default mismatch | default: 仄/七麌, consensus: 仄/十藥 (charles,jkak) |
| 婥 | default mismatch | default: 仄/十九效, consensus: 仄/十藥 (charles,jkak) |
| 渃 | default mismatch | default: 仄/二十二禡, consensus: 仄/十藥 (charles,jkak) |
| 跅 | default mismatch | default: 仄/十一陌, consensus: 仄/十藥 (charles,jkak) |
| 腭 | missing | consensus: 仄/十藥 (charles, jkak) |
| 鱷 | missing | consensus: 仄/十藥 (charles, jkak, cope) |
| 婳 | missing | consensus: 仄/十一陌 (charles, jkak) |
| 绤 | missing | consensus: 仄/十一陌 (charles, jkak) |
| 跖 | missing | consensus: 仄/十一陌 (charles, cope) |
| 檡 | default mismatch | default: 平/七虞, consensus: 仄/十一陌 (charles,jkak) |
| 啯 | missing | consensus: 仄/十一陌 (charles, jkak) |
| 鹡 | missing | consensus: 仄/十一陌 (charles, jkak, cope) |
| 溺 | default mismatch | default: 仄/十八嘯, consensus: 仄/十二錫 (charles,jkak,cope) |
| 鹢 | missing | consensus: 仄/十二錫 (charles, jkak, cope) |
| 轢 | default mismatch | default: 仄/七曷, consensus: 仄/十二錫 (charles,jkak,cope); 仄/十藥 (jkak,cope) |
| 鹝 | missing | consensus: 仄/十二錫 (charles, jkak) |
| 荝 | missing | consensus: 仄/十三職 (charles, jkak) |
| 檍 | default mismatch | default: 仄/四寘, consensus: 仄/十三職 (charles,jkak) |
| 钑 | missing | consensus: 仄/十四緝, 仄/十五合 (charles, jkak) |
| 諿 | default mismatch | default: 仄/六語, consensus: 仄/十四緝 (charles,jkak) |
| 湆 | default mismatch | default: 仄/十七洽, consensus: 仄/十四緝 (charles,jkak) |
| 圾 | default mismatch | default: 仄/十五合, consensus: 仄/十四緝 (charles,jkak,cope) |
| 阘 | missing | consensus: 仄/十五合 (charles, jkak) |
| 姶 | default mismatch | default: 仄/十七洽, consensus: 仄/十五合 (charles,jkak) |
| 詟 | missing | consensus: 仄/十六葉 (charles, jkak) |
| 獦 | default mismatch | default: 仄/七曷, consensus: 仄/十六葉 (charles,jkak) |
| 鰈 | default mismatch | default: 仄/十五合, consensus: 仄/十六葉 (charles,jkak,cope) |
| 馌 | missing | consensus: 仄/十六葉 (charles, jkak) |
| 孿 | default mismatch | default: 平/一先, consensus: 仄/十六諫 (jkak,cope) |
| 曝 | default mismatch | default: 仄/二十號, consensus: 仄/一屋 (jkak,cope) |
| 獾 | missing | consensus: 平/十四寒 (jkak, cope) |
| 着 | missing | consensus: 仄/十藥 (jkak, cope) |
| 乾 | default mismatch | default: 平/十四寒, consensus: 平/一先 (jkak,cope) |
| 吵 | default mismatch | default: 平/三肴, consensus: 仄/十八巧 (jkak,cope) |
| 拿 | missing | consensus: 平/六麻 (jkak, cope) |

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
