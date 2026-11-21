import React from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { PitbullLogo } from './PitbullLogo';
import { HomeSwipeWidget } from './HomeSwipeWidget';
import { RecoveryCard } from './RecoveryCard';
import { WeeklyCalendarStrip } from './WeeklyCalendarStrip';
import { Sun, Moon, Bell } from 'lucide-react';
import { soundFx } from '../utils/audio';

/**
 * Home answers three questions in order: where am I in the week,
 * what am I training right now, and how is the body doing.
 */
export const HomeView: React.FC = () => {
  const { settings, updateSettings, setActiveTab, language, setLanguage } = useWorkout();

  const isDark = settings.theme !== 'light';

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  const toggleTheme = () => {
    updateSettings({ theme: isDark ? 'light' : 'dark' });
    if (settings.soundEnabled) soundFx.playTap();
  };

  return (
    <div className="pb-4 pt-2 px-4 max-w-[500px] mx-auto space-y-3 select-none">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={toggleTheme}
          className="size-9 rounded-full bg-surface-2 hover:bg-surface-3 border border-line flex items-center justify-center text-text-muted hover:text-text transition active:scale-90"
          title={isDark ? (language === 'id' ? 'Beralih ke Mode Terang' : 'Switch to Light Mode') : (language === 'id' ? 'Beralih ke Mode Gelap' : 'Switch to Dark Mode')}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun size={17} className="text-amber-600 dark:text-amber-400 hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon size={17} className="text-indigo-500 hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        <PitbullLogo size={36} showText={true} />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-line text-[11px] font-bold text-text-muted hover:text-text transition-colors active:scale-95"
            title="Switch Language / Ganti Bahasa"
          >
            <span>{language === 'id' ? '🇮🇩' : '🇬🇧'}</span>
            <span className="uppercase text-text font-black">{language}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workout')}
            className="size-9 rounded-full bg-surface-2 hover:bg-surface-3 border border-line relative flex items-center justify-center text-text-muted hover:text-text transition-colors active:scale-95"
            title="Notifications"
          >
            <Bell size={17} />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-accent" />
          </button>
        </div>
      </div>

      <WeeklyCalendarStrip />

      {/* Session deck: current session, week stats, body/recovery */}
      <HomeSwipeWidget
        onOpenRecovery={() => setActiveTab('exercises')}
        onOpenHistory={() => setActiveTab('history')}
      />

      <RecoveryCard />
    </div>
  );
};
