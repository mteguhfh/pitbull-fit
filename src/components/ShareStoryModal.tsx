import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WorkoutSession, MuscleGroup } from '../types';
import { useWorkout } from '../context/WorkoutContext';
import {
  X,
  Download,
  Share2,
  Image as ImageIcon,
  Video,
  Layout,
  Type,
  Camera,
  Sparkles,
  Trophy,
  Flame,
  Check
} from 'lucide-react';
import { PitbullLogo } from './PitbullLogo';
import { MuscleAnatomy } from './MuscleAnatomy';
import { INITIAL_EXERCISES } from '../data/exercises';

interface ShareStoryModalProps {
  session: WorkoutSession;
  onClose: () => void;
}

type TemplateType = 'clean' | 'banner' | 'hud' | 'receipt' | 'magazine';

const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80'
];

export const ShareStoryModal: React.FC<ShareStoryModalProps> = ({ session, onClose }) => {
  const { settings, t, language } = useWorkout();

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);
  const [template, setTemplate] = useState<TemplateType>('clean');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyCardRef = useRef<HTMLDivElement>(null);

  const activePhoto = customPhoto || DEFAULT_PHOTOS[photoIndex];

  const durationMin = Math.round(session.durationSeconds / 60);
  const durationHours = Math.floor(durationMin / 60);
  const durationRemainingMin = durationMin % 60;
  const durationFormatted =
    durationHours > 0
      ? `${durationHours}h ${durationRemainingMin}m`
      : `${durationMin}m`;

  const dateFormatted = new Date(session.startedAt).toLocaleDateString(
    language === 'id' ? 'id-ID' : 'en-US',
    { day: '2-digit', month: '2-digit', year: 'numeric' }
  );

  const allWorkoutMuscles = Array.from(
    new Set(
      session.exercises.flatMap(
        (item) => INITIAL_EXERCISES.find((e) => e.id === item.exerciseId)?.primaryMuscles || []
      )
    )
  );
  const displayMuscles: MuscleGroup[] =
    allWorkoutMuscles.length > 0 ? allWorkoutMuscles : (['chest', 'shoulders', 'triceps'] as MuscleGroup[]);

  const fallbackExercises = [
    { exerciseId: 'bench-press', sets: [{ completed: true }, { completed: true }, { completed: true }] },
    { exerciseId: 'incline-dumbbell-press', sets: [{ completed: true }, { completed: true }, { completed: true }] },
    { exerciseId: 'dips', sets: [{ completed: true }, { completed: true }] }
  ];
  const storyExercises = session.exercises && session.exercises.length > 0 ? session.exercises : fallbackExercises;

  const templateNames: Record<TemplateType, string> = {
    clean: t('story_clean'),
    banner: t('story_banner'),
    hud: t('story_hud'),
    receipt: t('story_receipt'),
    magazine: t('story_magazine')
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${session.title} - PITBULL FIT`,
          text: `Crushed ${session.title}! ${session.totalVolume} ${settings.weightUnit} lifted across ${session.totalSets} sets in ${durationFormatted}. 💪🔥`,
          url: window.location.href
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(
        `Crushed ${session.title}! ${session.totalVolume} ${settings.weightUnit} lifted across ${session.totalSets} sets in ${durationFormatted}. Tracked with PITBULL FIT.`
      );
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    } catch {}
  };

  const handleDownload = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleCyclePhoto = () => {
    setCustomPhoto(null);
    setPhotoIndex((prev) => (prev + 1) % DEFAULT_PHOTOS.length);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomPhoto(url);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/90 animate-in fade-in select-none">
      <div className="relative w-full max-w-[420px] max-h-[95vh] flex flex-col rounded-3xl bg-[#0f0f14] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Top Action Bar matching 7.webp */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="text-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {t('share_story')}
            </h3>
            <span className="text-[10px] text-text-muted capitalize">
              {templateNames[template]}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title={t('share_download')}
          >
            <Download size={16} />
          </button>
        </div>

        {/* Image / Video Segment Switcher matching 7.webp */}
        <div className="flex justify-center py-2.5 shrink-0">
          <div className="flex items-center bg-[#1a1a24] p-1 rounded-full border border-white/10">
            <button
              type="button"
              onClick={() => setMediaType('image')}
              className={`flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold transition ${
                mediaType === 'image'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              <ImageIcon size={14} />
              <span>{t('share_image')}</span>
            </button>
            <button
              type="button"
              onClick={() => setMediaType('video')}
              className={`flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold transition ${
                mediaType === 'video'
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              <Video size={14} />
              <span>{t('share_video')}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Story Preview Canvas matching 7.webp */}
        <div className="flex-1 overflow-y-auto px-4 py-2 flex items-center justify-center">
          <div
            ref={storyCardRef}
            className="relative w-full aspect-[9/16] max-h-[380px] rounded-2xl overflow-hidden shadow-2xl border border-white/15 flex flex-col justify-between p-4"
            style={{
              background:
                template === 'receipt'
                  ? '#f4f4f5'
                  : '#121218'
            }}
          >
            {/* Full-bleed Workout Photo Background for photo-based templates matching 7.webp */}
            {template !== 'receipt' && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <img
                  src={activePhoto}
                  alt="Workout Ambient"
                  className="w-full h-full object-cover brightness-[0.55] contrast-[1.1] filter"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/25" />
              </div>
            )}

            {/* TEMPLATE 1: CLEAN (Matches 7.webp Clean layout) */}
            {template === 'clean' && (
              <div className="relative z-10 h-full flex flex-col justify-between text-white">
                <div className="flex items-center justify-between">
                  <PitbullLogo size={24} showText={true} />
                  <span className="text-[10px] font-mono font-bold text-white/80">{dateFormatted}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 block font-bold">
                    ✓ Done · Today
                  </span>
                  <h2 className="text-2xl font-black text-white leading-tight">
                    {session.title}
                  </h2>
                  <p className="text-xs font-mono font-bold text-white/90 pt-1">
                    {session.totalVolume} {settings.weightUnit} ·{' '}
                    {durationFormatted} · {session.totalSets} {t('profile_sets')}
                  </p>
                </div>
              </div>
            )}

            {/* TEMPLATE 2: BANNER (Bold FULL TIME + diagonal-striped crimson volume + LINE-UP matching 7.webp) */}
            {template === 'banner' && (
              <div className="relative z-10 h-full flex flex-col justify-between text-white">
                <div className="flex items-center justify-between border-b border-accent/40 pb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-widest text-accent flex items-center gap-1">
                    <Flame size={13} className="fill-accent" /> FULL TIME
                  </span>
                  <span className="text-[10px] font-mono text-white/70">{dateFormatted}</span>
                </div>

                {/* Diagonal-striped crimson volume banner */}
                <div className="my-auto py-2">
                  <div className="relative rounded-2xl bg-gradient-to-r from-accent via-accent-bright to-accent p-3 text-center overflow-hidden border border-white/20">
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(45deg, #000, #000 10px, transparent 10px, transparent 20px)'
                      }}
                    />
                    <span className="relative z-10 text-3xl font-black font-mono text-white block tracking-tight">
                      {session.totalVolume} <span className="text-lg">{settings.weightUnit}</span>
                    </span>
                    <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-white/90 block">
                      TOTAL VOLUME CONQUERED
                    </span>
                  </div>

                  {/* LINE-UP exercise list matching 7.webp */}
                  <div className="mt-3 p-2.5 rounded-xl bg-black/60 border border-white/10 space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-accent block">
                      LINE-UP
                    </span>
                    <div className="space-y-0.5 text-[10px] font-mono text-white/90">
                      {storyExercises.slice(0, 3).map((ex, i) => {
                        const exName = INITIAL_EXERCISES.find((e) => e.id === ex.exerciseId)?.name || ex.exerciseId;
                        return (
                          <div key={i} className="flex justify-between">
                            <span className="truncate max-w-[140px]">{exName}</span>
                            <span className="text-accent font-bold">{ex.sets.length} sets</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-black/60 border border-white/10 text-center text-xs font-mono">
                  <div>
                    <span className="block text-white font-bold">{durationFormatted}</span>
                    <span className="text-[9px] text-text-muted">{t('profile_time')}</span>
                  </div>
                  <div>
                    <span className="block text-white font-bold">{session.totalSets}</span>
                    <span className="text-[9px] text-text-muted">{t('profile_sets')}</span>
                  </div>
                  <div>
                    <span className="block text-pr font-bold">{session.prCount} PR</span>
                    <span className="text-[9px] text-text-muted">{t('records_count')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* TEMPLATE 3: HUD (Glowing front/back muscle anatomy + muscle set bars matching 7.webp) */}
            {template === 'hud' && (
              <div className="relative z-10 h-full flex flex-col justify-between text-white font-mono">
                <div className="flex items-center justify-between border-b border-accent/40 pb-1">
                  <span className="text-[9px] text-accent font-bold tracking-widest">
                    SYSTEM // BIO-HUD LOG
                  </span>
                  <span className="text-[9px] text-white/60">{dateFormatted}</span>
                </div>

                {/* Glowing front/back muscle anatomy silhouettes */}
                <div className="my-auto flex flex-col items-center gap-2">
                  <div className="w-32 h-28 flex items-center justify-center p-1 bg-black/40 rounded-2xl border border-accent/30">
                    <MuscleAnatomy
                      compact={true}
                      showToggle={false}
                      showDetailCard={false}
                      primaryMuscles={displayMuscles}
                      width={110}
                      activeView="both"
                    />
                  </div>

                  {/* Muscle set bars matching 7.webp (Triceps, Chest, Shoulders) */}
                  <div className="w-full space-y-1 bg-black/60 p-2 rounded-xl border border-white/10 text-[10px]">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted uppercase text-[9px]">Triceps</span>
                      <div className="w-24 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full w-[85%]" />
                      </div>
                      <span className="text-accent font-bold text-[9px]">9 sets</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-text-muted uppercase text-[9px]">Chest</span>
                      <div className="w-24 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full w-[100%]" />
                      </div>
                      <span className="text-accent font-bold text-[9px]">12 sets</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-text-muted uppercase text-[9px]">Shoulders</span>
                      <div className="w-24 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full w-[65%]" />
                      </div>
                      <span className="text-accent font-bold text-[9px]">7 sets</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-white/80 border-t border-white/10 pt-1.5 flex justify-between bg-black/40 px-2 py-1 rounded-lg">
                  <span>VOL: {Math.round(session.totalVolume)} {settings.weightUnit}</span>
                  <span>SETS: {session.totalSets}</span>
                  <span>TIME: {durationFormatted}</span>
                </div>
              </div>
            )}

            {/* TEMPLATE 4: RECEIPT (Itemized exercises + APPROVED // VALIDATED stamp matching 7.webp) */}
            {template === 'receipt' && (
              <div className="relative z-10 h-full flex flex-col justify-between text-black font-mono text-[11px] p-2 bg-[#f4f4f5]">
                <div className="text-center border-b border-black/20 pb-2">
                  <span className="text-base font-black tracking-widest block">PITBULL FIT</span>
                  <span className="text-[9px] text-black/60 uppercase">STRENGTH RECEIPT #{session.id.slice(-6)}</span>
                  <span className="text-[9px] text-black/60 block">{dateFormatted}</span>
                </div>

                {/* Itemized exercises list */}
                <div className="space-y-1.5 my-auto overflow-hidden">
                  <div className="flex justify-between font-bold border-b border-black/10 pb-0.5 text-[9px] text-black/70">
                    <span>EXERCISE</span>
                    <span>SETS / STATUS</span>
                  </div>
                  {storyExercises.slice(0, 4).map((ex, i) => {
                    const exName = INITIAL_EXERCISES.find((e) => e.id === ex.exerciseId)?.name || ex.exerciseId;
                    return (
                      <div key={i} className="flex justify-between text-[10px]">
                        <span className="truncate max-w-[130px] font-bold">{exName}</span>
                        <span className="text-black/80">{ex.sets.filter((s) => s.completed).length}s · DONE</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-dashed border-black/40 pt-1.5 mt-1 flex justify-between font-black text-xs">
                    <span>TOTAL LOAD:</span>
                    <span>{session.totalVolume} {settings.weightUnit}</span>
                  </div>
                </div>

                {/* APPROVED // VALIDATED Stamp matching 7.webp */}
                <div className="my-1 flex justify-center">
                  <div className="rotate-[-12deg] border-2 border-accent text-accent font-black px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-widest font-mono shadow-sm">
                    APPROVED // VALIDATED
                  </div>
                </div>

                <div className="text-center border-t border-black/20 pt-1">
                  <span className="font-barcode text-xl tracking-widest block select-none">
                    ||| | |||| | ||||| | ||
                  </span>
                  <span className="text-[8px] text-black/50">NO REFUNDS · ONLY GAINS</span>
                </div>
              </div>
            )}

            {/* TEMPLATE 5: MAGAZINE COVER */}
            {template === 'magazine' && (
              <div className="relative z-10 h-full flex flex-col justify-between text-white">
                <div className="border-b-2 border-white pb-1 flex justify-between items-baseline">
                  <span className="text-2xl font-black tracking-tighter">PITBULL</span>
                  <span className="text-[9px] font-mono tracking-widest text-accent uppercase">
                    ISSUE #08
                  </span>
                </div>

                <div className="space-y-1 my-auto">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                    EXCLUSIVE RECORD
                  </span>
                  <h2 className="text-xl font-black uppercase tracking-tight leading-tight">
                    {session.title}
                  </h2>
                  <p className="text-xs text-white/80 font-serif italic">
                    "{session.totalVolume} {settings.weightUnit} conquered with absolute biomechanical precision."
                  </p>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-white/70 border-t border-white/20 pt-1">
                  <span>{durationFormatted}</span>
                  <span>{session.totalSets} SETS</span>
                  <span>{dateFormatted}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Template Thumbnails Carousel matching 7.webp with Pro beta badges */}
        <div className="px-4 py-2 shrink-0">
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none justify-center">
            {(['clean', 'banner', 'hud', 'receipt', 'magazine'] as TemplateType[]).map((tType) => {
              const isPro = tType === 'receipt' || tType === 'magazine';
              const isSelected = template === tType;

              return (
                <button
                  key={tType}
                  type="button"
                  onClick={() => setTemplate(tType)}
                  className={`relative flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 transition flex flex-col items-center justify-between p-1 ${
                    isSelected
                      ? 'border-accent scale-105'
                      : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    background: tType === 'receipt' ? '#f4f4f5' : '#14141c'
                  }}
                >
                  {/* Pro · beta Badge matching 7.webp */}
                  {isPro && (
                    <span className="absolute top-1 right-1 px-1 py-0.5 rounded bg-accent text-[7px] font-black text-white uppercase tracking-tighter shadow-sm z-10 leading-none">
                      Pro · beta
                    </span>
                  )}

                  {/* Mini Visual Preview of template matching 7.webp */}
                  <div className="w-full flex-1 rounded bg-black/30 flex items-center justify-center overflow-hidden">
                    {tType === 'clean' && (
                      <div className="space-y-0.5 text-center">
                        <div className="w-8 h-1 bg-white/60 rounded-full mx-auto" />
                        <div className="w-5 h-1 bg-accent rounded-full mx-auto" />
                      </div>
                    )}
                    {tType === 'banner' && (
                      <div className="w-10 h-3 rounded bg-accent flex items-center justify-center text-[7px] font-bold text-white">
                        STAT
                      </div>
                    )}
                    {tType === 'hud' && (
                      <div className="size-6 rounded-full border border-accent flex items-center justify-center text-[7px] text-accent">
                        BIO
                      </div>
                    )}
                    {tType === 'receipt' && (
                      <div className="space-y-0.5 text-center text-black">
                        <div className="w-7 h-0.5 bg-black/60 mx-auto" />
                        <div className="w-5 h-0.5 bg-black/40 mx-auto" />
                      </div>
                    )}
                    {tType === 'magazine' && (
                      <div className="text-[7px] font-black text-white">
                        MAG
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-[9px] font-bold truncate max-w-full mt-0.5 ${
                      tType === 'receipt' ? 'text-black' : 'text-white'
                    }`}
                  >
                    {templateNames[tType]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Story Tools Bar matching 7.webp (Layout, Text, Photo, Pro) */}
        <div className="px-4 py-1.5 flex items-center justify-around border-t border-white/10 shrink-0 text-text-muted">
          <button
            type="button"
            onClick={() => setTemplate('clean')}
            className="flex items-center gap-1 text-[11px] font-semibold hover:text-white"
          >
            <Layout size={14} />
            <span>Layout</span>
          </button>
          <button
            type="button"
            onClick={() => setTemplate('magazine')}
            className="flex items-center gap-1 text-[11px] font-semibold hover:text-white"
          >
            <Type size={14} />
            <span>Text</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              } else {
                handleCyclePhoto();
              }
            }}
            className="flex items-center gap-1 text-[11px] font-semibold hover:text-white"
            title="Upload custom photo or switch preset"
          >
            <Camera size={14} />
            <span>Photo</span>
          </button>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-accent">
            <Sparkles size={14} />
            <span>Pro</span>
          </div>
        </div>

        {/* Primary Instagram Share CTA matching 7.webp */}
        <div className="p-4 pt-2 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="w-full py-3.5 rounded-2xl bg-accent text-on-accent font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition"
          >
            <Share2 size={16} />
            <span>{t('share_instagram')}</span>
          </button>

          {copiedNotification && (
            <div className="text-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 animate-in fade-in flex items-center justify-center gap-1">
              <Check size={13} />
              <span>{t('copied_alert')}</span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
