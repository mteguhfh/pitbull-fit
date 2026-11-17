import React, { useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle, Clock, Dumbbell, Flame, X } from 'lucide-react';
import { INITIAL_EXERCISES } from '../data/exercises';

export const WorkoutSummaryModal: React.FC = () => {
  const { showSummaryModal, lastCompletedWorkout, closeSummaryModal, settings } = useWorkout();

  useEffect(() => {
    if (showSummaryModal) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ccff00', '#ffffff', '#eab308']
        });
      } catch {}
    }
  }, [showSummaryModal]);

  if (!showSummaryModal || !lastCompletedWorkout) return null;

  const durationMin = Math.round(lastCompletedWorkout.durationSeconds / 60);

  // Collect muscle groups worked
  const musclesWorked = new Set<string>();
  lastCompletedWorkout.exercises.forEach((ex) => {
    const meta = INITIAL_EXERCISES.find((e) => e.id === ex.exerciseId);
    if (meta) {
      meta.primaryMuscles.forEach((m) => musclesWorked.add(m));
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-surface border border-line p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeSummaryModal}
          className="absolute top-4 right-4 size-9 rounded-full bg-surface-2 border border-line text-text-muted hover:text-text flex items-center justify-center transition-colors"
        >
          <X size={18} />
        </button>

        {/* Celebration Trophy Icon */}
        <div className="size-20 rounded-3xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mb-4 shadow-[0_0_32px_rgba(204,255,0,0.3)] animate-pulse">
          <Trophy size={40} />
        </div>

        <h2 className="text-2xl font-black text-text tracking-tight mb-1">Workout Complete!</h2>
        <p className="text-sm text-text-muted mb-6">{lastCompletedWorkout.title}</p>

        {/* Stat Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="p-3.5 rounded-2xl bg-surface-2 border border-line flex flex-col items-center">
            <Clock size={18} className="text-accent mb-1" />
            <span className="text-2xl font-black font-mono text-text">{durationMin}</span>
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Minutes</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-2 border border-line flex flex-col items-center">
            <Dumbbell size={18} className="text-accent mb-1" />
            <span className="text-2xl font-black font-mono text-text">
              {Math.round(lastCompletedWorkout.totalVolume).toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              {settings.weightUnit} Volume
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-2 border border-line flex flex-col items-center">
            <CheckCircle size={18} className="text-accent mb-1" />
            <span className="text-2xl font-black font-mono text-text">{lastCompletedWorkout.totalSets}</span>
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Sets Logged</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-2 border border-line flex flex-col items-center">
            <Flame size={18} className="text-pr mb-1" />
            <span className="text-2xl font-black font-mono text-pr">{lastCompletedWorkout.prCount}</span>
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">PRs Smashed</span>
          </div>
        </div>

        {/* Muscles trained badge list */}
        {musclesWorked.size > 0 && (
          <div className="w-full mb-6">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2 text-left">
              Muscles Stimulated:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Array.from(musclesWorked).map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 rounded-full bg-accent/15 border border-accent/25 text-xs font-bold text-accent capitalize"
                >
                  {m.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={closeSummaryModal}
          className="w-full py-3.5 rounded-xl bg-accent text-on-accent font-black text-base shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:brightness-110 active:scale-[0.99] transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};
