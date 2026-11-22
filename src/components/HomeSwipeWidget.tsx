import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Card } from './Card';
import { useWorkout } from '../context/WorkoutContext';
import { formatDuration, formatNumber } from '../utils/format';
import { useDomTicker } from '../hooks/useDomTicker';
import { INITIAL_EXERCISES } from '../data/exercises';
import {
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Play,
  SlidersHorizontal,
  Trophy
} from 'lucide-react';

/** Elapsed clock painted outside React so the deck never re-renders on a tick. */
const ActiveWorkoutClock: React.FC<{ startedAt: number }> = ({ startedAt }) => {
  const readElapsed = useCallback(() => (Date.now() - startedAt) / 1000, [startedAt]);
  const ref = useDomTicker(readElapsed);
  return <span ref={ref} className="tabular-nums">00:00</span>;
};

const SLIDES = ['session', 'week', 'nutrition'] as const;

/** One curve for the whole deck: the wrapper height, the card and the ghost all share it. */
const DECK_MS = 260;
const DECK_EASE = 'cubic-bezier(0.2, 0.9, 0.3, 1)';

/**
 * Home deck: one place for the three things that matter when you open the app.
 *
 * 1. Session — what you're training now, or what's next, or rest day.
 * 2. Week    — planned / volume / sets / time / records.
 * 3. Body    — BMI, targets, and the recovery entry point.
 *
 * Swipes are driven by direct transform writes, so dragging never runs React.
 */
export const HomeSwipeWidget: React.FC<{
  onOpenRecovery: () => void;
  onOpenHistory: () => void;
}> = ({ onOpenRecovery, onOpenHistory }) => {
  const {
    activeWorkout,
    workoutHistory,
    routines,
    settings,
    startWorkout,
    openSummaryModal,
    setActiveTab,
    getMuscleFatigueMap,
    getStreakWeeks,
    language,
    t
  } = useWorkout();

  const [frontIndex, setFrontIndex] = useState(0);
  const [showExercises, setShowExercises] = useState(false);
  /* Swap guard lives in a ref: the animation must not depend on a re-render. */
  const isBusyRef = useRef(false);
  const swapSeqRef = useRef(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const isPointerDownRef = useRef<boolean>(false);
  const isPointerCapturedRef = useRef<boolean>(false);
  const isHorizontalGestureRef = useRef<boolean | null>(null);
  const dragOccurredRef = useRef<boolean>(false);
  const pendingDeltaXRef = useRef<number>(0);

  const fatigueMap = getMuscleFatigueMap();
  const streak = getStreakWeeks();
  const todayRoutine = routines[0] || null;
  const nextRoutine = routines.length > 1 ? routines[1] : routines[0];

  const oneWeekAgo = useMemo(() => Date.now() - 7 * 24 * 60 * 60 * 1000, []);
  const thisWeekWorkouts = useMemo(
    () =>
      workoutHistory.filter((w) => w.status === 'completed' && w.startedAt >= oneWeekAgo),
    [workoutHistory, oneWeekAgo]
  );
  const weekVolume = thisWeekWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
  const weekSets = thisWeekWorkouts.reduce((sum, w) => sum + (w.totalSets || 0), 0);
  const weekTimeSeconds = thisWeekWorkouts.reduce((sum, w) => sum + (w.durationSeconds || 0), 0);
  const weekPRs = thisWeekWorkouts.reduce((sum, w) => sum + (w.prCount || 0), 0);

  const allMuscleKeys = Object.keys(fatigueMap) as (keyof typeof fatigueMap)[];
  const readyMusclesCount = allMuscleKeys.filter((k) => fatigueMap[k].fatiguePct < 30).length;
  const totalMusclesTracked = allMuscleKeys.length;

  const profile = settings.profile;

  function exerciseName(id: string) {
    const fromCatalog = INITIAL_EXERCISES.find((e) => e.id === id);
    return fromCatalog ? fromCatalog.name : id.replace(/-/g, ' ');
  }
  const totalCards = SLIDES.length;
  const plannedTarget = 4;
  const peekIndex = (frontIndex + 1) % totalCards;

  /* ------------------------------------------------------------------ *
   * Swipe physics: transform writes only, no state per pointer move.
   * ------------------------------------------------------------------ */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || isBusyRef.current) return;
    isPointerDownRef.current = true;
    isPointerCapturedRef.current = false;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    pendingDeltaXRef.current = 0;
    isHorizontalGestureRef.current = null;
    dragOccurredRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || isBusyRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    const deltaY = e.clientY - startYRef.current;

    if (isHorizontalGestureRef.current === null) {
      if (Math.abs(deltaX) > 7 || Math.abs(deltaY) > 7) {
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        isHorizontalGestureRef.current = isHorizontal;
        if (isHorizontal) {
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
            isPointerCapturedRef.current = true;
          } catch {}
          dragOccurredRef.current = true;
        }
      }
    }

    if (isHorizontalGestureRef.current) {
      pendingDeltaXRef.current = deltaX;
      dragOccurredRef.current = true;

      if (cardRef.current) {
        const rot = deltaX * 0.04;
        const opacity = Math.max(0.68, 1 - Math.abs(deltaX) / 750);
        cardRef.current.style.transition = 'none';
        cardRef.current.style.transform = `translate3d(${deltaX}px, 0, 0) rotate(${rot}deg)`;
        cardRef.current.style.opacity = `${opacity}`;
      }
      if (backCardRef.current) {
        const spread = Math.min(Math.abs(deltaX) / 12, 22);
        backCardRef.current.style.transition = 'none';
        backCardRef.current.style.transform = `translate3d(${spread}px, 0, 0)`;
      }
    }
  };

  const settleCard = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
      cardRef.current.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
      cardRef.current.style.opacity = '1';
    }
    if (backCardRef.current) {
      backCardRef.current.style.transition = 'none';
      backCardRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
  };

  /**
   * Swaps the slide and animates the outgoing card at the same time, so the
   * stack never flashes an empty shell. The transition class is toggled
   * imperatively: a re-render would clear an inline transition.
   */
  const swapTo = (nextIndex: number, dir: 1 | -1) => {
    const outgoing = cardRef.current;
    if (!outgoing) {
      setFrontIndex(nextIndex);
      return;
    }

    isBusyRef.current = true;
    const seq = ++swapSeqRef.current;

    /* Snapshot before React renders anything new. */
    const styles = getComputedStyle(outgoing);
    const startTransform = styles.transform;
    const startOpacity = styles.opacity;
    const startHeight = outgoing.getBoundingClientRect().height;

    const ghost = outgoing.cloneNode(true) as HTMLDivElement;
    ghost.removeAttribute('ref');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.cssText = [
      'position:absolute',
      'inset:0 0 auto 0',
      'z-index:20',
      'pointer-events:none',
      'transform:none',
      'transition:none'
    ].join(';');
    outgoing.parentElement?.appendChild(ghost);

    outgoing.style.transition = 'none';
    outgoing.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
    outgoing.style.opacity = '1';

    /*
     * Hand-off: the ghost starts exactly on the old frame, then flies out while
     * the wrapper height follows it. The new card is only revealed at the end,
     * so nothing is ever painted twice or half-moved.
     */
    requestAnimationFrame(() => {
      if (swapSeqRef.current !== seq) return;
      setFrontIndex(nextIndex);
      ghost.style.transition = `transform ${DECK_MS}ms ${DECK_EASE}, opacity 200ms ease-out, height ${DECK_MS}ms ${DECK_EASE}`;
      ghost.style.height = `${startHeight}px`;
      ghost.style.transform = startTransform === 'none' ? 'none' : startTransform;
      ghost.style.opacity = startOpacity;
      if (wrapRef.current) wrapRef.current.style.transition = `height ${DECK_MS}ms ${DECK_EASE}`;
      void ghost.offsetHeight;
      const endHeight = ghost.getBoundingClientRect().height;
      ghost.style.height = `${endHeight}px`;
      ghost.style.transform = `translate3d(${dir * -360}px, 0, 0) rotate(${dir * -10}deg)`;
      ghost.style.opacity = '0';
      if (wrapRef.current) wrapRef.current.style.height = `${endHeight}px`;
    });

    const finish = () => {
      if (swapSeqRef.current !== seq) return;
      ghost.remove();
      outgoing.style.transition = 'none';
      outgoing.style.opacity = '1';
      if (wrapRef.current) {
        wrapRef.current.style.transition = 'none';
        wrapRef.current.style.height = 'auto';
      }
      isBusyRef.current = false;
      dragOccurredRef.current = false;
    };
    ghost.addEventListener('transitionend', finish, { once: true });
    window.setTimeout(finish, 420);
  };

  const throwCard = (dir: 1 | -1, nextIndex: number) => {
    swapTo(nextIndex, dir);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    if (isPointerCapturedRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      isPointerCapturedRef.current = false;
    }
    isPointerDownRef.current = false;

    const effectiveDrag = pendingDeltaXRef.current;

    if (isHorizontalGestureRef.current && Math.abs(effectiveDrag) > 65) {
      const dir = effectiveDrag < 0 ? 1 : -1;
      throwCard(dir, (frontIndex + dir + totalCards) % totalCards);
    } else {
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease-out';
        cardRef.current.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        cardRef.current.style.opacity = '1';
      }
      if (backCardRef.current) {
        backCardRef.current.style.transition = 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)';
        backCardRef.current.style.transform = 'translate3d(0, 0, 0)';
      }
      window.setTimeout(() => {
        dragOccurredRef.current = false;
      }, 80);
    }
    isHorizontalGestureRef.current = null;
    pendingDeltaXRef.current = 0;
  };

  const jumpToSlide = (idx: number) => {
    if (idx === frontIndex || isBusyRef.current) return;
    const dir = (idx - frontIndex + totalCards) % totalCards === 1 ? 1 : -1;
    throwCard(dir as 1 | -1, idx);
  };

  /**
   * Last completed session, used when nothing is running and today has no plan —
   * an empty deck on a rest day tells you nothing about your training.
   */
  const lastCompleted = workoutHistory
    .filter((w) => w.status === 'completed')
    .sort((a, b) => b.startedAt - a.startedAt)[0];
  const recent = workoutHistory
    .filter((w) => w.status === 'completed')
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, 2);

  /* ------------------------------------------------------------------ *
   * Slide 1: Session
   * ------------------------------------------------------------------ */
  const activeExerciseIndex = activeWorkout
    ? activeWorkout.exercises.findIndex((ex) => ex.sets.some((s) => !s.completed))
    : -1;
  const currentExercise =
    activeExerciseIndex >= 0 ? activeWorkout?.exercises[activeExerciseIndex] : activeWorkout?.exercises[0];
  const nextExercise =
    activeWorkout && activeExerciseIndex >= 0
      ? activeWorkout.exercises
          .slice(activeExerciseIndex + 1)
          .find((ex) => ex.exerciseId !== currentExercise?.exerciseId)
      : undefined;
  const currentExerciseName = currentExercise ? exerciseName(currentExercise.exerciseId) : '';
  const completedSetsDone = currentExercise
    ? currentExercise.sets.filter((s) => s.completed).length
    : 0;
  const currentSetCount = currentExercise ? currentExercise.sets.length : 0;


  const renderSessionSlide = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
          {activeWorkout
            ? t('today_label')
            : todayRoutine
            ? t('today_label')
            : t('rest_day')}
        </span>
        {activeWorkout && (
          <span className="px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/40 text-[10px] font-black text-accent uppercase tracking-wider">
            {t('workout_in_progress')}
          </span>
        )}
      </div>

      {activeWorkout ? (
        <>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-text tracking-tight leading-tight">
              {activeWorkout.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
              <Clock size={13} className="text-accent" />
              <ActiveWorkoutClock startedAt={activeWorkout.startedAt} />
              <span>·</span>
              <span>{activeWorkout.exercises.length} {t('nav_exercises')}</span>
              <span>·</span>
              <span className="text-accent font-bold">
                {activeWorkout.totalSets} {t('set_col')}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-2 border border-line space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-text truncate">
                {currentExerciseName}
              </span>
              <span className="text-[11px] font-mono font-bold text-accent shrink-0">
                {currentSetCount > 0
                  ? `${t('set_col')} ${Math.min(completedSetsDone + 1, currentSetCount)}/${currentSetCount}`
                  : ''}
              </span>
            </div>
            {nextExercise ? (
              <span className="text-[11px] text-text-muted block truncate">
                {t('next_up_label')}: {exerciseName(nextExercise.exerciseId)}
              </span>
            ) : (
              <span className="text-[11px] text-text-muted block">{t('last_exercise_label')}</span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              if (dragOccurredRef.current) return;
              e.stopPropagation();
              setActiveTab('workout');
            }}
            className="w-full py-3.5 rounded-xl bg-accent text-on-accent font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <Play size={16} className="fill-current" />
            {t('continue_workout')}
          </button>
        </>
      ) : lastCompleted ? (
        <>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-xl font-black text-text tracking-tight leading-tight truncate">
                {lastCompleted.title}
              </h2>
              {todayRoutine && todayRoutine.name !== lastCompleted.title && (
                <span className="text-[10px] font-bold text-accent shrink-0 max-w-[45%] truncate text-right">
                  {t('next_up_label')}: {todayRoutine.name}
                </span>
              )}
            </div>
            <p className="text-[11px] text-text-muted font-mono">
              {formatDuration(lastCompleted.durationSeconds)} · {lastCompleted.totalSets}{' '}
              {t('set_col')} · {formatNumber(lastCompleted.totalVolume, language)}{' '}
              {settings.weightUnit}
            </p>
          </div>

          <div className="border-t border-line pt-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                {t('recent_workouts')}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  if (dragOccurredRef.current) return;
                  e.stopPropagation();
                  setActiveTab('history');
                }}
                className="text-[11px] font-bold text-accent hover:underline"
              >
                {t('see_all')} →
              </button>
            </div>
            {recent.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={(e) => {
                  if (dragOccurredRef.current) return;
                  e.stopPropagation();
                  openSummaryModal(w);
                }}
                className="w-full flex items-center justify-between gap-2 text-left px-2.5 py-1.5 rounded-lg bg-surface-2 border border-line"
              >
                <span className="text-[11px] font-bold text-text truncate">{w.title}</span>
                <span className="text-[10px] font-mono text-text-muted shrink-0">
                  {formatDuration(w.durationSeconds)}
                </span>
              </button>
            ))}
          </div>

          {todayRoutine && (
            <button
              type="button"
              onClick={(e) => {
                if (dragOccurredRef.current) return;
                e.stopPropagation();
                startWorkout(todayRoutine.id);
              }}
              className="w-full py-3.5 rounded-xl bg-accent text-on-accent font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <Play size={16} className="fill-current" />
              {t('start_training_btn')}
            </button>
          )}
        </>
      ) : todayRoutine ? (
        <>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-text tracking-tight leading-tight">
              {todayRoutine.name}
            </h2>
            <p className="text-xs text-text-muted line-clamp-2">{todayRoutine.description}</p>
          </div>

          <div className="border-t border-line pt-2">
            <button
              type="button"
              onClick={(e) => {
                if (dragOccurredRef.current) return;
                e.stopPropagation();
                setShowExercises(!showExercises);
              }}
              className="flex items-center justify-between w-full py-1 text-xs font-semibold text-text-muted hover:text-text transition-colors"
            >
              <span>{showExercises ? t('hide_exercises') : t('see_exercises')}</span>
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${
                  showExercises ? 'rotate-180 text-text' : ''
                }`}
              />
            </button>

            {showExercises && (
              <div className="flex flex-wrap gap-1.5 pt-2 animate-in fade-in duration-200">
                {(todayRoutine?.exercises || nextRoutine?.exercises || []).map((item) => (
                  <span
                    key={item.exerciseId}
                    className="px-2.5 py-1 rounded-lg bg-surface-2 border border-line text-[11px] font-semibold text-text"
                  >
                    {exerciseName(item.exerciseId)}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              if (dragOccurredRef.current) return;
              e.stopPropagation();
              startWorkout(todayRoutine.id);
            }}
            className="w-full py-3.5 rounded-xl bg-accent text-on-accent font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <Play size={16} className="fill-current" />
            {t('start_training_btn')}
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-text tracking-tight leading-tight">
              {t('rest_day')}
            </h2>
            <p className="text-xs text-text-muted">
              {nextRoutine ? `${t('next_up_label')}: ${nextRoutine.name}` : t('rest_desc')}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              if (dragOccurredRef.current) return;
              e.stopPropagation();
              setActiveTab('workout');
            }}
            className="w-full py-3.5 rounded-xl bg-surface-2 border border-line text-text font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <Play size={16} />
            {t('see_exercises')}
          </button>
        </div>
      )}
    </div>
  );

  /* ------------------------------------------------------------------ *
   * Slide 2: Week
   * ------------------------------------------------------------------ */
  const weekTiles = [
    {
      label: t('planned_workouts'),
      value: `${thisWeekWorkouts.length}/4`,
      icon: <Activity size={13} className="text-emerald-600 dark:text-emerald-400 opacity-80" />
    },
    {
      label: t('volume_lifted'),
      value: `${formatNumber(weekVolume, language)}`,
      icon: <Dumbbell size={13} className="text-text-muted opacity-80" />
    },
    {
      label: t('ready_muscles'),
      value: `${readyMusclesCount}/${totalMusclesTracked}`,
      icon: <Activity size={13} className="text-emerald-600 dark:text-emerald-400 opacity-80" />
    },
    {
      label: t('total_sets'),
      value: `${weekSets}`,
      icon: <SlidersHorizontal size={13} className="text-text-muted opacity-80" />
    },
    {
      label: t('training_time'),
      value: `${Math.round(weekTimeSeconds / 60)}m`,
      icon: <Clock size={13} className="text-text-muted opacity-80" />
    },
    {
      label: t('personal_records'),
      value: `${weekPRs}`,
      icon: <Trophy size={13} className="text-pr opacity-80" />
    }
  ];

  const renderWeekSlide = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
          {t('this_week_label')}
        </span>
        <span className="text-xs font-mono font-bold text-accent">
          {thisWeekWorkouts.length} / 4 {t('planned_workouts')}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {weekTiles.map((tile) => (
          <div
            key={tile.label}
            className="p-2.5 rounded-xl bg-surface-2 border border-line flex flex-col justify-between min-h-[64px]"
          >
            <div className="flex items-start justify-between gap-1">
              <span className="text-sm font-black font-mono text-text truncate">{tile.value}</span>
              {tile.icon}
            </div>
            <span className="text-[9px] font-bold text-text-muted uppercase leading-tight mt-1">
              {tile.label}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-line flex items-center justify-between text-xs text-text-muted">
        <span className="flex items-center gap-1.5 font-bold">
          <Flame size={14} className="text-accent fill-accent" />
          {streak} {t('streak_weeks')}
        </span>
        <button
          type="button"
          onClick={(e) => {
            if (dragOccurredRef.current) return;
            e.stopPropagation();
            setActiveTab('history');
          }}
          className="text-accent font-bold hover:underline"
        >
          {t('see_all')} →
        </button>
      </div>
    </div>
  );

  /* ------------------------------------------------------------------ *
   * Slide 3: Body
   * ------------------------------------------------------------------ */
  const renderNutritionSlide = () => {
    const calories = profile?.dailyCalories ?? 2200;
    const protein = profile?.dailyProteinGrams ?? 140;
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const todayVolume = workoutHistory
      .filter((w) => w.status === 'completed' && w.startedAt >= startOfToday)
      .reduce((sum, w) => sum + (w.totalVolume || 0), 0);

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            {t('lean_bulk')}
          </span>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            {t('left_today')}
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-black font-mono text-text leading-none">
              {formatNumber(calories, language)}
            </span>
            <span className="text-[11px] text-text-muted font-bold ml-1">kcal</span>
          </div>
          <span className="text-sm font-bold text-accent font-mono">
            {protein}g {t('protein_label')}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-xl bg-surface-2 border border-line">
            <span className="text-[9px] text-text-muted block font-semibold uppercase">
              {t('volume_lifted')}
            </span>
            <span className="text-xs font-black font-mono text-text">
              {formatNumber(todayVolume, language)}
              <span className="text-[9px] text-text-muted"> {settings.weightUnit}</span>
            </span>
          </div>
          <div className="p-2 rounded-xl bg-surface-2 border border-line">
            <span className="text-[9px] text-text-muted block font-semibold uppercase">
              {t('trend_label')}
            </span>
            <span className="text-xs font-black font-mono text-text">
              {profile ? profile.weightKg : '—'}
              <span className="text-[9px] text-text-muted">kg</span>
            </span>
          </div>
          <div className="p-2 rounded-xl bg-surface-2 border border-line">
            <span className="text-[9px] text-text-muted block font-semibold uppercase">
              {t('water_goal')}
            </span>
            <span className="text-xs font-black font-mono text-sky-600 dark:text-sky-400">
              2.8L
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            if (dragOccurredRef.current) return;
            e.stopPropagation();
            setActiveTab('settings');
          }}
          className="w-full py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold text-text flex items-center justify-center gap-1.5 transition"
        >
          <Flame size={13} className="text-accent" />
          {t('open_settings')}
        </button>
      </div>
    );
  };

  const renderSlide = (idx: number) => {
    if (idx === 1) return renderWeekSlide();
    if (idx === 2) return renderNutritionSlide();
    return renderSessionSlide();
  };

  const slideLabel = (idx: number) => {
    if (idx === 1) return t('this_week_label');
    if (idx === 2) return t('lean_bulk');
    return t('today_label');
  };

  return (
    <div className="relative w-full select-none">
      {/* Back card peeks from the side, the way a stacked deck does */}
      <div
        ref={backCardRef}
        style={{
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform'
        }}
        className="pointer-events-none absolute inset-y-2 left-0 right-[22px] -z-10 overflow-hidden rounded-sheet bg-gradient-to-r from-surface via-surface to-accent/70 border border-line shadow-card gpu-layer"
        aria-hidden="true"
      >
        <div className="relative h-full pl-2 pr-1 flex items-center justify-between overflow-hidden">
          <ChevronLeft size={12} className="text-text-muted shrink-0" />
          <span className="text-[9px] font-black text-accent uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">
            {slideLabel(peekIndex)}
          </span>
          {/* Peeking strip carries the maroon the card in front is tinting with */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-accent to-accent/30"
          />
        </div>
      </div>

      {/* Summary banner sits behind the card like ABOT: the card overlaps its lower edge */}
      <div className="rounded-sheet bg-accent text-on-accent px-4 pt-2.5 pb-7 -mb-5">
        <div className="grid grid-cols-3 divide-x divide-on-accent/25 items-center">
          <div className="pr-2 flex items-center gap-2">
            <span className="relative size-7 shrink-0 flex items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-on-accent/25" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.min(1, thisWeekWorkouts.length / plannedTarget) * 94.2} 94.2`}
                />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-black font-mono leading-none">
                {thisWeekWorkouts.length}/{plannedTarget}
              </span>
              <span className="block text-[10px] font-bold text-on-accent/80 mt-0.5">
                {t('planned_short')}
              </span>
            </span>
          </div>

          <div className="px-2 min-w-0">
            <span className="block text-sm font-black font-mono leading-none truncate">
              {formatNumber(weekVolume, language)} {settings.weightUnit}
            </span>
            <span className="block text-[10px] font-bold text-on-accent/80 mt-0.5">
              {t('volume_short')}
            </span>
          </div>

          <div className="pl-2 min-w-0 text-right">
            <span className="block text-sm font-black font-mono leading-none">
              {readyMusclesCount}/{totalMusclesTracked}
            </span>
            <span className="block text-[10px] font-bold text-on-accent/80 mt-0.5">
              {t('ready_short')}
            </span>
          </div>
        </div>
      </div>

      {/* Height follows the tallest frame so the swap never jumps */}
      <div ref={wrapRef} className="relative z-10">
      <div
        ref={cardRef}
        style={{
          transform: 'translate3d(0, 0, 0) rotate(0deg)',
          opacity: 1,
          transformOrigin: '50% 120%',
          willChange: 'transform, opacity'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative z-10 w-full touch-pan-y cursor-grab active:cursor-grabbing select-none gpu-layer"
      >
        <Card
          radius="sheet"
          padding="16px"
          variant="raised"
          className="relative overflow-hidden space-y-3 bg-surface/90 backdrop-blur-xl"
        >
          {/* Translucent front card: the maroon card underneath shows through as a warm veil, brighter while dragging */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-accent-veil"
          />
          {renderSlide(frontIndex)}
        </Card>
      </div>
      </div>

      {/* Explicit controls: the deck is also reachable without gestures */}
      <div className="flex items-center justify-center gap-2 mt-2.5">
        <button
          type="button"
          onClick={() => jumpToSlide((frontIndex - 1 + totalCards) % totalCards)}
          className="size-6 rounded-full flex items-center justify-center text-text-muted hover:text-text transition-colors"
          aria-label={slideLabel((frontIndex - 1 + totalCards) % totalCards)}
        >
          <ChevronLeft size={15} />
        </button>

        <div className="flex items-center gap-1.5">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide}
              type="button"
              onClick={() => jumpToSlide(idx)}
              className={`h-1.5 rounded-full transition duration-300 ${
                frontIndex === idx ? 'w-6 bg-accent' : 'w-1.5 bg-surface-3 hover:bg-surface-2'
              }`}
              aria-label={slideLabel(idx)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => jumpToSlide((frontIndex + 1) % totalCards)}
          className="size-6 rounded-full flex items-center justify-center text-text-muted hover:text-text transition-colors"
          aria-label={language === 'id' ? 'Slide berikutnya' : 'Next slide'}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};
