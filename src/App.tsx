import React, { useState, useEffect } from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import { LiquidBottomNav } from './components/LiquidBottomNav';
import { RestTimerBar } from './components/RestTimerBar';
import { ActiveSessionStrip } from './components/ActiveSessionStrip';
import { WorkoutSummaryModal } from './components/WorkoutSummaryModal';
import { OnboardingModal } from './components/OnboardingModal';
import { HomeView } from './components/HomeView';
import { WorkoutView } from './components/WorkoutView';
import { ExercisesView } from './components/ExercisesView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

const MainApp: React.FC = () => {
  const { activeTab, settings, updateSettings } = useWorkout();
  const [showOnboarding, setShowOnboarding] = useState(!settings.hasSeenOnboarding);

  // Initialize Mobile Native Status Bar & Splash Screen
  useEffect(() => {
    const isLight = settings.theme === 'light';
    StatusBar.setStyle({ style: isLight ? Style.Light : Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: isLight ? '#f4f5f8' : '#08080a' }).catch(() => {});
    SplashScreen.hide().catch(() => {});
  }, [settings.theme]);

  return (
    <div className="min-h-screen bg-bg text-text relative selection:bg-accent selection:text-on-accent overflow-x-hidden pt-[env(safe-area-inset-top,0px)]">

      {/* Onboarding Carousel Overlay */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={() => {
            setShowOnboarding(false);
            updateSettings({ hasSeenOnboarding: true });
          }}
        />
      )}

      {/* Main View Container with Smooth View Fade */}
      <main className="w-full relative z-10 transition-opacity duration-200 pb-[var(--bottom-nav-clearance)]">
        <div key={activeTab} className="animate-in fade-in duration-150">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'workout' && <WorkoutView />}
          {activeTab === 'exercises' && <ExercisesView />}
          {(activeTab === 'history' || activeTab === 'profile') && <HistoryView />}
          {activeTab === 'settings' && (
            <SettingsView onReplayOnboarding={() => setShowOnboarding(true)} />
          )}
        </div>
      </main>

      {/* Always-visible training context while a session runs */}
      <ActiveSessionStrip />

      {/* Floating Dynamic Rest Timer Bar */}
      <RestTimerBar />

      {/* Liquid Bottom Navigation */}
      <LiquidBottomNav />

      {/* Workout Completion Summary Celebration Modal */}
      <WorkoutSummaryModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <WorkoutProvider>
      <MainApp />
    </WorkoutProvider>
  );
};

export default App;
