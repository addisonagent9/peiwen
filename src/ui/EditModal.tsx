import React, { useEffect, useState } from "react";
import { lookup } from "../analysis/tone";
import { toTraditional, toSimplified } from "../analysis/s2t";
import { cedictLookup, cedictContext, loadCedict, isCedictLoaded } from "../analysis/cedict";
import { moedictLookup, loadMoedict, isMoedictLoaded } from "../analysis/moedict";
import { pinyin } from "pinyin-pro";

interface Props {
  open: boolean;
  initial: string;
  prevChar?: string;
  nextChar?: string;
  lineIdx: number;
  pos: number;
  onClose: () => void;
  onCommit: (ch: string) => void;
}

export function EditModal({ open, initial, prevChar = "", nextChar = "", lineIdx, pos, onClose, onCommit }: Props) {
  const [val, setVal] = useState(initial);
  const [dictsReady, setDictsReady] = useState(isCedictLoaded() && isMoedictLoaded());
  const [dictError, setDictError] = useState<string | null>(null);

  useEffect(() => { setVal(initial); }, [initial, open]);

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
        <div className="text-xs text-creamDim font-sans mb-1">第{lineIdx+1}句 · 第{pos+1}字</div>
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
                <div className="text-creamDim text-xs">繁體 / 簡體</div>
                <div className="mt-1 font-serif text-lg text-cream">
                  {sameForm ? trad : `${trad} / ${simp}`}
                </div>
              </div>
              <div>
                <div className="text-creamDim text-xs">漢語拼音</div>
                <div className="mt-1 font-serif text-lg text-gold">{py}</div>
              </div>
            </div>

            {info && !info.unknown && (
              <div>
                <div className="text-creamDim text-xs">讀音</div>
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
              <div className="text-rose">「{val}」不在平水韻表</div>
            )}

            <div>
              <div className="text-creamDim text-xs">字義</div>
              {!dictsReady ? (
                <div className="mt-1 text-creamDim">
                  {dictError ? <span className="text-rose text-xs">{dictError}</span> : "載入中…"}
                </div>
              ) : (
                <>
                  <div className="mt-1 text-cream leading-[1.6]">
                    <span className="text-creamDim">釋義：</span>
                    {basicZhDefs.length ? basicZhDefs.join("；") : <span className="text-creamDim">無釋義</span>}
                  </div>
                  <div className="mt-1 text-cream leading-[1.6]">
                    <span className="text-creamDim">English: </span>
                    {basicEnDefs.length ? basicEnDefs.join("; ") : <span className="text-creamDim">無釋義</span>}
                  </div>
                </>
              )}
            </div>

            {showCtx && (
              <div>
                <div className="text-creamDim text-xs">詞語義（「{ctxWord}」）</div>
                <div className="mt-1 text-cream leading-[1.6]">
                  <span className="text-creamDim">釋義：</span>
                  {ctxZhDefs.length ? ctxZhDefs.join("；") : <span className="text-creamDim">無釋義</span>}
                </div>
                <div className="mt-1 text-cream leading-[1.6]">
                  <span className="text-creamDim">English: </span>
                  {ctxEnDefs.length ? ctxEnDefs.join("; ") : <span className="text-creamDim">無釋義</span>}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-creamDim hover:text-cream">取消</button>
          <button
            onClick={() => { onCommit(val); onClose(); }}
            className="px-3 py-1.5 text-sm bg-gold text-ink-bg rounded hover:opacity-90"
          >確定</button>
        </div>
      </div>
    </div>
  );
}
