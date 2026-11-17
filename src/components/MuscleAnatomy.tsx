import React, { useState } from 'react';
import { FRONT_PARTS, BACK_PARTS, ANATOMY_SLUG_MAP, BODY_CONTOUR_FRONT } from '../data/anatomyPaths';
import { MuscleGroup, MuscleFatigueInfo } from '../types';

interface MuscleAnatomyProps {
  primaryMuscles?: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  fatigueMap?: Record<MuscleGroup, MuscleFatigueInfo>;
  onSelectMuscle?: (muscle: MuscleGroup) => void;
  width?: number | string;
  showToggle?: boolean;
}

export const MuscleAnatomy: React.FC<MuscleAnatomyProps> = ({
  primaryMuscles = [],
  secondaryMuscles = [],
  fatigueMap,
  onSelectMuscle,
  width = '100%',
  showToggle = true
}) => {
  const [view, setView] = useState<'both' | 'front' | 'back'>('both');
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  // Map each anatomy slug to its visual status
  const getSlugColor = (slug: string): { fill: string; opacity: number; isPrimary: boolean } => {
    // Check if part of primary muscles
    const isPrimary = primaryMuscles.some((m) => {
      const mapped = ANATOMY_SLUG_MAP[m] || [];
      return mapped.includes(slug) || m === slug;
    });

    if (isPrimary) {
      return { fill: '#ccff00', opacity: 1, isPrimary: true };
    }

    // Check if part of secondary muscles
    const isSecondary = secondaryMuscles.some((m) => {
      const mapped = ANATOMY_SLUG_MAP[m] || [];
      return mapped.includes(slug) || m === slug;
    });

    if (isSecondary) {
      return { fill: '#ccff00', opacity: 0.45, isPrimary: false };
    }

    // If fatigue map provided
    if (fatigueMap) {
      // Find matching muscle group for this slug
      const matchedGroup = (Object.keys(ANATOMY_SLUG_MAP) as MuscleGroup[]).find((mg) =>
        ANATOMY_SLUG_MAP[mg].includes(slug)
      );

      if (matchedGroup && fatigueMap[matchedGroup]) {
        const info = fatigueMap[matchedGroup];
        if (info.stage === 'exhausted') return { fill: '#ef4444', opacity: 0.9, isPrimary: false };
        if (info.stage === 'high') return { fill: '#f97316', opacity: 0.8, isPrimary: false };
        if (info.stage === 'recovering') return { fill: '#eab308', opacity: 0.7, isPrimary: false };
      }
    }

    // Default neutral muscle color
    return { fill: '#27272a', opacity: 0.7, isPrimary: false };
  };

  return (
    <div className="flex flex-col items-center select-none" style={{ width }}>
      {showToggle && (
        <div className="flex items-center gap-1.5 p-1 bg-surface-2 rounded-full border border-line mb-3 text-xs font-semibold">
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
            Front
          </button>
          <button
            type="button"
            onClick={() => setView('back')}
            className={`px-3 py-1 rounded-full transition-colors ${
              view === 'back' ? 'bg-accent text-on-accent font-bold' : 'text-text-muted hover:text-text'
            }`}
          >
            Back
          </button>
        </div>
      )}

      {/* Anatomical SVG Canvas */}
      <div className="relative w-full flex items-center justify-center gap-4 py-2">
        {/* Front View */}
        {(view === 'both' || view === 'front') && (
          <div className="flex flex-col items-center flex-1 max-w-[200px]">
            <svg
              viewBox="80 200 550 1180"
              className="w-full h-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <filter id="neon-glow-front" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Front Muscle Paths */}
              {FRONT_PARTS.map((part) => {
                const style = getSlugColor(part.slug);
                const isHovered = hoveredMuscle === part.slug;

                return (
                  <g
                    key={`front-${part.slug}`}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredMuscle(part.slug)}
                    onMouseLeave={() => setHoveredMuscle(null)}
                    onClick={() => onSelectMuscle && onSelectMuscle(part.slug as MuscleGroup)}
                    filter={style.isPrimary || isHovered ? 'url(#neon-glow-front)' : undefined}
                  >
                    {part.d.map((pathD, pIdx) => (
                      <path
                        key={`fp-${pIdx}`}
                        d={pathD}
                        fill={isHovered ? '#ccff00' : style.fill}
                        fillOpacity={isHovered ? 1 : style.opacity}
                        stroke="#09090b"
                        strokeWidth="1.2"
                        className="transition-colors duration-200"
                      />
                    ))}
                  </g>
                );
              })}
            </svg>
            <span className="text-[11px] font-semibold text-text-muted mt-2 tracking-wide uppercase">Front</span>
          </div>
        )}

        {/* Back View */}
        {(view === 'both' || view === 'back') && (
          <div className="flex flex-col items-center flex-1 max-w-[200px]">
            <svg
              viewBox="820 200 550 1180"
              className="w-full h-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <filter id="neon-glow-back" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Back Muscle Paths */}
              {BACK_PARTS.map((part) => {
                const style = getSlugColor(part.slug);
                const isHovered = hoveredMuscle === part.slug;

                return (
                  <g
                    key={`back-${part.slug}`}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredMuscle(part.slug)}
                    onMouseLeave={() => setHoveredMuscle(null)}
                    onClick={() => onSelectMuscle && onSelectMuscle(part.slug as MuscleGroup)}
                    filter={style.isPrimary || isHovered ? 'url(#neon-glow-back)' : undefined}
                  >
                    {part.d.map((pathD, pIdx) => (
                      <path
                        key={`bp-${pIdx}`}
                        d={pathD}
                        fill={isHovered ? '#ccff00' : style.fill}
                        fillOpacity={isHovered ? 1 : style.opacity}
                        stroke="#09090b"
                        strokeWidth="1.2"
                        className="transition-colors duration-200"
                      />
                    ))}
                  </g>
                );
              })}
            </svg>
            <span className="text-[11px] font-semibold text-text-muted mt-2 tracking-wide uppercase">Back</span>
          </div>
        )}
      </div>

      {/* Legend / Status indicator */}
      {fatigueMap ? (
        <div className="flex items-center gap-3 mt-3 text-[11px] font-medium text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-zinc-700 inline-block" /> Fresh
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-yellow-500 inline-block" /> Recovering
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-orange-500 inline-block" /> High Fatigue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500 inline-block" /> Exhausted
          </span>
        </div>
      ) : primaryMuscles.length > 0 ? (
        <div className="flex items-center gap-4 mt-2 text-[11px] font-medium text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-accent inline-block shadow-[0_0_8px_#ccff00]" /> Primary
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-accent/40 inline-block" /> Secondary
          </span>
        </div>
      ) : null}
    </div>
  );
};
