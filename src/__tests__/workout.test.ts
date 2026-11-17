import { describe, it, expect } from 'vitest';
import { INITIAL_EXERCISES, INITIAL_ROUTINES } from '../data/exercises';
import { ANATOMY_SLUG_MAP, FRONT_PARTS, BACK_PARTS } from '../data/anatomyPaths';

// Epley 1RM formula calculation
function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

// Volume calculation
function calculateTotalVolume(sets: { weight: number; reps: number; completed: boolean }[]): number {
  return sets
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.weight * s.reps, 0);
}

// PR detection
function checkIsPR(newWeight: number, newReps: number, historicalBest1RM: number): boolean {
  const current1RM = calculate1RM(newWeight, newReps);
  return current1RM > 0 && current1RM > historicalBest1RM;
}

// Rest timer countdown
function calculateRemaining(targetEndTime: number, now: number): number {
  return Math.max(0, Math.ceil((targetEndTime - now) / 1000));
}

// Muscle Fatigue calculation
function calculateMuscleFatigue(completedSets: number, hoursAgo: number, isPrimary: boolean): number {
  const WINDOW_HOURS = 72;
  if (hoursAgo > WINDOW_HOURS || completedSets <= 0) return 0;
  const decayFactor = Math.max(0, 1 - hoursAgo / WINDOW_HOURS);
  const pointsPerSet = isPrimary ? 18 : 9;
  return Math.min(100, Math.round(completedSets * pointsPerSet * decayFactor));
}

describe('Pitbull Fit Training Engine', () => {
  describe('Epley 1RM Calculation', () => {
    it('returns exact weight for 1 rep', () => {
      expect(calculate1RM(100, 1)).toBe(100);
      expect(calculate1RM(140, 1)).toBe(140);
    });

    it('returns 0 for non-positive values', () => {
      expect(calculate1RM(0, 10)).toBe(0);
      expect(calculate1RM(100, 0)).toBe(0);
      expect(calculate1RM(-50, 5)).toBe(0);
    });

    it('accurately calculates 1RM for standard rep ranges', () => {
      // 100kg x 10 reps -> 100 * (1 + 10/30) = 133.3
      expect(calculate1RM(100, 10)).toBe(133.3);
      // 80kg x 8 reps -> 80 * (1 + 8/30) = 80 * 1.2667 = 101.3
      expect(calculate1RM(80, 8)).toBe(101.3);
    });
  });

  describe('Volume Aggregation', () => {
    it('sums volume only for completed sets', () => {
      const sets = [
        { weight: 100, reps: 5, completed: true },  // 500
        { weight: 100, reps: 5, completed: true },  // 500
        { weight: 100, reps: 5, completed: false }, // not completed
      ];
      expect(calculateTotalVolume(sets)).toBe(1000);
    });

    it('returns 0 when no sets completed', () => {
      const sets = [
        { weight: 80, reps: 10, completed: false },
        { weight: 80, reps: 10, completed: false }
      ];
      expect(calculateTotalVolume(sets)).toBe(0);
    });
  });

  describe('Personal Record (PR) Recognition', () => {
    it('flags PR when new 1RM exceeds historical best', () => {
      // Historical best: 80kg x 8 reps = 101.3
      const histBest = calculate1RM(80, 8); // 101.3
      // New set: 82.5kg x 8 reps = 104.5
      expect(checkIsPR(82.5, 8, histBest)).toBe(true);
    });

    it('does not flag PR when new 1RM is below historical best', () => {
      const histBest = calculate1RM(100, 10); // 133.3
      // New set: 90kg x 8 reps = 114
      expect(checkIsPR(90, 8, histBest)).toBe(false);
    });
  });

  describe('Rest Timer Logic', () => {
    it('correctly calculates remaining countdown seconds', () => {
      const now = 1000000;
      const target = now + 90 * 1000;
      expect(calculateRemaining(target, now)).toBe(90);
      expect(calculateRemaining(target, now + 30000)).toBe(60);
      expect(calculateRemaining(target, now + 95000)).toBe(0);
    });
  });

  describe('Muscle Fatigue & Recovery Model', () => {
    it('calculates full fatigue immediately after workout (0 hours ago)', () => {
      // 4 primary sets -> 4 * 18 = 72% fatigue
      const fatigue = calculateMuscleFatigue(4, 0, true);
      expect(fatigue).toBe(72);
    });

    it('decays fatigue linearly over 72 hours window', () => {
      // At 36 hours (halfway), decay factor is 0.5 -> 72 * 0.5 = 36%
      const halfway = calculateMuscleFatigue(4, 36, true);
      expect(halfway).toBe(36);
    });

    it('recovers to 0 fatigue after 72 hours', () => {
      const recovered = calculateMuscleFatigue(4, 73, true);
      expect(recovered).toBe(0);
    });
  });

  describe('Anatomy & Exercises Mapping Integrity', () => {
    it('has valid front and back SVG paths', () => {
      expect(FRONT_PARTS.length).toBeGreaterThan(0);
      expect(BACK_PARTS.length).toBeGreaterThan(0);
      FRONT_PARTS.forEach((part) => {
        expect(part.slug).toBeDefined();
        expect(part.d.length).toBeGreaterThan(0);
      });
      BACK_PARTS.forEach((part) => {
        expect(part.slug).toBeDefined();
        expect(part.d.length).toBeGreaterThan(0);
      });
    });

    it('has exercise database with valid muscle groups and equipment', () => {
      expect(INITIAL_EXERCISES.length).toBeGreaterThan(15);
      INITIAL_EXERCISES.forEach((ex) => {
        expect(ex.id).toBeTruthy();
        expect(ex.name).toBeTruthy();
        expect(ex.primaryMuscles.length).toBeGreaterThan(0);
        expect(ex.instructions.length).toBeGreaterThan(0);
        expect(ex.defaultRestSeconds).toBeGreaterThan(0);
      });
    });

    it('has preset routines that reference valid exercise IDs', () => {
      const validIds = new Set(INITIAL_EXERCISES.map((e) => e.id));
      INITIAL_ROUTINES.forEach((r) => {
        expect(r.id).toBeTruthy();
        expect(r.exercises.length).toBeGreaterThan(0);
        r.exercises.forEach((item) => {
          expect(validIds.has(item.exerciseId)).toBe(true);
        });
      });
    });
  });
});
