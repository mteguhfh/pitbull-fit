import React from 'react';
import { Exercise } from '../types';
import { MuscleAnatomy } from './MuscleAnatomy';
import { X, Trophy, Dumbbell, ShieldAlert, Plus } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onAddToWorkout?: (exerciseId: string) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
  onAddToWorkout
}) => {
  const { getBest1RM, settings, activeWorkout } = useWorkout();

  if (!exercise) return null;

  const best1RM = getBest1RM(exercise.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-surface border border-line p-6 shadow-2xl flex flex-col text-text">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-black text-text tracking-tight">{exercise.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/25 text-xs font-bold text-accent capitalize">
                {exercise.category}
              </span>
              <span className="text-xs text-text-muted capitalize">· {exercise.equipment}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-full bg-surface-2 border border-line text-text-muted hover:text-text flex items-center justify-center transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Anatomical Body Preview */}
        <div className="rounded-2xl bg-surface-2 border border-line p-4 mb-5 flex flex-col items-center">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Targeted Muscles</span>
          <MuscleAnatomy
            primaryMuscles={exercise.primaryMuscles}
            secondaryMuscles={exercise.secondaryMuscles}
            width="280px"
            showToggle={true}
          />
        </div>

        {/* PR Highlight */}
        {best1RM > 0 && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 mb-5">
            <div className="flex items-center gap-2.5">
              <Trophy size={20} className="text-pr" />
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-pr">Estimated 1RM PR</span>
                <span className="text-xl font-black font-mono text-text">
                  {best1RM} {settings.weightUnit}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6">
          <span className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
            Execution Technique
          </span>
          <ol className="space-y-2">
            {exercise.instructions.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-text/90 leading-relaxed">
                <span className="size-5 rounded-md bg-surface-2 border border-line flex items-center justify-center text-[10px] font-bold text-accent shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Action Button */}
        {activeWorkout && onAddToWorkout && (
          <button
            type="button"
            onClick={() => {
              onAddToWorkout(exercise.id);
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-accent text-on-accent font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:brightness-110 active:scale-[0.99] transition-all"
          >
            <Plus size={18} />
            Add to Active Workout
          </button>
        )}
      </div>
    </div>
  );
};
