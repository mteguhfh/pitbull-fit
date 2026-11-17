import React, { useState } from 'react';
import {
  FRONT_PARTS,
  BACK_PARTS,
  FRONT_OUTLINE,
  BACK_OUTLINE,
  ANATOMY_SLUG_MAP,
  NON_MUSCLE_SLUGS,
  MUSCLE_DISPLAY_NAMES,
  VIEWBOX_CONFIG
} from '../data/anatomyPaths';
import { MuscleGroup, MuscleFatigueInfo } from '../types';

interface MuscleAnatomyProps {
  primaryMuscles?: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  fatigueMap?: Record<MuscleGroup, MuscleFatigueInfo>;
  onSelectMuscle?: (muscle: MuscleGroup) => void;
  selectedMuscle?: MuscleGroup | null;
  width?: number | string;
  showToggle?: boolean;
  showDetailCard?: boolean;
  compact?: boolean;
}

export const MuscleAnatomy: React.FC<MuscleAnatomyProps> = ({
  primaryMuscles = [],
  secondaryMuscles = [],
  fatigueMap,
  onSelectMuscle,
  selectedMuscle: externalSelected,
  width = '100%',
  showToggle = true,
  showDetailCard = true,
  compact = false
}) => {
  const [view, setView] = useState<'both' | 'front' | 'back'>('both');
  const [internalSelected, setInternalSelected] = useState<MuscleGroup | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const activeSelected = externalSelected !== undefined ? externalSelected : internalSelected;

  // Find which MuscleGroup a slug maps to
  const getGroupFromSlug = (slug: string): MuscleGroup | null => {
    if (NON_MUSCLE_SLUGS.has(slug)) return null;
    const entries = Object.entries(ANATOMY_SLUG_MAP) as [MuscleGroup, string[]][];
    const found = entries.find(([_, slugs]) => slugs.includes(slug));
    return found ? found[0] : (slug as MuscleGroup);
  };

  const handlePartClick = (slug: string) => {
    const group = getGroupFromSlug(slug);
    if (!group) return;
    setInternalSelected((prev) => (prev === group ? null : group));
    if (onSelectMuscle) {
      onSelectMuscle(group);
    }
  };

  // Determine styling for each anatomy SVG part
  const getPartStyle = (slug: string) => {
    // Non-muscle neutral body silhouette (head, hair, hands, feet, ankles, knees)
    if (NON_MUSCLE_SLUGS.has(slug)) {
      return {
        fill: '#18181b',
        opacity: 0.85,
        stroke: '#09090b',
        strokeWidth: 1.2,
        isInteractive: false
      };
    }

    const group = getGroupFromSlug(slug);
    const isSelected = activeSelected && group === activeSelected;
    const isHovered = hoveredSlug === slug;

    // 1. Primary muscles highlight
    const isPrimary = primaryMuscles.some((m) => {
      const mapped = ANATOMY_SLUG_MAP[m] || [];
      return mapped.includes(slug) || m === slug;
    });

    if (isPrimary) {
      return {
        fill: '#ccff00',
        opacity: 1,
        stroke: isSelected ? '#ffffff' : isHovered ? '#ffffff' : '#09090b',
        strokeWidth: isSelected ? 4 : isHovered ? 2.5 : 1.2,
        isInteractive: true
      };
    }

    // 2. Secondary muscles highlight
    const isSecondary = secondaryMuscles.some((m) => {
      const mapped = ANATOMY_SLUG_MAP[m] || [];
      return mapped.includes(slug) || m === slug;
    });

    if (isSecondary) {
      return {
        fill: '#ccff00',
        opacity: 0.45,
        stroke: isSelected ? '#ffffff' : isHovered ? '#ffffff' : '#09090b',
        strokeWidth: isSelected ? 4 : isHovered ? 2.5 : 1.2,
        isInteractive: true
      };
    }

    // 3. Dynamic Fatigue stages
    if (fatigueMap && group && fatigueMap[group]) {
      const info = fatigueMap[group];
      let fill = '#27272a';
      let opacity = 0.7;

      if (info.stage === 'exhausted') {
        fill = '#ef4444';
        opacity = 0.95;
      } else if (info.stage === 'high') {
        fill = '#f97316';
        opacity = 0.85;
      } else if (info.stage === 'recovering') {
        fill = '#eab308';
        opacity = 0.75;
      } else {
        fill = '#27272a';
        opacity = 0.65;
      }

      return {
        fill,
        opacity,
        stroke: isSelected ? '#ffffff' : isHovered ? '#ffffff' : '#09090b',
        strokeWidth: isSelected ? 4 : isHovered ? 2.5 : 1.2,
        isInteractive: true
      };
    }

    // Default neutral muscle color
    return {
      fill: isHovered ? '#3f3f46' : '#27272a',
      opacity: 0.7,
      stroke: isSelected ? '#ffffff' : isHovered ? '#ffffff' : '#09090b',
      strokeWidth: isSelected ? 4 : isHovered ? 2.5 : 1.2,
      isInteractive: true
    };
  };

  // Selected muscle fatigue details for ABOT inspector
  const selectedInfo = activeSelected && fatigueMap ? fatigueMap[activeSelected] : null;
  const selectedDisplayName = activeSelected
    ? MUSCLE_DISPLAY_NAMES[activeSelected] || activeSelected
    : null;

  return (
    <div className="flex flex-col items-center select-none w-full" style={{ maxWidth: width }}>
      {/* Perspective Toggle Pills */}
      {showToggle && !compact && (
        <div className="flex items-center gap-1 p-1 bg-surface-2 rounded-full border border-line mb-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setView('both')}
            className={`px-3 py-1 rounded-full transition-colors ${
              view === 'both' ? 'bg-accent text-on-accent font-bold' : 'text-text-muted hover:text-text'
            }`}
          >
            All Angles
          </button>
          <button
            type="button"
            onClick={() => setView('front')}
            className={`px-3 py-1 rounded-full transition-colors ${
              view === 'front' ? 'bg-accent text-on-accent font-bold' : 'text-text-muted hover:text-text'
            }`}
          >
            Anterior (Front)
          </button>
          <button
            type="button"
            onClick={() => setView('back')}
            className={`px-3 py-1 rounded-full transition-colors ${
              view === 'back' ? 'bg-accent text-on-accent font-bold' : 'text-text-muted hover:text-text'
            }`}
          >
            Posterior (Back)
          </button>
        </div>
      )}

      {/* SVG Canvas Area */}
      <div className="relative w-full flex items-center justify-center gap-3 py-1">
        {/* Front View */}
        {(view === 'both' || view === 'front') && (
          <div className="flex flex-col items-center flex-1 max-w-[220px]">
            <svg
              viewBox={VIEWBOX_CONFIG.front}
              className="w-full h-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)]"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <filter id="neon-glow-primary" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="7" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Front Silhouette Muscle Groups */}
              {FRONT_PARTS.map((part) => {
                const style = getPartStyle(part.slug);
                return (
                  <g
                    key={`front-${part.slug}`}
                    className={style.isInteractive ? 'cursor-pointer transition-all duration-200' : ''}
                    onMouseEnter={() => style.isInteractive && setHoveredSlug(part.slug)}
                    onMouseLeave={() => style.isInteractive && setHoveredSlug(null)}
                    onClick={() => style.isInteractive && handlePartClick(part.slug)}
                  >
                    {part.d.map((pathD, pIdx) => (
                      <path
                        key={`fp-${pIdx}`}
                        d={pathD}
                        fill={style.fill}
                        fillOpacity={style.opacity}
                        stroke={style.stroke}
                        strokeWidth={style.strokeWidth}
                        className="transition-colors duration-200"
                      />
                    ))}
                  </g>
                );
              })}

              {/* Authentic ABOT Front Body Outline Stroke */}
              <path
                d={FRONT_OUTLINE}
                fill="none"
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth="2.5"
                pointerEvents="none"
              />
            </svg>
            {!compact && (
              <span className="text-[10px] font-bold text-text-muted mt-2 tracking-wider uppercase">
                Anterior
              </span>
            )}
          </div>
        )}

        {/* Back View */}
        {(view === 'both' || view === 'back') && (
          <div className="flex flex-col items-center flex-1 max-w-[220px]">
            <svg
              viewBox={VIEWBOX_CONFIG.back}
              className="w-full h-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)]"
              style={{ overflow: 'visible' }}
            >
              {/* Back Silhouette Muscle Groups */}
              {BACK_PARTS.map((part) => {
                const style = getPartStyle(part.slug);
                return (
                  <g
                    key={`back-${part.slug}`}
                    className={style.isInteractive ? 'cursor-pointer transition-all duration-200' : ''}
                    onMouseEnter={() => style.isInteractive && setHoveredSlug(part.slug)}
                    onMouseLeave={() => style.isInteractive && setHoveredSlug(null)}
                    onClick={() => style.isInteractive && handlePartClick(part.slug)}
                  >
                    {part.d.map((pathD, pIdx) => (
                      <path
                        key={`bp-${pIdx}`}
                        d={pathD}
                        fill={style.fill}
                        fillOpacity={style.opacity}
                        stroke={style.stroke}
                        strokeWidth={style.strokeWidth}
                        className="transition-colors duration-200"
                      />
                    ))}
                  </g>
                );
              })}

              {/* Authentic ABOT Back Body Outline Stroke */}
              <path
                d={BACK_OUTLINE}
                fill="none"
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth="2.5"
                pointerEvents="none"
              />
            </svg>
            {!compact && (
              <span className="text-[10px] font-bold text-text-muted mt-2 tracking-wider uppercase">
                Posterior
              </span>
            )}
          </div>
        )}
      </div>

      {/* ABOT-style Interactive Muscle Recovery Inspector Card */}
      {showDetailCard && fatigueMap && !compact && (
        <div className="w-full mt-3 p-3 rounded-2xl bg-surface border border-line-strong transition-all">
          {selectedInfo && selectedDisplayName ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-text tracking-tight">
                  {selectedDisplayName}{' '}
                  <span className="text-text-muted font-normal">//</span>{' '}
                  <span className="text-accent font-mono font-bold">
                    Recovery {Math.max(0, 100 - selectedInfo.fatiguePct)}%
                  </span>
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    selectedInfo.stage === 'exhausted'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : selectedInfo.stage === 'high'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : selectedInfo.stage === 'recovering'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {selectedInfo.stage}
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                {selectedInfo.lastTrainedAt ? (
                  <>
                    Last trained {formatTimeAgo(selectedInfo.lastTrainedAt)}
                    {selectedInfo.lastSets ? ` (${selectedInfo.lastSets} sets)` : ''} ·{' '}
                    {selectedInfo.readyInHours === 0
                      ? 'Ready now'
                      : `Ready in ~${selectedInfo.readyInHours}h`}
                  </>
                ) : (
                  'Not trained in the last 72 hours · Fully recovered'
                )}
              </p>
            </div>
          ) : (
            <p className="text-xs text-text-muted text-center py-1">
              Tap any muscle on the body diagram to inspect its recovery status.
            </p>
          )}
        </div>
      )}

      {/* Heatmap Legend */}
      {fatigueMap && !compact && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-[11px] font-medium text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-zinc-700 inline-block" /> Fresh (0-20%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-yellow-500 inline-block" /> Recovering (21-50%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-orange-500 inline-block" /> High Load (51-80%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-red-500 inline-block" /> Exhausted (81-100%)
          </span>
        </div>
      )}

      {/* Primary / Secondary Workout Routine Legend */}
      {primaryMuscles.length > 0 && !compact && (
        <div className="flex items-center gap-4 mt-2 text-[11px] font-medium text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-accent inline-block shadow-[0_0_8px_#ccff00]" /> Primary Target
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-accent/45 inline-block" /> Secondary Synergist
          </span>
        </div>
      )}
    </div>
  );
};

function formatTimeAgo(timestamp: number): string {
  const diffHours = Math.max(0, Math.floor((Date.now() - timestamp) / 3600000));
  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const days = Math.floor(diffHours / 24);
  return `${days}d ago`;
}
