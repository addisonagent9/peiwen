/**
 * Gate the 文言教材 module to admins only (v1 scope).
 *
 * Returns 404 (not 403) on deny — deliberately hides the feature's
 * existence to non-admin users. Same pattern as requireTrainerBeta.
 *
 * Future: when the module opens to is_premium, refactor here.
 */
export const requireWenyanAdmin = (req, res, next) => {
  if (req.user?.is_admin !== 1) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }
  next();
};

export function describeWenyanGate() {
  return 'enabled (admins only)';
}
