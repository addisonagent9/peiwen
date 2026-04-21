/**
 * SM-2 Scheduler unit tests.
 *
 * Run with:
 *   node --test server/srs/scheduler.test.mjs
 *
 * Uses Node's built-in test runner — no new dev dependencies.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { schedule, newCardDefaults } from './scheduler.mjs';

const FIXED_NOW = new Date('2026-04-20T00:00:00.000Z');

describe('schedule()', () => {
  describe('initial reviews', () => {
    it('first success (grade 5) → interval 1 day, learning', () => {
      const out = schedule(newCardDefaults(FIXED_NOW), 5, FIXED_NOW);
      assert.equal(out.intervalDays, 1);
      assert.equal(out.repetitions, 1);
      assert.equal(out.state, 'learning');
      assert.equal(out.lapses, 0);
      assert.equal(out.nextDue, '2026-04-21T00:00:00.000Z');
    });

    it('second success → interval 6 days, review', () => {
      const afterFirst = schedule(newCardDefaults(FIXED_NOW), 4, FIXED_NOW);
      const out = schedule(afterFirst, 4, FIXED_NOW);
      assert.equal(out.intervalDays, 6);
      assert.equal(out.repetitions, 2);
      assert.equal(out.state, 'review');
    });

    it('grade 3 on new card still counts as success', () => {
      const out = schedule(newCardDefaults(FIXED_NOW), 3, FIXED_NOW);
      assert.equal(out.state, 'learning');
      assert.equal(out.repetitions, 1);
    });
  });

  describe('lapses', () => {
    it('grade 0 on mature card resets to learning and increments lapses', () => {
      const mature = {
        state: 'review',
        intervalDays: 30,
        easeFactor: 2.5,
        repetitions: 5,
        lapses: 0,
      };
      const out = schedule(mature, 0, FIXED_NOW);
      assert.equal(out.state, 'learning');
      assert.equal(out.intervalDays, 1);
      assert.equal(out.repetitions, 0);
      assert.equal(out.lapses, 1);
    });

    it('grade 2 is also a lapse', () => {
      const mature = {
        state: 'review',
        intervalDays: 30,
        easeFactor: 2.5,
        repetitions: 5,
        lapses: 0,
      };
      const out = schedule(mature, 2, FIXED_NOW);
      assert.equal(out.state, 'learning');
      assert.equal(out.lapses, 1);
    });
  });

  describe('ease factor bounds', () => {
    it('never drops below the 1.3 floor even on repeated grade-0 reviews', () => {
      let card = newCardDefaults(FIXED_NOW);
      for (let i = 0; i < 20; i++) {
        card = schedule(card, 0, FIXED_NOW);
      }
      assert.ok(card.easeFactor >= 1.3, `EF was ${card.easeFactor}`);
    });

    it('increases on grade 5 reviews', () => {
      const out = schedule(newCardDefaults(FIXED_NOW), 5, FIXED_NOW);
      assert.ok(out.easeFactor > 2.5, `Expected EF > 2.5, got ${out.easeFactor}`);
    });

    it('decreases on grade 3 reviews', () => {
      const out = schedule(newCardDefaults(FIXED_NOW), 3, FIXED_NOW);
      assert.ok(out.easeFactor < 2.5, `Expected EF < 2.5, got ${out.easeFactor}`);
    });
  });

  describe('interval growth', () => {
    it('third success multiplies previous interval by EF', () => {
      const state = {
        state: 'review',
        intervalDays: 6,
        easeFactor: 2.5,
        repetitions: 2,
        lapses: 0,
      };
      const out = schedule(state, 4, FIXED_NOW);
      // EF after grade-4: 2.5 + (0.1 - 1*(0.08 + 1*0.02)) = 2.5 + 0 = 2.5
      // interval = round(6 * 2.5) = 15
      assert.equal(out.intervalDays, 15);
      assert.equal(out.repetitions, 3);
    });

    it('intervals compound correctly across a long easy streak', () => {
      let card = newCardDefaults(FIXED_NOW);
      for (let i = 0; i < 6; i++) {
        card = schedule(card, 5, FIXED_NOW);
      }
      // Expect large interval and mastered state
      assert.ok(card.intervalDays > 60, `interval was ${card.intervalDays}`);
      assert.equal(card.repetitions, 6);
    });
  });

  describe('mastery promotion', () => {
    it('reaches mastered state after 5+ reps and interval > 90 days', () => {
      let card = newCardDefaults(FIXED_NOW);
      for (let i = 0; i < 10; i++) {
        card = schedule(card, 5, FIXED_NOW);
        if (card.state === 'mastered') break;
      }
      assert.equal(card.state, 'mastered');
      assert.ok(card.intervalDays > 90);
      assert.ok(card.repetitions >= 5);
    });

    it('lapse on a mastered card returns it to learning', () => {
      const mastered = {
        state: 'mastered',
        intervalDays: 180,
        easeFactor: 2.8,
        repetitions: 8,
        lapses: 0,
      };
      const out = schedule(mastered, 1, FIXED_NOW);
      assert.equal(out.state, 'learning');
      assert.equal(out.intervalDays, 1);
      assert.equal(out.lapses, 1);
    });
  });

  describe('nextDue computation', () => {
    it('is deterministic given a fixed reviewedAt', () => {
      const a = schedule(newCardDefaults(FIXED_NOW), 5, FIXED_NOW);
      const b = schedule(newCardDefaults(FIXED_NOW), 5, FIXED_NOW);
      assert.equal(a.nextDue, b.nextDue);
    });

    it('advances exactly by intervalDays', () => {
      const out = schedule(newCardDefaults(FIXED_NOW), 5, FIXED_NOW);
      const due = new Date(out.nextDue);
      const reviewed = FIXED_NOW;
      const diffMs = due.getTime() - reviewed.getTime();
      const diffDays = diffMs / (24 * 60 * 60 * 1000);
      assert.equal(diffDays, out.intervalDays);
    });
  });
});
