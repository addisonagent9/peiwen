import React, { useEffect, useState } from "react";
import { lookup } from "../analysis/tone";
import { toTraditional, toSimplified } from "../analysis/s2t";
import { cedictLookup, cedictContext, loadCedict, isCedictLoaded } from "../analysis/cedict";
import { moedictLookup, loadMoedict, isMoedictLoaded } from "../analysis/moedict";
import { pinyin } from "pinyin-pro";
import { rhymesOf } from "../analysis/rhyme";
import type { Translations } from "../i18n";

type Tone = "平" | "仄";

interface Props {
  open: boolean;
  initial: string;
  prevChar?: string;
  nextChar?: string;
  expectedTone?: Tone | null;
  requiredRhyme?: string | null;
  lineIdx: number;
  pos: number;
  t: Translations;
  onClose: () => void;
  onCommit: (ch: string) => void;
}

interface Suggestion {
  char: string;
  rhyme: string;
  definition: string;
}

async function callAnthropic(prompt: string): Promise<string> {
  const res = await fetch("/api/suggest", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return data.text ?? "";
}

function parseSuggestions(text: string): Suggestion[] {
  const out: Suggestion[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/\s*[-—–]\s*/);
    if (parts.length < 2) continue;
    const char = Array.from(parts[0].replace(/^[\d.、）)]+\s*/, ""))[0] ?? "";
    if (!char) continue;
    out.push({
      char,
      rhyme: (parts[1] ?? "").trim(),
      definition: (parts.slice(2).join(" - ") || "").trim()
    });
  }
  return out;
}

export function EditModal({ open, initial, prevChar = "", nextChar = "", expectedTone = null, requiredRhyme = null, lineIdx, pos, t, onClose, onCommit }: Props) {
  const [val, setVal] = useState(initial);
  const [dictsReady, setDictsReady] = useState(isCedictLoaded() && isMoedictLoaded());
  const [dictError, setDictError] = useState<string | null>(null);
  const [view, setView] = useState<"edit" | "suggest">("edit");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [seenChars, setSeenChars] = useState<Set<string>>(new Set());
  const [exhausted, setExhausted] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    setVal(initial); setView("edit"); setSuggestions([]); setSuggestError(null);
    setSeenChars(new Set()); setExhausted(false); setInitialLoaded(false);
  }, [initial, open]);

  useEffect(() => {
    if (!open || dictsReady) return;
    let cancelled = false;
    setDictError(null);
    Promise.all([loadCedict(), loadMoedict()])
      .then(() => { if (!cancelled) setDictsReady(true); })
      .catch(err => { if (!cancelled) setDictError(String(err.message ?? err)); });
    return () => { cancelled = true; };
  }, [open, dictsReady]);

  if (!open) return null;

  const info = val ? lookup(val) : null;
  const actualTone: Tone | null = info?.tone ?? null;
  const mismatch = !!(expectedTone && actualTone && actualTone !== expectedTone);

  const fetchBatch = (prevSeen: Set<string>) => {
    if (!expectedTone || !actualTone || !val) return;
    setSuggestLoading(true);
    setSuggestError(null);
    const rhymeClause = requiredRhyme
      ? `，且必須屬於平水韻「${requiredRhyme}」韻部`
      : "";
    const rhymeFilter = requiredRhyme
      ? `、屬於「${requiredRhyme}」韻部`
      : "";
    let prompt = `「${val}」讀${actualTone}聲，現需替換為${expectedTone}聲字${rhymeClause}。請列出5個意思與「${val}」相近、可用於古典詩詞${rhymeFilter}的${expectedTone}聲字。每個字用一行，格式：字 - 平水韻韻部 - 簡短釋義。只列字，不要其他說明。`;
    if (prevSeen.size > 0) {
      prompt += `\n請勿重複上一批：${Array.from(prevSeen).join("、")}`;
    }
    callAnthropic(prompt)
      .then(text => {
        const raw = parseSuggestions(text);
        const verified = requiredRhyme
          ? raw.filter(s => rhymesOf(s.char).includes(requiredRhyme))
          : raw;
        const fresh = verified.map(s => {
          const actual = rhymesOf(s.char);
          return { ...s, rhyme: actual.length ? actual.join("/") : s.rhyme };
        }).filter(s => !prevSeen.has(s.char));
        if (fresh.length === 0 || raw.length < 5) {
          setExhausted(true);
        }
        const nextSeen = new Set(prevSeen);
        for (const s of fresh) nextSeen.add(s.char);
        setSeenChars(nextSeen);
        setSuggestions(fresh);
      })
      .catch(err => setSuggestError(String(err.message ?? err)))
      .finally(() => setSuggestLoading(false));
  };

  const openSuggest = () => {
    setView("suggest");
    if (!initialLoaded && !suggestLoading) {
      setInitialLoaded(true);
      fetchBatch(seenChars);
    }
  };

  const loadNextPage = () => {
    if (suggestLoading || exhausted) return;
    fetchBatch(seenChars);
  };

  const trad = val ? toTraditional(val) : "";
  const simp = val ? toSimplified(val) : "";
  const sameForm = trad === simp;
  const py = val
    ? Array.from(new Set(
        (pinyin(val, { toneType: "symbol", multiple: true, type: "array" }) as string[])
          .map(s => s.trim())
          .filter(Boolean)
      )).join(" / ")
    : "";

  const charEntry = val && dictsReady ? cedictLookup(val) : null;
  const basicEnDefs = charEntry ? charEntry.definitions.slice(0, 2) : [];
  const basicZhDefs = val && dictsReady ? moedictLookup(val) : [];
  const ctx = val && dictsReady ? cedictContext(prevChar, val, nextChar) : null;
  const ctxWord = ctx ? ctx.word : (prevChar ? prevChar + val : (nextChar ? val + nextChar : ""));
  const ctxEnDefs = ctx ? ctx.entry.definitions.slice(0, 2) : [];
  const ctxZhDefs = ctxWord && dictsReady ? moedictLookup(ctxWord) : [];
  const showCtx = dictsReady && !!(ctxEnDefs.length || ctxZhDefs.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative ink-card rounded-lg px-6 py-5 w-[min(28rem,90vw)] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {view === "edit" ? (
          <>
            <div className="flex items-start justify-between mb-1">
              <div className="text-xs text-creamDim font-sans">{t.charLabel(lineIdx+1, pos+1)}</div>
              {mismatch && (
                <button
                  onClick={openSuggest}
                  aria-label={t.suggest}
                  title={t.suggest}
                  className="text-lg leading-none hover:opacity-80"
                >🙏</button>
              )}
            </div>
            <input
              autoFocus
              value={val}
              onChange={e => {
                const s = Array.from(e.target.value);
                setVal(s[s.length - 1] ?? "");
              }}
              maxLength={2}
              className="w-full bg-ink-bg border border-ink-line rounded px-3 py-2 text-4xl font-serif text-cream text-center outline-none focus:border-gold"
            />

            {val && (
              <div className="mt-4 text-sm font-sans space-y-3">
                <div className="flex gap-4">
                  <div>
                    <div className="text-creamDim text-xs">{t.trad} / {t.simp}</div>
                    <div className="mt-1 font-serif text-lg text-cream">
                      {sameForm ? trad : `${trad} / ${simp}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-creamDim text-xs">{t.pinyin}</div>
                    <div className="mt-1 font-serif text-lg text-gold">{py}</div>
                  </div>
                </div>

                {info && !info.unknown && (
                  <div>
                    <div className="text-creamDim text-xs">{t.reading}</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {info.entries.map((e, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-ink-bg border border-ink-line">
                          <span className={e.tone === "平" ? "text-teal" : e.tone === "入" ? "text-amber" : "text-rose"}>
                            {e.tone}
                          </span>
                          <span className="text-cream ml-1">{e.rhyme}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {info?.unknown && (
                  <div className="text-rose">{t.notInTable(val)}</div>
                )}

                <div>
                  <div className="text-creamDim text-xs">{t.meaning}</div>
                  {!dictsReady ? (
                    <div className="mt-1 text-creamDim">
                      {dictError ? <span className="text-rose text-xs">{dictError}</span> : t.loading}
                    </div>
                  ) : (
                    <>
                      {basicZhDefs.length > 0 && (
                        <div className="mt-1 text-cream leading-[1.6]">
                          <span className="text-creamDim">{t.zhDef}：</span>
                          {basicZhDefs.join("；")}
                        </div>
                      )}
                      {basicEnDefs.length > 0 && (
                        <div className="mt-1 text-cream leading-[1.6]">
                          <span className="text-creamDim">{t.enDef}: </span>
                          {basicEnDefs.join("; ")}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {showCtx && (
                  <div>
                    <div className="text-creamDim text-xs">{t.context}（「{ctxWord}」）</div>
                    {ctxZhDefs.length > 0 && (
                      <div className="mt-1 text-cream leading-[1.6]">
                        <span className="text-creamDim">{t.zhDef}：</span>
                        {ctxZhDefs.join("；")}
                      </div>
                    )}
                    {ctxEnDefs.length > 0 && (
                      <div className="mt-1 text-cream leading-[1.6]">
                        <span className="text-creamDim">{t.enDef}: </span>
                        {ctxEnDefs.join("; ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="px-3 py-1.5 text-sm text-creamDim hover:text-cream">{t.cancel}</button>
              <button
                onClick={() => { onCommit(val); onClose(); }}
                className="px-3 py-1.5 text-sm bg-gold text-ink-bg rounded hover:opacity-90"
              >{t.confirm}</button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setView("edit")}
              className="text-sm font-sans text-creamDim hover:text-gold"
            >{t.back2}</button>
            <div className="mt-3 text-base font-serif text-cream">
              {t.suggestHeading(val, expectedTone ?? "")}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {suggestions.length > 0 && (
                suggestions.map((s, i) => (
                  <button
                    key={`${s.char}-${i}`}
                    onClick={() => { onCommit(s.char); onClose(); }}
                    className="flex items-center gap-4 px-3 py-2 rounded border border-ink-line hover:border-gold text-left transition"
                  >
                    <span className="text-3xl font-serif text-cream">{s.char}</span>
                    <span className="flex flex-col min-w-0">
                      {s.rhyme && <span className="text-xs text-gold font-sans">{s.rhyme}</span>}
                      {s.definition && <span className="text-sm text-creamDim font-sans truncate">{s.definition}</span>}
                    </span>
                  </button>
                ))
              )}
              {suggestLoading && <div className="text-creamDim text-sm text-center py-2">{t.loading}</div>}
              {suggestError && <div className="text-rose text-sm">{suggestError}</div>}
              {!suggestLoading && !suggestError && suggestions.length === 0 && initialLoaded && (
                <div className="text-creamDim text-sm">{t.noSuggestion}</div>
              )}
              {!suggestLoading && !exhausted && initialLoaded && (
                <button
                  onClick={loadNextPage}
                  className="w-full border border-ink-line text-creamDim hover:text-gold hover:border-gold rounded py-2 text-sm font-sans transition"
                >{t.nextPage}</button>
              )}
              {exhausted && !suggestLoading && (
                <div className="text-creamDim text-sm text-center py-2">{t.noMore}</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
