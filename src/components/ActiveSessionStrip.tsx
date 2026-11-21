import React, { useCallback } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { useDomTicker } from '../hooks/useDomTicker';
import { INITIAL_EXERCISES } from '../data/exercises';
import { ChevronRight, Timer } from 'lucide-react';

/** Elapsed clock for the strip: painted outside React, ticks once a second. */
const SessionClock: React.FC<{ startedAt: number }> = ({ startedAt }) => {
  const readElapsed = useCallback(() => (Date.now() - startedAt) / 1000, [startedAt]);
  const ref = useDomTicker(readElapsed);
  return <span ref={ref} className="tabular-nums">00:00</span>;
};

/**
 * One line of training context that follows you across tabs,
 * the way a "Set 1 of 4" strip does. Renders nothing outside a session.
 */
export const ActiveSessionStrip: React.FC = () => {
  const { activeWorkout, setActiveTab, language, t } = useWorkout();

  if (!activeWorkout || activeWorkout.status !== 'active') return null;

  const exerciseIndex = activeWorkout.exercises.findIndex((ex) =>
    ex.sets.some((s) => !s.completed)
  );
  const exercise =
    exerciseIndex >= 0 ? activeWorkout.exercises[exerciseIndex] : activeWorkout.exercises[0];

  const exerciseName = exercise
    ? INITIAL_EXERCISES.find((e) => e.id === exercise.exerciseId)?.name ||
      exercise.exerciseId.replace(/-/g, ' ')
    : '';

  const nextSetNumber = exercise
    ? Math.min(exercise.sets.filter((s) => s.completed).length + 1, exercise.sets.length)
    : 0;
  const totalSets = exercise ? exercise.sets.length : 0;
  const reps = exercise ? Math.max(...exercise.sets.map((s) => s.reps), 0) : 0;

  return (
    <button
      type="button"
      onClick={() => setActiveTab('workout')}
      className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-clearance)+4px)] z-40 mx-auto max-w-[480px] px-3"
    >
      <div className="flex items-center gap-2.5 rounded-card border border-accent/40 bg-surface px-3 py-2 shadow-card text-left transition active:scale-[0.99]">
        <span className="size-8 rounded-ctl bg-accent/15 border border-accent/35 flex items-center justify-center shrink-0">
          <Timer size={15} className="text-accent" />
        </span>

        <div className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-accent">
            {exercise && totalSets > 0
              ? language === 'id'
                ? `Set ${nextSetNumber} dari ${totalSets}`
                : `Set ${nextSetNumber} of ${totalSets}`
              : t('workout_in_progress')}
            {reps > 0 && ` · ${reps} ${t('reps_col')}`}
          </span>
          <span className="block text-xs font-black text-text truncate">{exerciseName}</span>
        </div>

        <span className="text-xs font-mono font-bold text-text-muted shrink-0">
          <SessionClock startedAt={activeWorkout.startedAt} />
        </span>
        <ChevronRight size={14} className="text-text-muted shrink-0" />
      </div>
    </button>
  );
};
