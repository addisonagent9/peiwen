#!/usr/bin/env node
// Build script for #15 — Unihan-based variant detection.
//
// Fetches Unihan.zip (cached at ~/.cache/peiwen/unihan/), extracts
// Unihan_Variants.txt, parses kZVariant + kCompatibilityVariant edges,
// and BFS-resolves each variant char that's absent from pingshui.json
// to its closest pingshui-attested canonical (depth ≤ 3,
// codepoint-ascending tie-break, cycle detection).
//
// Emits src/data/unihan-variants.ts as a Record<string, string>
// keyed by variant char, valued by canonical form.
//
// Manual invocation only — NOT chained into npm run data.
//
// Usage:
//   node scripts/build-unihan-variants.mjs           # use cached zip if present
//   node scripts/build-unihan-variants.mjs --refresh # force re-download

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const PINGSHUI_PATH = path.join(REPO_ROOT, 'src', 'data', 'pingshui.json');
const OUTPUT_PATH = path.join(REPO_ROOT, 'src', 'data', 'unihan-variants.ts');

const CACHE_DIR = path.join(os.homedir(), '.cache', 'peiwen', 'unihan');
const CACHE_FILE = path.join(CACHE_DIR, 'Unihan.zip');
const META_FILE = path.join(CACHE_DIR, 'Unihan.zip.meta.json');
const UNIHAN_URL = 'https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip';

// Variant fields admitted into the graph. kSemanticVariant +
// kSpecializedSemanticVariant are included (per design pivot in
// Stage 1.2) but emission is gated by a rhyme-equivalence filter:
// when BFS reaches multiple pingshui canonicals at the same depth,
// emit only if they share ≥1 rhyme. This structurally prevents the
// "meaning-distinct merger" rhyme drift that motivated the original
// scope restriction.
//
// kSpoofingVariant excluded — that's homoglyph-attack confusion,
// irrelevant to classical rhyme analysis. kSimplifiedVariant +
// kTraditionalVariant excluded — already covered by opencc-js t2s
// fallback in the analyzer.
const TARGET_FIELDS = new Set([
  'kZVariant',
  'kCompatibilityVariant',
  'kSemanticVariant',
  'kSpecializedSemanticVariant',
]);
// kZVariant + kSemanticVariant + kSpecializedSemanticVariant live in
// Unihan_Variants.txt; kCompatibilityVariant lives in Unihan_IRGSources.txt
// (verified against current release). Scan both.
const TARGET_FILES_IN_ZIP = ['Unihan_Variants.txt', 'Unihan_IRGSources.txt'];
const MAX_BFS_DEPTH = 3;

// ---------------------------------------------------------------------------
// Step A: cache management
// ---------------------------------------------------------------------------

async function ensureCache(refresh) {
  if (fs.existsSync(CACHE_FILE) && !refresh) {
    const stat = fs.statSync(CACHE_FILE);
    const meta = fs.existsSync(META_FILE)
      ? JSON.parse(fs.readFileSync(META_FILE, 'utf-8'))
      : null;
    console.log(`[unihan-variants] using cached Unihan.zip from ${CACHE_FILE} (${stat.size} bytes)`);
    return { fetched: false, bytes: stat.size, lastModified: meta?.lastModified ?? null };
  }
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  console.log(`[unihan-variants] fetching ${UNIHAN_URL}`);
  let res;
  try {
    res = await fetch(UNIHAN_URL);
  } catch (e) {
    console.error(`[unihan-variants] fetch failed: ${e.message}`);
    console.error(`[unihan-variants] download Unihan.zip manually to ${CACHE_FILE} if your network blocks unicode.org`);
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`[unihan-variants] HTTP ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const lastModified = res.headers.get('last-modified');
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(CACHE_FILE, buf);
  fs.writeFileSync(META_FILE, JSON.stringify({ lastModified, fetchedAt: new Date().toISOString() }, null, 2));
  console.log(`[unihan-variants] downloaded ${buf.length} bytes (Last-Modified: ${lastModified})`);
  return { fetched: true, bytes: buf.length, lastModified };
}

// ---------------------------------------------------------------------------
// Step B: minimal ZIP reader (node:zlib only, no external deps)
// ---------------------------------------------------------------------------
//
// Reads via End-of-Central-Directory record. Supports DEFLATE (method=8)
// and stored (method=0). No zip64 / no spanning / no encryption — Unihan.zip
// is a single-file standard ZIP well under 4 GB.

function readEocd(buf) {
  const sig = 0x06054b50;
  // EOCD is at end; minimum 22 bytes; comment up to 65535 bytes after
  const minStart = Math.max(0, buf.length - 22 - 65535);
  for (let i = buf.length - 22; i >= minStart; i--) {
    if (buf.readUInt32LE(i) === sig) {
      return {
        cdEntries: buf.readUInt16LE(i + 10),
        cdSize: buf.readUInt32LE(i + 12),
        cdOffset: buf.readUInt32LE(i + 16),
      };
    }
  }
  throw new Error('EOCD not found — not a valid ZIP file?');
}

function findFileInCentralDir(buf, eocd, targetName) {
  const sig = 0x02014b50;
  let off = eocd.cdOffset;
  for (let n = 0; n < eocd.cdEntries; n++) {
    if (buf.readUInt32LE(off) !== sig) {
      throw new Error(`central directory entry ${n} bad signature at offset ${off}`);
    }
    const compMethod = buf.readUInt16LE(off + 10);
    const compSize = buf.readUInt32LE(off + 20);
    const uncompSize = buf.readUInt32LE(off + 24);
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const commentLen = buf.readUInt16LE(off + 32);
    const localOff = buf.readUInt32LE(off + 42);
    const name = buf.slice(off + 46, off + 46 + nameLen).toString('utf-8');
    if (name === targetName) {
      return { compMethod, compSize, uncompSize, localOff };
    }
    off += 46 + nameLen + extraLen + commentLen;
  }
  return null;
}

function extractFromLocalHeader(buf, entry) {
  const sig = 0x04034b50;
  const off = entry.localOff;
  if (buf.readUInt32LE(off) !== sig) {
    throw new Error(`local header bad signature at offset ${off}`);
  }
  const nameLen = buf.readUInt16LE(off + 26);
  const extraLen = buf.readUInt16LE(off + 28);
  const dataStart = off + 30 + nameLen + extraLen;
  const compressed = buf.slice(dataStart, dataStart + entry.compSize);
  if (entry.compMethod === 0) return compressed;
  if (entry.compMethod === 8) return zlib.inflateRawSync(compressed);
  throw new Error(`unsupported compression method ${entry.compMethod}`);
}

function extractFile(zipPath, fileName) {
  const buf = fs.readFileSync(zipPath);
  const eocd = readEocd(buf);
  const entry = findFileInCentralDir(buf, eocd, fileName);
  if (!entry) throw new Error(`${fileName} not found in zip`);
  return extractFromLocalHeader(buf, entry).toString('utf-8');
}

function extractFiles(zipPath, fileNames) {
  const buf = fs.readFileSync(zipPath);
  const eocd = readEocd(buf);
  const out = {};
  for (const name of fileNames) {
    const entry = findFileInCentralDir(buf, eocd, name);
    if (!entry) throw new Error(`${name} not found in zip`);
    out[name] = extractFromLocalHeader(buf, entry).toString('utf-8');
  }
  return out;
}

// ---------------------------------------------------------------------------
// Step C: parse Unihan_Variants.txt
// ---------------------------------------------------------------------------

function parseVariants(text) {
  // Returns Map<sourceChar, Array<targetChar>> for kZVariant + kCompatibilityVariant.
  // Source-tagged forms like `U+1234<kFoo` are stripped — we keep only the codepoint.
  const graph = new Map();
  let parsedLines = 0;
  let kept = 0;
  for (const line of text.split('\n')) {
    if (!line || line.startsWith('#')) continue;
    parsedLines++;
    const parts = line.split('\t');
    if (parts.length !== 3) continue;
    const [cpField, fieldName, value] = parts;
    if (!TARGET_FIELDS.has(fieldName)) continue;
    if (!cpField.startsWith('U+')) continue;
    const srcCp = parseInt(cpField.slice(2), 16);
    if (!Number.isFinite(srcCp)) continue;
    const src = String.fromCodePoint(srcCp);
    // VALUE may have multiple targets separated by whitespace, each
    // possibly tagged `<kSourceA,kSourceB`. Strip tag, parse codepoint.
    const targets = [];
    for (const tok of value.split(/\s+/)) {
      const stripped = tok.split('<')[0];
      if (!stripped.startsWith('U+')) continue;
      const tCp = parseInt(stripped.slice(2), 16);
      if (!Number.isFinite(tCp)) continue;
      targets.push(String.fromCodePoint(tCp));
    }
    if (targets.length === 0) continue;
    const existing = graph.get(src) ?? [];
    for (const t of targets) {
      if (t !== src && !existing.includes(t)) existing.push(t);
    }
    graph.set(src, existing);
    kept++;
  }
  return { graph, parsedLines, kept };
}

// ---------------------------------------------------------------------------
// Step D: BFS resolve each variant to its closest pingshui-attested canonical
// ---------------------------------------------------------------------------

// Returns { resolved, stats }. resolved is Map<variant, canonical>.
// Stats: { proposed, emittedSingle, emittedMulti, skippedMulti }.
//
// Per Stage 1.2 design pivot: when BFS reaches MULTIPLE pingshui canonicals
// at the same depth (branching), emit only if their rhyme sets share ≥1
// rhyme group. Otherwise skip — that variant is a meaning-distinct merger,
// out of scope for #15 (deferred to a future ticket analogous to #7's
// meaning-distinct deferrals).
//
// Tie-break for multi-canonical: pick smallest codepoint for determinism.
function resolveVariants(graph, pingshui) {
  const pingshuiKeys = new Set(Object.keys(pingshui.chars));
  const resolved = new Map();
  const stats = { proposed: 0, emittedSingle: 0, emittedMulti: 0, skippedMulti: 0 };

  for (const src of graph.keys()) {
    if (pingshuiKeys.has(src)) continue; // src already in pingshui — no fallback needed
    const visited = new Set([src]);
    let frontier = [src];
    let reachedAtThisDepth = [];

    for (let depth = 1; depth <= MAX_BFS_DEPTH; depth++) {
      const nextFrontier = [];
      const reached = [];
      for (const node of frontier) {
        const outs = graph.get(node) ?? [];
        const sortedOuts = [...outs].sort(
          (a, b) => a.codePointAt(0) - b.codePointAt(0)
        );
        for (const next of sortedOuts) {
          if (visited.has(next)) continue;
          visited.add(next);
          if (pingshuiKeys.has(next)) {
            reached.push(next);
          } else {
            nextFrontier.push(next);
          }
        }
      }
      if (reached.length > 0) {
        reachedAtThisDepth = reached;
        break;
      }
      frontier = nextFrontier;
      if (frontier.length === 0) break;
    }

    if (reachedAtThisDepth.length === 0) continue;
    stats.proposed++;

    if (reachedAtThisDepth.length === 1) {
      // Case 4 — single canonical (multi-rhyme-on-canonical is fine,
      // matches t2s fallback's existing behavior).
      resolved.set(src, reachedAtThisDepth[0]);
      stats.emittedSingle++;
      continue;
    }

    // Case 3 — multiple canonicals at the same depth. Apply rhyme-equivalence filter.
    const rhymeSets = reachedAtThisDepth.map(c =>
      new Set((pingshui.chars[c] ?? []).map(e => e.rhyme))
    );
    let intersection = new Set(rhymeSets[0]);
    for (let i = 1; i < rhymeSets.length; i++) {
      intersection = new Set([...intersection].filter(r => rhymeSets[i].has(r)));
    }
    if (intersection.size === 0) {
      // Genuine meaning-distinct merger — skip.
      stats.skippedMulti++;
      continue;
    }
    // Codepoint-ascending tie-break to pick canonical.
    const sorted = [...reachedAtThisDepth].sort(
      (a, b) => a.codePointAt(0) - b.codePointAt(0)
    );
    resolved.set(src, sorted[0]);
    stats.emittedMulti++;
  }
  return { resolved, stats };
}

// ---------------------------------------------------------------------------
// Step E: emit src/data/unihan-variants.ts
// ---------------------------------------------------------------------------

function emitTypeScript(resolved, lastModified) {
  const sorted = [...resolved.entries()].sort(
    (a, b) => a[0].codePointAt(0) - b[0].codePointAt(0)
  );
  const today = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push('// AUTO-GENERATED by scripts/build-unihan-variants.mjs');
  lines.push('// Do not edit by hand. Re-run script after Unihan releases.');
  lines.push('//');
  lines.push('// Source: Unicode Unihan database');
  lines.push('//   Fields: kZVariant + kCompatibilityVariant + kSemanticVariant');
  lines.push('//           + kSpecializedSemanticVariant');
  lines.push('//   URL: https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip');
  lines.push(`//   Last-Modified: ${lastModified ?? '(unknown — manual cache)'}`);
  lines.push(`//   Built: ${today}`);
  lines.push('//');
  lines.push('// Filter: variant char absent from pingshui.json AND a canonical form');
  lines.push('// is reachable via BFS (depth ≤ 3, codepoint-ascending tie-break).');
  lines.push('// Rhyme-equivalence guard: when BFS reaches multiple canonicals at the');
  lines.push('// same depth, emit only if their rhyme sets share ≥1 rhyme group;');
  lines.push('// otherwise skip (meaning-distinct merger, deferred to future ticket).');
  lines.push('');
  lines.push('export const UNIHAN_VARIANTS: Record<string, string> = {');
  for (const [v, c] of sorted) {
    const cp = v.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    lines.push(`  '${v}': '${c}', // U+${cp}`);
  }
  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const refresh = process.argv.includes('--refresh');
  const cache = await ensureCache(refresh);
  console.log(`[unihan-variants] extracting ${TARGET_FILES_IN_ZIP.join(', ')} from zip`);
  const texts = extractFiles(CACHE_FILE, TARGET_FILES_IN_ZIP);
  let totalParsed = 0;
  let totalKept = 0;
  const graph = new Map();
  for (const fname of TARGET_FILES_IN_ZIP) {
    const text = texts[fname];
    console.log(`[unihan-variants] ${fname}: ${text.length} chars`);
    const { graph: g, parsedLines, kept } = parseVariants(text);
    totalParsed += parsedLines;
    totalKept += kept;
    // merge graph
    for (const [src, targets] of g.entries()) {
      const existing = graph.get(src) ?? [];
      for (const t of targets) {
        if (t !== src && !existing.includes(t)) existing.push(t);
      }
      graph.set(src, existing);
    }
  }
  console.log(`[unihan-variants] parsed ${totalParsed} non-comment lines; kept ${totalKept} matching ${[...TARGET_FIELDS].join('/')} rows`);
  console.log(`[unihan-variants] graph: ${graph.size} source nodes`);

  const ps = JSON.parse(fs.readFileSync(PINGSHUI_PATH, 'utf-8'));
  console.log(`[unihan-variants] pingshui keys: ${Object.keys(ps.chars).length}`);

  const { resolved, stats } = resolveVariants(graph, ps);
  console.log(`[unihan-variants] BFS proposed ${stats.proposed} variants with reachable canonicals`);
  console.log(`[unihan-variants]   single-canonical (Case 4): ${stats.emittedSingle}`);
  console.log(`[unihan-variants]   multi-canonical, rhyme-safe (Case 3 emit): ${stats.emittedMulti}`);
  console.log(`[unihan-variants]   multi-canonical, rhyme-distinct (Case 3 skip): ${stats.skippedMulti}`);
  console.log(`[unihan-variants] resolved ${resolved.size} variants → pingshui canonicals`);

  const ts = emitTypeScript(resolved, cache.lastModified);
  fs.writeFileSync(OUTPUT_PATH, ts, 'utf-8');
  const outStat = fs.statSync(OUTPUT_PATH);
  console.log(`[unihan-variants] wrote ${resolved.size} entries to ${path.relative(REPO_ROOT, OUTPUT_PATH)} (${outStat.size} bytes)`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
