import { describe, it, expect } from 'vitest';
import { INITIAL_EXERCISES, INITIAL_ROUTINES } from '../data/exercises';
import {
  ANATOMY_SLUG_MAP,
  FRONT_PARTS,
  BACK_PARTS,
  FRONT_OUTLINE,
  BACK_OUTLINE,
  NON_MUSCLE_SLUGS,
  VIEWBOX_CONFIG
} from '../data/anatomyPaths';
import { calculate1RM } from '../context/WorkoutContext';

// Volume calculation helper
function calculateTotalVolume(sets: { weight: number; reps: number; completed: boolean }[]): number {
  return sets
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.weight * s.reps, 0);
}

// PR Recognition engine helper
function evaluateSessionPRs(
  completedSets: { weight: number; reps: number }[],
  historicalBest1RM: number
): { isPR: boolean; max1RM: number }[] {
  const oneRMs = completedSets.map((s) => calculate1RM(s.weight, s.reps));
  const maxSession1RM = Math.max(0, ...oneRMs);
  const isSessionPR = maxSession1RM > 0 && (historicalBest1RM === 0 || maxSession1RM > historicalBest1RM);

  let topSetClaimed = false;
  return oneRMs.map((rm) => {
    if (isSessionPR && rm === maxSession1RM && !topSetClaimed) {
      topSetClaimed = true;
      return { isPR: true, max1RM: rm };
    }
    return { isPR: false, max1RM: rm };
  });
}

// Rest timer countdown helper
function calculateRemaining(targetEndTime: number, now: number): number {
  return Math.max(0, Math.ceil((targetEndTime - now) / 1000));
}

// Scientific fatigue model: big muscles (72h) vs small muscles (48h)
function calculateMuscleFatigue(
  completedSets: number,
  hoursAgo: number,
  isBigMuscle: boolean,
  isPrimary: boolean
): { fatiguePct: number; stage: string; readyInHours: number } {
  const windowHours = isBigMuscle ? 72 : 48;
  if (hoursAgo > windowHours || completedSets <= 0) {
    return { fatiguePct: 0, stage: 'fresh', readyInHours: 0 };
  }
  const decayFactor = Math.max(0, 1 - hoursAgo / windowHours);
  const pointsPerSet = isPrimary ? 18 : 9;
  const fatiguePct = Math.min(100, Math.round(completedSets * pointsPerSet * decayFactor));

  let stage = 'fresh';
  let readyInHours = 0;
  if (fatiguePct >= 80) {
    stage = 'exhausted';
    readyInHours = Math.round((fatiguePct / 100) * windowHours);
  } else if (fatiguePct >= 50) {
    stage = 'high';
    readyInHours = Math.round((fatiguePct / 100) * (windowHours * 0.75));
  } else if (fatiguePct >= 20) {
    stage = 'recovering';
    readyInHours = Math.round((fatiguePct / 100) * (windowHours * 0.5));
  }

  return { fatiguePct, stage, readyInHours };
}

// Consecutive weekly streak calculation
function calculateWeeklyStreak(completedSessionTimestamps: number[], currentTimestamp: number): number {
  if (completedSessionTimestamps.length === 0) return 0;

  const getWeekMonday = (timestamp: number): number => {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    return date.getTime();
  };

  const trainedWeeks = new Set<number>();
  completedSessionTimestamps.forEach((ts) => trainedWeeks.add(getWeekMonday(ts)));

  const nowMonday = getWeekMonday(currentTimestamp);
  const ONE_WEEK_MS = 7 * 86400000;

  let checkWeek = nowMonday;
  if (!trainedWeeks.has(checkWeek)) {
    checkWeek -= ONE_WEEK_MS;
    if (!trainedWeeks.has(checkWeek)) {
      return 0; // Streak broken
    }
  }

  let streak = 0;
  while (trainedWeeks.has(checkWeek)) {
    streak += 1;
    checkWeek -= ONE_WEEK_MS;
  }
  return streak;
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
      // 60kg x 12 reps -> 60 * (1 + 12/30) = 84
      expect(calculate1RM(60, 12)).toBe(84);
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

    it('correctly handles bodyweight 0kg completed sets', () => {
      const sets = [
        { weight: 0, reps: 15, completed: true },
        { weight: 0, reps: 12, completed: true }
      ];
      expect(calculateTotalVolume(sets)).toBe(0);
    });
  });

  describe('Personal Record (PR) Recognition & Active Session Isolation', () => {
    it('flags only the top set as PR when establishing first record for an exercise', () => {
      // First ever session with Bench Press (history = 0)
      const sets = [
        { weight: 60, reps: 8 },  // 1RM = 76
        { weight: 80, reps: 8 },  // 1RM = 101.3 (TOP SET -> PR!)
        { weight: 50, reps: 8 }   // 1RM = 63.3 (Subsequent drop set -> MUST NOT BE PR!)
      ];
      const evaluated = evaluateSessionPRs(sets, 0);
      expect(evaluated[0].isPR).toBe(false);
      expect(evaluated[1].isPR).toBe(true);
      expect(evaluated[2].isPR).toBe(false);
    });

    it('flags PR when exceeding historical best, and denies lower sets in the same session', () => {
      const historicalBest1RM = 100; // Historical record: 100kg
      const sets = [
        { weight: 70, reps: 8 },  // 1RM = 88.7 (< 100) -> No
        { weight: 85, reps: 8 },  // 1RM = 107.7 (> 100) -> YES, Top PR!
        { weight: 60, reps: 10 }  // 1RM = 80 (< 100) -> No
      ];
      const evaluated = evaluateSessionPRs(sets, historicalBest1RM);
      expect(evaluated[0].isPR).toBe(false);
      expect(evaluated[1].isPR).toBe(true);
      expect(evaluated[2].isPR).toBe(false);
    });

    it('does not flag any PR if no set in current session exceeds historical best', () => {
      const historicalBest1RM = 120;
      const sets = [
        { weight: 80, reps: 8 },  // 101.3
        { weight: 85, reps: 6 }   // 102
      ];
      const evaluated = evaluateSessionPRs(sets, historicalBest1RM);
      expect(evaluated.every((s) => !s.isPR)).toBe(true);
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

  describe('Muscle Fatigue & Recovery Model (ABOT 72h / 48h windows)', () => {
    it('calculates full fatigue immediately after workout for big muscles (72h)', () => {
      // 5 primary sets on Chest -> 5 * 18 = 90% fatigue -> exhausted
      const result = calculateMuscleFatigue(5, 0, true, true);
      expect(result.fatiguePct).toBe(90);
      expect(result.stage).toBe('exhausted');
      expect(result.readyInHours).toBe(65); // 90% of 72h
    });

    it('uses 48h recovery window for small muscles (e.g. Biceps, Triceps, Deltoids)', () => {
      // 3 primary sets on Biceps at 24h ago (halfway)
      // Initial: 3 * 18 = 54%. After 24h of 48h (halfway): 54 * 0.5 = 27%
      const result = calculateMuscleFatigue(3, 24, false, true);
      expect(result.fatiguePct).toBe(27);
      expect(result.stage).toBe('recovering');
      expect(result.readyInHours).toBe(6); // 27% of 24h
    });

    it('fully recovers to 0 fatigue after window passes', () => {
      expect(calculateMuscleFatigue(4, 73, true, true).fatiguePct).toBe(0);
      expect(calculateMuscleFatigue(4, 49, false, true).fatiguePct).toBe(0);
    });
  });

  describe('True Consecutive Weekly Streak Engine', () => {
    it('returns 0 when no workouts completed', () => {
      expect(calculateWeeklyStreak([], Date.now())).toBe(0);
    });

    it('returns 1 when user worked out in the current week', () => {
      const now = Date.now();
      expect(calculateWeeklyStreak([now - 3600000], now)).toBe(1);
    });

    it('keeps streak alive if user worked out last week but not yet this week', () => {
      const now = Date.now();
      const lastWeek = now - 5 * 86400000; // 5 days ago (in previous or current week)
      expect(calculateWeeklyStreak([lastWeek], now)).toBeGreaterThanOrEqual(1);
    });

    it('counts consecutive weeks correctly', () => {
      const now = Date.now();
      const ONE_WEEK = 7 * 86400000;
      // 3 consecutive weeks
      const workouts = [
        now - 86400000,
        now - ONE_WEEK - 86400000,
        now - ONE_WEEK * 2 - 86400000
      ];
      expect(calculateWeeklyStreak(workouts, now)).toBe(3);
    });

    it('breaks streak when a week was missed', () => {
      const now = Date.now();
      const ONE_WEEK = 7 * 86400000;
      // Worked out 4 weeks ago, missed weeks 1, 2, 3
      const workouts = [now - ONE_WEEK * 4];
      expect(calculateWeeklyStreak(workouts, now)).toBe(0);
    });
  });

  describe('Anatomy SVG Integrity (ABOT Spec)', () => {
    it('has full Front and Back SVG parts with authentic coordinate viewboxes', () => {
      expect(FRONT_PARTS.length).toBe(19);
      expect(BACK_PARTS.length).toBe(16);
      expect(VIEWBOX_CONFIG.front).toBe('29 147 670 1225');
      expect(VIEWBOX_CONFIG.back).toBe('749 146 670 1225');
      expect(VIEWBOX_CONFIG.both).toBe('29 146 1390 1226');
    });

    it('includes non-muscle body features for full human silhouette', () => {
      const nonMuscles = ['head', 'hair', 'hands', 'feet', 'ankles'];
      nonMuscles.forEach((slug) => {
        expect(NON_MUSCLE_SLUGS.has(slug)).toBe(true);
      });
      const frontSlugs = new Set(FRONT_PARTS.map((p) => p.slug));
      const backSlugs = new Set(BACK_PARTS.map((p) => p.slug));
      expect(frontSlugs.has('head')).toBe(true);
      expect(backSlugs.has('head')).toBe(true);
      expect(backSlugs.has('deltoids')).toBe(true);
      expect(backSlugs.has('forearm')).toBe(true);
      expect(backSlugs.has('adductors')).toBe(true);
      expect(backSlugs.has('neck')).toBe(true);
    });

    it('has authentic body outline vector paths', () => {
      expect(FRONT_OUTLINE.length).toBeGreaterThan(5000);
      expect(BACK_OUTLINE.length).toBeGreaterThan(5000);
      expect(FRONT_OUTLINE.startsWith('M')).toBe(true);
      expect(BACK_OUTLINE.startsWith('M')).toBe(true);
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
