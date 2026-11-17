import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { MuscleAnatomy } from './MuscleAnatomy';
import { Flame, Play, Dumbbell, Clock, ChevronRight, Activity, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { INITIAL_EXERCISES } from '../data/exercises';
import { MuscleGroup } from '../types';

export const HomeView: React.FC = () => {
  const {
    activeWorkout,
    workoutHistory,
    routines,
    settings,
    startWorkout,
    setActiveTab,
    getMuscleFatigueMap,
    getStreakWeeks
  } = useWorkout();

  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);

  const fatigueMap = getMuscleFatigueMap();
  const streak = getStreakWeeks();

  // Find recommended routine
  const todayRoutine = routines[0] || null;

  // Calculate quick totals
  const totalVolumeAllTime = workoutHistory.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
  const totalWorkouts = workoutHistory.filter((w) => w.status === 'completed').length;

  return (
    <div className="pb-32 pt-4 px-4 max-w-[500px] mx-auto space-y-5">
      {/* App Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-accent text-on-accent flex items-center justify-center font-black text-sm shadow-[0_0_16px_rgba(204,255,0,0.4)]">
            PF
          </div>
          <div>
            <h1 className="text-lg font-black text-text tracking-tight leading-none">PITBULL FIT</h1>
            <span className="text-[11px] font-semibold text-text-muted">Strength & Hypertrophy</span>
          </div>
        </div>

        {/* Streak Counter Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 border border-line">
          <Flame size={16} className="text-orange-500 fill-orange-500 animate-pulse" />
          <span className="text-xs font-black text-text font-mono">{streak}</span>
          <span className="text-[10px] font-bold text-text-muted uppercase">wk streak</span>
        </div>
      </div>

      {/* ACTIVE WORKOUT HERO CARD (if workout in progress) */}
      {activeWorkout && activeWorkout.status === 'active' ? (
        <div className="relative overflow-hidden rounded-3xl bg-surface border border-accent/40 p-5 shadow-[0_0_30px_rgba(204,255,0,0.15)] animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-accent/20 border border-accent/30 text-[11px] font-black text-accent uppercase tracking-wider flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-accent animate-ping" />
              Workout in Progress
            </span>
            <span className="text-xs font-mono font-bold text-accent">
              {Math.floor(activeWorkout.durationSeconds / 60)}:
              {(activeWorkout.durationSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <h2 className="text-xl font-black text-text tracking-tight mb-1">{activeWorkout.title}</h2>
          <p className="text-xs text-text-muted mb-4">
            {activeWorkout.exercises.length} movements · {activeWorkout.totalSets} completed sets
          </p>

          <button
            type="button"
            onClick={() => setActiveTab('workout')}
            className="w-full py-3.5 rounded-xl bg-accent text-on-accent font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(204,255,0,0.4)] hover:brightness-110 active:scale-[0.99] transition-all"
          >
            <Play size={16} className="fill-current" />
            Continue Workout
          </button>
        </div>
      ) : todayRoutine ? (
        /* PLANNED ROUTINE CARD */
        <div className="relative overflow-hidden rounded-3xl bg-surface border border-accent/25 p-5 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/25 text-[11px] font-bold text-accent uppercase tracking-wider">
              Today's Session
            </span>
            <span className="text-xs text-text-muted capitalize">{todayRoutine.split} Split</span>
          </div>

          <h2 className="text-2xl font-black text-text tracking-tight mb-1">{todayRoutine.name}</h2>
          <p className="text-xs text-text-muted mb-4 line-clamp-1">{todayRoutine.description}</p>

          {/* Exercise preview pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {todayRoutine.exercises.slice(0, 4).map((item) => {
              const ex = INITIAL_EXERCISES.find((e) => e.id === item.exerciseId);
              return (
                <span
                  key={item.exerciseId}
                  className="px-2.5 py-1 rounded-lg bg-surface-2 border border-line text-[11px] font-semibold text-text/90"
                >
                  {ex ? ex.name : item.exerciseId}
                </span>
              );
            })}
            {todayRoutine.exercises.length > 4 && (
              <span className="px-2 py-1 rounded-lg bg-surface-2 text-[11px] font-semibold text-text-muted">
                +{todayRoutine.exercises.length - 4} more
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => startWorkout(todayRoutine.id)}
            className="w-full py-3.5 rounded-xl bg-accent text-on-accent font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(204,255,0,0.35)] hover:brightness-110 active:scale-[0.99] transition-all"
          >
            <Play size={16} className="fill-current" />
            Start Workout
          </button>
        </div>
      ) : null}

      {/* Muscle Recovery & Fatigue Heatmap Card */}
      <div className="rounded-3xl bg-surface border border-line p-5 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-accent" />
            <h3 className="text-sm font-black text-text tracking-tight uppercase">Muscle Recovery Map</h3>
          </div>
          <span className="text-[11px] font-semibold text-text-muted">Dynamic 72h / 48h</span>
        </div>
        <p className="text-xs text-text-muted mb-4">
          Muscles recover dynamically based on volume, set intensity, and elapsed hours.
        </p>

        {/* Anatomical Heatmap SVG */}
        <div className="rounded-2xl bg-surface-2/40 border border-line p-3 flex justify-center">
          <MuscleAnatomy
            fatigueMap={fatigueMap}
            selectedMuscle={selectedMuscle}
            onSelectMuscle={(m) => setSelectedMuscle((prev) => (prev === m ? null : m))}
            showToggle={true}
            showDetailCard={true}
            width="100%"
          />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-surface border border-line flex flex-col">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Dumbbell size={16} className="text-accent" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Volume Lifted</span>
          </div>
          <span className="text-2xl font-black font-mono text-text">
            {totalVolumeAllTime >= 1000
              ? `${(totalVolumeAllTime / 1000).toFixed(1)}k`
              : totalVolumeAllTime}
          </span>
          <span className="text-[10px] font-semibold text-text-muted">
            {settings.weightUnit} total across all sets
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line flex flex-col">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Calendar size={16} className="text-accent" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Sessions Done</span>
          </div>
          <span className="text-2xl font-black font-mono text-text">{totalWorkouts}</span>
          <span className="text-[10px] font-semibold text-text-muted">completed workouts</span>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="rounded-3xl bg-surface border border-line p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-text tracking-tight uppercase">Recent Workouts</h3>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className="text-xs font-bold text-accent hover:underline flex items-center gap-0.5"
          >
            See All <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-2.5">
          {workoutHistory.slice(0, 3).map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-line"
            >
              <div className="min-w-0">
                <span className="block text-sm font-bold text-text truncate">{session.title}</span>
                <span className="text-[11px] text-text-muted">
                  {new Date(session.startedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}{' '}
                  · {Math.round(session.durationSeconds / 60)} min · {session.totalSets} sets
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-xs font-black font-mono text-text">
                  {Math.round(session.totalVolume).toLocaleString()} {settings.weightUnit}
                </span>
                {session.prCount > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-pr">
                    ★ {session.prCount} PR
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
