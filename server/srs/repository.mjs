/**
 * SRS Repository — DB access layer.
 *
 * Wraps the four tables from migration 002:
 *   srs_cards, srs_reviews, user_rhyme_progress, user_trainer_state
 *
 * Exposes a small, typed interface the Express routes consume. All SQL lives
 * here. Prepared statements are cached in the constructor for speed.
 *
 * ── Adapting to a different SQLite driver ────────────────────────────────────
 * This file uses `better-sqlite3` (synchronous). If your project uses the
 * callback-based `sqlite3` package, the changes are mechanical:
 *   • Replace `db.prepare(sql).all()` with promisified `db.all(sql)`
 *   • Replace `db.prepare(sql).run(args)` with `db.run(sql, args)`
 *   • Make every repository method `async`
 *   • Remove the `transaction()` wrapper, use BEGIN/COMMIT manually
 */

import { newCardDefaults, schedule } from './scheduler.mjs';

// ---------------------------------------------------------------------------
// Row → domain object mapping
// ---------------------------------------------------------------------------

function rowToCard(r) {
  return {
    id: r.id,
    userId: r.user_id,
    character: r.character,
    rhymeId: r.rhyme_id,
    state: r.state,
    intervalDays: r.interval_days,
    easeFactor: r.ease_factor,
    repetitions: r.repetitions,
    dueDate: r.due_date,
    lastReviewed: r.last_reviewed,
    createdAt: r.created_at,
  };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class SRSRepository {
  // Prepared statements — cached for speed

  constructor(db) {
    this.db = db;

    this.sGetCard = db.prepare(
      'SELECT * FROM srs_cards WHERE id = ?',
    );

    this.sGetDueCards = db.prepare(`
      SELECT * FROM srs_cards
      WHERE user_id = ?
        AND state != 'suspended'
        AND due_date <= ?
      ORDER BY due_date ASC
      LIMIT 50
    `);

    this.sUpsertCard = db.prepare(`
      INSERT INTO srs_cards
        (user_id, character, rhyme_id, state, interval_days, ease_factor,
         repetitions, lapses, due_date)
      VALUES
        (@user_id, @character, @rhyme_id, @state, @interval_days, @ease_factor,
         @repetitions, @lapses, @due_date)
      ON CONFLICT(user_id, character) DO NOTHING
    `);

    this.sUpdateCardAfterReview = db.prepare(`
      UPDATE srs_cards
      SET state = @state,
          interval_days = @interval_days,
          ease_factor = @ease_factor,
          repetitions = @repetitions,
          lapses = @lapses,
          due_date = @due_date,
          last_reviewed = @last_reviewed
      WHERE id = @id
    `);

    this.sInsertReview = db.prepare(`
      INSERT INTO srs_reviews
        (card_id, grade, drill_type, response_time_ms, previous_interval, new_interval)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    this.sGetTrainerState = db.prepare(
      'SELECT * FROM user_trainer_state WHERE user_id = ?',
    );

    this.sUpsertTrainerState = db.prepare(`
      INSERT INTO user_trainer_state
        (user_id, foundation_completed, current_tier, streak_days, last_activity_date, ui_language)
      VALUES
        (@user_id, @foundation_completed, @current_tier, @streak_days, @last_activity_date, @ui_language)
      ON CONFLICT(user_id) DO UPDATE SET
        foundation_completed = excluded.foundation_completed,
        current_tier         = excluded.current_tier,
        streak_days          = excluded.streak_days,
        last_activity_date   = excluded.last_activity_date,
        ui_language          = excluded.ui_language,
        updated_at           = datetime('now')
    `);

    this.sGetProgress = db.prepare(
      'SELECT * FROM user_rhyme_progress WHERE user_id = ?',
    );

    this.sUpsertProgress = db.prepare(`
      INSERT INTO user_rhyme_progress
        (user_id, rhyme_id, mastery_level, unlocked_at, mastered_at, recent_accuracy, review_count)
      VALUES
        (@user_id, @rhyme_id, @mastery_level, @unlocked_at, @mastered_at, @recent_accuracy, @review_count)
      ON CONFLICT(user_id, rhyme_id) DO UPDATE SET
        mastery_level    = excluded.mastery_level,
        unlocked_at      = COALESCE(user_rhyme_progress.unlocked_at, excluded.unlocked_at),
        mastered_at      = COALESCE(user_rhyme_progress.mastered_at, excluded.mastered_at),
        recent_accuracy  = excluded.recent_accuracy,
        review_count     = excluded.review_count
    `);

    this.sCountCardStatesForRhyme = db.prepare(`
      SELECT state, COUNT(*) as n
      FROM srs_cards
      WHERE user_id = ? AND rhyme_id = ?
      GROUP BY state
    `);
  }

  // -----------------------------------------------------------------------
  // Cards
  // -----------------------------------------------------------------------

  getCard(id) {
    const row = this.sGetCard.get(id);
    return row ? rowToCard(row) : null;
  }

  getDueCards(userId, now = new Date()) {
    const rows = this.sGetDueCards.all(userId, now.toISOString());
    return rows.map(rowToCard);
  }

  /**
   * Create SRS cards for a rhyme's seed characters. Idempotent via the
   * UNIQUE(user_id, character) constraint — chars already seeded are skipped.
   * Returns the count of newly created cards.
   */
  seedCardsForRhyme(userId, rhymeId, characters, now = new Date()) {
    const defaults = newCardDefaults(now);
    const insertMany = this.db.transaction((chars) => {
      let created = 0;
      for (const ch of chars) {
        const result = this.sUpsertCard.run({
          user_id: userId,
          character: ch,
          rhyme_id: rhymeId,
          state: defaults.state,
          interval_days: defaults.intervalDays,
          ease_factor: defaults.easeFactor,
          repetitions: defaults.repetitions,
          lapses: defaults.lapses,
          due_date: defaults.nextDue,
        });
        if (result.changes > 0) created++;
      }
      return created;
    });
    return insertMany(characters);
  }

  /**
   * Apply a review: run the SM-2 scheduler, update the card, log the review,
   * and recompute the per-rhyme progress rollup. All in a single transaction.
   */
  applyReview(userId, input) {
    const txn = this.db.transaction(() => {
      const card = this.getCard(input.cardId);
      if (!card) throw new Error(`Card ${input.cardId} not found`);
      if (card.userId !== userId) {
        throw new Error(`Card ${input.cardId} does not belong to user ${userId}`);
      }

      const schedulerInput = {
        state: card.state,
        intervalDays: card.intervalDays,
        easeFactor: card.easeFactor,
        repetitions: card.repetitions,
        lapses: 0, // see note below
      };
      // lapses is tracked separately — fetch raw row to include it correctly
      const rawRow = this.sGetCard.get(input.cardId);
      schedulerInput.lapses = rawRow.lapses;

      const now = new Date();
      const next = schedule(schedulerInput, input.grade, now);

      this.sUpdateCardAfterReview.run({
        id: input.cardId,
        state: next.state,
        interval_days: next.intervalDays,
        ease_factor: next.easeFactor,
        repetitions: next.repetitions,
        lapses: next.lapses,
        due_date: next.nextDue,
        last_reviewed: now.toISOString(),
      });

      this.sInsertReview.run(
        input.cardId,
        input.grade,
        input.drillType,
        input.responseTimeMs ?? null,
        card.intervalDays,
        next.intervalDays,
      );

      this.recomputeRhymeProgress(userId, card.rhymeId, now);

      const updated = this.getCard(input.cardId);
      if (!updated) throw new Error('Card vanished mid-transaction');
      return updated;
    });
    return txn();
  }

  // -----------------------------------------------------------------------
  // Per-rhyme progress rollup
  // -----------------------------------------------------------------------

  /**
   * Rollup logic:
   *   mastery_level 0: no cards yet (not recorded)
   *   mastery_level 1: introduced — has cards, none past 'learning' on average
   *   mastery_level 2: learning — most cards are still in 'learning' state
   *   mastery_level 3: review — most cards are in 'review'
   *   mastery_level 4: mastered — 80%+ of cards are 'mastered'
   */
  recomputeRhymeProgress(userId, rhymeId, now) {
    const rows = this.sCountCardStatesForRhyme.all(userId, rhymeId);
    if (rows.length === 0) return;

    let counts = {
      new: 0,
      learning: 0,
      review: 0,
      mastered: 0,
      suspended: 0,
    };
    let total = 0;
    for (const r of rows) {
      counts[r.state] = r.n;
      total += r.n;
    }

    let level = 1;
    const masteredFrac = total > 0 ? counts.mastered / total : 0;
    const reviewPlus = counts.review + counts.mastered;

    if (masteredFrac >= 0.8 && total >= 8) level = 4;
    else if (reviewPlus / total >= 0.7) level = 3;
    else if (counts.learning > 0) level = 2;

    // Rolling accuracy: last 20 reviews for this rhyme
    const accRow = this.db
      .prepare(`
        SELECT AVG(CASE WHEN grade >= 3 THEN 1.0 ELSE 0.0 END) as acc
        FROM srs_reviews r
        JOIN srs_cards c ON c.id = r.card_id
        WHERE c.user_id = ? AND c.rhyme_id = ?
        ORDER BY r.reviewed_at DESC
        LIMIT 20
      `)
      .get(userId, rhymeId);
    const recentAccuracy = accRow?.acc ?? 0;

    const masteredAt = level === 4 ? now.toISOString() : null;

    this.sUpsertProgress.run({
      user_id: userId,
      rhyme_id: rhymeId,
      mastery_level: level,
      unlocked_at: now.toISOString(),
      mastered_at: masteredAt,
      recent_accuracy: recentAccuracy,
      review_count: total,
    });
  }

  getProgress(userId) {
    const rows = this.sGetProgress.all(userId);
    return rows.map((r) => ({
      userId: r.user_id,
      rhymeId: r.rhyme_id,
      masteryLevel: r.mastery_level,
      unlockedAt: r.unlocked_at,
      masteredAt: r.mastered_at,
      recentAccuracy: r.recent_accuracy,
    }));
  }

  // -----------------------------------------------------------------------
  // Trainer state
  // -----------------------------------------------------------------------

  getTrainerState(userId) {
    const row = this.sGetTrainerState.get(userId);
    if (!row) return null;
    return {
      userId: row.user_id,
      foundationCompleted: row.foundation_completed === 1,
      currentTier: row.current_tier,
      streakDays: row.streak_days,
      lastActivityDate: row.last_activity_date,
      uiLanguage: row.ui_language,
    };
  }

  upsertTrainerState(state) {
    this.sUpsertTrainerState.run({
      user_id: state.userId,
      foundation_completed: state.foundationCompleted ? 1 : 0,
      current_tier: state.currentTier,
      streak_days: state.streakDays,
      last_activity_date: state.lastActivityDate,
      ui_language: state.uiLanguage,
    });
  }

  /** Initialize trainer state for a new user (idempotent). */
  ensureTrainerState(userId) {
    const existing = this.getTrainerState(userId);
    if (existing) return existing;
    const fresh = {
      userId,
      foundationCompleted: false,
      currentTier: 1,
      streakDays: 0,
      lastActivityDate: null,
      uiLanguage: 'zh-Hans',
    };
    this.upsertTrainerState(fresh);
    return fresh;
  }
}
