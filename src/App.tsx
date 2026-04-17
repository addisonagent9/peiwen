import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Grid } from "./ui/Grid";
import { RhymeDrawer } from "./ui/RhymeDrawer";
import { EditModal } from "./ui/EditModal";
import { detectBest, formFromDims } from "./analysis/detect";
import { lookupExpecting } from "./analysis/tone";
import { toTraditional, toSimplified } from "./analysis/s2t";
import { T, localizeIssue, type Locale, type Translations } from "./i18n";
import { patternsForForm } from "./patterns/patterns";
import type { FormId, PoemPattern } from "./patterns/types";

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

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  is_premium: number;
}

interface SavedPoem {
  id: number;
  text: string;
  saved_at: string;
}

function convertText(text: string, to: Locale): string {
  return Array.from(text).map(ch => {
    if (ch === "\n" || ch === "\r" || /\s/.test(ch)) return ch;
    return to === "簡" ? toSimplified(ch) : toTraditional(ch);
  }).join("");
}

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
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "繁";
    return window.localStorage.getItem("locale") === "簡" ? "簡" : "繁";
  });
  const t: Translations = T[locale];

  // --- Auth state ---
  const [user, setUser] = useState<User | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);
  const [poemsOpen, setPoemsOpen] = useState(false);
  const [poems, setPoems] = useState<SavedPoem[]>([]);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  const loadPoems = useCallback(() => {
    fetch("/api/poems", { credentials: "same-origin" })
      .then(r => r.json())
      .then(d => setPoems(d.poems ?? []))
      .catch(() => {});
  }, []);

  const savePoem = () => {
    if (!raw.trim()) return;
    fetch("/api/poems", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ text: raw })
    }).then(r => { if (r.ok) { setSavedMsg(true); setTimeout(() => setSavedMsg(false), 2000); } });
  };

  const deletePoem = (id: number) => {
    fetch(`/api/poems/${id}`, { method: "DELETE", credentials: "same-origin" })
      .then(r => { if (r.ok) setPoems(prev => prev.filter(p => p.id !== id)); });
  };

  const openPoems = () => { setPoemsOpen(true); loadPoems(); };

  // --- Theme ---
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    window.localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleLocale = () => {
    const next: Locale = locale === "繁" ? "簡" : "繁";
    setLocale(next);
    window.localStorage.setItem("locale", next);
    setRaw(prev => convertText(prev, next));
  };

  // --- Analysis ---
  const lines = useMemo(() => {
    const arr = raw.split(/\r?\n/).map(s => Array.from(s.replace(/\s+/g, "")));
    while (arr.length && arr[arr.length - 1].length === 0) arr.pop();
    return arr;
  }, [raw]);

  const validForms = useMemo((): FormId[] => {
    const n = lines[0]?.length ?? 0;
    if (n === 7) return ["七絕", "七律"];
    if (n === 5) return ["五絕", "五律"];
    return ["五絕", "五律", "七絕", "七律"];
  }, [lines]);

  useEffect(() => {
    const n = lines[0]?.length ?? 0;
    if (n === 7 && (form === "五絕" || form === "五律")) {
      setForm("auto");
      setLockedPattern(null);
    }
    if (n === 5 && (form === "七絕" || form === "七律")) {
      setForm("auto");
      setLockedPattern(null);
    }
  }, [lines]);

  const patternKey = (p: { form: string; kind: string; name: string }) =>
    `${p.form}·${p.kind}·${p.name}`;

  // --- Analysis result (set on submit, not reactive) ---
  const [analysisResult, setAnalysisResult] = useState<ReturnType<typeof detectBest> | null>(null);

  const handleSubmit = () => {
    if (!lines.length || !lines[0].length) {
      setAnalysisResult(null);
      setSubmitted(true);
      return;
    }
    const detected = form === "auto"
      ? formFromDims(lines.length, lines[0].length)
      : form;
    const result = detectBest(lines, { form: detected ?? undefined, allowZeYun: allowZe });
    setAnalysisResult(result);
    setLockedPattern(null);
    setSubmitted(true);
  };

  // --- Pattern resolution ---
  const allPatterns = useMemo(() => [
    ...patternsForForm("七絕", "平韻"), ...patternsForForm("七絕", "仄韻"),
    ...patternsForForm("七律", "平韻"), ...patternsForForm("七律", "仄韻"),
    ...patternsForForm("五絕", "平韻"), ...patternsForForm("五絕", "仄韻"),
    ...patternsForForm("五律", "平韻"), ...patternsForForm("五律", "仄韻"),
  ], []);

  const makeStub = (p: PoemPattern) => ({
    pattern: p, combined: 0, toneScore: 0, rhymeScore: 0,
    chars: p.lines.map((line, li) => line.slots.map((slot, si) => {
      const expected = (slot === "P" ? "平" : slot === "Z" ? "仄" : null) as "平" | "仄" | null;
      return {
        char: "", entries: [], chosen: null,
        tone: null, isRu: false, ambiguous: false,
        unknown: false, mismatch: !!expected,
        expected,
        slotKind: (slot === "P" || slot === "Z" ? "fixed" : slot === "f" ? "free" : "constrained") as "fixed" | "free" | "constrained",
        pos: si + 1, lineIdx: li
      };
    })),
    issues: [] as any[], rhyme: null, nianDuiOk: false
  });

  const buildFromPoem = (p: PoemPattern) => ({
    pattern: p, combined: 0, toneScore: 0, rhymeScore: 0,
    chars: p.lines.map((line, li) => line.slots.map((slot, si) => {
      const ch = lines[li]?.[si] ?? "";
      const expected = (slot === "P" ? "平" : slot === "Z" ? "仄" : null) as "平" | "仄" | null;
      const slotKind = (slot === "P" || slot === "Z" ? "fixed" : slot === "f" ? "free" : "constrained") as "fixed" | "free" | "constrained";
      if (ch) {
        const info = lookupExpecting(ch, expected);
        let mismatch = false;
        if (expected && info.tone && info.tone !== expected) mismatch = true;
        return { ...info, expected, slotKind, mismatch, pos: si + 1, lineIdx: li };
      }
      return {
        char: "", entries: [], chosen: null,
        tone: null, isRu: false, ambiguous: false,
        unknown: false, mismatch: !!expected,
        expected, slotKind, pos: si + 1, lineIdx: li
      };
    })),
    issues: [] as any[], rhyme: null, nianDuiOk: false
  });

  const selectedPattern = useMemo(() => {
    const targetKey = lockedPattern ?? (analysisResult ? patternKey(analysisResult.best.pattern) : null);
    const hasContent = lines.length > 0 && lines[0].length > 0;

    if (!targetKey) {
      const fallbackForm: FormId = form !== "auto" ? form : "七絕";
      const p = patternsForForm(fallbackForm, "平韻")[0];
      if (!p) return null;
      return hasContent ? buildFromPoem(p) : makeStub(p);
    }

    if (analysisResult) {
      const found = analysisResult.ranked.find(r => patternKey(r.pattern) === targetKey);
      if (found) return found;
    }

    const p = allPatterns.find(pp => patternKey(pp) === targetKey);
    if (!p) return null;
    return hasContent ? buildFromPoem(p) : makeStub(p);
  }, [analysisResult, lockedPattern, form, allPatterns, lines]);

  const patternOptions = useMemo(() => {
    const targetForm: FormId = form !== "auto"
      ? form
      : analysisResult ? analysisResult.best.pattern.form as FormId : "七絕";
    const allPats = [
      ...patternsForForm(targetForm, "平韻"),
      ...(allowZe ? patternsForForm(targetForm, "仄韻") : [])
    ];
    const rankedMap = new Map(
      (analysisResult?.ranked ?? []).map(r => [patternKey(r.pattern), r])
    );
    return allPats.map(p => rankedMap.get(patternKey(p)) ?? {
      pattern: p, combined: 0, toneScore: 0, rhymeScore: 0,
      chars: [] as any, issues: [], rhyme: null, nianDuiOk: false
    });
  }, [analysisResult, form, allowZe]);

  const updateChar = (li: number, pos: number, ch: string) => {
    const next = raw.split(/\r?\n/);
    const arr = Array.from(next[li] ?? "");
    arr[pos] = ch;
    next[li] = arr.join("");
    setRaw(next.join("\n"));
  };

  const zeYunCaution = selectedPattern?.pattern.kind === "仄韻";
  const N = selectedPattern?.pattern.lines[0]?.slots.length ?? 7;
  const offendingLines = useMemo(() => {
    const s = new Set<number>();
    if (selectedPattern?.rhyme?.offending) {
      for (const o of selectedPattern.rhyme.offending) s.add(o.lineIdx);
    }
    return s;
  }, [selectedPattern]);

  // --- Header components ---
  const LocaleToggle = (
    <div className="flex items-center rounded border border-ink-line overflow-hidden text-xs font-sans">
      <button
        onClick={locale === "繁" ? undefined : toggleLocale}
        className={`px-2 py-1 ${locale === "繁" ? "bg-gold text-ink-bg font-medium" : "text-creamDim"}`}
      >繁</button>
      <button
        onClick={locale === "簡" ? undefined : toggleLocale}
        className={`px-2 py-1 ${locale === "簡" ? "bg-gold text-ink-bg font-medium" : "text-creamDim"}`}
      >簡</button>
    </div>
  );

  const UserAvatar = user && (
    <div className="flex items-center gap-2">
      {user.avatar ? (
        <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-gold text-ink-bg text-xs flex items-center justify-center font-sans font-medium">
          {(user.name || user.email)[0]}
        </div>
      )}
      <span className="text-cream text-xs font-sans hidden sm:inline">{user.name}</span>
    </div>
  );

  const HeaderLeft = ({ mobile }: { mobile?: boolean }) => {
    const px = mobile ? "px-3 py-1" : "px-4 py-1.5";
    const sz = mobile ? "text-xs" : "text-sm";
    if (!user) return <div />;
    return (
      <div className={`flex items-center gap-2 ${sz} font-sans`}>
        {UserAvatar}
        <button onClick={openPoems} className={`${px} text-gold hover:opacity-80`}>{t.myPoems}</button>
      </div>
    );
  };

  const HeaderRight = ({ mobile }: { mobile?: boolean }) => {
    const px = mobile ? "px-3 py-1" : "px-4 py-1.5";
    const sz = mobile ? "text-xs" : "text-sm";
    return (
      <div className={`flex items-center gap-2 ${sz} font-sans whitespace-nowrap`}>
        {LocaleToggle}
        <button
          onClick={() => setDarkMode(d => !d)}
          aria-label="Toggle theme"
          className={`${px} rounded border border-ink-line text-creamDim hover:text-cream hover:border-cream`}
        >{darkMode ? "☀️" : "🌙"}</button>
        {user ? (
          <a href="/api/auth/logout" className={`${px} text-creamDim hover:text-cream`}>{t.signOut}</a>
        ) : (
          <a href="/api/auth/google"
            className={`${px} rounded border border-ink-line text-creamDim hover:text-cream hover:border-cream`}
          >{t.signIn}</a>
        )}
      </div>
    );
  };

  const ScorePill = selectedPattern && selectedPattern.combined > 0 && (
    <div className="flex items-center justify-center px-2">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-ink-card/60 border border-ink-line rounded-2xl sm:rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-sans max-w-full">
        <span className="text-creamDim whitespace-nowrap">平仄 <span className="text-gold">{Math.round(selectedPattern.toneScore * 100)}%</span></span>
        <span className="text-ink-line hidden sm:inline">·</span>
        <span className="text-creamDim whitespace-nowrap">押韻 <span className="text-gold">{Math.round(selectedPattern.rhymeScore * 100)}%</span></span>
        {selectedPattern.rhyme?.baseRhyme && (
          <>
            <span className="text-ink-line hidden sm:inline">·</span>
            <span className="text-creamDim whitespace-nowrap">韻部：<span className="text-gold">{selectedPattern.rhyme.baseRhyme}</span></span>
          </>
        )}
        <span className="text-ink-line hidden sm:inline">·</span>
        <span className="text-gold font-serif whitespace-nowrap hidden sm:inline">{selectedPattern.pattern.form}·{selectedPattern.pattern.name}</span>
      </div>
    </div>
  );

  const activeForm: FormId = analysisResult
    ? analysisResult.best.pattern.form as FormId
    : form !== "auto" ? form : "七絕";

  const FormSelector = (
    <div className="flex flex-col gap-1.5">
      <span className="text-creamDim text-xs font-sans">{t.poemForm}</span>
      <div className="flex gap-1.5 sm:gap-2 text-xs sm:text-sm font-sans">
        {validForms.map(f => {
          const active = form === f || (form === "auto" && activeForm === f);
          return (
            <button
              key={f}
              onClick={() => { setForm(f); setLockedPattern(null); }}
              className={`px-3 py-1 rounded-full border whitespace-nowrap transition ${
                active
                  ? "border-gold text-gold"
                  : "border-ink-line text-creamDim hover:text-gold hover:border-gold"
              }`}
            >{f}</button>
          );
        })}
      </div>
    </div>
  );

  const PatternSelector = patternOptions.length > 0 && (
    <div className="flex flex-col gap-1.5">
      <span className="text-creamDim text-xs font-sans">{t.format}</span>
      <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2 text-xs font-sans">
        {patternOptions.map(r => {
          const key = patternKey(r.pattern);
          const active = lockedPattern
            ? lockedPattern === key
            : selectedPattern && patternKey(selectedPattern.pattern) === key;
          const hasScore = r.combined > 0;
          return (
            <button
              key={key}
              onClick={() => setLockedPattern(key)}
              className={`px-2 py-1 rounded-full border whitespace-nowrap transition text-center ${
                active
                  ? "border-gold text-gold"
                  : "border-ink-line text-creamDim hover:text-gold hover:border-gold"
              }`}
            >
              {r.pattern.name}{hasScore ? <span className="opacity-70"> {Math.round(r.combined * 100)}%</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );

  const SampleButtons = (
    <div className="flex flex-wrap gap-2 text-xs font-sans">
      {(Object.keys(SAMPLES) as FormId[]).map(f => (
        <button key={f}
                onClick={() => { setRaw(locale === "簡" ? convertText(SAMPLES[f], "簡") : SAMPLES[f]); setForm(f); }}
                className="px-3 py-1.5 rounded border border-ink-line text-creamDim hover:text-gold hover:border-gold">
          {f}範例
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-bg text-cream flex flex-col">
      <header className="sticky top-0 z-10 bg-ink-bg border-b border-ink-line px-4 sm:px-6 py-3 sm:py-4 overflow-hidden">
        <div className="sm:hidden flex flex-col gap-2">
          <div className="text-center">
            <div className="text-xl font-serif font-bold text-gold tracking-[0.2em] whitespace-nowrap">佩文・詩律析辨</div>
            <div className="text-[10px] text-creamDim font-sans mt-0.5">Classical Chinese prosody analyzer · 平水韻 106 部</div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <HeaderLeft mobile />
            <HeaderRight mobile />
          </div>
        </div>

        <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          <HeaderLeft />

          <div className="text-center">
            <div className="text-4xl font-serif font-bold text-gold tracking-[0.2em] whitespace-nowrap">佩文・詩律析辨</div>
            <div className="text-xs text-creamDim font-sans mt-1">Classical Chinese prosody analyzer · 平水韻 106 部</div>
          </div>

          <div className="flex justify-end">
            <HeaderRight />
          </div>
        </div>
      </header>

      {!submitted ? (
        <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-10">
          {ScorePill}
          <div className="w-full max-w-3xl flex flex-col gap-3">
            <div className="text-xs text-creamDim font-sans text-center">{t.inputPlaceholder}</div>
            <div className="relative">
              <textarea
                value={raw}
                onChange={e => setRaw(e.target.value)}
                rows={8}
                className="ink-card rounded p-6 font-serif font-light text-2xl text-cream leading-loose tracking-widest outline-none focus:border-gold text-center w-full"
              />
              {raw && (
                <button
                  onClick={() => { setRaw(""); setSubmitted(false); setLockedPattern(null); setAnalysisResult(null); }}
                  aria-label="Clear"
                  className="absolute top-2 right-2 text-creamDim hover:text-rose text-xl leading-none"
                >×</button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-sans mt-2">
              <span className="text-creamDim whitespace-nowrap">{t.examples}</span>
              {validForms.map(f => (
                <button
                  key={f}
                  onClick={() => { setRaw(locale === "簡" ? convertText(SAMPLES[f], "簡") : SAMPLES[f]); setForm(f); }}
                  className="px-3 py-1 rounded-full border border-ink-line text-creamDim hover:text-gold hover:border-gold whitespace-nowrap transition"
                >{f}</button>
              ))}
              <label className="flex items-center gap-1 text-creamDim whitespace-nowrap ml-2">
                <input type="checkbox" checked={allowZe} onChange={e => setAllowZe(e.target.checked)} />
                {t.allowZe}
              </label>
            </div>
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-gold text-ink-bg rounded font-sans font-semibold hover:opacity-90"
              >{t.submit}</button>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex flex-col items-center px-6 py-6">
          <div className="w-full max-w-3xl flex flex-col gap-3 sm:gap-4">
            {ScorePill}

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => { setSubmitted(false); setLockedPattern(null); setAnalysisResult(null); }}
                className="px-3 py-1.5 text-sm font-sans text-creamDim hover:text-gold whitespace-nowrap"
              >{t.back}</button>
              <div className="flex items-center gap-3">
                {zeYunCaution && (
                  <div className="text-xs text-amber border border-amber/40 rounded px-3 py-1 hidden sm:block">
                    {t.zeYunCaution}
                  </div>
                )}
                {user && (
                  <button
                    onClick={savePoem}
                    className={`flex items-center gap-1 text-sm font-sans transition ${savedMsg ? "text-gold" : "text-creamDim hover:text-gold"}`}
                  >
                    <span className="text-base leading-none">💾</span>
                    <span>{savedMsg ? t.saved : t.save}</span>
                  </button>
                )}
              </div>
            </div>

            {zeYunCaution && (
              <div className="text-xs text-amber border border-amber/40 rounded px-3 py-1 sm:hidden">
                {t.zeYunCaution}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:gap-4 self-center" style={{ width: "max-content", maxWidth: "100%" }}>
              {FormSelector}
              {PatternSelector}

              {selectedPattern && (
                <Grid
                  chars={selectedPattern.chars}
                  lineTemplates={selectedPattern.pattern.lines}
                  cols={N}
                  offendingLines={offendingLines}
                  t={t}
                  onPick={(li, pos) => setEditCell({ li, pos })}
                  onRhymeClick={r => setDrawerRhyme(r)}
                />
              )}
            </div>

            {selectedPattern && selectedPattern.issues.length > 0 && (
              <div className="ink-card rounded p-4 text-sm font-sans space-y-1">
                <div className="text-creamDim text-xs mb-2">{t.verifyResult}</div>
                {selectedPattern.issues.length === 0 && <div className="text-teal">{t.allPass}</div>}
                {selectedPattern.issues.map((it, i) => (
                  <div key={i} className={
                    it.severity === "error" ? "text-rose" :
                    it.severity === "warn" ? "text-amber" : "text-teal"
                  }>
                    <span className="inline-block w-12 text-creamDim">[{it.kind}]</span> {localizeIssue(it.message, locale)}
                  </div>
                ))}
              </div>
            )}

            {selectedPattern && selectedPattern.issues.length === 0 && analysisResult && (
              <div className="ink-card rounded p-4 text-sm font-sans">
                <div className="text-teal">{t.allPass}</div>
              </div>
            )}

            <div className="flex justify-center mt-2">{SampleButtons}</div>
          </div>
        </main>
      )}

      {/* Poems slide-in panel */}
      {poemsOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setPoemsOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute top-0 right-0 h-full w-[min(24rem,90vw)] bg-ink-bg border-l border-ink-line overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-line">
              <div className="text-lg font-serif text-gold">{t.myPoems}</div>
              <button onClick={() => setPoemsOpen(false)} className="text-creamDim hover:text-cream text-xl leading-none">×</button>
            </div>
            {poems.length === 0 ? (
              <div className="p-4 text-creamDim text-sm font-sans">{t.noSavedPoems}</div>
            ) : (
              <div className="flex flex-col">
                {poems.map(p => {
                  const firstLine = p.text.split(/\r?\n/)[0] ?? "";
                  const date = p.saved_at?.replace("T", " ").slice(0, 16) ?? "";
                  return (
                    <div key={p.id} className="flex items-center justify-between gap-2 px-4 py-3 border-b border-ink-line hover:bg-ink-card/60 transition">
                      <button
                        className="flex-1 text-left min-w-0"
                        onClick={() => { setRaw(p.text); setSubmitted(false); setLockedPattern(null); setAnalysisResult(null); setPoemsOpen(false); }}
                      >
                        <div className="text-cream font-serif truncate">{firstLine}</div>
                        <div className="text-[10px] text-creamDim font-sans mt-0.5">{date}</div>
                      </button>
                      <button
                        onClick={() => deletePoem(p.id)}
                        className="text-creamDim hover:text-rose text-sm flex-shrink-0"
                        title="Delete"
                      >🗑</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <RhymeDrawer rhyme={drawerRhyme} onClose={() => setDrawerRhyme(null)} />
      <EditModal
        open={!!editCell}
        initial={editCell ? (lines[editCell.li]?.[editCell.pos] ?? "") : ""}
        prevChar={editCell ? (lines[editCell.li]?.[editCell.pos - 1] ?? "") : ""}
        nextChar={editCell ? (lines[editCell.li]?.[editCell.pos + 1] ?? "") : ""}
        expectedTone={editCell && selectedPattern ? (selectedPattern.chars[editCell.li]?.[editCell.pos]?.expected ?? null) : null}
        requiredRhyme={editCell && selectedPattern && selectedPattern.pattern.lines[editCell.li]?.rhymes
          ? (selectedPattern.rhyme?.baseRhyme
              ?? selectedPattern.chars[1]?.[selectedPattern.chars[1].length - 1]?.entries[0]?.rhyme
              ?? null)
          : null}
        isLoggedIn={!!user}
        isAdmin={user?.is_premium === 1}
        lineIdx={editCell?.li ?? 0}
        pos={editCell?.pos ?? 0}
        t={t}
        onClose={() => setEditCell(null)}
        onCommit={ch => editCell && updateChar(editCell.li, editCell.pos, ch)}
      />
    </div>
  );
}
