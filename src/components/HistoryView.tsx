import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { Flame, Trophy, Calendar, Clock, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import { INITIAL_EXERCISES } from '../data/exercises';

export const HistoryView: React.FC = () => {
  const { workoutHistory, getStreakWeeks, settings } = useWorkout();
  const streak = getStreakWeeks();

  // Expanded session ids
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const totalPRs = workoutHistory.reduce((sum, w) => sum + w.prCount, 0);
  const totalVolume = workoutHistory.reduce((sum, w) => sum + w.totalVolume, 0);

  return (
    <div className="pb-28 pt-4 px-4 max-w-[500px] mx-auto space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-text tracking-tight uppercase">Training History</h1>
        <span className="text-xs text-text-muted">Past workouts & progression</span>
      </div>

      {/* Streak & Consistency Card */}
      <div className="p-5 rounded-3xl bg-surface border border-line shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <Flame size={22} className="fill-orange-500" />
            </div>
            <div>
              <span className="block text-xl font-black font-mono text-text leading-tight">{streak} Weeks</span>
              <span className="text-xs text-text-muted">Active Training Streak</span>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-xl font-black font-mono text-pr leading-tight">{totalPRs}</span>
            <span className="text-xs text-text-muted">Total PRs</span>
          </div>
        </div>

        {/* 5-Week Consistency Dots */}
        <div className="flex items-center justify-between gap-1 pt-2 border-t border-line">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`h-2 w-full rounded-full transition-all ${
                  idx < Math.min(5, streak)
                    ? 'bg-accent shadow-[0_0_8px_#ccff00]'
                    : 'bg-zinc-800'
                }`}
              />
              <span className="text-[10px] text-text-muted font-mono">W{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* History Log Feed */}
      <div className="space-y-3">
        <span className="block text-xs font-bold uppercase tracking-wider text-text-muted">
          Past Sessions ({workoutHistory.length})
        </span>

        {workoutHistory.map((session) => {
          const isExpanded = expandedId === session.id;
          const dateStr = new Date(session.startedAt).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });

          return (
            <div
              key={session.id}
              className="rounded-3xl bg-surface border border-line shadow-md overflow-hidden transition-all"
            >
              <div
                onClick={() => toggleExpand(session.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-2/60 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-semibold text-text-muted">{dateStr}</span>
                    {session.prCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-[10px] font-bold text-pr">
                        <Trophy size={10} /> {session.prCount} PR
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-text truncate">{session.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-1 font-mono">
                    <span>{Math.round(session.durationSeconds / 60)}m</span>
                    <span>·</span>
                    <span>{session.totalSets} sets</span>
                    <span>·</span>
                    <span className="text-accent font-bold">
                      {Math.round(session.totalVolume).toLocaleString()} {settings.weightUnit}
                    </span>
                  </div>
                </div>

                <div className="text-text-muted ml-3 shrink-0">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Expandable Exercise Sets Details */}
              {isExpanded && (
                <div className="p-4 pt-1 bg-surface-2/40 border-t border-line space-y-3">
                  {session.exercises.map((ex, exIdx) => {
                    const exMeta = INITIAL_EXERCISES.find((e) => e.id === ex.exerciseId);

                    return (
                      <div key={ex.id || exIdx} className="space-y-1">
                        <span className="text-xs font-bold text-text">
                          {exMeta ? exMeta.name : ex.exerciseId}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {ex.sets.map((s, sIdx) => (
                            <span
                              key={s.id || sIdx}
                              className={`px-2 py-1 rounded-lg text-[11px] font-mono border ${
                                s.isPR
                                  ? 'bg-amber-500/15 border-amber-500/30 text-pr font-bold'
                                  : 'bg-surface border-line text-text-muted'
                              }`}
                            >
                              {s.weight} × {s.reps}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {workoutHistory.length === 0 && (
          <div className="p-8 text-center rounded-3xl bg-surface border border-line text-text-muted text-xs">
            No completed workouts yet. Log your first set to start tracking!
          </div>
        )}
      </div>
    </div>
  );
};
