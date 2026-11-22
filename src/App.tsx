import React, { useState, useEffect, Suspense, lazy } from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import { LiquidBottomNav } from './components/LiquidBottomNav';
import { RestTimerBar } from './components/RestTimerBar';
import { ActiveSessionStrip } from './components/ActiveSessionStrip';
import { HomeView } from './components/HomeView';
import { UpdateToast } from './components/UpdateToast';
import { InstallPrompt } from './components/InstallPrompt';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Secondary screens and overlays load on demand to keep the initial bundle small.
const WorkoutView = lazy(() => import('./components/WorkoutView').then(m => ({ default: m.WorkoutView })));
const ExercisesView = lazy(() => import('./components/ExercisesView').then(m => ({ default: m.ExercisesView })));
const HistoryView = lazy(() => import('./components/HistoryView').then(m => ({ default: m.HistoryView })));
const SettingsView = lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));
const OnboardingModal = lazy(() => import('./components/OnboardingModal').then(m => ({ default: m.OnboardingModal })));
const WorkoutSummaryModal = lazy(() => import('./components/WorkoutSummaryModal').then(m => ({ default: m.WorkoutSummaryModal })));

const ViewFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
  </div>
);

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
        <Suspense fallback={null}>
          <OnboardingModal
            onComplete={() => {
              setShowOnboarding(false);
              updateSettings({ hasSeenOnboarding: true });
            }}
          />
        </Suspense>
      )}

      {/* Main View Container with Smooth View Fade */}
      <main className="w-full relative z-10 transition-opacity duration-200 pb-[var(--bottom-nav-clearance)]">
        <div key={activeTab} className="animate-in fade-in duration-150">
          <Suspense fallback={<ViewFallback />}>
            {activeTab === 'home' && <HomeView />}
            {activeTab === 'workout' && <WorkoutView />}
            {activeTab === 'exercises' && <ExercisesView />}
            {(activeTab === 'history' || activeTab === 'profile') && <HistoryView />}
            {activeTab === 'settings' && (
              <SettingsView onReplayOnboarding={() => setShowOnboarding(true)} />
            )}
          </Suspense>
        </div>
      </main>

      {/* Always-visible training context while a session runs */}
      <ActiveSessionStrip />

      {/* Floating Dynamic Rest Timer Bar */}
      <RestTimerBar />

      {/* Liquid Bottom Navigation */}
      <LiquidBottomNav />

      {/* Prompts a reload when a new service worker is ready */}
      <UpdateToast />

      {/* Offers PWA install once the browser allows it */}
      <InstallPrompt />

      {/* Workout Completion Summary Celebration Modal */}
      <Suspense fallback={null}>
        <WorkoutSummaryModal />
      </Suspense>
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
