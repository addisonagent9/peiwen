// Post-build: inline JS/CSS from dist/ into a single self-contained bundle.html.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "../dist");
const htmlPath = path.join(DIST, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

const readDist = (ref) => {
  const file = path.join(DIST, ref.replace(/^\.\//, ""));
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
};

// <link ... rel=stylesheet ... href=X ...>   (quoted or unquoted attrs, any order)
html = html.replace(/<link\b[^>]*\brel=(?:"stylesheet"|stylesheet|'stylesheet')[^>]*>/gi, (tag) => {
  const m = tag.match(/\bhref=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
  if (!m) return tag;
  const href = m[1] ?? m[2] ?? m[3];
  if (/^https?:/i.test(href)) return tag; // leave remote links (Google Fonts)
  const css = readDist(href);
  return css == null ? tag : `<style>${css}</style>`;
});

// <script ... src=X ...></script>
html = html.replace(/<script\b[^>]*\bsrc=(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*><\/script>/gi, (tag, a, b, c) => {
  const src = a ?? b ?? c;
  if (/^https?:/i.test(src)) return tag;
  const js = readDist(src);
  return js == null ? tag : `<script>${js}</script>`;
});

const outPath = path.join(DIST, "bundle.html");
fs.writeFileSync(outPath, html);
console.log(`wrote ${outPath} (${html.length.toLocaleString()} bytes)`);

// Copy lazy-loaded dictionaries next to bundle.html so EditModal can fetch them.
const SRC_DATA = path.resolve(__dirname, "../src/data");
for (const f of ["cedict.json", "moedict-map.json"]) {
  const from = path.join(SRC_DATA, f);
  const to = path.join(DIST, f);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
    console.log(`copied ${f} (${fs.statSync(to).size.toLocaleString()} bytes)`);
  }
}
