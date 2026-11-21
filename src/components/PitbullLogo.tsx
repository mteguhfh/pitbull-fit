import React, { useState } from 'react';

interface PitbullLogoProps {
  size?: number; // Size in px
  variant?: 'compact' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PitbullLogo: React.FC<PitbullLogoProps> = ({
  size = 36,
  variant = 'compact',
  showText = false,
  className = '',
  onClick
}) => {
  const [isWinking, setIsWinking] = useState(false);
  const [eyeColor, setEyeColor] = useState('var(--color-accent)');

  const handleTap = () => {
    setIsWinking(true);
    setEyeColor('var(--color-accent-bright)');
    setTimeout(() => {
      setIsWinking(false);
      setEyeColor('var(--color-accent)');
    }, 600);
    if (onClick) onClick();
  };

  return (
    <div
      onClick={handleTap}
      role="button"
      tabIndex={0}
      title="Pitbull Fit AI Cyber Mascot"
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group transition-transform active:scale-95 ${className}`}
    >
      {/* Animated Pitbull Mascot Head SVG */}
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center shrink-0 rounded-2xl bg-surface-2/90 border border-line transition duration-300"
      >
        {/* Ambient Crimson Aura */}
        <span className="absolute inset-0 rounded-2xl bg-accent/10 blur-sm pointer-events-none group-hover:bg-accent/20 transition" />

        <svg
          viewBox="0 0 100 100"
          className="w-[82%] h-[82%] transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Metallic Head Gradients */}
            <linearGradient id="headPlate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a2a34" />
              <stop offset="50%" stopColor="#1a1a22" />
              <stop offset="100%" stopColor="#101015" />
            </linearGradient>

            <linearGradient id="snoutPlate" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#32323e" />
              <stop offset="100%" stopColor="#1f1f26" />
            </linearGradient>

            <linearGradient id="crimsonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-accent)" />
              <stop offset="100%" stopColor="var(--color-accent-bright)" />
            </linearGradient>

            {/* Eye Glow Filter */}
            <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ears (Pointed, Aggressive Athletic Silhouette) */}
          {/* Left Ear */}
          <polygon
            points="18,12 36,32 16,36"
            fill="#1e1e26"
            stroke="#3a3a48"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon
            points="22,18 32,30 20,32"
            fill="var(--color-accent)"
            opacity="0.3"
          />

          {/* Right Ear */}
          <polygon
            points="82,12 64,32 84,36"
            fill="#1e1e26"
            stroke="#3a3a48"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon
            points="78,18 68,30 80,32"
            fill="var(--color-accent)"
            opacity="0.3"
          />

          {/* Skull / Cranium Main Polygon */}
          <polygon
            points="28,26 72,26 84,48 76,74 50,86 24,74 16,48"
            fill="url(#headPlate)"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeOpacity="0.6"
            strokeLinejoin="round"
          />

          {/* Brow Ridge (Cyber Facet Line) */}
          <polyline
            points="22,46 38,40 50,44 62,40 78,46"
            stroke="#4a4a5a"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Snout / Muzzle Polygon */}
          <polygon
            points="36,54 64,54 59,76 50,82 41,76"
            fill="url(#snoutPlate)"
            stroke="#333342"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Nose Tip & Fang Accents */}
          <polygon
            points="45,67 55,67 50,72"
            fill="var(--color-accent)"
          />

          {/* Jaw Seam */}
          <line
            x1="50"
            y1="72"
            x2="50"
            y2="78"
            stroke="#111116"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Collar / Neck Ridge */}
          <polygon
            points="32,84 50,92 68,84 62,94 50,98 38,94"
            fill="#16161c"
            stroke="var(--color-accent)"
            strokeWidth="1.2"
            strokeOpacity="0.7"
          />
          {/* Spikes / Studs on Collar */}
          <circle cx="42" cy="91" r="1.5" fill="var(--color-accent-bright)" />
          <circle cx="50" cy="95" r="1.8" fill="var(--color-accent-bright)" />
          <circle cx="58" cy="91" r="1.5" fill="var(--color-accent-bright)" />

          {/* --- ANIMATED CYBER EYES --- */}
          {/* Left Eye Socket */}
          <polygon
            points="29,46 44,44 41,52 32,52"
            fill="#09090c"
            stroke="#262630"
            strokeWidth="1"
          />
          {/* Left Eye Glowing Pupil & Eyelid */}
          <g className="animate-pitbull-blink" style={{ transformOrigin: '36px 48px' }}>
            <ellipse
              cx="36"
              cy="48"
              rx="4"
              ry="2.5"
              fill={eyeColor}
              filter="url(#eyeGlow)"
              className="transition-colors duration-200"
            />
            {/* Pupil Center Specular Spark */}
            <circle cx="35" cy="47.5" r="1" fill="#ffffff" />
          </g>

          {/* Right Eye Socket */}
          <polygon
            points="71,46 56,44 59,52 68,52"
            fill="#09090c"
            stroke="#262630"
            strokeWidth="1"
          />
          {/* Right Eye Glowing Pupil & Eyelid (winks on tap) */}
          <g
            className={isWinking ? '' : 'animate-pitbull-blink'}
            style={{ transformOrigin: '64px 48px' }}
          >
            {isWinking ? (
              /* Playful wink line */
              <path
                d="M 59 48 Q 63.5 52 68 48"
                stroke="var(--color-accent)"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <ellipse
                  cx="64"
                  cy="48"
                  rx="4"
                  ry="2.5"
                  fill={eyeColor}
                  filter="url(#eyeGlow)"
                  className="transition-colors duration-200"
                />
                <circle cx="63" cy="47.5" r="1" fill="#ffffff" />
              </>
            )}
          </g>
        </svg>

        {/* Breathing Ring Pulse on bottom */}
        <span className="absolute -bottom-1 size-2 rounded-full bg-accent/60 pointer-events-none" />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-tight text-text leading-none group-hover:text-white transition-colors">
              PITBULL
            </span>
            <span className="text-base font-black tracking-tight text-accent leading-none">
              FIT
            </span>
            <span className="px-1.5 py-0.2 rounded-md bg-accent/15 border border-accent/25 text-[9px] font-black text-accent uppercase tracking-widest">
              AI
            </span>
          </div>
          <span className="text-[10px] font-semibold text-text-muted leading-tight mt-0.5">
            Heavy Strength & Hypertrophy
          </span>
        </div>
      )}
    </div>
  );
};
