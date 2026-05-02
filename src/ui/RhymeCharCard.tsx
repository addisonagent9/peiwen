import React, { useEffect, useMemo, useState } from "react";
import { lookup } from "../analysis/tone";
import { toTraditional, toSimplified } from "../analysis/s2t";
import { cedictCompounds, loadCedict, isCedictLoaded } from "../analysis/cedict";
import { moedictLookup, loadMoedict, isMoedictLoaded } from "../analysis/moedict";
import { pinyin } from "pinyin-pro";
import { AMBIGUOUS_READINGS } from "../data/ambiguous-readings";
import { RHYMES_PINGSHENG } from "../data/pingshui/trainer-curriculum";
import type { Locale, Translations } from "../i18n";

const JYUTPING_MAP: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const rhyme of RHYMES_PINGSHENG) {
    if (rhyme.tier !== 1) continue;
    const seeds = rhyme.seedCharacters;
    if (!Array.isArray(seeds) || seeds.length === 0) continue;
    if (typeof seeds[0] === "string") continue;
    for (const s of seeds as Array<{ char: string; jyutping: string }>) {
      if (s.jyutping) m.set(s.char, s.jyutping);
    }
  }
  return m;
})();

interface Props {
  char: string;
  currentRhyme: string;
  locale: Locale;
  t: Translations;
  onClose: () => void;
}

export function RhymeCharCard({ char, currentRhyme, locale, t, onClose }: Props) {
  const [dictsReady, setDictsReady] = useState(isCedictLoaded() && isMoedictLoaded());

  useEffect(() => {
    if (dictsReady) return;
    Promise.all([loadCedict(), loadMoedict()])
      .then(() => setDictsReady(true))
      .catch(() => {});
  }, [dictsReady]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const info = lookup(char);
  const trad = toTraditional(char);
  const simp = toSimplified(char);
  const sameForm = trad === simp;

  const py = useMemo(() =>
    Array.from(new Set(
      (pinyin(char, { toneType: "symbol", multiple: true, type: "array" }) as string[])
        .map(s => s.trim()).filter(Boolean)
    )).join(" / "),
  [char]);

  const jyut = JYUTPING_MAP.get(char) ?? null;

  const zhDefs = dictsReady ? moedictLookup(char) : [];
  const compounds = dictsReady ? cedictCompounds(char) : [];

  const ar = AMBIGUOUS_READINGS[char];
  const charNote = ar ? (locale === "繁" ? ar.note_zh_tw : ar.note_zh_cn) : null;
  const prn = ar?.per_reading_notes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative ink-card rounded-lg px-6 py-5 w-[min(28rem,90vw)] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-creamDim hover:text-cream text-lg leading-none"
          aria-label="Close"
        >✕</button>

        <div className="text-center mb-4">
          <div className="text-5xl font-serif text-cream">{char}</div>
          {!sameForm && (
            <div className="text-xs text-creamDim font-sans mt-1">{trad} / {simp}</div>
          )}
        </div>

        <div className="text-sm font-sans space-y-3">
          {zhDefs.length > 0 && (
            <div>
              <div className="text-creamDim text-xs">{t.refMeaning}</div>
              <div className="mt-1 text-cream leading-[1.6]">{zhDefs.join("；")}</div>
            </div>
          )}
          {!dictsReady && (
            <div className="text-creamDim text-xs">{t.loading}</div>
          )}

          <div>
            <div className="text-creamDim text-xs">{t.pinyin}</div>
            <div className="mt-1 font-serif text-lg text-gold">{py}</div>
          </div>

          {jyut && (
            <div>
              <div className="text-creamDim text-xs">{t.refJyutping}</div>
              <div className="mt-1 font-serif text-lg text-gold">{jyut}</div>
            </div>
          )}

          {info && !info.unknown && (
            <div>
              <div className="text-creamDim text-xs">{t.reading}</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {info.entries.map((e, i) => {
                  const isCtx = e.rhyme === currentRhyme;
                  const rn = ar?.per_reading_notes?.find(n => n.rhyme === e.rhyme);
                  return (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded bg-ink-bg border ${isCtx ? "border-gold ring-2 ring-gold" : "border-ink-line"}`}
                    >
                      {rn && (
                        <span className={`mr-1 ${rn.status === "attested" ? "text-teal" : "text-amber"}`}>
                          {rn.status === "attested" ? "✓" : "ⓘ"}
                        </span>
                      )}
                      <span className={e.tone === "平" ? "text-teal" : e.tone === "入" ? "text-amber" : "text-rose"}>
                        {e.tone}
                      </span>
                      <span className="text-cream ml-1">{e.rhyme}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {compounds.length > 0 && (
            <div>
              <div className="text-creamDim text-xs">{t.refCompounds}</div>
              <div className="mt-1 space-y-1">
                {compounds.map((c, i) => (
                  <div key={i} className="text-cream leading-[1.6]">
                    <span className="font-serif">{c.word}</span>
                    <span className="text-gold ml-2 text-xs">{c.pinyin}</span>
                    <span className="text-creamDim ml-2 text-xs">{c.gloss}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(charNote || (prn && prn.length > 0)) && (
            <div>
              <div className="text-creamDim text-xs">{t.refNotes}</div>
              {charNote && (
                <div className="mt-1 text-[11px] italic text-creamDim">{charNote}</div>
              )}
              {prn && prn.length > 0 && (
                <div className="mt-1 text-[10px] text-cream space-y-1">
                  {prn.map(rn => (
                    <div key={rn.rhyme}>
                      <span className={rn.status === "attested" ? "text-teal" : "text-amber"}>
                        {rn.status === "attested" ? "✓" : "ⓘ"}
                      </span>
                      {" "}<span className="text-gold">{rn.rhyme}</span>
                      {" — "}{locale === "繁" ? rn.note_zh_tw : rn.note_zh_cn}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
