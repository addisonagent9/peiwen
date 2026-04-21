/**
 * SM-2 Spaced Repetition Scheduler
 *
 * Pure function, no DB / IO. Given a card's current state and a user review
 * grade (0–5), returns the new state. Totally deterministic and unit-testable.
 *
 * ── Algorithm reference ──────────────────────────────────────────────────────
 * Based on the classic SM-2 algorithm (Piotr Woźniak, 1987), which is also the
 * base of Anki's default scheduler. Key rules:
 *
 *   • Grade ≥ 3 is a success, grade < 3 is a lapse.
 *   • Ease factor (EF) is updated on every review:
 *       EF' = EF + (0.1 − (5 − q)(0.08 + (5 − q) × 0.02))
 *     bounded below by 1.3.
 *   • On first success:  interval = 1 day
 *   • On second success: interval = 6 days
 *   • On subsequent success: interval = round(prev_interval × EF')
 *   • On lapse: interval resets to 1 day, repetitions resets to 0, state
 *     goes back to 'learning', lapse count increments.
 *
 * ── Mastery promotion ────────────────────────────────────────────────────────
 * After 5+ consecutive successes AND an interval > 90 days, the card is
 * marked 'mastered' (still reviewed, just shown infrequently).
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EF_FLOOR = 1.3;
const EF_DEFAULT = 2.5;

/** Number of consecutive successes required to consider a card mastered. */
const MASTERY_REPETITIONS_THRESHOLD = 5;
/** Minimum interval (days) required to consider a card mastered. */
const MASTERY_INTERVAL_THRESHOLD_DAYS = 90;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute the next SRS state for a card given a review grade.
 *
 * @param prev        Current card state (as stored in `srs_cards`).
 * @param grade       User's self-assessed grade 0–5.
 * @param reviewedAt  Time of review. Defaults to now. Pass an explicit Date
 *                    for deterministic testing.
 */
export function schedule(prev, grade, reviewedAt = new Date()) {
  // Ease factor — always updated regardless of correctness.
  const q = grade;
  const efCandidate = prev.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  const newEF = Math.max(EF_FLOOR, efCandidate);

  let newRepetitions;
  let newInterval;
  let newLapses = prev.lapses;
  let newState;

  if (grade >= 3) {
    // -------- Success --------
    newRepetitions = prev.repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1;
      newState = 'learning';
    } else if (newRepetitions === 2) {
      newInterval = 6;
      newState = 'review';
    } else {
      newInterval = Math.max(1, Math.round(prev.intervalDays * newEF));
      newState = 'review';
    }

    // Mastery promotion
    if (
      newRepetitions >= MASTERY_REPETITIONS_THRESHOLD &&
      newInterval > MASTERY_INTERVAL_THRESHOLD_DAYS
    ) {
      newState = 'mastered';
    }
  } else {
    // -------- Lapse --------
    newRepetitions = 0;
    newInterval = 1;
    newLapses = prev.lapses + 1;
    newState = 'learning';
  }

  return {
    state: newState,
    intervalDays: newInterval,
    easeFactor: newEF,
    repetitions: newRepetitions,
    lapses: newLapses,
    nextDue: addDays(reviewedAt, newInterval).toISOString(),
  };
}

/**
 * Convenience factory for a brand-new card (before its first review).
 * Due immediately — this card will appear in the "new" queue.
 */
export function newCardDefaults(createdAt = new Date()) {
  return {
    state: 'new',
    intervalDays: 0,
    easeFactor: EF_DEFAULT,
    repetitions: 0,
    lapses: 0,
    nextDue: createdAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addDays(base, days) {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
