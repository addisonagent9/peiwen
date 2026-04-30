import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import connectSqlite3 from "connect-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "./db.mjs";
import { runMigrations } from "./db/migrate.mjs";
import { mountTrainer } from "./trainer/index.mjs";
import { requireTrainerBeta, describeTrainerGate } from "./middleware/trainer-beta.mjs";
import { createAudioServiceFromEnv } from "./audio/service.mjs";
import { createAudioRouter } from "./routes/audio.mjs";
import { createAdminAudioRouter } from "./routes/admin-audio.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
const DIST = path.resolve(__dirname, "../dist");

// Run DB migrations (idempotent). Safe here because db.mjs already
// created users/poems tables via its top-level CREATE TABLE IF NOT EXISTS.
runMigrations(db, path.join(__dirname, "db/migrations"));

const {
  ANTHROPIC_API_KEY,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SESSION_SECRET,
  PORT = 3000
} = process.env;

if (!ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in server/.env");
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "64kb" }));
app.use(cors({ origin: "https://pw.truesolartime.com", credentials: true }));

// --- Sessions ---
const SQLiteStore = connectSqlite3(session);
app.use(session({
  store: new SQLiteStore({ db: "sessions.db", dir: __dirname }),
  secret: SESSION_SECRET || "dev-secret-change-me",
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  }
}));

// --- Passport ---
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const row = db.prepare("SELECT id, email, name, avatar, is_premium, is_admin, last_login FROM users WHERE id = ?").get(id);
  done(null, row || null);
});

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "https://pw.truesolartime.com/api/auth/google/callback"
  }, (_accessToken, _refreshToken, profile, done) => {
    const id = profile.id;
    const email = profile.emails?.[0]?.value ?? "";
    const name = profile.displayName ?? "";
    const avatar = profile.photos?.[0]?.value ?? "";
    const isPremium = email === "addison.k@gmail.com" ? 1 : 0;
    const isAdmin = email === "addison.k@gmail.com" ? 1 : 0;
    const now = new Date().toISOString();

    const existing = db.prepare("SELECT id, is_admin, is_premium FROM users WHERE id = ?").get(id);
    if (existing) {
      db.prepare("UPDATE users SET email = ?, name = ?, avatar = ?, last_login = ? WHERE id = ?")
        .run(email, name, avatar, now, id);
      done(null, { id, email, name, avatar, is_premium: existing.is_premium, is_admin: existing.is_admin, last_login: now });
    } else {
      db.prepare("INSERT INTO users (id, email, name, avatar, is_premium, is_admin, last_login) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(id, email, name, avatar, isPremium, isAdmin, now);
      done(null, { id, email, name, avatar, is_premium: isPremium, is_admin: isAdmin, last_login: now });
    }
  }));
}

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "not authenticated" });
}

function requireAdmin(req, res, next) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "unauthenticated" });
  if (req.user?.is_admin !== 1) return res.status(403).json({ error: "forbidden" });
  next();
}

// --- Auth routes ---
app.get("/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (_req, res) => res.redirect("/"));

app.get("/api/auth/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
});

app.get("/api/auth/me", (req, res) => {
  res.json({ user: req.user ?? null });
});

// --- Poems routes ---
function parseReadings(raw) {
  if (!raw) return {};
  try { const o = JSON.parse(raw); return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {}; }
  catch { return {}; }
}

function validateReadingsShape(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  for (const [k, v] of Object.entries(obj)) {
    if (!/^\d+$/.test(k)) return false;
    if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
    if (typeof v.tone !== 'string' || typeof v.rhyme !== 'string') return false;
  }
  return true;
}

app.get("/api/poems", requireAuth, (req, res) => {
  const rows = db.prepare(
    "SELECT id, text, saved_at, is_locked, intended_readings FROM poems WHERE user_id = ? ORDER BY saved_at DESC"
  ).all(req.user.id);
  res.json({ poems: rows.map(r => ({ ...r, intended_readings: parseReadings(r.intended_readings) })) });
});

app.post("/api/poems", requireAuth, (req, res) => {
  const text = req.body?.text;
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "missing text" });
  }
  const rawReadings = req.body?.intended_readings;
  let readings = '{}';
  if (rawReadings !== undefined && rawReadings !== null) {
    if (!validateReadingsShape(rawReadings)) {
      return res.status(400).json({ error: "invalid_intended_readings" });
    }
    readings = JSON.stringify(rawReadings);
  }
  const result = db.prepare("INSERT INTO poems (user_id, text, intended_readings) VALUES (?, ?, ?)").run(req.user.id, text, readings);
  res.json({ id: result.lastInsertRowid });
});

app.patch("/api/poems/:id/lock", requireAuth, express.json(), (req, res) => {
  const id = parseInt(req.params.id);
  const { is_locked } = req.body ?? {};
  if (is_locked !== 0 && is_locked !== 1) return res.status(400).json({ error: "INVALID_LOCK_VALUE" });
  const poem = db.prepare("SELECT user_id FROM poems WHERE id = ?").get(id);
  if (!poem) return res.status(404).json({ error: "not found" });
  if (poem.user_id !== req.user.id) return res.status(403).json({ error: "forbidden" });
  db.prepare("UPDATE poems SET is_locked = ? WHERE id = ?").run(is_locked, id);
  res.json({ id, is_locked });
});

app.patch("/api/poems/:id/readings", requireAuth, express.json(), (req, res) => {
  const id = parseInt(req.params.id);
  const poem = db.prepare("SELECT user_id, is_locked FROM poems WHERE id = ?").get(id);
  if (!poem) return res.status(404).json({ error: "not found" });
  if (poem.user_id !== req.user.id) return res.status(403).json({ error: "forbidden" });
  if (poem.is_locked === 1) return res.status(409).json({ error: "poem_locked" });
  const { intended_readings } = req.body ?? {};
  if (!validateReadingsShape(intended_readings)) {
    return res.status(400).json({ error: "invalid_intended_readings" });
  }
  db.prepare("UPDATE poems SET intended_readings = ? WHERE id = ?").run(JSON.stringify(intended_readings), id);
  res.json({ ok: true });
});

app.delete("/api/poems/:id", requireAuth, (req, res) => {
  const poem = db.prepare("SELECT user_id, is_locked FROM poems WHERE id = ?").get(req.params.id);
  if (!poem) return res.status(404).json({ error: "not found" });
  if (poem.user_id !== req.user.id) return res.status(403).json({ error: "forbidden" });
  if (poem.is_locked === 1) return res.status(409).json({ error: "POEM_LOCKED" });
  db.prepare("DELETE FROM poems WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// --- Settings routes ---
const PUBLIC_SETTINGS_WHITELIST = new Set([
  'drill3_correct_advance_ms',
  'drill3_wrong_advance_ms',
]);

app.get("/api/settings", (req, res) => {
  const placeholders = Array.from(PUBLIC_SETTINGS_WHITELIST).map(() => '?').join(',');
  const rows = db.prepare(`SELECT key, value FROM app_settings WHERE key IN (${placeholders})`).all(...PUBLIC_SETTINGS_WHITELIST);
  const out = {};
  for (const row of rows) out[row.key] = row.value;
  res.json(out);
});

app.get("/api/admin/settings", requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT key, value, description, updated_at, updated_by FROM app_settings ORDER BY key").all();
  res.json({ settings: rows });
});

app.patch("/api/admin/settings/:key", requireAdmin, express.json(), (req, res) => {
  const { value } = req.body ?? {};
  if (typeof value !== "string" || value.length === 0 || value.length > 500) {
    return res.status(400).json({ error: "INVALID_VALUE" });
  }
  const existing = db.prepare("SELECT key FROM app_settings WHERE key = ?").get(req.params.key);
  if (!existing) return res.status(404).json({ error: "NOT_FOUND" });
  db.prepare("UPDATE app_settings SET value = ?, updated_at = datetime('now'), updated_by = ? WHERE key = ?")
    .run(value, req.user?.email ?? req.user?.id ?? "unknown", req.params.key);
  res.json({ key: req.params.key, value });
});

// --- Suggest route ---
app.post("/api/suggest", requireAdmin, async (req, res) => {
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
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        temperature: 0,
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

// --- Admin routes ---
app.get("/api/admin/users", requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT
      u.id, u.email, u.name, u.avatar, u.is_admin, u.is_premium,
      u.created_at, u.last_login,
      (SELECT COUNT(*) FROM poems p WHERE p.user_id = u.id) AS poem_count
    FROM users u
    ORDER BY u.created_at DESC
  `).all();
  res.json({ users: rows });
});

app.patch("/api/admin/users/:id", requireAdmin, express.json(), (req, res) => {
  const targetId = req.params.id;
  const { is_admin, is_premium } = req.body ?? {};

  if (is_admin === undefined && is_premium === undefined) {
    return res.status(400).json({ error: "NOTHING_TO_UPDATE" });
  }

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(targetId);
  if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

  if (is_admin === 0 && String(req.user.id) === String(targetId)) {
    return res.status(403).json({ error: "CANNOT_DEMOTE_SELF" });
  }

  if (is_admin === 0) {
    const adminCount = db.prepare("SELECT COUNT(*) as n FROM users WHERE is_admin = 1").get().n;
    if (adminCount <= 1 && user.is_admin === 1) {
      return res.status(400).json({ error: "LAST_ADMIN" });
    }
  }

  const newAdmin = is_admin !== undefined ? is_admin : user.is_admin;
  const newPremium = is_premium !== undefined ? is_premium : user.is_premium;

  db.prepare("UPDATE users SET is_admin = ?, is_premium = ? WHERE id = ?").run(newAdmin, newPremium, targetId);

  const updated = db.prepare(`
    SELECT u.id, u.email, u.name, u.avatar, u.is_admin, u.is_premium,
           u.created_at, u.last_login,
           (SELECT COUNT(*) FROM poems p WHERE p.user_id = u.id) AS poem_count
    FROM users u WHERE u.id = ?
  `).get(targetId);
  res.json({ user: updated });
});

app.get("/api/admin/users/:id/poems", requireAdmin, (req, res) => {
  const targetId = req.params.id;
  const user = db.prepare("SELECT id, email, name, avatar, created_at, last_login FROM users WHERE id = ?").get(targetId);
  if (!user) return res.status(404).json({ error: "user not found" });
  const poems = db.prepare("SELECT id, text, saved_at FROM poems WHERE user_id = ? ORDER BY saved_at DESC").all(targetId);
  res.json({ user, poems });
});

app.post("/api/admin/users/:id/unlock-all-trainer", requireAdmin, async (req, res) => {
  const { adminUnlockAll, getUnlockStatus } = await import('./trainer/unlocks.mjs');
  const targetId = req.params.id;
  const user = db.prepare("SELECT id FROM users WHERE id = ?").get(targetId);
  if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });
  adminUnlockAll(db, targetId);
  res.json({ ok: true, unlocks: getUnlockStatus(db, targetId) });
});

// --- Trainer routes (beta-gated) ---
mountTrainer(app, db, requireAuth, { betaGate: requireTrainerBeta });
console.log(`[trainer] beta gate: ${describeTrainerGate()}`);

// --- Audio routes ---
const audioService = createAudioServiceFromEnv({
  cacheDir: path.join(__dirname, "data", "audio-cache"),
});
app.use("/api/audio", createAudioRouter(audioService, db));
app.use("/api/admin/audio", createAdminAudioRouter({
  db, audioService, requireAdmin,
  cacheDir: path.join(__dirname, "data", "audio-cache"),
}));
console.log(`[audio] providers: ${audioService.describeProviders()}`);

// --- Static / SPA fallback ---
app.use(express.static(DIST, { maxAge: "1y", etag: false, index: false }));
app.get("*", (_req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.sendFile(path.join(DIST, "bundle.html"));
});

app.listen(PORT, () => {
  console.log(`poetry-checker listening on :${PORT}`);
});
