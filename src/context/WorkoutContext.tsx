import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  WorkoutSession,
  WorkoutSet,
  WorkoutExercise,
  Routine,
  Exercise,
  UserSettings,
  MuscleGroup,
  MuscleFatigueInfo
} from '../types';
import { INITIAL_EXERCISES, INITIAL_ROUTINES } from '../data/exercises';
import { soundFx } from '../utils/audio';

interface RestTimerState {
  isActive: boolean;
  exerciseName?: string;
  totalSeconds: number;
  remainingSeconds: number;
  targetEndTime: number;
}

interface WorkoutContextType {
  // State
  activeWorkout: WorkoutSession | null;
  workoutHistory: WorkoutSession[];
  exercises: Exercise[];
  routines: Routine[];
  settings: UserSettings;
  restTimer: RestTimerState;
  activeTab: 'home' | 'workout' | 'exercises' | 'history' | 'settings';
  showSummaryModal: boolean;
  lastCompletedWorkout: WorkoutSession | null;

  // Navigation
  setActiveTab: (tab: 'home' | 'workout' | 'exercises' | 'history' | 'settings') => void;
  closeSummaryModal: () => void;

  // Active Workout Actions
  startWorkout: (routineId?: string, customTitle?: string) => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  addExerciseToWorkout: (exerciseId: string) => void;
  removeExerciseFromWorkout: (exerciseIndex: number) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => void;
  toggleSetCompleted: (exerciseIndex: number, setIndex: number) => void;

  // Rest Timer Actions
  startRestTimer: (seconds?: number, exerciseName?: string) => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  skipRestTimer: () => void;

  // Routines & Exercises
  createCustomRoutine: (routine: Omit<Routine, 'id'>) => void;
  deleteRoutine: (id: string) => void;
  addCustomExercise: (exercise: Omit<Exercise, 'id'>) => void;

  // Settings & Utilities
  updateSettings: (updates: Partial<UserSettings>) => void;
  getBest1RM: (exerciseId: string) => number;
  getMuscleFatigueMap: () => Record<MuscleGroup, MuscleFatigueInfo>;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  getStreakWeeks: () => number;
}

const DEFAULT_SETTINGS: UserSettings = {
  weightUnit: 'kg',
  defaultRestSeconds: 90,
  soundEnabled: true,
  hapticEnabled: true,
  hasSeenOnboarding: false,
  theme: 'oled'
};

const STORAGE_KEYS = {
  ACTIVE: 'pitbull_active_workout',
  HISTORY: 'pitbull_workout_history',
  EXERCISES: 'pitbull_custom_exercises',
  ROUTINES: 'pitbull_routines',
  SETTINGS: 'pitbull_settings'
};

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'exercises' | 'history' | 'settings'>('home');

  // Exercises
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXERCISES);
      if (saved) {
        const custom = JSON.parse(saved);
        return [...INITIAL_EXERCISES, ...custom];
      }
    } catch {}
    return INITIAL_EXERCISES;
  });

  // Routines
  const [routines, setRoutines] = useState<Routine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ROUTINES;
  });

  // Workout History
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Seed initial dummy past workout so user sees instant beautiful stats
    const now = Date.now();
    const demoPast: WorkoutSession = {
      id: 'demo-session-1',
      title: 'Push Day (Chest & Triceps)',
      routineId: 'push-day',
      startedAt: now - 86400000 * 2,
      finishedAt: now - 86400000 * 2 + 3600000,
      durationSeconds: 3600,
      exercises: [
        {
          id: 'ex-1',
          exerciseId: 'bench-press',
          sets: [
            { id: 's1', setNumber: 1, type: 'normal', weight: 80, reps: 8, completed: true, isPR: false },
            { id: 's2', setNumber: 2, type: 'normal', weight: 82.5, reps: 8, completed: true, isPR: true },
            { id: 's3', setNumber: 3, type: 'normal', weight: 82.5, reps: 7, completed: true, isPR: false }
          ]
        },
        {
          id: 'ex-2',
          exerciseId: 'incline-dumbbell-press',
          sets: [
            { id: 's4', setNumber: 1, type: 'normal', weight: 30, reps: 10, completed: true, isPR: false },
            { id: 's5', setNumber: 2, type: 'normal', weight: 32, reps: 8, completed: true, isPR: true }
          ]
        }
      ],
      totalVolume: 82.5 * 8 + 80 * 8 + 82.5 * 7 + 30 * 10 * 2 + 32 * 8 * 2,
      totalSets: 5,
      prCount: 2,
      status: 'completed'
    };
    return [demoPast];
  });

  // Active Workout
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Summary Modal
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [lastCompletedWorkout, setLastCompletedWorkout] = useState<WorkoutSession | null>(null);

  // Rest Timer
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    isActive: false,
    totalSeconds: 90,
    remainingSeconds: 90,
    targetEndTime: 0
  });

  // Save Settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Save History
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  // Save Active Workout
  useEffect(() => {
    if (activeWorkout) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE, JSON.stringify(activeWorkout));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE);
    }
  }, [activeWorkout]);

  // Live Workout Duration Timer ticker
  useEffect(() => {
    if (!activeWorkout || activeWorkout.status !== 'active') return;
    const interval = setInterval(() => {
      setActiveWorkout((prev) => {
        if (!prev || prev.status !== 'active') return prev;
        const durationSeconds = Math.max(0, Math.floor((Date.now() - prev.startedAt) / 1000));
        return { ...prev, durationSeconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout?.status, activeWorkout?.startedAt]);

  // Live Rest Timer countdown ticker
  const timerCompleteRef = useRef(false);
  useEffect(() => {
    if (!restTimer.isActive) return;
    timerCompleteRef.current = false;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((restTimer.targetEndTime - now) / 1000));

      if (remaining <= 0) {
        clearInterval(interval);
        setRestTimer((prev) => ({ ...prev, isActive: false, remainingSeconds: 0 }));
        if (!timerCompleteRef.current) {
          timerCompleteRef.current = true;
          if (settings.soundEnabled) soundFx.playTimerComplete();
          if (settings.hapticEnabled) soundFx.triggerHaptic([100, 100, 200, 100, 400]);
        }
      } else {
        setRestTimer((prev) => ({ ...prev, remainingSeconds: remaining }));
      }
    }, 250);

    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.targetEndTime, settings.soundEnabled, settings.hapticEnabled]);

  // Calculate 1RM via Epley Formula: weight * (1 + reps / 30)
  const calculate1RM = useCallback((weight: number, reps: number): number => {
    if (reps <= 0 || weight <= 0) return 0;
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30) * 10) / 10;
  }, []);

  // Find all-time best 1RM for an exercise
  const getBest1RM = useCallback(
    (exerciseId: string): number => {
      let max1RM = 0;
      workoutHistory.forEach((session) => {
        session.exercises.forEach((ex) => {
          if (ex.exerciseId === exerciseId) {
            ex.sets.forEach((set) => {
              if (set.completed && set.weight > 0 && set.reps > 0) {
                const oneRM = calculate1RM(set.weight, set.reps);
                if (oneRM > max1RM) max1RM = oneRM;
              }
            });
          }
        });
      });
      return max1RM;
    },
    [workoutHistory, calculate1RM]
  );

  // Get previous set data for an exercise
  const getPreviousSetData = useCallback(
    (exerciseId: string, setIndex: number): { weight: number; reps: number } | null => {
      // Look back through history in reverse chronological order
      for (const session of workoutHistory) {
        const found = session.exercises.find((e) => e.exerciseId === exerciseId);
        if (found && found.sets[setIndex] && found.sets[setIndex].completed) {
          return {
            weight: found.sets[setIndex].weight,
            reps: found.sets[setIndex].reps
          };
        }
      }
      return null;
    },
    [workoutHistory]
  );

  // Start Workout
  const startWorkout = useCallback(
    (routineId?: string, customTitle?: string) => {
      const routine = routineId ? routines.find((r) => r.id === routineId) : null;
      const title = customTitle || (routine ? routine.name : 'Quick Workout');

      let initialExercises: WorkoutExercise[] = [];
      if (routine) {
        initialExercises = routine.exercises.map((item, exIdx) => {
          const sets: WorkoutSet[] = [];
          for (let s = 1; s <= item.defaultSets; s++) {
            const prev = getPreviousSetData(item.exerciseId, s - 1);
            sets.push({
              id: `set-${exIdx}-${s}-${Date.now()}`,
              setNumber: s,
              type: 'normal',
              weight: prev?.weight ?? (settings.weightUnit === 'kg' ? 60 : 135),
              reps: prev?.reps ?? 8,
              previousWeight: prev?.weight,
              previousReps: prev?.reps,
              completed: false,
              isPR: false
            });
          }
          return {
            id: `we-${exIdx}-${Date.now()}`,
            exerciseId: item.exerciseId,
            sets
          };
        });
      } else {
        // Default with Bench Press
        const prev = getPreviousSetData('bench-press', 0);
        initialExercises = [
          {
            id: `we-0-${Date.now()}`,
            exerciseId: 'bench-press',
            sets: [
              {
                id: `set-0-1-${Date.now()}`,
                setNumber: 1,
                type: 'normal',
                weight: prev?.weight ?? (settings.weightUnit === 'kg' ? 60 : 135),
                reps: prev?.reps ?? 8,
                previousWeight: prev?.weight,
                previousReps: prev?.reps,
                completed: false,
                isPR: false
              }
            ]
          }
        ];
      }

      const newSession: WorkoutSession = {
        id: `workout-${Date.now()}`,
        title,
        routineId,
        startedAt: Date.now(),
        durationSeconds: 0,
        exercises: initialExercises,
        totalVolume: 0,
        totalSets: 0,
        prCount: 0,
        status: 'active'
      };

      setActiveWorkout(newSession);
      setActiveTab('workout');
      if (settings.soundEnabled) soundFx.playTap();
      if (settings.hapticEnabled) soundFx.triggerHaptic(40);
    },
    [routines, getPreviousSetData, settings.weightUnit, settings.soundEnabled, settings.hapticEnabled]
  );

  // Add Exercise to active workout
  const addExerciseToWorkout = useCallback(
    (exerciseId: string) => {
      if (!activeWorkout) return;
      const prev = getPreviousSetData(exerciseId, 0);
      const newEx: WorkoutExercise = {
        id: `we-${activeWorkout.exercises.length}-${Date.now()}`,
        exerciseId,
        sets: [
          {
            id: `set-${Date.now()}`,
            setNumber: 1,
            type: 'normal',
            weight: prev?.weight ?? (settings.weightUnit === 'kg' ? 40 : 90),
            reps: prev?.reps ?? 10,
            previousWeight: prev?.weight,
            previousReps: prev?.reps,
            completed: false,
            isPR: false
          }
        ]
      };

      setActiveWorkout((prev) => (prev ? { ...prev, exercises: [...prev.exercises, newEx] } : prev));
      if (settings.soundEnabled) soundFx.playTap();
    },
    [activeWorkout, getPreviousSetData, settings.weightUnit, settings.soundEnabled]
  );

  // Remove Exercise
  const removeExerciseFromWorkout = useCallback((exerciseIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      const exercises = [...prev.exercises];
      exercises.splice(exerciseIndex, 1);
      return { ...prev, exercises };
    });
  }, []);

  // Add Set
  const addSet = useCallback(
    (exerciseIndex: number) => {
      if (!activeWorkout) return;
      setActiveWorkout((prev) => {
        if (!prev) return prev;
        const exercises = [...prev.exercises];
        const targetEx = exercises[exerciseIndex];
        if (!targetEx) return prev;

        const nextSetNum = targetEx.sets.length + 1;
        const lastSet = targetEx.sets[targetEx.sets.length - 1];
        const prevSetData = getPreviousSetData(targetEx.exerciseId, nextSetNum - 1);

        const newSet: WorkoutSet = {
          id: `set-${exerciseIndex}-${nextSetNum}-${Date.now()}`,
          setNumber: nextSetNum,
          type: 'normal',
          weight: lastSet ? lastSet.weight : prevSetData?.weight ?? 60,
          reps: lastSet ? lastSet.reps : prevSetData?.reps ?? 8,
          previousWeight: prevSetData?.weight,
          previousReps: prevSetData?.reps,
          completed: false,
          isPR: false
        };

        targetEx.sets = [...targetEx.sets, newSet];
        return { ...prev, exercises };
      });
      if (settings.soundEnabled) soundFx.playTap();
    },
    [activeWorkout, getPreviousSetData, settings.soundEnabled]
  );

  // Remove Set
  const removeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      const exercises = [...prev.exercises];
      const targetEx = exercises[exerciseIndex];
      if (!targetEx) return prev;

      targetEx.sets.splice(setIndex, 1);
      // Re-index remaining sets
      targetEx.sets = targetEx.sets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return { ...prev, exercises };
    });
  }, []);

  // Update Set fields
  const updateSet = useCallback((exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      const exercises = [...prev.exercises];
      const targetEx = exercises[exerciseIndex];
      if (!targetEx || !targetEx.sets[setIndex]) return prev;

      targetEx.sets[setIndex] = { ...targetEx.sets[setIndex], ...updates };
      return { ...prev, exercises };
    });
  }, []);

  // Rest Timer Controls
  const startRestTimer = useCallback(
    (seconds?: number, exerciseName?: string) => {
      const dur = seconds ?? settings.defaultRestSeconds;
      setRestTimer({
        isActive: true,
        exerciseName,
        totalSeconds: dur,
        remainingSeconds: dur,
        targetEndTime: Date.now() + dur * 1000
      });
    },
    [settings.defaultRestSeconds]
  );

  const adjustRestTimer = useCallback((deltaSeconds: number) => {
    setRestTimer((prev) => {
      if (!prev.isActive) return prev;
      const newRemaining = Math.max(5, prev.remainingSeconds + deltaSeconds);
      const newTotal = Math.max(newRemaining, prev.totalSeconds);
      return {
        ...prev,
        totalSeconds: newTotal,
        remainingSeconds: newRemaining,
        targetEndTime: Date.now() + newRemaining * 1000
      };
    });
  }, []);

  const skipRestTimer = useCallback(() => {
    setRestTimer((prev) => ({ ...prev, isActive: false, remainingSeconds: 0 }));
  }, []);

  // Toggle Set Completed
  const toggleSetCompleted = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      if (!activeWorkout) return;

      let triggerTimer = false;
      let exName = '';
      let isPR = false;

      setActiveWorkout((prev) => {
        if (!prev) return prev;
        const exercises = [...prev.exercises];
        const targetEx = exercises[exerciseIndex];
        if (!targetEx || !targetEx.sets[setIndex]) return prev;

        const currentSet = targetEx.sets[setIndex];
        const willBeCompleted = !currentSet.completed;

        if (willBeCompleted) {
          triggerTimer = true;
          const exMeta = INITIAL_EXERCISES.find((e) => e.id === targetEx.exerciseId);
          exName = exMeta ? exMeta.name : 'Rest';

          // Check if this is a new PR
          const current1RM = calculate1RM(currentSet.weight, currentSet.reps);
          const bestHistorical1RM = getBest1RM(targetEx.exerciseId);

          if (current1RM > 0 && (bestHistorical1RM === 0 || current1RM > bestHistorical1RM)) {
            isPR = true;
          }
        }

        targetEx.sets[setIndex] = {
          ...currentSet,
          completed: willBeCompleted,
          isPR: willBeCompleted ? isPR : false
        };

        // Recalculate summary metrics
        let totalVolume = 0;
        let totalSets = 0;
        let prCount = 0;

        exercises.forEach((ex) => {
          ex.sets.forEach((s) => {
            if (s.completed) {
              totalVolume += s.weight * s.reps;
              totalSets += 1;
              if (s.isPR) prCount += 1;
            }
          });
        });

        return { ...prev, exercises, totalVolume, totalSets, prCount };
      });

      if (triggerTimer) {
        if (isPR) {
          if (settings.soundEnabled) soundFx.playPRCelebration();
          if (settings.hapticEnabled) soundFx.triggerHaptic([50, 50, 100]);
        } else {
          if (settings.soundEnabled) soundFx.playSetComplete();
          if (settings.hapticEnabled) soundFx.triggerHaptic(35);
        }
        startRestTimer(undefined, exName);
      }
    },
    [activeWorkout, calculate1RM, getBest1RM, settings.soundEnabled, settings.hapticEnabled, startRestTimer]
  );

  // Finish Workout
  const finishWorkout = useCallback(() => {
    if (!activeWorkout) return;

    const finishedSession: WorkoutSession = {
      ...activeWorkout,
      finishedAt: Date.now(),
      status: 'completed'
    };

    setWorkoutHistory((prev) => [finishedSession, ...prev]);
    setLastCompletedWorkout(finishedSession);
    setActiveWorkout(null);
    skipRestTimer();
    setShowSummaryModal(true);
    if (settings.soundEnabled) soundFx.playPRCelebration();
  }, [activeWorkout, skipRestTimer, settings.soundEnabled]);

  // Cancel Workout
  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null);
    skipRestTimer();
    setActiveTab('home');
  }, [skipRestTimer]);

  const closeSummaryModal = useCallback(() => {
    setShowSummaryModal(false);
    setActiveTab('home');
  }, []);

  // Create Custom Routine
  const createCustomRoutine = useCallback((routineData: Omit<Routine, 'id'>) => {
    const newRoutine: Routine = {
      ...routineData,
      id: `custom-routine-${Date.now()}`
    };
    setRoutines((prev) => {
      const updated = [...prev, newRoutine];
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Delete Routine
  const deleteRoutine = useCallback((id: string) => {
    setRoutines((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Add Custom Exercise
  const addCustomExercise = useCallback((exerciseData: Omit<Exercise, 'id'>) => {
    const newEx: Exercise = {
      ...exerciseData,
      id: `custom-ex-${Date.now()}`
    };
    setExercises((prev) => {
      const updated = [...prev, newEx];
      // Save only custom
      const customOnly = updated.filter((e) => !INITIAL_EXERCISES.some((ie) => ie.id === e.id));
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(customOnly));
      return updated;
    });
  }, []);

  // Update Settings
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Calculate Muscle Fatigue Map
  const getMuscleFatigueMap = useCallback((): Record<MuscleGroup, MuscleFatigueInfo> => {
    const fatigueMap: Record<MuscleGroup, MuscleFatigueInfo> = {
      chest: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      back: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      'upper-back': { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      lats: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      traps: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      shoulders: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      biceps: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      triceps: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      forearms: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      abs: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      obliques: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      quads: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      hamstrings: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      glutes: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      calves: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      lower_back: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      adductors: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      neck: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      full_body: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 },
      cardio: { fatiguePct: 0, stage: 'fresh', readyInHours: 0 }
    };

    const now = Date.now();
    const WINDOW_HOURS = 72;

    workoutHistory.forEach((session) => {
      const sessionTime = session.finishedAt || session.startedAt;
      const hoursAgo = (now - sessionTime) / (1000 * 3600);
      if (hoursAgo > WINDOW_HOURS) return;

      session.exercises.forEach((ex) => {
        const meta = INITIAL_EXERCISES.find((e) => e.id === ex.exerciseId);
        if (!meta) return;

        const completedSets = ex.sets.filter((s) => s.completed).length;
        if (completedSets === 0) return;

        // Base fatigue points: 15 per set for primary, 8 for secondary
        const decayFactor = Math.max(0, 1 - hoursAgo / WINDOW_HOURS);

        meta.primaryMuscles.forEach((m) => {
          if (fatigueMap[m]) {
            const added = completedSets * 18 * decayFactor;
            fatigueMap[m].fatiguePct = Math.min(100, Math.round(fatigueMap[m].fatiguePct + added));
            fatigueMap[m].lastTrainedAt = Math.max(fatigueMap[m].lastTrainedAt || 0, sessionTime);
          }
        });

        meta.secondaryMuscles.forEach((m) => {
          if (fatigueMap[m]) {
            const added = completedSets * 9 * decayFactor;
            fatigueMap[m].fatiguePct = Math.min(100, Math.round(fatigueMap[m].fatiguePct + added));
          }
        });
      });
    });

    // Assign stages
    (Object.keys(fatigueMap) as MuscleGroup[]).forEach((m) => {
      const f = fatigueMap[m].fatiguePct;
      if (f >= 75) {
        fatigueMap[m].stage = 'exhausted';
        fatigueMap[m].readyInHours = Math.round((f / 100) * 48);
      } else if (f >= 45) {
        fatigueMap[m].stage = 'high';
        fatigueMap[m].readyInHours = Math.round((f / 100) * 36);
      } else if (f >= 20) {
        fatigueMap[m].stage = 'recovering';
        fatigueMap[m].readyInHours = Math.round((f / 100) * 24);
      } else {
        fatigueMap[m].stage = 'fresh';
        fatigueMap[m].readyInHours = 0;
      }
    });

    return fatigueMap;
  }, [workoutHistory]);

  // Calculate Streak in Weeks
  const getStreakWeeks = useCallback((): number => {
    if (workoutHistory.length === 0) return 0;
    // Count active weeks
    const weekTimestamps = new Set<string>();
    workoutHistory.forEach((session) => {
      const d = new Date(session.finishedAt || session.startedAt);
      const weekYear = `${d.getFullYear()}-W${Math.ceil((d.getDate() + 6) / 7)}`;
      weekTimestamps.add(weekYear);
    });
    return Math.max(1, weekTimestamps.size);
  }, [workoutHistory]);

  // Data Export / Import
  const exportData = useCallback((): string => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      workoutHistory,
      routines,
      settings
    };
    return JSON.stringify(payload, null, 2);
  }, [workoutHistory, routines, settings]);

  const importData = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.workoutHistory) setWorkoutHistory(parsed.workoutHistory);
      if (parsed.routines) setRoutines(parsed.routines);
      if (parsed.settings) setSettings(parsed.settings);
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        activeWorkout,
        workoutHistory,
        exercises,
        routines,
        settings,
        restTimer,
        activeTab,
        showSummaryModal,
        lastCompletedWorkout,
        setActiveTab,
        closeSummaryModal,
        startWorkout,
        finishWorkout,
        cancelWorkout,
        addExerciseToWorkout,
        removeExerciseFromWorkout,
        addSet,
        removeSet,
        updateSet,
        toggleSetCompleted,
        startRestTimer,
        adjustRestTimer,
        skipRestTimer,
        createCustomRoutine,
        deleteRoutine,
        addCustomExercise,
        updateSettings,
        getBest1RM,
        getMuscleFatigueMap,
        exportData,
        importData,
        getStreakWeeks
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) throw new Error('useWorkout must be used within WorkoutProvider');
  return context;
};
