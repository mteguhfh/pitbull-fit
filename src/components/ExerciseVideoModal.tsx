import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Exercise } from '../types';
import { ExerciseVideoPlayer } from './ExerciseVideoPlayer';
import { X, Play, Dumbbell, ShieldCheck, Plus } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';

interface ExerciseVideoModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onAddToWorkout?: (exerciseId: string) => void;
}

export const ExerciseVideoModal: React.FC<ExerciseVideoModalProps> = ({
  exercise,
  onClose,
  onAddToWorkout
}) => {
  const { activeWorkout, startWorkout, t } = useWorkout();

  // Lock background scroll when modal is active
  useEffect(() => {
    if (!exercise) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [exercise]);

  if (!exercise) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 animate-in fade-in select-none">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-sheet bg-surface border border-accent/30 p-5 flex flex-col text-text">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-accent/20 border border-accent/40 text-[11px] font-black text-accent uppercase tracking-wider flex items-center gap-1.5">
                <Play size={10} className="fill-current" /> {t('video_guide_label')}
              </span>
              <span className="text-xs text-text-muted capitalize">· {exercise.category}</span>
            </div>
            <h2 className="text-xl font-black text-text tracking-tight">{exercise.name}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-full bg-surface-2 border border-line text-text-muted hover:text-text flex items-center justify-center transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Player */}
        <div className="mb-4">
          <ExerciseVideoPlayer exercise={exercise} />
        </div>

        {/* Action Button */}
        {activeWorkout ? (
          onAddToWorkout ? (
            <button
              type="button"
              onClick={() => {
                onAddToWorkout(exercise.id);
                onClose();
              }}
              className="w-full py-3.5 rounded-xl bg-accent text-on-accent font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition"
            >
              <Plus size={18} />
              {t('add_to_workout_btn')}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-accent text-on-accent font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition"
            >
              <ShieldCheck size={18} />
              {t('resume_workout_btn')}
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={() => {
              startWorkout(undefined, `${exercise.name} Session`);
              onClose();
            }}
            className="w-full py-3.5 rounded-xl bg-accent text-on-accent font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition"
          >
            <Play size={18} className="fill-current" />
            {t('start_workout_with_ex')} {exercise.name}
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};
