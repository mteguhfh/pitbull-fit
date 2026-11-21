import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Exercise } from '../types';
import { MuscleAnatomy } from './MuscleAnatomy';
import { ExerciseVideoPlayer } from './ExerciseVideoPlayer';
import { X, Trophy, Dumbbell, ShieldAlert, Plus, Video, Eye, Play } from 'lucide-react';
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
  const { getBest1RM, settings, activeWorkout, startWorkout } = useWorkout();
  const [activeTab, setActiveTab] = useState<'video' | 'anatomy'>('video');

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

  const best1RM = getBest1RM(exercise.id);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 animate-in fade-in select-none">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sheet bg-surface border border-accent/25 p-5 sm:p-6 flex flex-col text-text">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/30 text-xs font-bold text-accent capitalize">
                {exercise.category}
              </span>
              <span className="text-xs text-text-muted capitalize">· {exercise.equipment}</span>
              {exercise.tempo && (
                <span className="text-[10px] font-mono text-accent/90 px-1.5 py-0.5 rounded bg-surface-2 border border-line">
                  {exercise.tempo}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-text tracking-tight">{exercise.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-full bg-surface-2 border border-line text-text-muted hover:text-text flex items-center justify-center transition-colors shrink-0 hover:bg-surface-3"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector: Video Demonstration vs Anatomical Model */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-2 rounded-2xl border border-line mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'video'
                ? 'bg-accent text-on-accent'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Video size={14} />
            <span>Form Video & Motion</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('anatomy')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'anatomy'
                ? 'bg-accent text-on-accent'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Eye size={14} />
            <span>Anatomy Heatmap</span>
          </button>
        </div>

        {/* Tab 1: Video Player & Biomechanical Motion Visualizer */}
        {activeTab === 'video' && (
          <div className="mb-5 animate-in fade-in">
            <ExerciseVideoPlayer exercise={exercise} />
          </div>
        )}

        {/* Tab 2: Anatomical Body Preview */}
        {activeTab === 'anatomy' && (
          <div className="rounded-2xl bg-surface-2 border border-line p-4 mb-5 flex flex-col items-center animate-in fade-in">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Targeted Muscles</span>
            <MuscleAnatomy
              primaryMuscles={exercise.primaryMuscles}
              secondaryMuscles={exercise.secondaryMuscles}
              width="280px"
              showToggle={true}
            />
          </div>
        )}

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

        {/* Execution Instructions */}
        <div className="mb-6">
          <span className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
            Step-by-Step Technique
          </span>
          <ol className="space-y-2">
            {exercise.instructions.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-text/90 leading-relaxed">
                <span className="size-5 rounded-md bg-surface-2 border border-accent/30 flex items-center justify-center text-[10px] font-bold text-accent shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Action Button */}
        {activeWorkout ? (
          <button
            type="button"
            onClick={() => {
              if (onAddToWorkout) onAddToWorkout(exercise.id);
              onClose();
            }}
            className="w-full py-3.5 rounded-xl bg-accent text-on-accent font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition"
          >
            <Plus size={18} />
            Add to Active Workout
          </button>
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
            Start Workout with {exercise.name}
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};
