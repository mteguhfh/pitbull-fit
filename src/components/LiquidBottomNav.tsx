import React from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { Home, Dumbbell, BookOpen, Calendar, Settings, Play } from 'lucide-react';

export const LiquidBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeWorkout, startWorkout } = useWorkout();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 mx-auto max-w-[500px] px-4 pb-4 pointer-events-auto">
      <div className="relative">
        {/* Floating Center Elevated FAB */}
        <div className="absolute left-1/2 -top-5 -translate-x-1/2 z-40">
          <button
            type="button"
            onClick={() => {
              if (activeWorkout) {
                setActiveTab('workout');
              } else {
                startWorkout(undefined, 'Quick Workout');
              }
            }}
            className="group relative flex size-14 items-center justify-center rounded-full bg-accent text-on-accent shadow-[0_0_24px_rgba(204,255,0,0.5)] transition-all duration-300 hover:scale-105 active:scale-95"
            title={activeWorkout ? 'Resume Active Workout' : 'Start Workout'}
          >
            {activeWorkout ? (
              <span className="relative flex items-center justify-center">
                <Dumbbell size={26} className="animate-bounce" />
                <span className="absolute -top-1 -right-1 size-3 rounded-full bg-red-500 ring-2 ring-bg animate-ping" />
              </span>
            ) : (
              <Play size={24} className="fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Liquid Glass Dock Bar */}
        <div
          className="relative flex items-center justify-between rounded-2xl p-1.5 backdrop-blur-xl border border-line"
          style={{
            background: 'color-mix(in oklab, #09090b 80%, transparent)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 16px 40px rgba(0, 0, 0, 0.7)'
          }}
        >
          {/* Home */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 ${
              activeTab === 'home' ? 'text-accent font-bold' : 'text-text-muted hover:text-text'
            }`}
          >
            <Home size={20} className={activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
            <span className="text-[10px] mt-1">Home</span>
          </button>

          {/* Workout / Routines */}
          <button
            type="button"
            onClick={() => setActiveTab('workout')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 mr-8 ${
              activeTab === 'workout' ? 'text-accent font-bold' : 'text-text-muted hover:text-text'
            }`}
          >
            <Dumbbell size={20} className={activeTab === 'workout' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
            <span className="text-[10px] mt-1">Workout</span>
          </button>

          {/* Exercises */}
          <button
            type="button"
            onClick={() => setActiveTab('exercises')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 ml-8 ${
              activeTab === 'exercises' ? 'text-accent font-bold' : 'text-text-muted hover:text-text'
            }`}
          >
            <BookOpen size={20} className={activeTab === 'exercises' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
            <span className="text-[10px] mt-1">Exercises</span>
          </button>

          {/* History */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 ${
              activeTab === 'history' ? 'text-accent font-bold' : 'text-text-muted hover:text-text'
            }`}
          >
            <Calendar size={20} className={activeTab === 'history' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
            <span className="text-[10px] mt-1">History</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-200 ${
              activeTab === 'settings' ? 'text-accent font-bold' : 'text-text-muted hover:text-text'
            }`}
          >
            <Settings size={20} className={activeTab === 'settings' ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
            <span className="text-[10px] mt-1">Settings</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
