import React, { useState } from 'react';
import { WorkoutProvider, useWorkout } from './context/WorkoutContext';
import { LiquidBottomNav } from './components/LiquidBottomNav';
import { RestTimerBar } from './components/RestTimerBar';
import { WorkoutSummaryModal } from './components/WorkoutSummaryModal';
import { OnboardingModal } from './components/OnboardingModal';
import { HomeView } from './components/HomeView';
import { WorkoutView } from './components/WorkoutView';
import { ExercisesView } from './components/ExercisesView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';

const MainApp: React.FC = () => {
  const { activeTab, settings, updateSettings } = useWorkout();
  const [showOnboarding, setShowOnboarding] = useState(!settings.hasSeenOnboarding);

  return (
    <div className="min-h-screen bg-bg text-text relative selection:bg-accent selection:text-on-accent">
      {/* Onboarding Carousel Overlay */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={() => {
            setShowOnboarding(false);
            updateSettings({ hasSeenOnboarding: true });
          }}
        />
      )}

      {/* Main View Container */}
      <main className="w-full">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'workout' && <WorkoutView />}
        {activeTab === 'exercises' && <ExercisesView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'settings' && (
          <SettingsView onReplayOnboarding={() => setShowOnboarding(true)} />
        )}
      </main>

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
