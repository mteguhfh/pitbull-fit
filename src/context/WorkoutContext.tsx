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
import { TRANSLATIONS, TranslationKey, Language } from '../utils/i18n';

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
  activeTab: 'home' | 'workout' | 'exercises' | 'history' | 'profile' | 'settings';
  showSummaryModal: boolean;
  lastCompletedWorkout: WorkoutSession | null;

  // Navigation
  setActiveTab: (tab: 'home' | 'workout' | 'exercises' | 'history' | 'profile' | 'settings') => void;
  openSummaryModal: (workout?: WorkoutSession) => void;
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
  updateWorkoutTitle: (title: string) => void;
  updateExerciseNotes: (exerciseIndex: number, notes: string) => void;

  // Rest Timer Actions
  startRestTimer: (seconds?: number, exerciseName?: string) => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  skipRestTimer: () => void;

  // Routines & Exercises
  createCustomRoutine: (routine: Omit<Routine, 'id'>) => void;
  deleteRoutine: (id: string) => void;
  addCustomExercise: (exercise: Omit<Exercise, 'id'>) => void;

  // Settings, Profile & Utilities
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
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
  theme: 'dark',
  language: 'id',
  profile: {
    heightCm: 175,
    weightKg: 70,
    age: 25,
    gender: 'male',
    bmi: 22.9,
    bmiCategory: 'normal',
    goal: 'maintain',
    dailyCalories: 2200,
    dailyProteinGrams: 140
  }
};

const STORAGE_KEYS = {
  ACTIVE: 'pitbull_active_workout',
  HISTORY: 'pitbull_workout_history',
  EXERCISES: 'pitbull_custom_exercises',
  ROUTINES: 'pitbull_routines',
  SETTINGS: 'pitbull_settings'
};

// Calculate 1RM using standard Epley Formula: weight * (1 + reps / 30)
export const calculate1RM = (weight: number, reps: number): number => {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
};

// Big muscles vs small muscles recovery windows (ABOT standard)
const BIG_MUSCLES = new Set<string>([
  'chest',
  'back',
  'upper-back',
  'lower-back',
  'gluteal',
  'glutes',
  'quadriceps',
  'quads',
  'hamstring',
  'hamstrings'
]);

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
  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'exercises' | 'history' | 'profile' | 'settings'>('home');

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
    return [];
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

  // Sync Theme (Dark vs Light) with DOM root and color-scheme
  useEffect(() => {
    const isLight = settings.theme === 'light';
    const root = document.documentElement;
    if (isLight) {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f4f5f8');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#08080a');
    }
  }, [settings.theme]);

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

  // `startedAt` is the source of truth for elapsed time. Components read the
  // clock themselves instead of a 1 Hz context mutation, so the timer does not
  // re-render the whole active-workout tree (and re-run its localStorage write).

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

  // Find all-time best 1RM for an exercise from workoutHistory
  const getBest1RM = useCallback(
    (exerciseId: string): number => {
      let max1RM = 0;
      workoutHistory.forEach((session) => {
        if (session.status !== 'completed') return;
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
    [workoutHistory]
  );

  // Synchronize volume, sets count, and PR recognition across exercises
  const syncWorkoutMetrics = useCallback(
    (rawExercises: WorkoutExercise[]): {
      exercises: WorkoutExercise[];
      totalVolume: number;
      totalSets: number;
      prCount: number;
    } => {
      let totalVolume = 0;
      let totalSets = 0;
      let prCount = 0;

      const exercises = rawExercises.map((ex) => {
        const bestHist = getBest1RM(ex.exerciseId);

        // Find max 1RM achieved in this current active session for this exercise
        let maxSession1RM = 0;
        ex.sets.forEach((s) => {
          if (s.completed && s.weight > 0 && s.reps > 0) {
            const oneRM = calculate1RM(s.weight, s.reps);
            if (oneRM > maxSession1RM) {
              maxSession1RM = oneRM;
            }
          }
        });

        // Determine if this session sets a PR
        const isSessionPR =
          maxSession1RM > 0 && (bestHist === 0 ? true : maxSession1RM > bestHist);

        let exerciseHasPRSet = false;

        const sets = ex.sets.map((s) => {
          if (s.completed) {
            totalVolume += s.weight * s.reps;
            totalSets += 1;

            if (isSessionPR && s.weight > 0 && s.reps > 0) {
              const oneRM = calculate1RM(s.weight, s.reps);
              if (oneRM === maxSession1RM && !exerciseHasPRSet) {
                exerciseHasPRSet = true;
                return { ...s, isPR: true };
              }
            }
          }
          return { ...s, isPR: false };
        });

        if (exerciseHasPRSet) {
          prCount += 1;
        }

        return { ...ex, sets };
      });

      return { exercises, totalVolume, totalSets, prCount };
    },
    [getBest1RM]
  );

  // Get previous set data for an exercise
  const getPreviousSetData = useCallback(
    (exerciseId: string, setIndex: number): { weight: number; reps: number } | null => {
      // Look back through history in reverse chronological order
      for (const session of workoutHistory) {
        if (session.status !== 'completed') continue;
        const found = session.exercises.find((e) => e.exerciseId === exerciseId);
        if (found) {
          // Exact matching set index
          if (found.sets[setIndex] && found.sets[setIndex].completed) {
            return {
              weight: found.sets[setIndex].weight,
              reps: found.sets[setIndex].reps
            };
          }
          // Fall back to the last completed set of that exercise
          const completedSets = found.sets.filter((s) => s.completed);
          if (completedSets.length > 0) {
            const lastCompleted = completedSets[completedSets.length - 1];
            return {
              weight: lastCompleted.weight,
              reps: lastCompleted.reps
            };
          }
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

      setActiveWorkout((prev) => {
        if (!prev) return prev;
        const updatedRaw = [...prev.exercises, newEx];
        const synced = syncWorkoutMetrics(updatedRaw);
        return { ...prev, ...synced };
      });
      if (settings.soundEnabled) soundFx.playTap();
    },
    [activeWorkout, getPreviousSetData, settings.weightUnit, settings.soundEnabled, syncWorkoutMetrics]
  );

  // Remove Exercise
  const removeExerciseFromWorkout = useCallback(
    (exerciseIndex: number) => {
      setActiveWorkout((prev) => {
        if (!prev) return prev;
        const exercises = [...prev.exercises];
        exercises.splice(exerciseIndex, 1);
        const synced = syncWorkoutMetrics(exercises);
        return { ...prev, ...synced };
      });
    },
    [syncWorkoutMetrics]
  );

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
        const synced = syncWorkoutMetrics(exercises);
        return { ...prev, ...synced };
      });
      if (settings.soundEnabled) soundFx.playTap();
    },
    [activeWorkout, getPreviousSetData, settings.soundEnabled, syncWorkoutMetrics]
  );

  // Remove Set
  const removeSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      setActiveWorkout((prev) => {
        if (!prev) return prev;
        const exercises = [...prev.exercises];
        const targetEx = exercises[exerciseIndex];
        if (!targetEx) return prev;

        targetEx.sets.splice(setIndex, 1);
        // Re-index remaining sets
        targetEx.sets = targetEx.sets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        const synced = syncWorkoutMetrics(exercises);
        return { ...prev, ...synced };
      });
    },
    [syncWorkoutMetrics]
  );

  // Update Set fields
  const updateSet = useCallback(
    (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => {
      setActiveWorkout((prev) => {
        if (!prev) return prev;
        const targetEx = prev.exercises[exerciseIndex];
        if (!targetEx || !targetEx.sets[setIndex]) return prev;

        // Copy every level we touch: React bails out when the state object
        // keeps its identity, so in-place mutation silently drops the update.
        const exercises = prev.exercises.map((ex, idx) =>
          idx === exerciseIndex
            ? {
                ...ex,
                sets: ex.sets.map((set, sIdx) =>
                  sIdx === setIndex ? { ...set, ...updates } : set
                )
              }
            : ex
        );
        const synced = syncWorkoutMetrics(exercises);
        return { ...prev, ...synced };
      });
    },
    [syncWorkoutMetrics]
  );

  // Update workout title
  const updateWorkoutTitle = useCallback((title: string) => {
    setActiveWorkout((prev) => (prev ? { ...prev, title } : prev));
  }, []);

  // Update per-exercise note
  const updateExerciseNotes = useCallback((exerciseIndex: number, notes: string) => {
    setActiveWorkout((prev) => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, idx) =>
        idx === exerciseIndex ? { ...ex, notes } : ex
      );
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
      let isSetPR = false;

      setActiveWorkout((prev) => {
        if (!prev) return prev;
        const targetEx = prev.exercises[exerciseIndex];
        if (!targetEx || !targetEx.sets[setIndex]) return prev;

        const currentSet = targetEx.sets[setIndex];
        const willBeCompleted = !currentSet.completed;

        const exercises = prev.exercises.map((ex, idx) =>
          idx === exerciseIndex
            ? {
                ...ex,
                sets: ex.sets.map((set, sIdx) =>
                  sIdx === setIndex ? { ...set, completed: willBeCompleted } : set
                )
              }
            : ex
        );

        const synced = syncWorkoutMetrics(exercises);

        if (willBeCompleted) {
          triggerTimer = true;
          const exMeta = INITIAL_EXERCISES.find((e) => e.id === targetEx.exerciseId);
          exName = exMeta ? exMeta.name : 'Rest';

          // Check if the newly completed set became a PR
          const updatedSet = synced.exercises[exerciseIndex]?.sets[setIndex];
          if (updatedSet?.isPR) {
            isSetPR = true;
          }
        }

        return { ...prev, ...synced };
      });

      if (triggerTimer) {
        if (isSetPR) {
          if (settings.soundEnabled) soundFx.playPRCelebration();
          if (settings.hapticEnabled) soundFx.triggerHaptic([50, 50, 100]);
        } else {
          if (settings.soundEnabled) soundFx.playSetComplete();
          if (settings.hapticEnabled) soundFx.triggerHaptic(35);
        }
        startRestTimer(undefined, exName);
      }
    },
    [activeWorkout, settings.soundEnabled, settings.hapticEnabled, startRestTimer, syncWorkoutMetrics]
  );

  // Finish Workout
  const finishWorkout = useCallback(() => {
    if (!activeWorkout) return;

    const finishedAt = Date.now();
    const finishedSession: WorkoutSession = {
      ...activeWorkout,
      finishedAt,
      // duration is derived from the clock, so it must be resolved before archiving
      durationSeconds: Math.max(0, Math.floor((finishedAt - activeWorkout.startedAt) / 1000)),
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

  const openSummaryModal = useCallback((workout?: WorkoutSession) => {
    if (workout) {
      setLastCompletedWorkout(workout);
    } else if (!lastCompletedWorkout) {
      const fallback = workoutHistory.find((w) => w.status === 'completed') || workoutHistory[0] || null;
      if (fallback) {
        setLastCompletedWorkout(fallback);
      }
    }
    setShowSummaryModal(true);
  }, [lastCompletedWorkout, workoutHistory]);

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
      const customOnly = updated.filter((e) => !INITIAL_EXERCISES.some((ie) => ie.id === e.id));
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(customOnly));
      return updated;
    });
  }, []);

  // Update Settings
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const language = settings.language || 'id';

  const setLanguage = useCallback((lang: Language) => {
    updateSettings({ language: lang });
  }, [updateSettings]);

  const t = useCallback(
    (key: TranslationKey): string => {
      const activeLang = settings.language || 'id';
      const dict = TRANSLATIONS[activeLang] || TRANSLATIONS.en;
      return (dict as Record<string, string>)[key] || TRANSLATIONS.en[key] || key;
    },
    [settings.language]
  );

  // Calculate Muscle Fatigue Map according to ABOT's exact scientific decay model
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

    workoutHistory.forEach((session) => {
      if (session.status !== 'completed') return;
      const sessionTime = session.finishedAt || session.startedAt;
      const hoursAgo = (now - sessionTime) / (1000 * 3600);

      session.exercises.forEach((ex) => {
        const meta = INITIAL_EXERCISES.find((e) => e.id === ex.exerciseId);
        if (!meta) return;

        const completedSets = ex.sets.filter((s) => s.completed).length;
        if (completedSets === 0) return;

        // Big muscles recover in 72 hours, small ones in 48 hours (ABOT architecture)
        meta.primaryMuscles.forEach((m) => {
          if (fatigueMap[m]) {
            const windowHours = BIG_MUSCLES.has(m) ? 72 : 48;
            if (hoursAgo <= windowHours) {
              const decayFactor = Math.max(0, 1 - hoursAgo / windowHours);
              const added = completedSets * 18 * decayFactor;
              fatigueMap[m].fatiguePct = Math.min(100, Math.round(fatigueMap[m].fatiguePct + added));
              fatigueMap[m].lastTrainedAt = Math.max(fatigueMap[m].lastTrainedAt || 0, sessionTime);
              fatigueMap[m].lastSets = (fatigueMap[m].lastSets || 0) + completedSets;
            }
          }
        });

        meta.secondaryMuscles.forEach((m) => {
          if (fatigueMap[m]) {
            const windowHours = BIG_MUSCLES.has(m) ? 72 : 48;
            if (hoursAgo <= windowHours) {
              const decayFactor = Math.max(0, 1 - hoursAgo / windowHours);
              const added = completedSets * 9 * decayFactor;
              fatigueMap[m].fatiguePct = Math.min(100, Math.round(fatigueMap[m].fatiguePct + added));
              fatigueMap[m].lastTrainedAt = Math.max(fatigueMap[m].lastTrainedAt || 0, sessionTime);
            }
          }
        });
      });
    });

    // Assign stages and recovery hours
    (Object.keys(fatigueMap) as MuscleGroup[]).forEach((m) => {
      const f = fatigueMap[m].fatiguePct;
      const windowHours = BIG_MUSCLES.has(m) ? 72 : 48;

      if (f >= 80) {
        fatigueMap[m].stage = 'exhausted';
        fatigueMap[m].readyInHours = Math.round((f / 100) * windowHours);
      } else if (f >= 50) {
        fatigueMap[m].stage = 'high';
        fatigueMap[m].readyInHours = Math.round((f / 100) * (windowHours * 0.75));
      } else if (f >= 20) {
        fatigueMap[m].stage = 'recovering';
        fatigueMap[m].readyInHours = Math.round((f / 100) * (windowHours * 0.5));
      } else {
        fatigueMap[m].stage = 'fresh';
        fatigueMap[m].readyInHours = 0;
      }
    });

    return fatigueMap;
  }, [workoutHistory]);

  // Calculate Streak in Weeks: True consecutive calendar weeks
  const getStreakWeeks = useCallback((): number => {
    if (workoutHistory.length === 0) return 0;

    const getWeekMonday = (timestamp: number): number => {
      const date = new Date(timestamp);
      date.setHours(0, 0, 0, 0);
      const day = date.getDay(); // 0 is Sun, 1 is Mon...
      const diff = (day === 0 ? -6 : 1) - day;
      date.setDate(date.getDate() + diff);
      return date.getTime();
    };

    const trainedWeeks = new Set<number>();
    workoutHistory.forEach((session) => {
      if (session.status === 'completed') {
        const time = session.finishedAt || session.startedAt;
        if (time) trainedWeeks.add(getWeekMonday(time));
      }
    });

    if (trainedWeeks.size === 0) return 0;

    const nowMonday = getWeekMonday(Date.now());
    const ONE_WEEK_MS = 7 * 86400000;

    let checkWeek = nowMonday;
    // Allow active streak if user trained this week OR last week
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
        openSummaryModal,
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
        updateWorkoutTitle,
        updateExerciseNotes,
        startRestTimer,
        adjustRestTimer,
        skipRestTimer,
        createCustomRoutine,
        deleteRoutine,
        addCustomExercise,
        updateSettings,
        language,
        setLanguage,
        t,
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
