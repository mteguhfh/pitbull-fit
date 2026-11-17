import React from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { Timer, Plus, Minus, X } from 'lucide-react';

export const RestTimerBar: React.FC = () => {
  const { restTimer, adjustRestTimer, skipRestTimer } = useWorkout();

  if (!restTimer.isActive) return null;

  const minutes = Math.floor(restTimer.remainingSeconds / 60);
  const seconds = restTimer.remainingSeconds % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const progressPct = Math.min(100, Math.max(0, (restTimer.remainingSeconds / restTimer.totalSeconds) * 100));

  return (
    <div className="fixed bottom-[88px] inset-x-0 mx-auto max-w-[500px] px-4 z-40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="relative overflow-hidden rounded-2xl bg-surface/90 backdrop-blur-xl border border-accent/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] p-3 text-text">
        {/* Depleting neon progress line at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-800">
          <div
            className="h-full bg-accent transition-all duration-300 shadow-[0_0_8px_#ccff00]"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Left: Icon & Label */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-9 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent shrink-0">
              <Timer size={18} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                {restTimer.exerciseName ? `Rest · ${restTimer.exerciseName}` : 'Rest Timer'}
              </span>
              <span className="text-2xl font-black font-mono tracking-tight text-accent leading-none">
                {timeFormatted}
              </span>
            </div>
          </div>

          {/* Right: Quick adjustment buttons & Skip */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => adjustRestTimer(-15)}
              className="h-9 px-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold text-text-muted hover:text-text transition-colors flex items-center gap-0.5 active:scale-95"
              title="Subtract 15 seconds"
            >
              <Minus size={12} />
              15s
            </button>
            <button
              type="button"
              onClick={() => adjustRestTimer(15)}
              className="h-9 px-2.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold text-text-muted hover:text-text transition-colors flex items-center gap-0.5 active:scale-95"
              title="Add 15 seconds"
            >
              <Plus size={12} />
              15s
            </button>
            <button
              type="button"
              onClick={skipRestTimer}
              className="size-9 rounded-lg bg-surface-2 hover:bg-red-500/20 border border-line hover:border-red-500/40 text-text-muted hover:text-red-400 transition-colors flex items-center justify-center active:scale-95 ml-1"
              title="Skip rest"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
