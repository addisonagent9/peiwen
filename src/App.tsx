import React, { useEffect, useMemo, useState } from "react";
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
  const [submitted, setSubmitted] = useState(false);
  const [drawerRhyme, setDrawerRhyme] = useState<string | null>(null);
  const [editCell, setEditCell] = useState<{ li: number; pos: number } | null>(null);
  const [lockedPattern, setLockedPattern] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    window.localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const lines = useMemo(() => {
    const arr = raw.split(/\r?\n/).map(s => Array.from(s.replace(/\s+/g, "")));
    while (arr.length && arr[arr.length - 1].length === 0) arr.pop();
    return arr;
  }, [raw]);

  const detect = useMemo(() => {
    if (!lines.length || !lines[0].length) return null;
    const detected = form === "auto"
      ? formFromDims(lines.length, lines[0].length)
      : form;
    return detectBest(lines, { form: detected ?? undefined, allowZeYun: allowZe });
  }, [lines, form, allowZe]);

  const patternKey = (p: { form: string; kind: string; name: string }) =>
    `${p.form}·${p.kind}·${p.name}`;

  const best = useMemo(() => {
    if (!detect) return null;
    if (lockedPattern) {
      const found = detect.ranked.find(r => patternKey(r.pattern) === lockedPattern);
      if (found) return found;
    }
    return detect.best;
  }, [detect, lockedPattern]);

  const patternOptions = useMemo(() => {
    if (!detect) return [];
    const detectedForm = detect.best.pattern.form;
    return detect.ranked.filter(r => r.pattern.form === detectedForm);
  }, [detect]);

  const updateChar = (li: number, pos: number, ch: string) => {
    const next = raw.split(/\r?\n/);
    const arr = Array.from(next[li] ?? "");
    arr[pos] = ch;
    next[li] = arr.join("");
    setRaw(next.join("\n"));
  };

  const zeYunCaution = best?.pattern.kind === "仄韻";
  const N = best?.pattern.lines[0]?.slots.length ?? 7;

  // TODO: Google OAuth
  const handleSignIn = () => {};
  const handleSignUp = () => {};

  const ScorePill = best && (
    <div className="flex items-center justify-center px-2">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-ink-card/60 border border-ink-line rounded-2xl sm:rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-sans max-w-full">
        <span className="text-creamDim whitespace-nowrap">平仄 <span className="text-gold">{Math.round(best.toneScore * 100)}%</span></span>
        <span className="text-ink-line hidden sm:inline">·</span>
        <span className="text-creamDim whitespace-nowrap">押韻 <span className="text-gold">{Math.round(best.rhymeScore * 100)}%</span></span>
        {best.rhyme?.baseRhyme && (
          <>
            <span className="text-ink-line hidden sm:inline">·</span>
            <span className="text-creamDim whitespace-nowrap">韻部：<span className="text-gold">{best.rhyme.baseRhyme}</span></span>
          </>
        )}
        <span className="text-ink-line hidden sm:inline">·</span>
        <span className="text-gold font-serif whitespace-nowrap">{best.pattern.form}·{best.pattern.name}</span>
      </div>
    </div>
  );

  const SampleButtons = (
    <div className="flex flex-wrap gap-2 text-xs font-sans">
      {(Object.keys(SAMPLES) as FormId[]).map(f => (
        <button key={f}
                onClick={() => { setRaw(SAMPLES[f]); setForm(f); }}
                className="px-3 py-1.5 rounded border border-ink-line text-creamDim hover:text-gold hover:border-gold">
          {f}範例
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-full bg-ink-bg text-cream flex flex-col">
      <header className="border-b border-ink-line px-4 sm:px-6 py-3 sm:py-4 overflow-hidden">
        {/* Mobile: 2-row stack (title row, controls row). Desktop (sm+): 3-col grid. */}
        <div className="sm:hidden flex flex-col gap-3">
          <div className="text-center">
            <div className="text-xl font-serif font-bold text-gold tracking-[0.2em] whitespace-nowrap">佩文・詩律析辨</div>
            <div className="text-[10px] text-creamDim font-sans mt-0.5">Classical Chinese prosody analyzer · 平水韻 106 部</div>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs font-sans">
            <div className="flex items-center gap-3 min-w-0">
              <label className="flex items-center gap-1 text-creamDim whitespace-nowrap">
                <input type="checkbox" checked={allowZe} onChange={e => setAllowZe(e.target.checked)} />
                允許仄韻
              </label>
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
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <button
                onClick={() => setDarkMode(d => !d)}
                aria-label="Toggle theme"
                className="px-2 py-1 rounded border border-ink-line text-creamDim"
              >{darkMode ? "☀️" : "🌙"}</button>
              <button onClick={handleSignIn} className="px-3 py-1 rounded border border-ink-line text-creamDim">Sign in</button>
              <button onClick={handleSignUp} className="px-3 py-1 text-gold">Sign up</button>
            </div>
          </div>
        </div>

        <div className="hidden sm:grid grid-cols-[auto_1fr_auto] items-center gap-6">
          <div className="flex flex-col gap-2 text-sm font-sans">
            <label className="flex items-center gap-2 text-creamDim">
              <input type="checkbox" checked={allowZe} onChange={e => setAllowZe(e.target.checked)} />
              允許仄韻
            </label>
            <div className="flex items-center gap-2">
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
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-serif font-bold text-gold tracking-[0.2em] whitespace-nowrap">佩文・詩律析辨</div>
            <div className="text-xs text-creamDim font-sans mt-1">Classical Chinese prosody analyzer · 平水韻 106 部</div>
          </div>

          <div className="flex items-center gap-3 text-sm font-sans">
            <button
              onClick={() => setDarkMode(d => !d)}
              aria-label="Toggle theme"
              className="px-3 py-1.5 rounded border border-ink-line text-creamDim hover:text-cream hover:border-cream"
            >{darkMode ? "☀️" : "🌙"}</button>
            <button onClick={handleSignIn} className="px-4 py-1.5 rounded border border-ink-line text-creamDim hover:text-cream hover:border-cream">Sign in</button>
            <button onClick={handleSignUp} className="px-4 py-1.5 text-gold hover:opacity-80">Sign up</button>
          </div>
        </div>
      </header>

      {!submitted ? (
        <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-10">
          {ScorePill}
          <div className="w-full max-w-3xl flex flex-col gap-3">
            <div className="text-xs text-creamDim font-sans text-center">輸入詩句（每句一行）</div>
            <div className="relative">
              <textarea
                value={raw}
                onChange={e => setRaw(e.target.value)}
                rows={8}
                className="ink-card rounded p-6 font-serif font-light text-2xl text-cream leading-loose tracking-widest outline-none focus:border-gold text-center w-full"
              />
              {raw && (
                <button
                  onClick={() => { setRaw(""); setSubmitted(false); setLockedPattern(null); }}
                  aria-label="Clear"
                  className="absolute top-2 right-2 text-creamDim hover:text-rose text-xl leading-none"
                >×</button>
              )}
            </div>
            <div className="flex items-center justify-between gap-4 mt-2">
              {SampleButtons}
              <button
                onClick={() => setSubmitted(true)}
                className="px-6 py-2 bg-gold text-ink-bg rounded font-sans font-semibold hover:opacity-90"
              >析辨</button>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 flex flex-col gap-4 px-6 py-6">
          {ScorePill}

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => { setSubmitted(false); setLockedPattern(null); }}
                className="px-3 py-1.5 text-sm font-sans text-creamDim hover:text-gold whitespace-nowrap"
              >← 重新輸入</button>
              {patternOptions.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap text-xs font-sans">
                  <span className="text-creamDim">格：</span>
                  {patternOptions.map(r => {
                    const key = patternKey(r.pattern);
                    const active = best && patternKey(best.pattern) === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setLockedPattern(key)}
                        className={`px-2 py-1 rounded-full border whitespace-nowrap transition ${
                          active
                            ? "border-gold text-gold"
                            : "border-ink-line text-creamDim hover:text-gold hover:border-gold"
                        }`}
                      >
                        {r.pattern.name} <span className="opacity-70">{Math.round(r.combined * 100)}%</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {zeYunCaution && (
              <div className="text-xs text-amber border border-amber/40 rounded px-3 py-1">
                溫馨提示：仄韻七絕多為「古絕」，非近體詩正例
              </div>
            )}
          </div>

          {best && (
            <Grid
              chars={best.chars}
              lineTemplates={best.pattern.lines}
              cols={N}
              onPick={(li, pos) => setEditCell({ li, pos })}
              onRhymeClick={r => setDrawerRhyme(r)}
            />
          )}

          {best && (
            <div className="ink-card rounded p-4 text-sm font-sans space-y-1 max-w-3xl w-full self-center">
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
          )}

          <div className="flex justify-center mt-2">{SampleButtons}</div>
        </main>
      )}

      <RhymeDrawer rhyme={drawerRhyme} onClose={() => setDrawerRhyme(null)} />
      <EditModal
        open={!!editCell}
        initial={editCell ? (lines[editCell.li]?.[editCell.pos] ?? "") : ""}
        prevChar={editCell ? (lines[editCell.li]?.[editCell.pos - 1] ?? "") : ""}
        nextChar={editCell ? (lines[editCell.li]?.[editCell.pos + 1] ?? "") : ""}
        expectedTone={editCell && best ? (best.chars[editCell.li]?.[editCell.pos]?.expected ?? null) : null}
        lineIdx={editCell?.li ?? 0}
        pos={editCell?.pos ?? 0}
        onClose={() => setEditCell(null)}
        onCommit={ch => editCell && updateChar(editCell.li, editCell.pos, ch)}
      />
    </div>
  );
}
