/**
 * SRS algorithm — simplified SM-2 for char-to-rhyme drills.
 *
 * updateSrsState(current, isCorrect) → newState
 *
 * On correct: interval grows by ease_factor; ease unchanged.
 * On wrong: interval resets to 1; ease drops by 0.2 (floor 1.3).
 * Status transitions: new → learning → mastered (interval > 120).
 * Mastered + wrong → learning (regression).
 *
 * Note: The `interval_days` DB column name is legacy. The semantic is
 * MINUTES (not days). Renaming the column would require migration;
 * keeping it reduces risk.
 */

const MINUTE_MS = 60000;

/**
 * @param {{ interval_days: number, ease_factor: number, status: string, correct_count: number, wrong_count: number }} current
 * @param {boolean} isCorrect
 * @returns {{ interval_days: number, ease_factor: number, status: string, correct_count: number, wrong_count: number, next_review: string }}
 */
export function updateSrsState(current, isCorrect) {
  const now = new Date();

  if (isCorrect) {
    const newInterval = Math.max(1, Math.round(current.interval_days * current.ease_factor));
    const newStatus = newInterval > 120 ? 'mastered' : 'learning';
    const nextReview = new Date(now.getTime() + newInterval * MINUTE_MS);
    return {
      interval_days: newInterval,
      ease_factor: current.ease_factor,
      status: newStatus,
      correct_count: current.correct_count + 1,
      wrong_count: current.wrong_count,
      next_review: nextReview.toISOString(),
    };
  }

  const newEase = Math.max(1.3, current.ease_factor - 0.2);
  const nextReview = new Date(now.getTime() + 1 * MINUTE_MS);
  return {
    interval_days: 1,
    ease_factor: newEase,
    status: 'learning',
    correct_count: current.correct_count,
    wrong_count: current.wrong_count + 1,
    next_review: nextReview.toISOString(),
  };
}
