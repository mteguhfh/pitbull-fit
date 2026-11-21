import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { createPortal } from 'react-dom';
import { useWorkout } from '../context/WorkoutContext';
import { formatNumber } from '../utils/format';
import confetti from 'canvas-confetti';
import {
  Clock,
  Dumbbell,
  Layers,
  Trophy,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  MapPin,
  Camera,
  RotateCcw,
  Share2,
  Check,
  Plus
} from 'lucide-react';
import { INITIAL_EXERCISES } from '../data/exercises';
import { MuscleAnatomy } from './MuscleAnatomy';
import { ShareStoryModal } from './ShareStoryModal';
import { MuscleGroup } from '../types';

export const WorkoutSummaryModal: React.FC = () => {
  const {
    showSummaryModal,
    lastCompletedWorkout,
    closeSummaryModal,
    startWorkout,
    settings,
    language,
    t
  } = useWorkout();

  const [showShareModal, setShowShareModal] = useState(false);
  const gymName = settings.gymLocation || '';
  const [collapsedExercises, setCollapsedExercises] = useState<Set<number>>(() => new Set());
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&auto=format&fit=crop&q=60'
  ]);

  const toggleExerciseCollapse = (idx: number) => {
    setCollapsedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  useEffect(() => {
    if (showSummaryModal) {
      try {
        confetti({
          particleCount: 110,
          spread: 85,
          origin: { y: 0.5 },
          colors: ['var(--color-accent)', 'var(--color-accent-bright)', '#ffffff', '#eab308']
        });
      } catch {}
    }
  }, [showSummaryModal]);

  // Lock background scroll when summary modal is visible
  useEffect(() => {
    if (!showSummaryModal || !lastCompletedWorkout) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showSummaryModal, lastCompletedWorkout]);

  if (!showSummaryModal || !lastCompletedWorkout) return null;
  if (typeof document === 'undefined') return null;

  const durationMin = Math.round(lastCompletedWorkout.durationSeconds / 60);
  const durationHours = Math.floor(durationMin / 60);
  const durationRemainingMin = durationMin % 60;
  const durationFormatted =
    durationHours > 0
      ? `${durationHours}h ${durationRemainingMin}m`
      : `${durationMin}m`;

  const dateStr = new Date(lastCompletedWorkout.startedAt).toLocaleDateString(
    language === 'id' ? 'id-ID' : 'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  );

  const allWorkoutMuscles = Array.from(
    new Set(
      lastCompletedWorkout.exercises.flatMap(
        (item) => INITIAL_EXERCISES.find((e) => e.id === item.exerciseId)?.primaryMuscles || []
      )
    )
  );
  const displaySummaryMuscles: MuscleGroup[] =
    allWorkoutMuscles.length > 0 ? allWorkoutMuscles : (['chest', 'shoulders', 'triceps'] as MuscleGroup[]);

  const handleRepeat = () => {
    closeSummaryModal();
    startWorkout(lastCompletedWorkout.routineId, lastCompletedWorkout.title);
  };

  const handleAddPhoto = () => {
    const demoPics = [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&auto=format&fit=crop&q=60'
    ];
    const nextPic = demoPics[photos.length % demoPics.length];
    setPhotos([...photos, nextPic]);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/90 animate-in fade-in select-none">
      <div className="min-h-full max-w-[500px] mx-auto bg-bg text-text pt-3 px-4 flex flex-col justify-between relative">
        <div className="space-y-4 pb-32">
          {/* Top Bar matching 6.webp (< Home rounded pill button & 3-dots menu) */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={closeSummaryModal}
              className="px-3.5 py-1.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold text-text hover:text-white flex items-center gap-1 transition-colors active:scale-95"
            >
              <ChevronLeft size={16} />
              <span>{t('nav_home')}</span>
            </button>

            <button
              type="button"
              className="size-8 rounded-full bg-surface-2 flex items-center justify-center text-text-muted hover:text-white"
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Date & Title Header with Anatomy Highlight on Right matching 6.webp */}
          <div className="flex items-start justify-between gap-3 pt-1">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-text-muted">
                {dateStr}
              </span>
              <h1 className="text-2xl font-black text-text tracking-tight">
                {lastCompletedWorkout.title}
              </h1>

              {/* Gym Location Tagger matching 6.webp */}
              <div className="flex items-center gap-1.5 text-xs text-text-muted pt-0.5">
                <MapPin size={13} className="text-accent" />
                <span className="text-text-muted">
                  {gymName || t('tag_gym')}
                </span>
              </div>
            </div>

            {/* Front & Back Muscle Highlight Preview glowing in crimson matching 6.webp */}
            <div className="shrink-0 w-24 h-24 rounded-2xl bg-surface-2/60 border border-line p-1.5 flex items-center justify-center overflow-hidden">
              <MuscleAnatomy
                compact={true}
                primaryMuscles={displaySummaryMuscles}
                width="100%"
                activeView="both"
                showToggle={false}
                showDetailCard={false}
              />
            </div>
          </div>

          {/* 4 Stat Boxes Matrix matching 6.webp */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div className="p-3 rounded-2xl bg-surface-2/80 border border-line flex flex-col justify-between">
              <div className="flex items-center gap-1 text-text-muted mb-1">
                <Clock size={12} className="text-accent" />
                <span className="text-[10px] font-bold uppercase">{t('profile_time')}</span>
              </div>
              <span className="text-base font-black font-mono text-text truncate">
                {durationFormatted}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-2/80 border border-line flex flex-col justify-between">
              <div className="flex items-center gap-1 text-text-muted mb-1">
                <Dumbbell size={12} className="text-accent" />
                <span className="text-[10px] font-bold uppercase">Volume</span>
              </div>
              <span className="text-base font-black font-mono text-text truncate">
                {formatNumber(lastCompletedWorkout.totalVolume, language)}
                <span className="text-[9px] font-normal text-text-muted ml-0.5">
                  {settings.weightUnit}
                </span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-2/80 border border-line flex flex-col justify-between">
              <div className="flex items-center gap-1 text-text-muted mb-1">
                <Layers size={12} className="text-accent" />
                <span className="text-[10px] font-bold uppercase">{t('profile_sets')}</span>
              </div>
              <span className="text-base font-black font-mono text-text">
                {lastCompletedWorkout.totalSets}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-2/80 border border-line flex flex-col justify-between">
              <div className="flex items-center gap-1 text-text-muted mb-1">
                <Trophy size={12} className="text-pr" />
                <span className="text-[10px] font-bold uppercase">{t('records_count')}</span>
              </div>
              <span className="text-base font-black font-mono text-pr">
                {lastCompletedWorkout.prCount}
              </span>
            </div>
          </div>

          {/* Photos Section matching 6.webp */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text uppercase tracking-wider">
                {t('photos_label')} ({photos.length}/6)
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="size-20 rounded-2xl overflow-hidden border border-line shrink-0 bg-surface-2 relative group"
                >
                  <img src={url} alt="Workout" className="w-full h-full object-cover" />
                </div>
              ))}

              {photos.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="size-20 rounded-2xl border-2 border-dashed border-line hover:border-accent/50 flex flex-col items-center justify-center text-text-muted hover:text-white shrink-0 bg-surface-2/40 transition-colors"
                >
                  <Camera size={18} className="mb-1" />
                  <span className="text-[9px] font-bold">{t('add_photo')}</span>
                </button>
              )}
            </div>
            <p className="text-[10px] text-text-muted">{t('photos_notice')}</p>
          </div>

          {/* Exercise Breakdown List matching 6.webp */}
          <div className="space-y-3 pt-2">
            <span className="block text-xs font-bold text-text-muted uppercase tracking-wider">
              {t('nav_exercises')} ({lastCompletedWorkout.exercises.length})
            </span>

            {lastCompletedWorkout.exercises.map((item, exIdx) => {
              const meta = INITIAL_EXERCISES.find((e) => e.id === item.exerciseId);
              const completedSets = item.sets.filter((s) => s.completed);
              const isCollapsed = collapsedExercises.has(exIdx);
              const completionPct = Math.round(
                (completedSets.length / Math.max(item.sets.length, 1)) * 100
              );

              return (
                <Card
                  radius="card"
                  key={exIdx}
                  padding="14px 16px"
                  variant="default"
                  className="space-y-3"
                >
                  <div
                    onClick={() => toggleExerciseCollapse(exIdx)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Exercise / anatomy thumbnail matching 6.webp */}
                      <div className="size-11 rounded-xl bg-surface-2 border border-line flex items-center justify-center text-accent shrink-0 relative overflow-hidden p-0.5">
                        <MuscleAnatomy
                          compact={true}
                          showToggle={false}
                          showDetailCard={false}
                          activeView={meta?.primaryMuscles.includes('back') ? 'back' : 'front'}
                          primaryMuscles={meta?.primaryMuscles || []}
                          width={22}
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-text truncate">
                          {meta ? meta.name : item.exerciseId}
                        </h3>
                        <span className="text-[11px] text-text-muted capitalize block">
                          {meta?.equipment || 'Free Weight'} · {completedSets.length}{' '}
                          {t('profile_sets')}
                        </span>
                        {/* Progress bar under subtitle matching 6.webp */}
                        <div className="h-1 w-24 bg-surface-3 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-accent rounded-full transition duration-300"
                            style={{ width: `${completionPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.sets.some((s) => s.isPR) && (
                        <span className="px-2 py-0.5 rounded-full bg-pr/20 border border-pr/40 text-[10px] font-black text-pr flex items-center gap-1">
                          <Trophy size={10} />
                          PR
                        </span>
                      )}

                      <button
                        type="button"
                        className="size-7 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted hover:text-white transition-colors"
                      >
                        {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Set-by-Set Visualizer with proportional volume bars matching 6.webp */}
                  {!isCollapsed && (
                    <div className="space-y-1.5 pt-1 border-t border-line/60 animate-in fade-in">
                      {completedSets.map((s, sIdx) => {
                        const weights = completedSets.map((x) => x.weight || 0);
                        const maxWeightInEx = weights.length > 0 ? Math.max(...weights) : 0;
                        const barPercent =
                          maxWeightInEx > 0
                            ? Math.round((s.weight / maxWeightInEx) * 100)
                            : 50;

                        return (
                          <div
                            key={sIdx}
                            className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-surface-2/70 border border-line"
                          >
                            <div className="flex items-center gap-3 w-1/3">
                              <span className="size-5 rounded-md bg-surface-3 flex items-center justify-center font-mono font-bold text-[10px] text-text-muted">
                                {s.setNumber}
                              </span>
                              <span className="font-mono font-bold text-text">
                                {s.weight} {settings.weightUnit} × {s.reps}
                              </span>
                            </div>

                            <div className="w-1/3 px-2">
                              <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-accent rounded-full transition duration-300"
                                  style={{ width: `${barPercent}%` }}
                                />
                              </div>
                            </div>

                            <div className="w-1/3 text-right">
                              {s.isPR ? (
                                <span className="text-[10px] font-black text-pr uppercase">
                                  Best
                                </span>
                              ) : (
                                <Check size={14} className="text-emerald-600 dark:text-emerald-400 ml-auto" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sticky Bottom Bar matching 6.webp ([> Repeat] + Share story) */}
        <div
          className="sticky bottom-0 inset-x-0 z-30 -mx-4 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom,16px))] border-t border-line shadow-[0_-8px_32px_rgba(0,0,0,0.65)] flex items-center gap-3"
          style={{ backgroundColor: 'var(--color-bg, #08080a)' }}
        >
          <button
            type="button"
            onClick={handleRepeat}
            className="flex-1 py-3.5 rounded-2xl bg-accent text-on-accent font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition"
          >
            <RotateCcw size={16} />
            <span>{t('repeat_workout')}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="flex-1 py-3.5 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-line text-sm font-bold text-text flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <Share2 size={16} />
            <span>{t('share_story')} ↗</span>
          </button>
        </div>
      </div>

      {/* Share Story Instagram Modal */}
      {showShareModal && (
        <ShareStoryModal
          session={lastCompletedWorkout}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>,
    document.body
  );
};
