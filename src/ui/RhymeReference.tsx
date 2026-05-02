import React, { useMemo, useState } from "react";
import { PINGSHUI_RHYME } from "../data/pingshui";
import { pinyin } from "pinyin-pro";
import { RhymeCharCard } from "./RhymeCharCard";
import type { Locale, Translations } from "../i18n";

interface Props {
  t: Translations;
  locale: Locale;
  onBack: () => void;
}

const PING_GROUPS = [
  "上平一東","上平二冬","上平三江","上平四支","上平五微","上平六魚","上平七虞","上平八齊",
  "上平九佳","上平十灰","上平十一眞","上平十二文","上平十三元","上平十四寒","上平十五刪",
  "下平一先","下平二蕭","下平三肴","下平四豪","下平五歌","下平六麻","下平七陽","下平八庚",
  "下平九青","下平十蒸","下平十一尤","下平十二侵","下平十三覃","下平十四鹽","下平十五咸"
];

const ZE_SECTIONS = [
  { key: "shangTone" as const, groups: [
    "上聲一董","上聲二腫","上聲三講","上聲四紙","上聲五尾","上聲六語","上聲七麌","上聲八薺",
    "上聲九蟹","上聲十賄","上聲十一軫","上聲十二吻","上聲十三阮","上聲十四旱","上聲十五潸",
    "上聲十六銑","上聲十七筱","上聲十八巧","上聲十九皓","上聲二十哿","上聲二十一馬",
    "上聲二十二養","上聲二十三梗","上聲二十四迥","上聲二十五有","上聲二十六寢",
    "上聲二十七感","上聲二十八琰","上聲二十九豏"
  ]},
  { key: "quTone" as const, groups: [
    "去聲一送","去聲二宋","去聲三絳","去聲四寘","去聲五未","去聲六御","去聲七遇","去聲八霽",
    "去聲九泰","去聲十卦","去聲十一隊","去聲十二震","去聲十三問","去聲十四願","去聲十五翰",
    "去聲十六諫","去聲十七霰","去聲十八嘯","去聲十九效","去聲二十號","去聲二十一箇",
    "去聲二十二禡","去聲二十三漾","去聲二十四敬","去聲二十五徑","去聲二十六宥",
    "去聲二十七沁","去聲二十八勘","去聲二十九艷","去聲三十陷"
  ]},
  { key: "ruTone" as const, groups: [
    "入聲一屋","入聲二沃","入聲三覺","入聲四質","入聲五物","入聲六月","入聲七曷","入聲八黠",
    "入聲九屑","入聲十藥","入聲十一陌","入聲十二錫","入聲十三職","入聲十四緝","入聲十五合",
    "入聲十六葉","入聲十七洽"
  ]}
];

function shortName(full: string): string {
  const prefixes = ["上平", "下平", "上聲", "去聲", "入聲"];
  for (const p of prefixes) {
    if (full.startsWith(p)) return full.slice(p.length);
  }
  return full;
}

function isCommon(ch: string): boolean {
  const code = ch.codePointAt(0) ?? 0;
  return code >= 0x4E00 && code <= 0x9FFF;
}

const RhymeGroup = React.memo(({ name, chars, showPinyin, showRare, onCharClick }: {
  name: string;
  chars: string[];
  showPinyin: boolean;
  showRare: boolean;
  onCharClick: (ch: string, rhyme: string) => void;
}) => {
  const filtered = showRare
    ? [...chars.filter(isCommon), ...chars.filter(c => !isCommon(c))]
    : chars.filter(isCommon);
  if (filtered.length === 0) return null;
  const rhyme = shortName(name);

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
      <div className="text-creamDim text-sm font-sans mb-1">{name}</div>
      <div className={showPinyin ? "flex flex-wrap gap-x-3 gap-y-1" : ""}>
        {showPinyin ? (
          filtered.map((ch, i) => {
            const rare = showRare && !isCommon(ch);
            return (
              <button
                key={i}
                onClick={() => onCharClick(ch, rhyme)}
                className="inline-flex flex-col items-center hover:text-gold transition-colors"
              >
                <span className={`text-lg font-serif leading-tight ${rare ? "text-rose-400" : "text-cream"}`}>{ch}</span>
                <span className="text-[10px] text-creamDim font-sans leading-tight">{pinyinMap?.get(ch) ?? ""}</span>
              </button>
            );
          })
        ) : (
          <span className="text-lg font-serif leading-[2] tracking-wide">
            {filtered.map((ch, i) => {
              const rare = showRare && !isCommon(ch);
              return (
                <button
                  key={i}
                  onClick={() => onCharClick(ch, rhyme)}
                  className={`hover:text-gold transition-colors ${rare ? "text-rose-400" : "text-cream"}`}
                >{ch}</button>
              );
            })}
          </span>
        )}
      </div>
    </div>
  );
});

function RhymeGroupList({ groups, showPinyin, showRare, onCharClick }: {
  groups: string[];
  showPinyin: boolean;
  showRare: boolean;
  onCharClick: (ch: string, rhyme: string) => void;
}) {
  return (
    <>
      {groups.map(name => {
        const bucket = PINGSHUI_RHYME[shortName(name)];
        if (!bucket) return null;
        return (
          <RhymeGroup
            key={name}
            name={name}
            chars={bucket.chars}
            showPinyin={showPinyin}
            showRare={showRare}
            onCharClick={onCharClick}
          />
        );
      })}
    </>
  );
}

export function RhymeReference({ t, locale, onBack }: Props) {
  const [showPinyin, setShowPinyin] = useState(false);
  const [showRare, setShowRare] = useState(false);
  const [activeTab, setActiveTab] = useState<"平" | "仄">("平");
  const [cardTarget, setCardTarget] = useState<{ char: string; rhyme: string } | null>(null);

  const handleCharClick = (ch: string, rhyme: string) => {
    setCardTarget({ char: ch, rhyme });
  };

  return (
    <div className="min-h-screen bg-ink-bg text-cream">
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="text-sm font-sans text-creamDim hover:text-gold"
          >← </button>
          <div className="text-3xl font-serif font-bold text-gold tracking-[0.15em]">{t.rhymeRefTitle}</div>
        </div>

        <div className="flex flex-wrap items-end gap-y-2 mb-6 border-b border-ink-line pb-0">
          <button
            onClick={() => setActiveTab("平")}
            className={`pb-2 text-lg font-serif transition mr-6 ${
              activeTab === "平"
                ? "text-gold border-b-2 border-gold font-bold"
                : "text-creamDim hover:text-gold cursor-pointer"
            }`}
          >{t.pingTab}</button>
          <button
            onClick={() => setActiveTab("仄")}
            className={`pb-2 text-lg font-serif transition ${
              activeTab === "仄"
                ? "text-gold border-b-2 border-gold font-bold"
                : "text-creamDim hover:text-gold cursor-pointer"
            }`}
          >{t.zeTab}</button>
          <div className="ml-auto flex items-center gap-6 pb-2 text-sm font-sans">
            <label className="flex items-center gap-1.5 text-creamDim cursor-pointer">
              <input type="checkbox" checked={showPinyin} onChange={e => setShowPinyin(e.target.checked)} />
              {t.showPinyin}
            </label>
            <label className="flex items-center gap-1.5 text-creamDim cursor-pointer">
              <input type="checkbox" checked={showRare} onChange={e => setShowRare(e.target.checked)} />
              {t.showRareChars}
            </label>
          </div>
        </div>

        {activeTab === "平" && (
          <RhymeGroupList groups={PING_GROUPS} showPinyin={showPinyin} showRare={showRare} onCharClick={handleCharClick} />
        )}

        {activeTab === "仄" && (
          <>
            {ZE_SECTIONS.map(section => (
              <RhymeGroupList
                key={section.key}
                groups={section.groups}
                showPinyin={showPinyin}
                showRare={showRare}
                onCharClick={handleCharClick}
              />
            ))}
          </>
        )}
      </div>

      {cardTarget && (
        <RhymeCharCard
          char={cardTarget.char}
          currentRhyme={cardTarget.rhyme}
          locale={locale}
          t={t}
          onClose={() => setCardTarget(null)}
          onRhymeChange={r => setCardTarget(prev => prev && { ...prev, rhyme: r })}
        />
      )}
    </div>
  );
}
