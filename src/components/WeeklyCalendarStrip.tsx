import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { SlidersHorizontal, Flame } from 'lucide-react';
import { MuscleAnatomy } from './MuscleAnatomy';
import { MuscleGroup } from '../types';

const SPLIT_MUSCLE_MAP: Record<string, MuscleGroup[]> = {
  Push: ['chest', 'shoulders', 'triceps'],
  Pull: ['back', 'biceps'],
  Legs: ['quads', 'hamstrings', 'glutes', 'calves'],
  Upper: ['chest', 'back', 'shoulders', 'biceps', 'triceps']
};

interface DaySchedule {
  dayName: string;
  dayInitial: string;
  dateNum: number;
  dateObj: Date;
  isToday: boolean;
  scheduledRoutine?: string;
  isRest: boolean;
}

export const WeeklyCalendarStrip: React.FC = () => {
  const { language, routines, setActiveTab, getStreakWeeks } = useWorkout();
  const streak = getStreakWeeks();

  // Calculate current week days (Monday - Sunday)
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(() => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday
    return day === 0 ? 6 : day - 1; // 0-indexed starting Monday
  });

  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const currentMondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() + currentMondayOffset);

  const dayInitialsEN = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayInitialsID = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];
  const dayInitials = language === 'id' ? dayInitialsID : dayInitialsEN;

  const monthYearString = now.toLocaleDateString(
    language === 'id' ? 'id-ID' : 'en-US',
    { month: 'long', year: 'numeric' }
  );

  const scheduledSplits = [undefined, 'Push', 'Pull', undefined, 'Legs', 'Upper', 'Legs'];

  const days: DaySchedule[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const routineName = scheduledSplits[i];

    return {
      dayName: d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' }),
      dayInitial: dayInitials[i],
      dateNum: d.getDate(),
      dateObj: d,
      isToday,
      scheduledRoutine: routineName,
      isRest: !routineName
    };
  });

  return (
    <div className="w-full space-y-2 select-none">
      {/* Month Header & Status line matching Abot 1.webp */}
      <div className="flex items-center justify-between text-xs px-1 text-text-muted">
        <span className="font-black text-text capitalize text-sm">{monthYearString}</span>

        <div className="flex items-center gap-2">
          {/* Flame streak */}
          <span className="flex items-center gap-1 font-bold text-accent font-mono text-[11px]">
            <Flame size={13} className="fill-accent" />
            <span>{streak} wk</span>
          </span>

          {/* Schedule status */}
          <button
            type="button"
            onClick={() => setActiveTab('workout')}
            className="flex items-center gap-1 hover:text-text transition-colors text-[11px] font-semibold text-text-muted"
          >
            <span>5 days · 17:30</span>
            <SlidersHorizontal size={13} className="text-accent" />
          </button>
        </div>
      </div>

      {/* 7-Day Strip Container matching Abot 1.webp */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 items-end min-h-[84px]">
        {days.map((day, idx) => {
          const isSelected = selectedDayOffset === idx;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDayOffset(idx)}
              className="flex flex-col items-center justify-between transition focus:outline-none min-w-0"
            >
              {isSelected ? (
                /* Selected / Active Day Rounded Box with Mini Robot / Muscle Avatar matching 1.webp */
                <div className="w-full h-[88px] rounded-2xl bg-surface-2 border-2 border-accent/80 flex flex-col items-center justify-between py-1.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase">
                    {day.dayInitial}
                  </span>
                  <span className="text-xs font-black font-mono text-text">
                    {day.dateNum}
                  </span>

                  {/* Mini Muscle Silhouette Silhouette Icon inside active box matching 1.webp */}
                  <div className="w-8 h-8 rounded-lg bg-surface-3/80 border border-accent/40 flex items-center justify-center overflow-hidden p-0.5">
                    {day.scheduledRoutine && SPLIT_MUSCLE_MAP[day.scheduledRoutine] ? (
                      <MuscleAnatomy
                        compact={true}
                        showToggle={false}
                        showDetailCard={false}
                        activeView="front"
                        primaryMuscles={SPLIT_MUSCLE_MAP[day.scheduledRoutine]}
                        width={24}
                      />
                    ) : (
                      <div className="size-2 rounded-full bg-accent/60" />
                    )}
                  </div>

                  <span className="text-[9px] font-black text-accent truncate max-w-full">
                    {day.scheduledRoutine || 'Rest'}
                  </span>
                </div>
              ) : (
                /* Unselected Day */
                <div className="w-full flex flex-col items-center justify-between h-[84px] py-1 text-text-muted hover:text-text transition-colors">
                  <span className="text-[10px] font-medium uppercase opacity-75">
                    {day.dayInitial}
                  </span>
                  <span className="text-xs font-bold font-mono text-text/80">
                    {day.dateNum}
                  </span>

                  {day.scheduledRoutine ? (
                    /* Rounded squircle box with circle indicator matching 1.webp */
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="size-8 rounded-xl bg-surface-2/80 border border-line flex items-center justify-center">
                        <span className="size-3.5 rounded-full border-2 border-accent/70 flex items-center justify-center">
                          <span className="size-1 rounded-full bg-accent" />
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-text-muted mt-1 truncate max-w-full capitalize">
                        {day.scheduledRoutine}
                      </span>
                    </div>
                  ) : (
                    /* Dot indicator for rest day */
                    <div className="flex flex-col items-center justify-center min-h-[44px]">
                      <span className="size-1.5 rounded-full bg-text/25" />
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
