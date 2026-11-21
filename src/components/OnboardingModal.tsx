import React, { useState, useRef } from 'react';
import { Card } from './Card';
import { useWorkout } from '../context/WorkoutContext';
import {
  Check,
  Dumbbell,
  ShieldCheck,
  WifiOff,
  Trophy,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Activity,
  Sparkles,
  Scale,
  Flame,
  Globe
} from 'lucide-react';
import { PitbullLogo } from './PitbullLogo';
import { calculateBMI, lbsToKg, kgToLbs, BMICategory, FitnessGoal, Gender } from '../utils/bmi';

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const { settings, updateSettings, language, setLanguage, t } = useWorkout();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Swipe & Drag Gesture State
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isPointerDownRef = useRef(false);
  const isHorizontalGestureRef = useRef<boolean | null>(null);

  // BMI Calculation State
  const [gender, setGender] = useState<Gender>(settings.profile?.gender || 'male');
  const [age, setAge] = useState<number>(settings.profile?.age || 25);
  const [heightCm, setHeightCm] = useState<number>(settings.profile?.heightCm || 175);
  const [weight, setWeight] = useState<number>(settings.profile?.weightKg || 70);
  const [unit, setUnit] = useState<'kg' | 'lbs'>(settings.weightUnit || 'kg');
  const [goal, setGoal] = useState<FitnessGoal>(settings.profile?.goal || 'maintain');

  // Interactive workout demo state
  const [demoSet2Done, setDemoSet2Done] = useState(false);
  const [demoRestSeconds, setDemoRestSeconds] = useState(85);

  // Calculate live BMI
  const weightInKg = unit === 'lbs' ? lbsToKg(weight) : weight;
  const bmiResult = calculateBMI(weightInKg, heightCm, age, gender, goal);

  // Sync profile when BMI values change
  const saveProfileData = () => {
    updateSettings({
      weightUnit: unit,
      profile: {
        heightCm,
        weightKg: weightInKg,
        age,
        gender,
        bmi: bmiResult.bmi,
        bmiCategory: bmiResult.category,
        goal,
        dailyCalories: bmiResult.dailyCalories,
        dailyProteinGrams: bmiResult.dailyProteinGrams
      }
    });
  };

  const getBmiColor = (cat: BMICategory) => {
    switch (cat) {
      case 'underweight':
        return '#38bdf8'; // Sky blue
      case 'normal':
        return '#10b981'; // Emerald
      case 'overweight':
        return '#f59e0b'; // Amber
      case 'obese':
        return '#ef4444'; // Red
    }
  };

  // BMI Gauge needle position: mapping BMI 14 - 38 to 0% - 100%
  const getBmiPositionPercent = (bmi: number): number => {
    const minBmi = 14;
    const maxBmi = 38;
    const clamped = Math.max(minBmi, Math.min(maxBmi, bmi));
    return ((clamped - minBmi) / (maxBmi - minBmi)) * 100;
  };

  const slides = [
    // SLIDE 0: WELCOME & LANGUAGE SELECTION
    {
      title: t('onboarding_title_0'),
      description: t('onboarding_desc_0'),
      renderVisual: () => (
        <div className="w-full max-w-[340px] flex flex-col items-center">
          <div className="mb-4 animate-subtle-float">
            <PitbullLogo size={76} />
          </div>

          {/* Language Selector Pill in Rich Solid Liquid Glass */}
          <Card
            radius="card"
            padding="16px"
            variant="raised"
            className="w-full space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-bold text-text-muted">
              <span className="flex items-center gap-1.5">
                <Globe size={14} className="text-accent" />
                {t('select_language')}
              </span>
              <span className="uppercase text-accent font-black">{language}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  language === 'id'
                    ? 'bg-accent text-on-accent scale-[1.02]'
                    : 'bg-surface-2 text-text-muted hover:text-text border border-line'
                }`}
              >
                <span>🇮🇩</span>
                <span>Bahasa Indonesia</span>
              </button>

              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  language === 'en'
                    ? 'bg-accent text-on-accent scale-[1.02]'
                    : 'bg-surface-2 text-text-muted hover:text-text border border-line'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </Card>
        </div>
      )
    },

    // SLIDE 1: INTERACTIVE BMI & PHYSIOLOGICAL CALCULATION
    {
      title: t('onboarding_title_1'),
      description: t('onboarding_desc_1'),
      renderVisual: () => (
        <Card
          radius="card"
          padding="16px"
          variant="raised"
          className="w-full max-w-[340px] space-y-3.5 max-h-[50vh] overflow-y-auto scrollbar-none"
        >
          {/* Gender & Age Row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] font-bold text-text-muted block mb-1">
                {t('gender_label')}
              </span>
              <div className="flex bg-surface-2 p-0.5 rounded-xl border border-line">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold transition ${
                    gender === 'male' ? 'bg-accent text-on-accent' : 'text-text-muted'
                  }`}
                >
                  {t('gender_male')}
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold transition ${
                    gender === 'female' ? 'bg-accent text-on-accent' : 'text-text-muted'
                  }`}
                >
                  {t('gender_female')}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-text-muted block mb-1">
                {t('age_label')}
              </span>
              <div className="flex items-center rounded-xl bg-surface-2 border border-line px-3 py-1">
                <input
                  type="number"
                  min={12}
                  max={99}
                  value={age}
                  onChange={(e) => setAge(Math.max(12, Math.min(99, Number(e.target.value))))}
                  className="w-full bg-transparent text-sm font-black font-mono text-text outline-none"
                />
                <span className="text-xs text-text-muted">th</span>
              </div>
            </div>
          </div>

          {/* Height & Weight Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] font-bold text-text-muted block mb-1">
                {t('height_label')}
              </span>
              <div className="flex items-center rounded-xl bg-surface-2 border border-line px-3 py-1">
                <input
                  type="number"
                  min={100}
                  max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(100, Math.min(250, Number(e.target.value))))}
                  className="w-full bg-transparent text-sm font-black font-mono text-text outline-none"
                />
                <span className="text-xs text-text-muted">cm</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-text-muted">
                  {t('weight_label')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (unit === 'kg') {
                      setUnit('lbs');
                      setWeight(Math.round(kgToLbs(weight)));
                    } else {
                      setUnit('kg');
                      setWeight(Math.round(lbsToKg(weight)));
                    }
                  }}
                  className="text-[10px] font-black text-accent uppercase hover:underline"
                >
                  {unit} ⇆
                </button>
              </div>
              <div className="flex items-center rounded-xl bg-surface-2 border border-line px-3 py-1">
                <input
                  type="number"
                  min={30}
                  max={300}
                  value={weight}
                  onChange={(e) => setWeight(Math.max(30, Math.min(300, Number(e.target.value))))}
                  className="w-full bg-transparent text-sm font-black font-mono text-text outline-none"
                />
                <span className="text-xs text-text-muted">{unit}</span>
              </div>
            </div>
          </div>

          {/* Goal Selector */}
          <div>
            <span className="text-[11px] font-bold text-text-muted block mb-1">
              {t('goal_label')}
            </span>
            <div className="grid grid-cols-3 gap-1 bg-surface-2 p-1 rounded-xl border border-line text-[11px] font-bold">
              {(['cut', 'maintain', 'bulk'] as FitnessGoal[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={`py-1 rounded-lg capitalize transition ${
                    goal === g
                      ? 'bg-accent text-on-accent shadow-sm'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {g === 'cut' ? 'Cut' : g === 'maintain' ? 'Recomp' : 'Bulk'}
                </button>
              ))}
            </div>
          </div>

          {/* Live Dynamic BMI Score Meter & Gauge */}
          <div className="p-3 rounded-2xl bg-surface-2/90 border border-line space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  {t('current_bmi')}
                </span>
                <span className="text-2xl font-black font-mono" style={{ color: getBmiColor(bmiResult.category) }}>
                  {bmiResult.bmi}
                </span>
              </div>

              <div className="text-right">
                <span
                  className="px-3 py-0.5 rounded-full text-[11px] font-bold capitalize border inline-flex items-center justify-center whitespace-nowrap text-center"
                  style={{
                    color: getBmiColor(bmiResult.category),
                    borderColor: `${getBmiColor(bmiResult.category)}40`,
                    backgroundColor: `${getBmiColor(bmiResult.category)}15`
                  }}
                >
                  {t(`bmi_${bmiResult.category}` as any)}
                </span>
                <span className="block text-[10px] text-text-muted mt-0.5 font-medium">
                  {t('ideal_weight_range')}: {Math.round(bmiResult.idealWeightRange[0])}-{Math.round(bmiResult.idealWeightRange[1])} kg
                </span>
              </div>
            </div>

            {/* Gradient Spectrum Gauge Bar with Needle */}
            <div className="relative pt-2 pb-1">
              <div
                className="h-2 w-full rounded-full overflow-hidden"
                style={{
                  background: 'linear-gradient(to right, #38bdf8 0%, #10b981 35%, #f59e0b 70%, #ef4444 100%)'
                }}
              />
              {/* Pointer Needle Indicator */}
              <div
                className="absolute top-1 size-3.5 -ml-1.5 rounded-full bg-white border-2 border-bg shadow-[0_0_8px_rgba(255,255,255,0.9)] transition duration-300 pointer-events-none"
                style={{ left: `${getBmiPositionPercent(bmiResult.bmi)}%` }}
              />
            </div>

            {/* Daily Recommended Targets */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line text-center">
              <div className="p-1.5 rounded-lg bg-surface-3/60">
                <span className="text-[10px] text-text-muted block font-semibold">
                  {t('daily_protein')}
                </span>
                <span className="text-xs font-black font-mono text-text">
                  {bmiResult.dailyProteinGrams}g / hari
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-surface-3/60">
                <span className="text-[10px] text-text-muted block font-semibold">
                  {t('daily_calories')}
                </span>
                <span className="text-xs font-black font-mono text-text">
                  {bmiResult.dailyCalories} kcal / hari
                </span>
              </div>
            </div>
          </div>
        </Card>
      )
    },

    // SLIDE 2: QUICK ONE-TAP LOGGING
    {
      title: t('onboarding_title_2'),
      description: t('onboarding_desc_2'),
      renderVisual: () => (
        <Card
          radius="card"
          padding="18px"
          variant="raised"
          className="w-full max-w-[340px] space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-accent/20 border border-accent/35 flex items-center justify-center text-accent">
                <Dumbbell size={16} />
              </div>
              <div>
                <span className="text-xs font-black text-text block">Incline Dumbbell Press</span>
                <span className="text-[10px] text-text-muted">Chest · Dumbbell</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-accent">Interactive Demo</span>
          </div>

          {/* Set 1: Done */}
          <div className="grid grid-cols-[28px_1fr_56px_46px_36px] items-center gap-1.5 p-1 rounded-xl bg-accent/[0.08] border border-accent/30 text-xs">
            <span className="size-7 rounded-lg bg-accent/20 text-accent font-black flex items-center justify-center font-mono">
              1
            </span>
            <span className="text-[10px] font-mono text-text-muted">30 × 10</span>
            <span className="font-mono font-bold text-center text-text">32.5</span>
            <span className="font-mono font-bold text-center text-text">10</span>
            <div className="size-8 rounded-lg bg-accent text-on-accent flex items-center justify-center shadow-sm">
              <Check size={14} className="stroke-[3]" />
            </div>
          </div>

          {/* Set 2: Clickable demo */}
          <div
            onClick={() => setDemoSet2Done(!demoSet2Done)}
            className={`grid grid-cols-[28px_1fr_56px_46px_36px] items-center gap-1.5 p-1 rounded-xl border transition cursor-pointer ${
              demoSet2Done
                ? 'bg-accent/[0.08] border-accent/30'
                : 'bg-surface-2 border-line hover:border-accent/40'
            }`}
          >
            <span className="size-7 rounded-lg bg-surface-2 text-text-muted font-bold flex items-center justify-center font-mono">
              2
            </span>
            <span className="text-[10px] font-mono text-text-muted">32.5 × 10</span>
            <span className="font-mono font-bold text-center text-text">35.0</span>
            <span className="font-mono font-bold text-center text-text">8</span>
            <button
              type="button"
              className={`size-8 rounded-lg flex items-center justify-center transition ${
                demoSet2Done
                  ? 'bg-accent text-on-accent scale-105'
                  : 'bg-surface-3 text-text-muted border border-line'
              }`}
            >
              <Check size={14} className={demoSet2Done ? 'stroke-[3]' : ''} />
            </button>
          </div>

          <div className="text-center pt-1">
            <span className="text-[10px] font-semibold text-accent animate-pulse">
              {demoSet2Done ? '✓ Set logged!' : 'Tap the row above to test logging!'}
            </span>
          </div>
        </Card>
      )
    },

    // SLIDE 3: REST TIMER WITH THUMB CONTROLS
    {
      title: t('onboarding_title_3'),
      description: t('onboarding_desc_3'),
      renderVisual: () => (
        <div className="w-full max-w-[340px] space-y-3">
          <Card
            radius="card"
            padding="18px"
            variant="raised"
            className="w-full relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                Rest Timer Demo
              </span>
              <span className="size-2 rounded-full bg-accent animate-ping" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-black font-mono text-accent leading-none">
                  01:{demoRestSeconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[11px] text-text-muted block mt-1">Incline Press · Set 2</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDemoRestSeconds((prev) => Math.max(10, prev - 15))}
                  className="px-2.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line text-xs font-mono font-bold text-text active:scale-95 transition"
                >
                  -15s
                </button>
                <button
                  type="button"
                  onClick={() => setDemoRestSeconds((prev) => prev + 15)}
                  className="px-2.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line text-xs font-mono font-bold text-text active:scale-95 transition"
                >
                  +15s
                </button>
              </div>
            </div>

            {/* Simulated Countdown Bar */}
            <div className="h-1.5 w-full bg-surface-3 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition duration-300"
                style={{ width: `${Math.min(100, (demoRestSeconds / 90) * 100)}%` }}
              />
            </div>
          </Card>
        </div>
      )
    },

    // SLIDE 4: PRIVACY FIRST / 100% OFFLINE
    {
      title: t('onboarding_title_4'),
      description: t('onboarding_desc_4'),
      renderVisual: () => (
        <div className="w-full max-w-[340px] space-y-3">
          <div className="p-4 rounded-2xl bg-[#13131c]/95 border border-white/15 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-text">Zero Account Required</p>
              <p className="text-[11px] text-text-muted">No trackers, no external cloud dependencies.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#13131c]/95 border border-white/15 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
              <WifiOff size={20} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-text">{t('onboarding_title_4')}</p>
              <p className="text-[11px] text-text-muted">{t('onboarding_desc_4')}</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Pointer drag gesture handlers for seamless horizontal swiping
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, select, textarea')) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    isPointerDownRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    isHorizontalGestureRef.current = null;
    setIsDragging(false);
    setDragX(0);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    const deltaY = e.clientY - startYRef.current;

    if (isHorizontalGestureRef.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isHorizontalGestureRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalGestureRef.current) {
      // Elastic resistance at carousel ends
      if ((currentSlide === 0 && deltaX > 0) || (currentSlide === slides.length - 1 && deltaX < 0)) {
        setDragX(deltaX * 0.35);
      } else {
        setDragX(deltaX);
      }
      setIsDragging(true);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    isPointerDownRef.current = false;

    if (isHorizontalGestureRef.current && Math.abs(dragX) > 40) {
      if (dragX < 0 && currentSlide < slides.length - 1) {
        if (currentSlide === 1) saveProfileData();
        setCurrentSlide((prev) => prev + 1);
      } else if (dragX > 0 && currentSlide > 0) {
        setCurrentSlide((prev) => prev - 1);
      }
    }
    setDragX(0);
    setIsDragging(false);
    isHorizontalGestureRef.current = null;
  };

  const handleNext = () => {
    if (currentSlide === 1) {
      saveProfileData();
    }

    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      saveProfileData();
      updateSettings({ hasSeenOnboarding: true });
      onComplete();
    }
  };

  const handleSkip = () => {
    saveProfileData();
    updateSettings({ hasSeenOnboarding: true });
    onComplete();
  };

  const jumpToSlide = (idx: number) => {
    if (currentSlide === 1) saveProfileData();
    setCurrentSlide(idx);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-bg px-6 py-6 overflow-hidden select-none">
      {/* Top Header & Interactive Indicator Bars */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <PitbullLogo size={32} showText={true} />
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-text-muted hover:text-text transition-colors px-3 py-1.5 rounded-full bg-surface-2 border border-line"
          >
            {t('skip_btn')}
          </button>
        </div>

        {/* Progress Bars (clickable to jump) */}
        <div className="flex gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => jumpToSlide(idx)}
              className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden cursor-pointer"
              title={`Slide ${idx + 1}`}
            >
              <div
                className={`h-full bg-accent transition duration-300 ${
                  idx <= currentSlide ? 'w-full' : 'w-0'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* HORIZONTAL SWIPE CAROUSEL VIEWPORT */}
      <div
        className="my-auto w-full overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="flex w-full"
          style={{
            transform: `translate3d(calc(-${currentSlide * 100}% + ${dragX}px), 0, 0)`,
            transition: isDragging ? 'none' : 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {slides.map((s, idx) => (
            <div
              key={idx}
              className="w-full shrink-0 flex flex-col items-center justify-center px-1"
            >
              <div className="w-full flex justify-center mb-4">{s.renderVisual()}</div>

              <h2 className="text-2xl sm:text-3xl font-black text-text text-center tracking-tight leading-snug">
                {s.title}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted text-center max-w-xs mt-2 leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA with Swipe Navigation Arrows */}
      <div className="pt-2 space-y-3">
        {/* Swipe Hint & Navigation Controls */}
        <div className="flex items-center justify-between text-xs text-text-muted px-1">
          <button
            type="button"
            onClick={() => currentSlide > 0 && setCurrentSlide((prev) => prev - 1)}
            disabled={currentSlide === 0}
            className={`flex items-center gap-1 font-semibold transition-opacity ${
              currentSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-80 hover:opacity-100'
            }`}
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          <span className="text-[11px] font-mono font-bold text-text-muted">
            {currentSlide + 1} / {slides.length}
          </span>

          <button
            type="button"
            onClick={() => currentSlide < slides.length - 1 && handleNext()}
            disabled={currentSlide === slides.length - 1}
            className={`flex items-center gap-1 font-semibold transition-opacity ${
              currentSlide === slides.length - 1
                ? 'opacity-0 pointer-events-none'
                : 'opacity-80 hover:opacity-100'
            }`}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-full h-14 py-3.5 rounded-xl bg-accent text-on-accent font-black text-base flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition"
        >
          {currentSlide === slides.length - 1 ? t('start_training_btn') : t('next_btn')}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
