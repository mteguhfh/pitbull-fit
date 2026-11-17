import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import {
  Play,
  Plus,
  Trash2,
  Check,
  Trophy,
  Clock,
  Dumbbell,
  ChevronDown,
  Info,
  Flame,
  Search,
  X,
  PlusCircle
} from 'lucide-react';
import { INITIAL_EXERCISES } from '../data/exercises';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { Exercise } from '../types';

export const WorkoutView: React.FC = () => {
  const {
    activeWorkout,
    startWorkout,
    finishWorkout,
    cancelWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    addSet,
    removeSet,
    updateSet,
    toggleSetCompleted,
    routines,
    settings,
    exercises
  } = useWorkout();

  // Add exercise modal state
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Exercise detail modal state
  const [selectedExDetail, setSelectedExDetail] = useState<Exercise | null>(null);

  // Filter exercises for the picker
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.category.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.primaryMuscles.some((m) => m.toLowerCase().includes(exerciseSearch.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // If NO active workout: show routines and quick start
  if (!activeWorkout) {
    return (
      <div className="pb-28 pt-4 px-4 max-w-[500px] mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-text tracking-tight uppercase">Workout Planner</h1>
        </div>

        {/* Quick Start Card */}
        <div className="p-5 rounded-3xl bg-surface border border-accent/25 shadow-xl flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-text tracking-tight">Quick Start</h2>
            <p className="text-xs text-text-muted">Start an empty session and add exercises as you go.</p>
          </div>
          <button
            type="button"
            onClick={() => startWorkout(undefined, 'Quick Workout')}
            className="size-12 rounded-2xl bg-accent text-on-accent flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.35)] hover:brightness-110 active:scale-95 transition-all"
            title="Start Empty Workout"
          >
            <Play size={20} className="fill-current ml-0.5" />
          </button>
        </div>

        {/* Preset Routines */}
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
            Routines & Splits
          </span>
          <div className="space-y-3">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="p-5 rounded-3xl bg-surface border border-line hover:border-line-strong transition-all shadow-lg"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                      {routine.split} split
                    </span>
                    <h3 className="text-base font-black text-text">{routine.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => startWorkout(routine.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-accent text-on-accent text-xs font-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(204,255,0,0.25)] hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Play size={12} className="fill-current" />
                    Start
                  </button>
                </div>
                <p className="text-xs text-text-muted mb-3">{routine.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {routine.exercises.map((item) => {
                    const ex = INITIAL_EXERCISES.find((e) => e.id === item.exerciseId);
                    return (
                      <span
                        key={item.exerciseId}
                        className="px-2 py-0.5 rounded-md bg-surface-2 text-[10px] font-semibold text-text-muted border border-line"
                      >
                        {ex ? ex.name : item.exerciseId}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE WORKOUT VIEW
  const durationMin = Math.floor(activeWorkout.durationSeconds / 60);
  const durationSec = activeWorkout.durationSeconds % 60;
  const timeFormatted = `${durationMin.toString().padStart(2, '0')}:${durationSec.toString().padStart(2, '0')}`;

  return (
    <div className="pb-36 pt-4 px-4 max-w-[500px] mx-auto space-y-4">
      {/* Active Workout Header Bar */}
      <div className="p-4 rounded-3xl bg-surface border border-accent/25 shadow-xl flex items-center justify-between sticky top-2 z-20 backdrop-blur-xl">
        <div className="min-w-0">
          <span className="block text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
            <span className="size-2 rounded-full bg-accent animate-ping" /> Live Workout
          </span>
          <h1 className="text-base font-black text-text truncate">{activeWorkout.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Timer Display */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-2 border border-line text-accent font-mono text-xs font-black">
            <Clock size={14} />
            {timeFormatted}
          </div>

          {/* Finish Button */}
          <button
            type="button"
            onClick={finishWorkout}
            className="px-3.5 py-1.5 rounded-xl bg-accent text-on-accent text-xs font-black shadow-[0_0_16px_rgba(204,255,0,0.35)] hover:brightness-110 active:scale-95 transition-all"
          >
            Finish
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 gap-2 px-1 text-xs">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface border border-line">
          <Dumbbell size={16} className="text-accent" />
          <span className="text-text-muted">Volume:</span>
          <span className="font-mono font-bold text-text ml-auto">
            {Math.round(activeWorkout.totalVolume)} {settings.weightUnit}
          </span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface border border-line">
          <Check size={16} className="text-accent" />
          <span className="text-text-muted">Sets:</span>
          <span className="font-mono font-bold text-text ml-auto">{activeWorkout.totalSets} completed</span>
        </div>
      </div>

      {/* Exercises In Active Workout */}
      <div className="space-y-4">
        {activeWorkout.exercises.map((exItem, exIdx) => {
          const exMeta = exercises.find((e) => e.id === exItem.exerciseId);

          return (
            <div
              key={exItem.id}
              className="p-4 rounded-3xl bg-surface border border-line shadow-lg overflow-hidden space-y-3"
            >
              {/* Exercise Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-10 rounded-xl bg-surface-2 border border-line flex items-center justify-center text-accent shrink-0">
                    <Dumbbell size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-text truncate">{exMeta ? exMeta.name : exItem.exerciseId}</h3>
                    <span className="text-[11px] text-text-muted capitalize">
                      {exMeta ? `${exMeta.primaryMuscles.join(', ')} · ${exMeta.equipment}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {exMeta && (
                    <button
                      type="button"
                      onClick={() => setSelectedExDetail(exMeta)}
                      className="size-8 rounded-lg bg-surface-2 text-text-muted hover:text-text flex items-center justify-center transition-colors"
                      title="View Muscle Anatomy & Form"
                    >
                      <Info size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExerciseFromWorkout(exIdx)}
                    className="size-8 rounded-lg bg-surface-2 text-text-muted hover:text-red-400 flex items-center justify-center transition-colors"
                    title="Remove Exercise"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Sets Table Header */}
              <div className="grid grid-cols-[36px_1fr_64px_52px_42px] gap-1.5 px-1 text-[11px] font-semibold text-text-muted text-center">
                <span>Set</span>
                <span className="text-left">Last time</span>
                <span>{settings.weightUnit}</span>
                <span>Reps</span>
                <span></span>
              </div>

              {/* Set Rows */}
              <div className="space-y-1.5">
                {exItem.sets.map((set, sIdx) => {
                  return (
                    <div
                      key={set.id}
                      className={`grid grid-cols-[36px_1fr_64px_52px_42px] items-center gap-1.5 p-1 rounded-xl border transition-all duration-200 ${
                        set.completed
                          ? 'border-accent/30 bg-accent/[0.08]'
                          : 'border-line/70 bg-surface-2/40'
                      }`}
                    >
                      {/* Set Number */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextType =
                            set.type === 'normal'
                              ? 'warmup'
                              : set.type === 'warmup'
                              ? 'drop'
                              : 'normal';
                          updateSet(exIdx, sIdx, { type: nextType });
                        }}
                        className={`size-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
                          set.type === 'warmup'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : set.type === 'drop'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : set.completed
                            ? 'bg-accent/20 text-accent'
                            : 'bg-surface-2 text-text-muted'
                        }`}
                        title="Click to toggle set type (Normal, Warmup, Drop)"
                      >
                        {set.type === 'warmup' ? 'W' : set.type === 'drop' ? 'D' : set.setNumber}
                      </button>

                      {/* Last time / PR badge */}
                      <div className="text-left min-w-0 pr-1">
                        {set.isPR ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-pr">
                            <Trophy size={11} /> PR
                          </span>
                        ) : set.previousWeight && set.previousReps ? (
                          <span className="text-[11px] font-mono text-text-muted truncate block">
                            {set.previousWeight} × {set.previousReps}
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-600">—</span>
                        )}
                      </div>

                      {/* Weight Stepper / Input */}
                      <div className="relative flex items-center justify-center">
                        <input
                          type="number"
                          step="0.5"
                          value={set.weight || ''}
                          onChange={(e) =>
                            updateSet(exIdx, sIdx, { weight: parseFloat(e.target.value) || 0 })
                          }
                          className="h-10 w-full rounded-lg bg-bg border border-line text-center text-sm font-bold font-mono text-text focus:outline-none focus:border-accent"
                        />
                      </div>

                      {/* Reps Stepper / Input */}
                      <div className="relative flex items-center justify-center">
                        <input
                          type="number"
                          step="1"
                          value={set.reps || ''}
                          onChange={(e) =>
                            updateSet(exIdx, sIdx, { reps: parseInt(e.target.value, 10) || 0 })
                          }
                          className="h-10 w-full rounded-lg bg-bg border border-line text-center text-sm font-bold font-mono text-text focus:outline-none focus:border-accent"
                        />
                      </div>

                      {/* Checkmark Complete Button */}
                      <button
                        type="button"
                        onClick={() => toggleSetCompleted(exIdx, sIdx)}
                        className={`size-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                          set.completed
                            ? 'bg-accent text-on-accent shadow-[0_0_12px_rgba(204,255,0,0.45)]'
                            : 'bg-surface-2 text-text-muted hover:text-text border border-line'
                        }`}
                        title="Mark set complete"
                      >
                        <Check size={18} className={set.completed ? 'stroke-[3]' : 'stroke-[2]'} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Set Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => addSet(exIdx)}
                  className="px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold text-text-muted hover:text-text flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={14} /> Add Set
                </button>

                {exItem.sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSet(exIdx, exItem.sets.length - 1)}
                    className="text-xs text-text-muted hover:text-red-400 transition-colors"
                  >
                    Delete Set
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Exercise Trigger Button */}
      <button
        type="button"
        onClick={() => setShowAddExModal(true)}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-line hover:border-accent/40 bg-surface/40 hover:bg-surface text-text-muted hover:text-accent font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
      >
        <PlusCircle size={20} />
        Add Exercise
      </button>

      {/* Cancel Workout Action */}
      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Are you sure you want to discard this workout?')) {
              cancelWorkout();
            }
          }}
          className="text-xs font-semibold text-text-muted hover:text-red-400 transition-colors"
        >
          Discard Workout
        </button>
      </div>

      {/* ADD EXERCISE DRAWER / MODAL */}
      {showAddExModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg max-h-[85vh] bg-surface rounded-t-3xl sm:rounded-3xl border border-line p-5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-text">Add Exercise</h2>
              <button
                type="button"
                onClick={() => setShowAddExModal(false)}
                className="size-8 rounded-full bg-surface-2 border border-line text-text-muted hover:text-text flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search exercises by name or muscle..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-2 border border-line text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
              {['all', 'chest', 'back', 'shoulders', 'arms', 'legs', 'core'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-accent text-on-accent'
                      : 'bg-surface-2 text-text-muted hover:text-text border border-line'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => {
                    addExerciseToWorkout(ex.id);
                    setShowAddExModal(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-line cursor-pointer transition-colors active:scale-[0.99]"
                >
                  <div>
                    <span className="block text-sm font-bold text-text">{ex.name}</span>
                    <span className="text-xs text-text-muted capitalize">
                      {ex.primaryMuscles.join(', ')} · {ex.equipment}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="size-8 rounded-xl bg-accent text-on-accent flex items-center justify-center shadow-[0_0_8px_rgba(204,255,0,0.3)]"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        exercise={selectedExDetail}
        onClose={() => setSelectedExDetail(null)}
      />
    </div>
  );
};
