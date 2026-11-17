import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { Check, Dumbbell, ShieldCheck, WifiOff, Trophy, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const { settings, updateSettings } = useWorkout();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slide 1 interactive demo state
  const [demoSet2Done, setDemoSet2Done] = useState(false);

  // Slide 2 rest timer demo state
  const [demoRestSeconds, setDemoRestSeconds] = useState(85);

  const slides = [
    {
      title: 'Log a set in one tap',
      description: 'Type weight and reps, tap the check. Last time sits beside each set.',
      renderVisual: () => (
        <div className="w-full max-w-[340px] rounded-2xl bg-surface p-4 border border-line shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="size-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
              <Dumbbell size={20} />
            </div>
            <div>
              <span className="block text-sm font-bold text-text">Bench Press</span>
              <span className="block text-xs text-text-muted">Chest · Barbell</span>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[36px_1fr_60px_48px_40px] gap-2 px-1 text-[11px] font-semibold text-text-muted mb-2 text-center">
            <span>Set</span>
            <span className="text-left">Last time</span>
            <span>{settings.weightUnit}</span>
            <span>Reps</span>
            <span></span>
          </div>

          {/* Sets list */}
          <div className="space-y-2">
            {/* Set 1: Done */}
            <div className="grid grid-cols-[36px_1fr_60px_48px_40px] items-center gap-2 p-1.5 rounded-xl border border-accent/30 bg-accent/10">
              <span className="size-8 rounded-lg bg-surface-2 flex items-center justify-center text-xs font-bold text-accent">
                1
              </span>
              <span className="text-[11px] font-mono text-text-muted text-left">80 × 8</span>
              <div className="h-9 rounded-lg bg-bg border border-line flex items-center justify-center text-sm font-bold font-mono">
                80
              </div>
              <div className="h-9 rounded-lg bg-bg border border-line flex items-center justify-center text-sm font-bold font-mono">
                8
              </div>
              <div className="size-9 rounded-xl bg-accent text-on-accent flex items-center justify-center shadow-[0_0_12px_rgba(204,255,0,0.4)]">
                <Check size={18} className="stroke-[3]" />
              </div>
            </div>

            {/* Set 2: Interactive Demo */}
            <div
              className={`grid grid-cols-[36px_1fr_60px_48px_40px] items-center gap-2 p-1.5 rounded-xl border transition-all duration-300 ${
                demoSet2Done ? 'border-accent/40 bg-accent/10' : 'border-line bg-surface-2/60'
              }`}
            >
              <span
                className={`size-8 rounded-lg bg-surface-2 flex items-center justify-center text-xs font-bold ${
                  demoSet2Done ? 'text-accent' : 'text-text-muted'
                }`}
              >
                2
              </span>
              <div className="text-left">
                {demoSet2Done ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pr">
                    <Trophy size={11} /> PR
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-text-muted">80 × 8</span>
                )}
              </div>
              <div className="h-9 rounded-lg bg-bg border border-line flex items-center justify-center text-sm font-bold font-mono text-text">
                82.5
              </div>
              <div className="h-9 rounded-lg bg-bg border border-line flex items-center justify-center text-sm font-bold font-mono text-text">
                8
              </div>
              <button
                type="button"
                onClick={() => setDemoSet2Done(!demoSet2Done)}
                className={`size-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                  demoSet2Done
                    ? 'bg-accent text-on-accent shadow-[0_0_12px_rgba(204,255,0,0.5)]'
                    : 'bg-surface-3 text-text-muted hover:text-text border border-line'
                }`}
                title="Tap check to complete"
              >
                <Check size={18} className={demoSet2Done ? 'stroke-[3]' : 'stroke-[2]'} />
              </button>
            </div>
          </div>

          {/* Unit Toggle in Slide 1 */}
          <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">Weights in:</span>
            <div className="flex bg-surface-2 p-0.5 rounded-full border border-line">
              <button
                type="button"
                onClick={() => updateSettings({ weightUnit: 'kg' })}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  settings.weightUnit === 'kg' ? 'bg-accent text-on-accent' : 'text-text-muted hover:text-text'
                }`}
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ weightUnit: 'lbs' })}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  settings.weightUnit === 'lbs' ? 'bg-accent text-on-accent' : 'text-text-muted hover:text-text'
                }`}
              >
                lbs
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Rest sits by your thumb',
      description: 'Tick a set and rest starts counting down, right where you need it.',
      renderVisual: () => (
        <div className="w-full max-w-[340px] flex flex-col items-center">
          <div className="w-full rounded-2xl bg-surface p-4 border border-accent/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Rest Time</span>
              <span className="text-2xl font-black font-mono text-accent">
                {Math.floor(demoRestSeconds / 60)}:{(demoRestSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${(demoRestSeconds / 90) * 100}%` }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDemoRestSeconds((s) => Math.max(5, s - 15))}
                className="flex-1 py-2 rounded-xl bg-surface-2 text-xs font-bold text-text hover:bg-surface-3 transition-colors border border-line"
              >
                -15s
              </button>
              <button
                type="button"
                onClick={() => setDemoRestSeconds((s) => Math.min(180, s + 15))}
                className="flex-1 py-2 rounded-xl bg-surface-2 text-xs font-bold text-text hover:bg-surface-3 transition-colors border border-line"
              >
                +15s
              </button>
            </div>
          </div>
          <p className="text-xs text-text-muted text-center italic">
            Automatic sound alerts notify you when you are ready for the next heavy set.
          </p>
        </div>
      )
    },
    {
      title: 'Your training stays on this device',
      description: 'Zero login required. 100% offline-first, private, and lightning fast.',
      renderVisual: () => (
        <div className="w-full max-w-[340px] rounded-2xl bg-surface p-5 border border-line shadow-2xl space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-line">
            <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
              <WifiOff size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-text">Works 100% Offline</p>
              <p className="text-xs text-text-muted">No spotty gym Wi-Fi dropouts ever.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-line">
            <div className="size-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-text">Private & Secure</p>
              <p className="text-xs text-text-muted">Export your data backup anytime with 1-click JSON.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      updateSettings({ hasSeenOnboarding: true });
      onComplete();
    }
  };

  const handleSkip = () => {
    updateSettings({ hasSeenOnboarding: true });
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-bg px-6 py-8 overflow-hidden">
      {/* Top Header & Indicator */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-accent text-on-accent flex items-center justify-center font-black text-sm">
              PF
            </div>
            <span className="font-extrabold tracking-tight text-base text-text">PITBULL FIT</span>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-text-muted hover:text-text transition-colors px-3 py-1.5 rounded-full bg-surface-2 border border-line"
          >
            Skip intro
          </button>
        </div>

        {/* Progress Bars */}
        <div className="flex gap-1.5">
          {slides.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full bg-accent transition-all duration-300 ${idx <= currentSlide ? 'w-full' : 'w-0'}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Slide Visual Content */}
      <div className="my-auto flex flex-col items-center justify-center py-4">
        <div className="w-full flex justify-center mb-6">{slide.renderVisual()}</div>

        <h2 className="text-2xl sm:text-3xl font-black text-text text-center tracking-tight leading-snug">
          {slide.title}
        </h2>
        <p className="text-sm text-text-muted text-center max-w-xs mt-2 leading-relaxed">
          {slide.description}
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="w-full h-13 py-3.5 rounded-xl bg-accent text-on-accent font-black text-base flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(204,255,0,0.3)] hover:brightness-110 active:scale-[0.99] transition-all"
        >
          {currentSlide === slides.length - 1 ? 'Start Training' : 'Next'}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
