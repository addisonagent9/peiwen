/**
 * Unlock helpers — check and record drill/tier unlock state.
 * Used by trainer routes and admin unlock-all.
 */

export function isDrillUnlocked(db, userId, tier, drillNumber) {
  if (tier === 1 && drillNumber === 1) return true;
  const row = db.prepare(
    'SELECT 1 FROM tier_drill_unlocks WHERE user_id=? AND tier=? AND drill_number=?'
  ).get(userId, tier, drillNumber);
  return !!row;
}

export function isTierUnlocked(db, userId, tier) {
  if (tier === 1) return true;
  const row = db.prepare(
    'SELECT 1 FROM tier_unlocks WHERE user_id=? AND tier=?'
  ).get(userId, tier);
  return !!row;
}

export function recordDrillCompletion(db, userId, tier, drillNumber, { size, correctCount, wrongCount, rhymeId = null }) {
  db.prepare(`
    INSERT INTO drill_sessions (user_id, tier, drill_number, rhyme_id, size, correct_count, wrong_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, tier, drillNumber, rhymeId, size, correctCount, wrongCount);

  if (drillNumber < 4) {
    db.prepare(`
      INSERT OR IGNORE INTO tier_drill_unlocks (user_id, tier, drill_number)
      VALUES (?, ?, ?)
    `).run(userId, tier, drillNumber + 1);
  }

  if (drillNumber === 4 && tier < 3) {
    db.prepare(`
      INSERT OR IGNORE INTO tier_unlocks (user_id, tier)
      VALUES (?, ?)
    `).run(userId, tier + 1);
    db.prepare(`
      INSERT OR IGNORE INTO tier_drill_unlocks (user_id, tier, drill_number)
      VALUES (?, ?, 1)
    `).run(userId, tier + 1);
  }
}

export function getUnlockStatus(db, userId) {
  const drills = db.prepare(
    'SELECT tier, drill_number FROM tier_drill_unlocks WHERE user_id=?'
  ).all(userId);
  const tiers = db.prepare(
    'SELECT tier FROM tier_unlocks WHERE user_id=?'
  ).all(userId);

  const tierSet = new Set([1, ...tiers.map(r => r.tier)]);
  const drillList = [
    { tier: 1, drillNumber: 1 },
    ...drills.filter(r => !(r.tier === 1 && r.drill_number === 1))
      .map(r => ({ tier: r.tier, drillNumber: r.drill_number })),
  ];

  return {
    tiers: [...tierSet].sort(),
    drills: drillList,
  };
}

export function getDrillSessionCount(db, userId, tier, drillNumber) {
  const row = db.prepare(
    'SELECT COUNT(*) as n FROM drill_sessions WHERE user_id=? AND tier=? AND drill_number=?'
  ).get(userId, tier, drillNumber);
  return row.n;
}

export function adminUnlockAll(db, userId) {
  for (const tier of [1, 2, 3]) {
    db.prepare('INSERT OR IGNORE INTO tier_unlocks (user_id, tier) VALUES (?, ?)').run(userId, tier);
    for (const d of [1, 2, 3, 4]) {
      db.prepare('INSERT OR IGNORE INTO tier_drill_unlocks (user_id, tier, drill_number) VALUES (?, ?, ?)').run(userId, tier, d);
    }
  }
}
