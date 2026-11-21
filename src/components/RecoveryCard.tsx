import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { Card } from './Card';
import { MuscleAnatomy } from './MuscleAnatomy';
import { MuscleGroup } from '../types';
import { Activity } from 'lucide-react';

/**
 * Full-size anatomy map: every muscle is tappable, and the selected muscle
 * reports its fatigue and time to full recovery.
 */
export const RecoveryCard: React.FC = () => {
  const { getMuscleFatigueMap, settings, setActiveTab, t } = useWorkout();
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);

  const fatigueMap = getMuscleFatigueMap();
  const keys = Object.keys(fatigueMap) as (keyof typeof fatigueMap)[];
  const readyCount = keys.filter((k) => fatigueMap[k].fatiguePct < 30).length;
  const profile = settings.profile;

  return (
    <Card radius="card" padding="16px" variant="raised" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-accent" />
          <h3 className="text-sm font-black text-text tracking-tight uppercase">
            {t('recovery_title')}
          </h3>
        </div>
        <span className="text-[11px] font-bold text-text-muted font-mono">
          {readyCount}/{keys.length} {t('ready_muscles')}
        </span>
      </div>

      <div className="rounded-card bg-surface-2 border border-line p-3">
        <MuscleAnatomy
          fatigueMap={fatigueMap}
          selectedMuscle={selectedMuscle}
          onSelectMuscle={(m) => setSelectedMuscle((prev) => (prev === m ? null : m))}
          showToggle
          showDetailCard
          width="100%"
        />
      </div>

      {profile && (
        <div className="flex items-center justify-between pt-1 border-t border-line">
          <span className="text-[11px] text-text-muted">
            {t('swipe_bmi')} · {profile.bmi}
          </span>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className="text-[11px] font-bold text-accent"
          >
            {t('recalc_bmi_btn')}
          </button>
        </div>
      )}
    </Card>
  );
};
