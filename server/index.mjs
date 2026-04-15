import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
const DIST = path.resolve(__dirname, "../dist");

const { ANTHROPIC_API_KEY, PORT = 3000 } = process.env;
if (!ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in server/.env");
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "64kb" }));
app.use(cors({ origin: "https://pw.truesolartime.com" }));

app.post("/api/suggest", async (req, res) => {
  const prompt = req.body?.prompt;
  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "missing prompt" });
  }
  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!upstream.ok) {
      const body = await upstream.text();
      return res.status(upstream.status).json({ error: `upstream ${upstream.status}`, detail: body });
    }
    const data = await upstream.json();
    const text = data?.content?.[0]?.text?.trim() ?? "";
    res.json({ text });
  } catch (err) {
    res.status(502).json({ error: String(err?.message ?? err) });
  }
});

app.use(express.static(DIST));
app.get("*", (_req, res) => res.sendFile(path.join(DIST, "bundle.html")));

app.listen(PORT, () => {
  console.log(`poetry-checker listening on :${PORT}`);
});
