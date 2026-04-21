/**
 * Trainer module — one-liner wire-up.
 *
 * Drop this into your existing server bootstrap (server/index.mjs or similar):
 *
 *   import Database from 'better-sqlite3';
 *   import { runMigrations } from './db/migrate.mjs';
 *   import { mountTrainer } from './trainer/index.mjs';
 *   import { requireAuth } from './auth.mjs'; // your existing middleware
 *   import { requireTrainerBeta, describeTrainerGate }
 *     from './middleware/trainer-beta.mjs';
 *
 *   const db = new Database(DB_PATH);
 *   db.pragma('journal_mode = WAL');
 *   db.pragma('foreign_keys = ON');
 *   runMigrations(db, path.join(__dirname, 'db/migrations'));
 *
 *   // existing routes ...
 *   app.use('/api/poems', poemsRouter);
 *
 *   // Beta-gated launch: only users in TRAINER_BETA_USER_IDS env var see it
 *   mountTrainer(app, db, requireAuth, { betaGate: requireTrainerBeta });
 *   console.log(`[trainer] beta gate: ${describeTrainerGate()}`);
 *
 *   // Full-launch mode (later): drop the betaGate option entirely
 *   // mountTrainer(app, db, requireAuth);
 */

import { SRSRepository } from '../srs/repository.mjs';
import { createSRSRouter } from '../routes/srs.mjs';
import { createTrainerRouter } from '../routes/trainer.mjs';

export function mountTrainer(app, db, requireAuth, options = {}) {
  const basePath = options.basePath ?? '/api';
  const repo = new SRSRepository(db);

  // If a beta gate is provided, every request must pass BOTH auth and the
  // gate. Express happily accepts middleware arrays here.
  const gate = options.betaGate
    ? [requireAuth, options.betaGate]
    : [requireAuth];

  // We need to pass a single middleware to the route factories (they accept
  // one). Compose into a small function that runs them in sequence.
  const composedGate = (req, res, next) => {
    let idx = 0;
    const runNext = (err) => {
      if (err) return next(err);
      if (idx >= gate.length) return next();
      const mw = gate[idx++];
      mw(req, res, runNext);
    };
    runNext();
  };

  app.use(`${basePath}/srs`, createSRSRouter(repo, composedGate));
  app.use(`${basePath}/trainer`, createTrainerRouter(repo, composedGate));

  return { repo };
}
