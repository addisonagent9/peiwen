import type { LineTemplate, PoemPattern, Tone } from "../patterns/types";
import { lookup, lookupExpecting, computeRequiredRhyme, type ToneInfo } from "./tone";
import { checkRhymes, type RhymeCheckResult } from "./rhyme";

export interface CharAnalysis extends ToneInfo {
  pos: number;       // 1-indexed within line
  lineIdx: number;
  expected: Tone | null;   // null = free slot
  slotKind: "fixed" | "free" | "constrained";
  mismatch: boolean;       // tone ≠ fixed requirement
}

export interface LineIssue {
  kind: "孤平" | "三平尾" | "三仄尾" | "失對" | "失粘" | "出律" | "拗救" | "邊界";
  severity: "error" | "warn" | "info";
  lineIdx: number;
  message: string;
}

export interface PatternMatchResult {
  pattern: PoemPattern;
  chars: CharAnalysis[][];   // [line][pos]
  toneScore: number;         // 0..1 fraction of fixed positions matched
  rhymeScore: number;        // 0..1 (base + neighbor partial credit)
  combined: number;          // 0.65*tone + 0.35*rhyme
  issues: LineIssue[];
  rhyme: RhymeCheckResult | null;
  nianDuiOk: boolean;
}

export function analyzeAgainst(lines: string[][], pattern: PoemPattern, pins?: Record<string, { tone: string; rhyme: string }>): PatternMatchResult {
  const issues: LineIssue[] = [];
  const chars: CharAnalysis[][] = [];
  let fixedTotal = 0, fixedMatched = 0;
  const reqRhyme = computeRequiredRhyme(lines);

  // Per-line fixed-slot validation + 多音字 resolution via expected tone.
  for (let li = 0; li < pattern.lines.length; li++) {
    const tmpl = pattern.lines[li];
    const row = lines[li] ?? [];
    const rowOut: CharAnalysis[] = [];
    for (let i = 0; i < tmpl.slots.length; i++) {
      const ch = row[i] ?? "";
      const slot = tmpl.slots[i];
      const expected: Tone | null =
        slot === "P" ? "平" : slot === "Z" ? "仄" : null;
      const isRhymePos = tmpl.rhymes && i === tmpl.slots.length - 1;
      const pin = pins?.[`${li},${i}`] ?? null;
      const info = ch ? lookupExpecting(ch, expected, reqRhyme, isRhymePos, pin) : {
        char: "", entries: [], chosen: null, tone: null as Tone | null,
        isRu: false, ambiguous: false, unknown: true
      } as ToneInfo;
      const slotKind: "fixed" | "free" | "constrained" =
        slot === "P" || slot === "Z" ? "fixed" : slot === "f" ? "free" : "constrained";
      let mismatch = false;
      if (expected && !ch) mismatch = true;
      else if (expected && info.tone && info.tone !== expected) mismatch = true;
      if (slotKind === "fixed") {
        fixedTotal++;
        if (info.tone && info.tone === expected) fixedMatched++;
      }
      rowOut.push({ ...info, pos: i + 1, lineIdx: li, expected, slotKind, mismatch });
    }
    chars.push(rowOut);
  }

  // Line-level 禁忌: 孤平 (rhyming lines only), 三平尾 / 三仄尾 (all lines).
  for (let li = 0; li < pattern.lines.length; li++) {
    const tmpl = pattern.lines[li];
    const row = chars[li];
    const tones = row.map(c => c.tone);
    const N = tmpl.slots.length;
    const last3 = tones.slice(N - 3);
    if (last3.every(t => t === "平")) {
      issues.push({ kind: "三平尾", severity: "error", lineIdx: li, message: `第${li+1}句三平尾` });
    } else if (last3.every(t => t === "仄")) {
      issues.push({ kind: "三仄尾", severity: "info", lineIdx: li, message: `第${li+1}句三仄尾（唐詩可見，可接受）` });
    }
    if (tmpl.rhymes) {
      // 孤平: in a 平韻 rhyming line, the non-rhyme portion has only one 平 (or fewer).
      // Standard definition on 7-char rhyming line ending 平: pos1..pos6 has only one 平.
      if (N === 7 || N === 5) {
        const nonRhyme = tones.slice(0, N - 1);
        const pingCount = nonRhyme.filter(t => t === "平").length;
        // Check only if this is a 平韻 rhyming line (tmpl last slot = P or c resolving to 平).
        const endsPing = tones[N - 1] === "平";
        if (endsPing && pingCount <= 1) {
          // but check 孤平自救: 5th-position 平 rescues — covered by 拗救 matcher below.
          const lonePos = nonRhyme.findIndex(t => t === "平");
          const where = lonePos >= 0 ? `第${lonePos + 1}字` : "";
          issues.push({ kind: "孤平", severity: "error", lineIdx: li,
            message: `第${li+1}句${where}孤平（非韻字僅${pingCount}個平聲）` });
        }
      }
    }
  }

  // Fixed-slot mismatches → 出律.
  for (let li = 0; li < chars.length; li++) {
    for (const c of chars[li]) {
      if (c.slotKind === "fixed" && c.mismatch) {
        issues.push({
          kind: "出律",
          severity: "error",
          lineIdx: li,
          message: `第${li+1}句第${c.pos}字「${c.char}」應為${c.expected}，實為${c.tone ?? "?"}`
        });
      }
    }
  }

  // 拗救 recognition — downgrade matching errors to info.
  applyAoJiu(chars, issues, pattern);

  // 粘對 check on 2/4/6 (for 七言) / 2/4 (for 五言).
  const nianDui = checkNianDui(chars, pattern);
  issues.push(...nianDui.issues);

  // 押韻.
  const endChars: Array<{ char: string; chosenRhyme: string | null; lineIdx: number; isFirst: boolean }> = [];
  let totalRhymeLines = 0;
  const missingRhymeLines: number[] = [];
  for (let li = 0; li < pattern.lines.length; li++) {
    if (pattern.lines[li].rhymes) {
      totalRhymeLines++;
      const row = chars[li];
      const lastCell = row[row.length - 1];
      if (lastCell?.char) endChars.push({ char: lastCell.char, chosenRhyme: lastCell.chosen?.rhyme ?? null, lineIdx: li, isFirst: li === 0 });
      else missingRhymeLines.push(li);
    }
  }
  for (const li of missingRhymeLines) {
    issues.push({ kind: "出律", severity: "error", lineIdx: li,
      message: `第${li+1}句缺韻腳（此句未完成）` });
  }
  const rhyme = endChars.length ? checkRhymes(endChars, reqRhyme) : null;
  if (rhyme) {
    for (const o of rhyme.offending) {
      issues.push({ kind: "出律", severity: "error", lineIdx: o.lineIdx,
        message: `第${o.lineIdx+1}句韻腳「${o.char}」— ${o.reason}` });
    }
    for (const d of rhyme.duplicates) {
      issues.push({ kind: "出律", severity: "warn", lineIdx: d.lineIdx,
        message: `第${d.lineIdx+1}句重韻「${d.char}」` });
    }
    if (rhyme.firstLineNeighbor) {
      issues.push({ kind: "拗救", severity: "info", lineIdx: 0,
        message: `首句押鄰韻（孤雁出群格，允許）` });
    }
  }

  // Scores.
  const toneScore = fixedTotal ? fixedMatched / fixedTotal : 0;
  let rhymeScore = 0;
  if (totalRhymeLines === 0) {
    rhymeScore = 1;
  } else if (!rhyme) {
    rhymeScore = 0;
  } else {
    const strict = endChars.length - rhyme.offending.length - (rhyme.firstLineNeighbor ? 1 : 0);
    rhymeScore = (strict + (rhyme.firstLineNeighbor ? 0.7 : 0)) / totalRhymeLines;
  }
  const combined = 0.65 * toneScore + 0.35 * rhymeScore;

  return {
    pattern, chars, toneScore, rhymeScore, combined,
    issues, rhyme, nianDuiOk: nianDui.ok
  };
}

// --- 拗救 recognition --------------------------------------------------

function tonesOfLine(row: CharAnalysis[]): (Tone | null)[] {
  return row.map(c => c.tone);
}

function applyAoJiu(chars: CharAnalysis[][], issues: LineIssue[], pattern: PoemPattern) {
  for (let li = 0; li < chars.length; li++) {
    const tmpl = pattern.lines[li];
    const N = tmpl.slots.length;
    const tones = tonesOfLine(chars[li]);
    // We only recognize 拗救 on 七言 lines in this spec.
    if (N !== 7) continue;

    const t = tones as Tone[];
    const match = (pat: (Tone|"*")[]): boolean => pat.every((v, i) => v === "*" || t[i] === v);

    // 孤平自救 (rhyming line): ◉仄仄平平仄平 — pos 3 仄 → pos 5 平 救.
    if (tmpl.rhymes && match(["*","仄","仄","平","平","仄","平"])) {
      demote(issues, li, "孤平", `第${li+1}句孤平自救（拗救合法）`);
    }
    // 特拗 (锦鲤翻波) on C-nonrhy: ◉仄平平仄平仄 — pos 5/6 swap.
    if (!tmpl.rhymes && match(["*","仄","平","平","仄","平","仄"])) {
      demote(issues, li, "出律", `第${li+1}句特拗（錦鯉翻波，合法）`);
    }
    // 半拗: 出句 平平仄仄仄平仄 — pos 5 becomes 仄 in A-nonrhy line.
    if (!tmpl.rhymes && match(["平","平","仄","仄","仄","平","仄"])) {
      demote(issues, li, "出律", `第${li+1}句半拗（可不救，合法）`);
    }
    // 大拗: 仄仄平仄仄仄仄 — rare, flag as warning not error.
    if (match(["仄","仄","平","仄","仄","仄","仄"])) {
      demote(issues, li, "出律", `第${li+1}句大拗（非常規，建議避免）`, "warn");
    }
  }
}

function demote(issues: LineIssue[], lineIdx: number, fromKind: LineIssue["kind"],
                msg: string, severity: LineIssue["severity"] = "info") {
  for (let i = issues.length - 1; i >= 0; i--) {
    const it = issues[i];
    if (it.lineIdx === lineIdx && it.kind === fromKind) issues.splice(i, 1);
  }
  issues.push({ kind: "拗救", severity, lineIdx, message: msg });
}

// --- Live issue computation (for buildFromPoem) --------------------------

export function computeLiveIssues(chars: CharAnalysis[][], pattern: PoemPattern): LineIssue[] {
  const issues: LineIssue[] = [];

  for (let li = 0; li < pattern.lines.length; li++) {
    const tmpl = pattern.lines[li];
    const row = chars[li];
    if (!row) continue;
    const tones = row.map(c => c.tone);
    const N = tmpl.slots.length;
    const filled = row.filter(c => c.char !== "").length;
    if (filled === 0) continue;

    // 出律
    for (const c of row) {
      if (c.char && c.slotKind === "fixed" && c.mismatch) {
        issues.push({ kind: "出律", severity: "error", lineIdx: li,
          message: `第${li+1}句第${c.pos}字「${c.char}」應為${c.expected}，實為${c.tone ?? "?"}` });
      }
    }

    // 三平尾 / 三仄尾 (only check if last 3 chars are all filled)
    const last3 = tones.slice(N - 3);
    if (last3.every(t => t !== null)) {
      if (last3.every(t => t === "平")) {
        issues.push({ kind: "三平尾", severity: "error", lineIdx: li, message: `第${li+1}句三平尾` });
      } else if (last3.every(t => t === "仄")) {
        issues.push({ kind: "三仄尾", severity: "info", lineIdx: li, message: `第${li+1}句三仄尾（唐詩可見，可接受）` });
      }
    }

    // 孤平
    if (tmpl.rhymes && (N === 7 || N === 5)) {
      const nonRhyme = tones.slice(0, N - 1);
      const nonRhymeFilled = nonRhyme.filter(t => t !== null);
      if (nonRhymeFilled.length === nonRhyme.length) {
        const pingCount = nonRhyme.filter(t => t === "平").length;
        const endsPing = tones[N - 1] === "平";
        if (endsPing && pingCount <= 1) {
          const lonePos = nonRhyme.findIndex(t => t === "平");
          const where = lonePos >= 0 ? `第${lonePos + 1}字` : "";
          issues.push({ kind: "孤平", severity: "error", lineIdx: li,
            message: `第${li+1}句${where}孤平（非韻字僅${pingCount}個平聲）` });
        }
      }
    }
  }

  // 粘對
  const nianDui = checkNianDui(chars, pattern);
  issues.push(...nianDui.issues);

  return issues;
}

// --- 粘對 ----------------------------------------------------------------

export function checkNianDui(chars: CharAnalysis[][], pattern: PoemPattern): { ok: boolean; issues: LineIssue[] } {
  const issues: LineIssue[] = [];
  const L = pattern.lines.length;
  if (L < 2) return { ok: true, issues };
  const N = pattern.lines[0].slots.length;
  const keys = N === 7 ? [2, 4, 6] : [2, 4];

  const toneAt = (li: number, pos: number): Tone | null => {
    if (li >= chars.length) return null;
    return chars[li]?.[pos - 1]?.tone ?? null;
  };

  // 對: within each couplet, key positions must have opposite tones
  const couplets = Math.floor(L / 2);
  for (let c = 0; c < couplets; c++) {
    const a = c * 2, b = a + 1;
    const failed: number[] = [];
    for (const k of keys) {
      const ta = toneAt(a, k);
      const tb = toneAt(b, k);
      if (ta === null || tb === null) continue;
      if (ta === tb) failed.push(k);
    }
    if (failed.length > 0) {
      issues.push({ kind: "失對", severity: "error", lineIdx: b,
        message: `第${a+1}、${b+1}句失對（${failed.map(k => `第${k}字`).join("、")}）` });
    }
  }

  // 粘: between couplets, bridge lines must have matching tones
  for (let i = 1; i < couplets; i++) {
    const a = i * 2 - 1, b = i * 2;
    const failed: number[] = [];
    for (const k of keys) {
      const ta = toneAt(a, k);
      const tb = toneAt(b, k);
      if (ta === null || tb === null) continue;
      if (ta !== tb) failed.push(k);
    }
    if (failed.length > 0) {
      issues.push({ kind: "失粘", severity: "error", lineIdx: b,
        message: `第${a+1}、${b+1}句失粘（${failed.map(k => `第${k}字`).join("、")}）` });
    }
  }

  return { ok: issues.length === 0, issues };
}
