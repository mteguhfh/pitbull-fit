import React, { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
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
import { formatNumber, formatWeight } from '../utils/format';
import { useDomTicker } from '../hooks/useDomTicker';

/** Elapsed clock, painted outside React so the set grid never re-renders on a tick. */
const WorkoutTimer: React.FC<{ startedAt: number }> = ({ startedAt }) => {
  const readElapsed = useCallback(() => (Date.now() - startedAt) / 1000, [startedAt]);
  const ref = useDomTicker(readElapsed);
  return <span ref={ref} className="tabular-nums">00:00</span>;
};

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
    updateWorkoutTitle,
    updateExerciseNotes,
    updateSettings,
    routines,
    settings,
    exercises,
    language,
    t
  } = useWorkout();

  // Add exercise modal state
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Exercise detail modal state
  const [selectedExDetail, setSelectedExDetail] = useState<Exercise | null>(null);
  const [detailRoutine, setDetailRoutine] = useState<string | null>(null);

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
            className="size-12 rounded-2xl bg-accent text-on-accent flex items-center justify-center hover:brightness-110 active:scale-95 transition"
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
                className="p-5 rounded-card bg-surface border border-line hover:border-line-strong transition shadow-card"
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
                    className="px-3.5 py-1.5 rounded-ctl bg-accent text-on-accent text-xs font-black flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition"
                  >
                    <Play size={12} className="fill-current" />
                    {t('start_workout')}
                  </button>
                </div>
                <p className="text-xs text-text-muted mb-3">{routine.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {routine.exercises.map((item) => (
                    <span
                      key={item.exerciseId}
                      className="px-2 py-0.5 rounded-md bg-surface-2 text-[10px] font-semibold text-text-muted border border-line"
                    >
                      {INITIAL_EXERCISES.find((e) => e.id === item.exerciseId)?.name || item.exerciseId}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROUTINE DETAIL SHEET */}
        {detailRoutine &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/85 animate-in fade-in"
              onClick={() => setDetailRoutine(null)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg max-h-[80vh] bg-surface rounded-t-sheet sm:rounded-sheet border border-line-strong p-5 flex flex-col shadow-card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-black text-text">{detailRoutine}</h2>
                    <span className="text-xs text-text-muted capitalize">
                      {(routines.find((r) => r.name === detailRoutine)?.split || 'custom').replace('_', ' ')} ·{' '}
                      {routines.find((r) => r.name === detailRoutine)?.exercises.length ?? 0} {t('nav_exercises')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailRoutine(null)}
                    className="size-8 rounded-full bg-surface-2 border border-line text-text-muted hover:text-text flex items-center justify-center"
                    aria-label={t('close_video_modal')}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5">
                  {(routines.find((r) => r.name === detailRoutine)?.exercises || []).map((item, i) => (
                    <div
                      key={`${item.exerciseId}-${i}`}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-ctl bg-surface-2/60 border border-line"
                    >
                      <span className="text-sm font-bold text-text truncate">
                        {exercises.find((e) => e.id === item.exerciseId)?.name || item.exerciseId}
                      </span>
                      <span className="text-xs font-mono text-text-muted shrink-0">
                        {item.defaultSets} × {item.targetReps}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    startWorkout(routines.find((r) => r.name === detailRoutine)?.id, detailRoutine);
                    setDetailRoutine(null);
                  }}
                  className="mt-4 w-full py-3 rounded-ctl bg-accent text-on-accent font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition"
                >
                  <Play size={14} className="fill-current" />
                  {t('start_workout')}
                </button>
              </div>
            </div>,
            document.body
          )}
      </div>
    );
  }

  /* =========================================================================
   * VIEW B: ACTIVE WORKOUT STATE
   * ========================================================================= */
  const startedAt = activeWorkout.startedAt;

  return (
    <div className="pb-36 pt-4 px-4 max-w-[500px] mx-auto space-y-4">
      {/* Active Workout Header Bar */}
      <div className="p-4 rounded-3xl bg-surface border border-accent/25 shadow-xl flex items-center justify-between sticky top-2 z-20">
        <div className="min-w-0">
          <span className="block text-[11px] font-bold text-accent uppercase tracking-wider">
            {t('nav_active_workout')}
          </span>
          <h1 className="text-base font-black text-text truncate">{activeWorkout.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Timer Display */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-2 border border-line text-accent font-mono text-xs font-black">
            <Clock size={14} />
            <WorkoutTimer startedAt={startedAt} />
          </div>

          {/* Finish Button */}
          <button
            type="button"
            onClick={finishWorkout}
            className="px-3.5 py-1.5 rounded-ctl bg-accent text-on-accent text-xs font-black hover:brightness-110 active:scale-95 transition"
          >
            {t('finish_workout')}
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 gap-2 px-1 text-xs">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface border border-line">
          <Dumbbell size={16} className="text-accent" />
          <span className="text-text-muted">Volume:</span>
          <span className="font-mono font-bold text-text ml-auto tabular-nums">
            {formatNumber(activeWorkout.totalVolume, language)} {settings.weightUnit}
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
              <div className="grid grid-cols-[32px_1fr_60px_50px_40px] gap-1.5 px-1 text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">
                <span>Set</span>
                <span className="text-left">{t('prev_col')}</span>
                <span>{settings.weightUnit}</span>
                <span>{t('reps_col')}</span>
                <span></span>
              </div>

              {/* Set Rows */}
              <div className="space-y-1.5">
                {exItem.sets.map((set, sIdx) => {
                  return (
                    <div
                      key={set.id}
                      className={`grid grid-cols-[32px_1fr_60px_50px_40px] items-center gap-1.5 p-1 rounded-ctl border transition-colors duration-200 ${
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
                        className={`size-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-colors ${
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
                            {formatWeight(set.previousWeight, language)} × {set.previousReps}
                          </span>
                        ) : (
                          <span className="text-[11px] text-text-muted/60">—</span>
                        )}
                      </div>

                      {/* Weight Stepper / Input */}
                      <div className="relative flex items-center justify-center">
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.5"
                          min="0"
                          value={set.weight === 0 ? '0' : (set.weight || '')}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateSet(exIdx, sIdx, { weight: val === '' ? 0 : parseFloat(val) || 0 });
                          }}
                          className="h-9 w-full rounded-ctl bg-bg border border-line text-center text-sm font-bold font-mono text-text tabular-nums focus:outline-none focus:border-accent"
                          placeholder="0"
                        />
                      </div>

                      {/* Reps Stepper / Input */}
                      <div className="relative flex items-center justify-center">
                        <input
                          type="number"
                          inputMode="numeric"
                          step="1"
                          min="0"
                          value={set.reps === 0 ? '0' : (set.reps || '')}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateSet(exIdx, sIdx, { reps: val === '' ? 0 : parseInt(val, 10) || 0 });
                          }}
                          className="h-9 w-full rounded-ctl bg-bg border border-line text-center text-sm font-bold font-mono text-text tabular-nums focus:outline-none focus:border-accent"
                          placeholder="0"
                        />
                      </div>

                      {/* Checkmark Complete Button */}
                      <button
                        type="button"
                        onClick={() => toggleSetCompleted(exIdx, sIdx)}
                        className={`size-8 rounded-ctl flex items-center justify-center transition-colors duration-200 active:scale-90 ${
                          set.completed
                            ? 'bg-accent text-on-accent'
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
                  <Plus size={14} /> {t('add_set')}
                </button>

                {exItem.sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSet(exIdx, exItem.sets.length - 1)}
                    className="text-xs text-text-muted hover:text-red-400 transition-colors"
                  >
                    {t('delete_set')}
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
        className="w-full py-4 rounded-2xl border-2 border-dashed border-line hover:border-accent/40 bg-surface/40 hover:bg-surface text-text-muted hover:text-accent font-bold text-sm flex items-center justify-center gap-2 transition active:scale-[0.99]"
      >
        <PlusCircle size={20} />
        Add Exercise
      </button>

      {/* Cancel Workout Action */}
      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t('discard_confirm'))) {
              cancelWorkout();
            }
          }}
          className="text-xs font-semibold text-text-muted hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          {t('discard_workout')}
        </button>
      </div>

      {/* ADD EXERCISE DRAWER / MODAL */}
      {showAddExModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 animate-in fade-in">
          <div className="w-full max-w-lg max-h-[85vh] bg-surface rounded-t-sheet sm:rounded-sheet border border-line p-5 flex flex-col shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-text">{t('add_exercise')}</h2>
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
