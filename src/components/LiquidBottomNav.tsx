import React from 'react';
import { Card } from './Card';
import { useWorkout } from '../context/WorkoutContext';
import { Home, ClipboardList, Dumbbell, Search, Hexagon, Timer } from 'lucide-react';

export const LiquidBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeWorkout, startWorkout, t } = useWorkout();

  const handleFabClick = () => {
    if (activeWorkout) {
      setActiveTab('workout');
    } else {
      startWorkout(undefined, 'Quick Strength Session');
    }
  };

  const isHome = activeTab === 'home';
  const isWorkout = activeTab === 'workout';
  const isExercises = activeTab === 'exercises';
  const isProfile = activeTab === 'profile' || activeTab === 'history';

  const totalSets = activeWorkout
    ? activeWorkout.exercises.reduce((acc, e) => acc + e.sets.length, 0)
    : 0;
  const completedSets = activeWorkout
    ? activeWorkout.exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.completed).length, 0)
    : 0;
  const completionRatio = totalSets > 0 ? completedSets / totalSets : 0;
  const circumference = 2 * Math.PI * 20; // ~125.66
  const strokeDashoffset = circumference * (1 - Math.max(0.12, completionRatio));

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] mx-auto max-w-[480px] px-3 pointer-events-auto select-none">
      <div className="relative">
        {/* Floating Center Elevated Action FAB matching Abot screenshots */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-30 pointer-events-none">
          <button
            type="button"
            onClick={handleFabClick}
            className={`pointer-events-auto relative size-14 rounded-full flex items-center justify-center transition duration-200 active:scale-90 ${
              activeWorkout
                ? 'bg-[#13131c] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.85)]'
                : 'bg-accent text-on-accent border border-on-accent/20 hover:scale-105'
            }`}
            title={activeWorkout ? t('nav_active_workout') : t('nav_start_workout')}
          >
            {activeWorkout ? (
              <>
                {/* Segmented/dashed circular progress ring matching 5.webp */}
                <svg className="absolute inset-0 size-full -rotate-90 pointer-events-none p-0.5" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                    className="text-white/20"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={`${strokeDashoffset}`}
                    strokeLinecap="round"
                    className="text-accent transition duration-300"
                  />
                </svg>
                <Timer size={22} className="text-accent stroke-[2.5]" />
              </>
            ) : (
              <Dumbbell size={22} className="stroke-[2.5] -rotate-45" />
            )}
          </button>
        </div>

        {/* Real Refracting Liquid Glass Dock Container */}
        <Card
          radius="sheet"
          padding="4px 6px"
          variant="raised"
          className="relative grid grid-cols-[1fr_1fr_56px_1fr_1fr] items-center min-h-[var(--bottom-nav-height)]"
        >
          {/* TAB 1: HOME */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition duration-200 active:scale-95 ${
              isHome
                ? 'bg-accent/12 border border-accent/30 shadow-sm'
                : 'border border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Home
              size={19}
              className={isHome ? 'stroke-[2.5] text-accent' : 'stroke-[1.8] text-text-muted'}
            />
            <span
              className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] transition-colors ${
                isHome ? 'text-accent font-bold' : 'text-text-muted font-medium'
              }`}
            >
              {t('nav_home')}
            </span>
          </button>

          {/* TAB 2: WORKOUT (ClipboardList Icon matching Abot) */}
          <button
            type="button"
            onClick={() => setActiveTab('workout')}
            className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition duration-200 active:scale-95 ${
              isWorkout
                ? 'bg-accent/12 border border-accent/30 shadow-sm'
                : 'border border-transparent text-text-muted hover:text-text'
            }`}
          >
            <div className="relative">
              {activeWorkout && (
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-accent ring-2 ring-surface z-10" />
              )}
              <ClipboardList
                size={19}
                className={isWorkout ? 'stroke-[2.5] text-accent' : 'stroke-[1.8] text-text-muted'}
              />
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] transition-colors ${
                isWorkout ? 'text-accent font-bold' : 'text-text-muted font-medium'
              }`}
            >
              {t('nav_workout')}
            </span>
          </button>

          {/* CENTER DEDICATED SPACER (Symmetrical column for the elevated center FAB) */}
          <div className="w-14 h-11 pointer-events-none" aria-hidden="true" />

          {/* TAB 3: EXERCISES (Search Icon matching Abot) */}
          <button
            type="button"
            onClick={() => setActiveTab('exercises')}
            className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition duration-200 active:scale-95 ${
              isExercises
                ? 'bg-accent/12 border border-accent/30 shadow-sm'
                : 'border border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Search
              size={19}
              className={isExercises ? 'stroke-[2.5] text-accent' : 'stroke-[1.8] text-text-muted'}
            />
            <span
              className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] transition-colors ${
                isExercises ? 'text-accent font-bold' : 'text-text-muted font-medium'
              }`}
            >
              {t('nav_exercises')}
            </span>
          </button>

          {/* TAB 4: PROFILE (Hexagon Icon matching Abot 4.webp) */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition duration-200 active:scale-95 ${
              isProfile
                ? 'bg-accent/12 border border-accent/30 shadow-sm'
                : 'border border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Hexagon
              size={19}
              className={isProfile ? 'stroke-[2.5] text-accent fill-accent/15' : 'stroke-[1.8] text-text-muted'}
            />
            <span
              className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] transition-colors ${
                isProfile ? 'text-accent font-bold' : 'text-text-muted font-medium'
              }`}
            >
              {t('nav_profile')}
            </span>
          </button>
        </Card>
      </div>
    </nav>
  );
};
