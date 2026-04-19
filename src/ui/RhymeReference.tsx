import React, { useMemo, useState } from "react";
import { PINGSHUI_RHYME } from "../data/pingshui";
import { pinyin } from "pinyin-pro";
import type { Translations } from "../i18n";

interface Props {
  t: Translations;
  onBack: () => void;
}

const SECTIONS: Array<{ label: string; groups: string[] }> = [
  { label: "上平聲", groups: [
    "一東","二冬","三江","四支","五微","六魚","七虞","八齊","九佳","十灰",
    "十一眞","十二文","十三元","十四寒","十五刪"
  ]},
  { label: "下平聲", groups: [
    "一先","二蕭","三肴","四豪","五歌","六麻","七陽","八庚","九青","十蒸",
    "十一尤","十二侵","十三覃","十四鹽","十五咸"
  ]},
  { label: "上聲", groups: [
    "一董","二腫","三講","四紙","五尾","六語","七麌","八薺","九蟹","十賄",
    "十一軫","十二吻","十三阮","十四旱","十五潸","十六銑","十七筱","十八巧",
    "十九皓","二十哿","二十一馬","二十二養","二十三梗","二十四迥","二十五有",
    "二十六寢","二十七感","二十八琰","二十九豏"
  ]},
  { label: "去聲", groups: [
    "一送","二宋","三絳","四寘","五未","六御","七遇","八霽","九泰","十卦",
    "十一隊","十二震","十三問","十四願","十五翰","十六諫","十七霰","十八嘯",
    "十九效","二十號","二十一箇","二十二禡","二十三漾","二十四敬","二十五徑",
    "二十六宥","二十七沁","二十八勘","二十九豔","三十陷"
  ]},
  { label: "入聲", groups: [
    "一屋","二沃","三覺","四質","五物","六月","七曷","八黠","九屑","十藥",
    "十一陌","十二錫","十三職","十四緝","十五合","十六葉","十七洽"
  ]}
];

function isCommon(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return code >= 0x4E00 && code <= 0x9FFF;
}

const RhymeGroup = React.memo(({ name, groupLabel, chars, showPinyin, showRare }: {
  name: string;
  groupLabel: string;
  chars: string[];
  showPinyin: boolean;
  showRare: boolean;
}) => {
  const filtered = showRare ? chars : chars.filter(isCommon);
  if (filtered.length === 0) return null;

  const pinyinMap = useMemo(() => {
    if (!showPinyin) return null;
    const m = new Map<string, string>();
    for (const ch of filtered) {
      m.set(ch, pinyin(ch, { toneType: "symbol" }));
    }
    return m;
  }, [showPinyin, filtered]);

  return (
    <div className="mb-4">
      <div className="text-creamDim text-sm font-sans mb-1">{groupLabel}{name}</div>
      <div className={showPinyin ? "flex flex-wrap gap-x-3 gap-y-1" : ""}>
        {showPinyin ? (
          filtered.map((ch, i) => (
            <span key={i} className="inline-flex flex-col items-center">
              <span className="text-lg font-serif text-cream leading-tight">{ch}</span>
              <span className="text-[10px] text-creamDim font-sans leading-tight">{pinyinMap?.get(ch) ?? ""}</span>
            </span>
          ))
        ) : (
          <span className="text-lg font-serif text-cream leading-[2] tracking-wide">
            {filtered.join("")}
          </span>
        )}
      </div>
    </div>
  );
});

export function RhymeReference({ t, onBack }: Props) {
  const [showPinyin, setShowPinyin] = useState(false);
  const [showRare, setShowRare] = useState(false);

  return (
    <div className="min-h-screen bg-ink-bg text-cream">
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="text-sm font-sans text-creamDim hover:text-gold"
          >← </button>
          <div className="text-3xl font-serif font-bold text-gold tracking-[0.15em]">{t.rhymeRefTitle}</div>
        </div>

        <div className="flex items-center gap-6 mb-6 text-sm font-sans">
          <label className="flex items-center gap-1.5 text-creamDim cursor-pointer">
            <input type="checkbox" checked={showPinyin} onChange={e => setShowPinyin(e.target.checked)} />
            {t.showPinyin}
          </label>
          <label className="flex items-center gap-1.5 text-creamDim cursor-pointer">
            <input type="checkbox" checked={showRare} onChange={e => setShowRare(e.target.checked)} />
            {t.showRareChars}
          </label>
        </div>

        {SECTIONS.map(section => (
          <div key={section.label} className="mb-8">
            <div className="text-xl font-serif text-gold mb-3 border-b border-ink-line pb-1">{section.label}</div>
            {section.groups.map(name => {
              const bucket = PINGSHUI_RHYME[name];
              if (!bucket) return null;
              return (
                <RhymeGroup
                  key={name}
                  name={name}
                  groupLabel={section.label.slice(0, -1)}
                  chars={bucket.chars}
                  showPinyin={showPinyin}
                  showRare={showRare}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
