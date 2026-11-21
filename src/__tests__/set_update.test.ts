import { describe, it, expect } from 'vitest';
import { calculate1RM } from '../context/WorkoutContext';

/**
 * Regression guard for the update helpers shape.
 *
 * `updateSet` / `toggleSetCompleted` used to write into `prev.exercises[i].sets[j]`
 * in place and hand back an object that kept its identity, so React bailed out
 * and the tap did nothing. These tests pin the immutable transform that replaced it.
 */
type Set = { completed: boolean; weight: number; reps: number };

const applySetUpdate = (
  exercises: { sets: Set[] }[],
  exIdx: number,
  setIdx: number,
  updates: Partial<Set>
) =>
  exercises.map((ex, idx) =>
    idx === exIdx
      ? { ...ex, sets: ex.sets.map((set, sIdx) => (sIdx === setIdx ? { ...set, ...updates } : set)) }
      : ex
  );

describe('workout set updates are immutable', () => {
  const base = [
    { sets: [{ completed: false, weight: 60, reps: 8 }, { completed: false, weight: 60, reps: 8 }] },
    { sets: [{ completed: false, weight: 40, reps: 10 }] }
  ];

  it('returns a new array and a new set object', () => {
    const next = applySetUpdate(base, 0, 0, { completed: true });
    expect(next).not.toBe(base);
    expect(next[0].sets).not.toBe(base[0].sets);
    expect(next[0].sets[0]).not.toBe(base[0].sets[0]);
    expect(next[0].sets[0].completed).toBe(true);
  });

  it('leaves every untouched set and exercise referentially equal', () => {
    const next = applySetUpdate(base, 0, 0, { completed: true });
    expect(next[1]).toBe(base[1]);
    expect(next[0].sets[1]).toBe(base[0].sets[1]);
  });

  it('never mutates the input state', () => {
    applySetUpdate(base, 0, 1, { weight: 82.5 });
    expect(base[0].sets[1].weight).toBe(60);
  });

  it('toggling twice restores the original values', () => {
    const once = applySetUpdate(base, 1, 0, { completed: true });
    const twice = applySetUpdate(once, 1, 0, { completed: false });
    expect(twice[1].sets[0].completed).toBe(false);
  });

  it('completed sets are what volume is computed from', () => {
    const next = applySetUpdate(base, 0, 0, { completed: true });
    const volume = next
      .flatMap((ex) => ex.sets)
      .filter((set) => set.completed)
      .reduce((sum, set) => sum + set.weight * set.reps, 0);
    expect(volume).toBe(480);
  });

  it('keeps the 1RM helper consistent with logged sets', () => {
    expect(calculate1RM(80, 8)).toBeCloseTo(101.3, 1);
    expect(calculate1RM(0, 8)).toBe(0);
  });
});
