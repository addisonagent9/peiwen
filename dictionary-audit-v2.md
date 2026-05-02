# Pingshui Dictionary Audit Report v2

Generated: 2026-05-02

## Coverage Statistics

| Metric | Count |
|--------|-------|
| Our dictionary chars | 22016 |
| Consensus chars (union of 3 refs) | 19700 |
| In both | 19456 |
| Only in ours | 2560 |
| Only in consensus | 244 |

## Findings Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 9 |
| HIGH | 12 |
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
| 瞆 | missing | consensus:  (charles, jkak) |
| 佐 | default mismatch | default: 仄/二十哿, consensus: 仄/二十一箇 (charles,jkak,cope) |
| 跼 | missing | consensus:  (charles, cope) |

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
