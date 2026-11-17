export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'upper-back'
  | 'lats'
  | 'traps'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'lower_back'
  | 'adductors'
  | 'neck'
  | 'full_body'
  | 'cardio';

export type EquipmentType =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'plates'
  | 'other';

export interface Exercise {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio';
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  instructions: string[];
  defaultRestSeconds: number;
}

export type SetType = 'normal' | 'warmup' | 'drop' | 'failure';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: SetType;
  weight: number; // in current user unit or kg
  reps: number;
  rpe?: number; // 6 to 10
  previousWeight?: number;
  previousReps?: number;
  completed: boolean;
  isPR?: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  routineId?: string;
  startedAt: number;
  finishedAt?: number;
  durationSeconds: number;
  exercises: WorkoutExercise[];
  totalVolume: number; // sum of (weight * reps) for completed sets
  totalSets: number;
  prCount: number;
  status: 'active' | 'completed' | 'discarded';
}

export interface RoutineItem {
  exerciseId: string;
  defaultSets: number;
  targetReps: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  split: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full_body' | 'custom';
  exercises: RoutineItem[];
}

export interface UserSettings {
  weightUnit: 'kg' | 'lbs';
  defaultRestSeconds: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  hasSeenOnboarding: boolean;
  theme: 'dark' | 'oled';
}

export type MuscleFatigueStage = 'fresh' | 'recovering' | 'high' | 'exhausted';

export interface MuscleFatigueInfo {
  fatiguePct: number; // 0 to 100
  stage: MuscleFatigueStage;
  readyInHours: number;
  lastTrainedAt?: number;
}
