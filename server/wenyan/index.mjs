/**
 * 文言教材 module mount.
 *
 * Stage A: foundation — single /health endpoint for smoke-testing the
 * gate. Stages B/C/D add real endpoints for content listing, pairing
 * exercises, and audio.
 */

import express from 'express';
import { requireWenyanAdmin } from '../middleware/wenyan-admin.mjs';

export function mountWenyan(app, db, requireAuth) {
  const router = express.Router();

  // Auth + admin gate composed
  router.use(requireAuth);
  router.use(requireWenyanAdmin);

  router.get('/health', (req, res) => {
    res.json({ status: 'ok', stage: 'A', module: 'wenyan' });
  });

  app.use('/api/wenyan', router);
}
