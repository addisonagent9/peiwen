/**
 * Beta-gate middleware for the trainer sub-app.
 *
 * Layers on top of your existing auth middleware. The flow:
 *   requireAuth → user is logged in (or 401)
 *   requireTrainerBeta → user is in the allowlist (or 404)
 *
 * Why 404 instead of 403? Because a 403 says "you know this exists but can't
 * use it" — we want the endpoint to appear not to exist at all to anyone
 * outside the beta. No speculation, no leaked information.
 *
 * ── Configuration ────────────────────────────────────────────────────────────
 * The allowlist is an env var: TRAINER_BETA_USER_IDS="114847293847123,998877665544332"
 * Comma-separated list of Google OAuth profile ID strings from the users table.
 *
 * If the env var is UNSET, the gate is disabled (everyone with auth passes).
 * This is the behavior you want when you eventually fully launch.
 *
 * If the env var is SET but EMPTY (""), nobody passes — useful for
 * temporarily disabling the trainer sitewide without a deploy.
 */

function parseAllowlist() {
  const raw = process.env.TRAINER_BETA_USER_IDS;
  if (raw === undefined) {
    return { enabled: false, ids: new Set() };
  }
  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return { enabled: true, ids: new Set(ids) };
}

/**
 * Lazy-initialized allowlist. Parsed on first access (not module load)
 * so that dotenv.config() has time to run first.
 */
let _parsed = null;
function getAllowlist() {
  if (!_parsed) _parsed = parseAllowlist();
  return _parsed;
}

export const requireTrainerBeta = (req, res, next) => {
  if (req.user?.is_admin === 1 || req.user?.is_premium === 1) {
    return next();
  }

  const { enabled, ids } = getAllowlist();
  if (!enabled) {
    // Gate disabled (env var unset) — pass through. Full launch mode.
    return next();
  }

  const userId = req.user?.id;
  if (typeof userId !== 'string' || !ids.has(userId)) {
    // Deliberately 404 — don't reveal that the trainer exists.
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  next();
};

/** For logging on boot, so you can confirm the gate is set up correctly. */
export function describeTrainerGate() {
  const { enabled, ids } = getAllowlist();
  if (!enabled) return 'disabled (all authed users allowed)';
  if (ids.size === 0) return 'enabled with empty allowlist (nobody allowed)';
  return `enabled, ${ids.size} allowed user${ids.size === 1 ? '' : 's'}`;
}
