import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { updateSrsState } from './algorithm.mjs';

const base = {
  interval_days: 1,
  ease_factor: 2.5,
  status: 'new',
  correct_count: 0,
  wrong_count: 0,
};

describe('updateSrsState', () => {
  it('first correct: interval grows to ~3 days', () => {
    const result = updateSrsState(base, true);
    assert.equal(result.interval_days, 3); // round(1 * 2.5) = 3
    assert.equal(result.ease_factor, 2.5);
    assert.equal(result.status, 'learning');
    assert.equal(result.correct_count, 1);
    assert.equal(result.wrong_count, 0);
    assert.ok(result.next_review);
  });

  it('5 consecutive correct: interval grows geometrically', () => {
    let state = { ...base };
    for (let i = 0; i < 5; i++) {
      state = updateSrsState(state, true);
    }
    assert.ok(state.interval_days > 30);
    assert.equal(state.correct_count, 5);
  });

  it('wrong answer resets interval to 1', () => {
    const learning = updateSrsState(base, true); // interval=3
    const result = updateSrsState(learning, false);
    assert.equal(result.interval_days, 1);
    assert.equal(result.status, 'learning');
  });

  it('wrong answer drops ease_factor by 0.2, floored at 1.3', () => {
    const result = updateSrsState(base, false);
    assert.equal(result.ease_factor, 2.3);
    assert.equal(result.wrong_count, 1);

    let state = { ...base, ease_factor: 1.4 };
    const floored = updateSrsState(state, false);
    assert.equal(floored.ease_factor, 1.3);
  });

  it('status transitions to mastered when interval > 30', () => {
    let state = { ...base };
    while (state.interval_days <= 30) {
      state = updateSrsState(state, true);
    }
    assert.equal(state.status, 'mastered');
  });

  it('mastered + wrong → learning (regression)', () => {
    let state = { ...base };
    while (state.status !== 'mastered') {
      state = updateSrsState(state, true);
    }
    const regressed = updateSrsState(state, false);
    assert.equal(regressed.status, 'learning');
    assert.equal(regressed.interval_days, 1);
  });
});
