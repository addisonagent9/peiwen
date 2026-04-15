import React, { useMemo, useState } from "react";
import { Grid } from "./ui/Grid";
import { RhymeDrawer } from "./ui/RhymeDrawer";
import { EditModal } from "./ui/EditModal";
import { detectBest, formFromDims } from "./analysis/detect";
import type { FormId } from "./patterns/types";

const SAMPLES: Record<FormId, string> = {
  "七絕": "朝辭白帝彩雲間\n千里江陵一日還\n兩岸猿聲啼不住\n輕舟已過萬重山",
  "七律":
    "錦瑟無端五十絃\n一絃一柱思華年\n莊生曉夢迷蝴蝶\n望帝春心託杜鵑\n" +
    "滄海月明珠有淚\n藍田日暖玉生煙\n此情可待成追憶\n只是當時已惘然",
  "五絕": "白日依山盡\n黃河入海流\n欲窮千里目\n更上一層樓",
  "五律":
    "國破山河在\n城春草木深\n感時花濺淚\n恨別鳥驚心\n" +
    "烽火連三月\n家書抵萬金\n白頭搔更短\n渾欲不勝簪"
};

export default function App() {
  const [raw, setRaw] = useState(SAMPLES["七絕"]);
  const [form, setForm] = useState<FormId | "auto">("auto");
  const [allowZe, setAllowZe] = useState(false);
  const [drawerRhyme, setDrawerRhyme] = useState<string | null>(null);
  const [editCell, setEditCell] = useState<{ li: number; pos: number } | null>(null);

  const lines = useMemo(() => {
    return raw.split(/\r?\n/).map(s => Array.from(s.replace(/\s+/g, "")));
  }, [raw]);

  const detect = useMemo(() => {
    if (!lines.length || !lines[0].length) return null;
    const detected = form === "auto"
      ? formFromDims(lines.length, lines[0].length)
      : form;
    return detectBest(lines, { form: detected ?? undefined, allowZeYun: allowZe });
  }, [lines, form, allowZe]);

  const best = detect?.best ?? null;

  const updateChar = (li: number, pos: number, ch: string) => {
    const next = raw.split(/\r?\n/);
    const arr = Array.from(next[li] ?? "");
    arr[pos] = ch;
    next[li] = arr.join("");
    setRaw(next.join("\n"));
  };

  const zeYunCaution = best?.pattern.kind === "仄韻";

  return (
    <div className="min-h-full bg-ink-bg text-cream">
      <header className="border-b border-ink-line px-6 py-4 flex items-baseline gap-6">
        <div>
          <div className="text-3xl font-serif text-gold tracking-widest">詩律析辨</div>
          <div className="text-xs text-creamDim font-sans">Classical Chinese prosody analyzer · 平水韻 106 部</div>
        </div>
        <div className="ml-auto flex items-center gap-3 text-sm font-sans">
          <label className="text-creamDim">體裁</label>
          <select
            value={form}
            onChange={e => setForm(e.target.value as any)}
            className="bg-ink-card border border-ink-line rounded px-2 py-1 text-cream"
          >
            <option value="auto">自動偵測</option>
            <option value="七絕">七絕</option>
            <option value="七律">七律</option>
            <option value="五絕">五絕</option>
            <option value="五律">五律</option>
          </select>
          <label className="flex items-center gap-1 text-creamDim">
            <input type="checkbox" checked={allowZe} onChange={e => setAllowZe(e.target.checked)} />
            允許仄韻
          </label>
        </div>
      </header>

      <main className="grid grid-cols-[minmax(20rem,26rem)_1fr] gap-6 p-6">
        <section className="flex flex-col gap-3">
          <div className="text-xs text-creamDim font-sans">輸入詩句（每句一行）</div>
          <textarea
            value={raw}
            onChange={e => setRaw(e.target.value)}
            rows={12}
            className="ink-card rounded p-4 font-serif text-xl text-cream leading-[1.8] outline-none focus:border-gold"
          />
          <div className="flex flex-wrap gap-2 text-xs font-sans">
            {(Object.keys(SAMPLES) as FormId[]).map(f => (
              <button key={f}
                      onClick={() => { setRaw(SAMPLES[f]); setForm(f); }}
                      className="px-2 py-1 rounded border border-ink-line text-creamDim hover:text-gold hover:border-gold">
                {f}範例
              </button>
            ))}
          </div>

          {best && (
            <div className="ink-card rounded p-4 text-sm font-sans space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="text-gold text-lg font-serif">
                  {best.pattern.form} · {best.pattern.kind} · {best.pattern.name}
                </div>
                <div className="text-2xl font-serif text-cream">
                  {Math.round(best.combined * 100)}<span className="text-sm text-creamDim">%</span>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-creamDim">
                <span>平仄 {Math.round(best.toneScore * 100)}%</span>
                <span>押韻 {Math.round(best.rhymeScore * 100)}%</span>
                {best.rhyme?.baseRhyme && <span>主韻 <span className="text-gold">{best.rhyme.baseRhyme}</span></span>}
              </div>
              {zeYunCaution && (
                <div className="text-xs text-amber border border-amber/40 rounded p-2">
                  溫馨提示：仄韻七絕並非近體詩正例，傳統以平韻為主，此類作品多被視為「古絕」或「入律的古風」。
                </div>
              )}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4 min-w-0">
          {best && (
            <>
              <Grid
                chars={best.chars}
                lineTemplates={best.pattern.lines}
                onPick={(li, pos) => setEditCell({ li, pos })}
                onRhymeClick={r => setDrawerRhyme(r)}
              />
              <div className="ink-card rounded p-4 text-sm font-sans space-y-1">
                <div className="text-creamDim text-xs mb-2">校驗結果</div>
                {best.issues.length === 0 && <div className="text-teal">✓ 完全合格</div>}
                {best.issues.map((it, i) => (
                  <div key={i} className={
                    it.severity === "error" ? "text-rose" :
                    it.severity === "warn" ? "text-amber" : "text-teal"
                  }>
                    <span className="inline-block w-12 text-creamDim">[{it.kind}]</span> {it.message}
                  </div>
                ))}
              </div>
              <details className="text-xs font-sans text-creamDim">
                <summary className="cursor-pointer hover:text-gold">其他格式比對</summary>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {detect?.ranked.slice(1, 8).map((r, i) => (
                    <div key={i} className="flex justify-between border-b border-ink-line py-1">
                      <span>{r.pattern.form}·{r.pattern.name}</span>
                      <span>{Math.round(r.combined * 100)}%</span>
                    </div>
                  ))}
                </div>
              </details>
            </>
          )}
        </section>
      </main>

      <RhymeDrawer rhyme={drawerRhyme} onClose={() => setDrawerRhyme(null)} />
      <EditModal
        open={!!editCell}
        initial={editCell ? (lines[editCell.li]?.[editCell.pos] ?? "") : ""}
        prevChar={editCell ? (lines[editCell.li]?.[editCell.pos - 1] ?? "") : ""}
        nextChar={editCell ? (lines[editCell.li]?.[editCell.pos + 1] ?? "") : ""}
        lineIdx={editCell?.li ?? 0}
        pos={editCell?.pos ?? 0}
        onClose={() => setEditCell(null)}
        onCommit={ch => editCell && updateChar(editCell.li, editCell.pos, ch)}
      />
    </div>
  );
}
