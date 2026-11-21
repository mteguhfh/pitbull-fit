import React, { useState, useEffect, useRef } from 'react';
import { Exercise } from '../types';
import { Play, Pause, RotateCcw, Video, Activity, Sparkles, CheckCircle2, ExternalLink, Zap, Clock } from 'lucide-react';

interface ExerciseVideoPlayerProps {
  exercise: Exercise;
  compact?: boolean;
}

export const ExerciseVideoPlayer: React.FC<ExerciseVideoPlayerProps> = ({ exercise, compact = false }) => {
  const [activeTab, setActiveTab] = useState<'video' | 'visualizer'>('video');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [phase, setPhase] = useState<'eccentric' | 'isometric' | 'concentric'>('eccentric');
  const [phaseProgress, setPhaseProgress] = useState<number>(0);
  const [repCount, setRepCount] = useState<number>(1);

  // Biomechanical cycle timer for simulated cadence and form phase tracking
  useEffect(() => {
    if (!isPlaying || activeTab !== 'visualizer') return;

    // Step every 30ms
    const stepDelta = 0.85 * playbackSpeed;
    const timer = setInterval(() => {
      setPhaseProgress((prev) => {
        const next = prev + stepDelta;
        if (next >= 100) {
          setRepCount((r) => r + 1);
          return 0;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, activeTab]);

  // Derive movement phase:
  // 0% - 48%: Eccentric (controlled lowering)
  // 48% - 62%: Isometric (peak stretch pause)
  // 62% - 100%: Concentric (explosive drive)
  useEffect(() => {
    if (phaseProgress < 48) {
      setPhase('eccentric');
    } else if (phaseProgress < 62) {
      setPhase('isometric');
    } else {
      setPhase('concentric');
    }
  }, [phaseProgress]);

  const embedId = exercise.videoEmbedId || 'rT7DgCr-3pg';
  const tempo = exercise.tempo || '3-0-1-0';
  const tempoParts = tempo.split('-');
  const eccSec = tempoParts[0] || '3';
  const pauseSec = tempoParts[1] || '0';
  const conSec = tempoParts[2] || '1';
  const topSec = tempoParts[3] || '0';

  const tips = exercise.tips || [
    'Lock your core before every rep',
    'Full range of motion with controlled eccentric',
    'Breathe out through the concentric effort'
  ];

  // Determine motion category: vertical path vs arc trajectory
  const isVerticalExercise =
    exercise.category === 'legs' ||
    exercise.id.includes('squat') ||
    exercise.id.includes('deadlift') ||
    exercise.id.includes('overhead') ||
    exercise.id.includes('pull-up') ||
    exercise.id.includes('lat-pulldown');

  // Compute normalized rep contraction u in [0, 1]
  // 0 = bottom / stretched, 1 = top / contracted
  let u = 0;
  if (phaseProgress < 48) {
    // Eccentric: lowering from 1 down to 0
    const tNorm = phaseProgress / 48;
    u = 1 - tNorm;
  } else if (phaseProgress < 62) {
    // Isometric: held at bottom stretch (0)
    u = 0;
  } else {
    // Concentric: drive up from 0 to 1
    const tNorm = (phaseProgress - 62) / 38;
    // Slight ease-out for explosive initial drive
    u = Math.min(1, Math.sin(tNorm * (Math.PI / 2)));
  }

  // Curve coordinates for Arc mode:
  // P0 = (30, 85) [bottom left start], P1 = (80, 20) [top peak apex], P2 = (130, 85) [bottom right end]
  // Quadratic Bezier Formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
  const arcT = 0.5 + (u - 0.5); // smoothly oscillates between bottom (0) and top apex (0.5)
  // Let apex be at u = 1 (top of rep), bottom at u = 0 (bottom of rep)
  // Left-to-right arc representation:
  const arcParam = 0.15 + u * 0.7; // spans from 0.15 to 0.85
  const p0x = 25, p0y = 90;
  const p1x = 80, p1y = 20;
  const p2x = 135, p2y = 90;

  const curArcX = (1 - arcParam) * (1 - arcParam) * p0x + 2 * (1 - arcParam) * arcParam * p1x + arcParam * arcParam * p2x;
  const curArcY = (1 - arcParam) * (1 - arcParam) * p0y + 2 * (1 - arcParam) * arcParam * p1y + arcParam * arcParam * p2y;

  // Linear vertical coordinates
  // Top: y = 25, Bottom: y = 95
  const curVertX = 80;
  const curVertY = 95 - u * 70;

  const nodeX = isVerticalExercise ? curVertX : curArcX;
  const nodeY = isVerticalExercise ? curVertY : curArcY;

  return (
    <div className="w-full flex flex-col rounded-3xl bg-surface border border-line overflow-hidden shadow-2xl">
      {/* Visual Header / Switcher */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-2 border-b border-line">
        <div className="flex items-center gap-1.5 p-1 bg-surface-3/80 rounded-xl border border-line">
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === 'video'
                ? 'bg-accent text-on-accent'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Video size={13} />
            <span>HD Video</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('visualizer')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === 'visualizer'
                ? 'bg-accent text-on-accent'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Activity size={13} />
            <span>Biomechanical</span>
          </button>
        </div>

        {/* Speed / Controls */}
        <div className="flex items-center gap-1">
          {activeTab === 'visualizer' && (
            <div className="flex items-center gap-1 mr-1">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="size-7 rounded-lg bg-surface-3 hover:bg-surface border border-line text-accent flex items-center justify-center transition-colors active:scale-95"
                title={isPlaying ? 'Pause Visualizer' : 'Play Visualizer'}
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5 fill-current" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhaseProgress(0);
                  setRepCount(1);
                }}
                className="size-7 rounded-lg bg-surface-3 hover:bg-surface border border-line text-text-muted hover:text-text flex items-center justify-center transition-colors active:scale-95"
                title="Restart Rep"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          )}

          {[0.5, 1, 1.5].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-colors ${
                playbackSpeed === speed
                  ? 'bg-accent/20 border border-accent/40 text-accent'
                  : 'bg-surface-3/60 text-text-muted hover:text-text border border-line'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Main Screen Content */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        {activeTab === 'video' ? (
          <div className="relative w-full h-full">
            <iframe
              title={`${exercise.name} form demonstration`}
              src={`https://www.youtube-nocookie.com/embed/${embedId}?autoplay=1&mute=1&loop=1&playlist=${embedId}&controls=1&modestbranding=1&rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
            {/* Ambient Red Edge Glow */}
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-accent/20" />

            {/* External YouTube fallback button */}
            <a
              href={`https://www.youtube.com/watch?v=${embedId}`}
              target="_blank"
              rel="noreferrer noopener"
              className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/75 hover:bg-black/90 border border-line hover:border-accent/40 text-[10px] font-bold text-text-muted hover:text-accent flex items-center gap-1 transition"
              title="Open full video in YouTube"
            >
              <ExternalLink size={11} />
              <span>YouTube</span>
            </a>
          </div>
        ) : (
          /* Biomechanical Vector Cadence Simulator */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#141419] to-[#09090b]">
            {/* Cyber Grid Background */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(var(--color-accent) 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px'
              }}
            />

            {/* Animated Rep Cadence Figure */}
            <div className="relative w-48 h-32 flex items-center justify-center mb-1">
              {/* Radial Pulse Wave at tension point */}
              <div
                className="absolute size-24 rounded-full border border-accent/40 animate-ping-slow pointer-events-none"
                style={{ animationDuration: `${2.2 / playbackSpeed}s` }}
              />

              {/* Movement Arc SVG */}
              <svg viewBox="0 0 160 120" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="cyberRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-accent)" />
                    <stop offset="100%" stopColor="var(--color-accent-bright)" />
                  </linearGradient>
                  <filter id="redNeonVisualizer" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {isVerticalExercise ? (
                  <>
                    {/* Vertical Kinetic Guideway */}
                    <line
                      x1="80"
                      y1="25"
                      x2="80"
                      y2="95"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    {/* Active Laser Trail */}
                    <line
                      x1="80"
                      y1="95"
                      x2="80"
                      y2={nodeY}
                      stroke="url(#cyberRedGrad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      filter="url(#redNeonVisualizer)"
                    />
                    {/* Lockout line */}
                    <line x1="60" y1="25" x2="100" y2="25" stroke="var(--color-accent)" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x="105" y="28" fill="var(--color-accent)" fontSize="8" fontFamily="monospace" fontWeight="bold">LOCKOUT</text>
                    {/* Depth line */}
                    <line x1="60" y1="95" x2="100" y2="95" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x="105" y="98" fill="#8e8e99" fontSize="8" fontFamily="monospace">DEPTH</text>
                  </>
                ) : (
                  <>
                    {/* Target Movement Path Track */}
                    <path
                      d="M 25,90 Q 80,20 135,90"
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    {/* Peak Lockout Marker */}
                    <circle cx="80" cy="20" r="3" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeDasharray="2 2" />
                    <text x="80" y="12" textAnchor="middle" fill="var(--color-accent)" fontSize="8" fontFamily="monospace" fontWeight="bold">APEX CONTRACTION</text>
                  </>
                )}

                {/* Moving Barbell / Kinetic Load Node */}
                <circle
                  cx={nodeX}
                  cy={nodeY}
                  r="9"
                  fill="var(--color-accent)"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  filter="url(#redNeonVisualizer)"
                />
                <circle cx={nodeX} cy={nodeY} r="3" fill="#ffffff" />

                {/* Simulated Barbell / Dumbbell collar */}
                <line
                  x1={nodeX - 12}
                  y1={nodeY}
                  x2={nodeX + 12}
                  y2={nodeY}
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1={nodeX - 12}
                  y1={nodeY - 8}
                  x2={nodeX - 12}
                  y2={nodeY + 8}
                  stroke="var(--color-accent)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <line
                  x1={nodeX + 12}
                  y1={nodeY - 8}
                  x2={nodeX + 12}
                  y2={nodeY + 8}
                  stroke="var(--color-accent)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Base platform */}
                <line x1="15" y1="108" x2="145" y2="108" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
            </div>

            {/* Rep Counter & Phase Badge */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-surface-3 border border-line text-[11px] font-mono font-bold text-text-muted">
                Rep <span className="text-accent font-black">{repCount}</span>
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition duration-300 ${
                  phase === 'concentric'
                    ? 'bg-accent text-on-accent animate-pulse'
                    : phase === 'isometric'
                    ? 'bg-amber-500/20 text-pr border border-amber-500/40'
                    : 'bg-surface-3 text-text-muted border border-line'
                }`}
              >
                {phase === 'concentric'
                  ? '⚡ Concentric (Drive Up)'
                  : phase === 'isometric'
                  ? '🔒 Peak Tension (Pause)'
                  : '⏳ Eccentric (Slow Lower)'}
              </span>
            </div>

            {/* Target Tempo Indicator */}
            <div className="mt-2 text-[11px] font-mono text-text-muted flex items-center gap-2">
              <span>Cadence:</span>
              <span className="font-bold text-accent px-2 py-0.5 rounded bg-accent/15 border border-accent/25">
                {tempo}
              </span>
            </div>
          </div>
        )}

        {/* Live Video Watermark Badge */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 border border-line text-[10px] font-mono text-text-muted flex items-center gap-1.5 pointer-events-none">
          <span className="size-1.5 rounded-full bg-accent animate-pulse" />
          <span>FORM CHECK 60FPS</span>
        </div>
      </div>

      {/* Cadence Tempo Breakdown & Coaching Tips */}
      {!compact && (
        <div className="p-4 bg-surface space-y-3">
          {/* Tempo breakdown pills */}
          <div className="p-2.5 rounded-2xl bg-surface-2 border border-line/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Clock size={12} className="text-accent" />
                Cadence Protocol ({tempo})
              </span>
              <span className="text-[10px] font-mono text-accent font-bold">SECONDS PER REP</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="p-1.5 rounded-xl bg-surface-3/80 border border-line">
                <span className="block text-[10px] text-text-muted">Eccentric</span>
                <span className="text-sm font-black font-mono text-text">{eccSec}s</span>
              </div>
              <div className="p-1.5 rounded-xl bg-surface-3/80 border border-line">
                <span className="block text-[10px] text-text-muted">Pause</span>
                <span className="text-sm font-black font-mono text-pr">{pauseSec}s</span>
              </div>
              <div className="p-1.5 rounded-xl bg-surface-3/80 border border-line">
                <span className="block text-[10px] text-text-muted">Concentric</span>
                <span className="text-sm font-black font-mono text-accent">{conSec}s</span>
              </div>
              <div className="p-1.5 rounded-xl bg-surface-3/80 border border-line">
                <span className="block text-[10px] text-text-muted">Top</span>
                <span className="text-sm font-black font-mono text-text">{topSec}s</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Sparkles size={14} className="text-accent" />
              Biomechanical Form Cues
            </span>
            <span className="text-[11px] font-mono text-accent font-semibold capitalize">
              {exercise.category} · {exercise.equipment}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {tips.map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-2/60 border border-line/60 text-xs text-text/90"
              >
                <div className="size-5 rounded-md bg-accent/15 border border-accent/30 text-accent flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={12} className="stroke-[3]" />
                </div>
                <span className="leading-snug">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

