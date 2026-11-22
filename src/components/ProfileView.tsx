import React, { useMemo, useState } from 'react';
import { Card } from './Card';
import { useWorkout } from '../context/WorkoutContext';
import { formatDuration, formatNumber, formatWeight } from '../utils/format';
import {
  Settings,
  Camera,
  Cloud,
  Scale,
  Edit3,
  Share2,
  Trophy,
  Flame,
  Clock,
  Dumbbell,
  Layers,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';
import { INITIAL_EXERCISES } from '../data/exercises';
import { ShareStoryModal } from './ShareStoryModal';

export const ProfileView: React.FC = () => {
  const {
    workoutHistory,
    getStreakWeeks,
    settings,
    updateSettings,
    setActiveTab,
    language,
    t
  } = useWorkout();

  const [activeSubTab, setActiveSubTab] = useState<'progress' | 'lifts'>('progress');
  const [activeTimeframe, setActiveTimeframe] = useState<'4wk' | '8wk' | '12wk'>('8wk');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showShareStory, setShowShareStory] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const streak = getStreakWeeks();
  const profile = settings.profile;
  const userName = profile?.name || (language === 'id' ? 'Atlet' : 'Athlete');

  // Aggregate stats from real history only
  const totalVolumeAllTime = workoutHistory.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
  const totalWorkouts = workoutHistory.length;
  const totalSets = workoutHistory.reduce((sum, w) => sum + (w.totalSets || 0), 0);
  const totalTimeSeconds = workoutHistory.reduce((sum, w) => sum + (w.durationSeconds || 0), 0);
  const totalPrs = workoutHistory.reduce((sum, w) => sum + (w.prCount || 0), 0);

  const WEEK = 7 * 24 * 3600 * 1000;
  const timeframeWeeks = { '4wk': 4, '8wk': 8, '12wk': 12 } as const;

  const now = useMemo(() => Date.now(), []);

  const buildTimeframe = (weeks: number) => {
    const buckets = Array.from({ length: weeks }, () => 0);
    workoutHistory.forEach((session) => {
      if (session.status !== 'completed') return;
      const weekIdx = Math.floor((now - session.startedAt) / WEEK);
      if (weekIdx >= 0 && weekIdx < weeks) buckets[weeks - 1 - weekIdx] += session.totalVolume || 0;
    });
    const peak = Math.max(...buckets, 1);
    const inRange = workoutHistory.filter((s) => s.status === 'completed' && now - s.startedAt < weeks * WEEK);
    return {
      title: language === 'id'
        ? `Volume, ${weeks} minggu terakhir`
        : `Volume, last ${weeks} weeks`,
      volume: buckets.reduce((a, b) => a + b, 0),
      workouts: inRange.length,
      seconds: inRange.reduce((sum, s) => sum + (s.durationSeconds || 0), 0),
      sets: inRange.reduce((sum, s) => sum + (s.totalSets || 0), 0),
      bars: buckets.map((volume, i) => ({
        label: `W${i + 1}`,
        height: Math.round((volume / peak) * 100),
        volume,
        isCurrent: i === weeks - 1
      }))
    };
  };

  const currentTfData = buildTimeframe(timeframeWeeks[activeTimeframe]);
  const tfHours = Math.floor(currentTfData.seconds / 3600);
  const tfMinutes = Math.floor((currentTfData.seconds % 3600) / 60);
  const hasVolume = totalVolumeAllTime > 0;

  // Real PRs / estimated 1RM per exercise, from completed sets only
  const lifts = (() => {
    const byExercise = new Map<string, { bestOneRm: number; bestWeight: number; bestReps: number; lastAt: number }>();
    workoutHistory.forEach((session) => {
      if (session.status !== 'completed') return;
      session.exercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          if (!set.completed || set.weight <= 0 || set.reps <= 0) return;
          const oneRm = set.weight * (1 + set.reps / 30);
          const prev = byExercise.get(ex.exerciseId);
          if (!prev || oneRm > prev.bestOneRm) {
            byExercise.set(ex.exerciseId, {
              bestOneRm: oneRm,
              bestWeight: set.weight,
              bestReps: set.reps,
              lastAt: session.startedAt
            });
          }
        });
      });
    });
    return Array.from(byExercise.entries())
      .map(([exerciseId, data]) => {
        const meta = INITIAL_EXERCISES.find((e) => e.id === exerciseId);
        const daysAgo = Math.floor((now - data.lastAt) / (24 * 3600 * 1000));
        return {
          id: exerciseId,
          name: meta?.name || exerciseId,
          oneRepMax: Math.round(data.bestOneRm * 2) / 2,
          bestSet: `${formatWeight(data.bestWeight, language)} × ${data.bestReps}`,
          lastRecorded: daysAgo <= 0
            ? (language === 'id' ? 'Hari ini' : 'Today')
            : language === 'id' ? `${daysAgo} hr lalu` : `${daysAgo}d ago`
        };
      })
      .sort((a, b) => b.oneRepMax - a.oneRepMax);
  })();

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const startEditingName = () => {
    setNameDraft(profile?.name || '');
    setIsEditingName(true);
  };

  const commitName = () => {
    const next = nameDraft.trim();
    updateSettings({
      profile: profile
        ? { ...profile, name: next || undefined }
        : undefined
    });
    setIsEditingName(false);
  };

  return (
    <div className="pb-4 pt-3 px-4 max-w-[500px] mx-auto space-y-4 select-none">
      {/* Top Header matching 4.webp (Title Profile + Settings Gear Icon) */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-text tracking-tight uppercase">
          {t('nav_profile')}
        </h1>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className="size-9 rounded-full bg-surface-2 hover:bg-surface-3 border border-line flex items-center justify-center text-text-muted hover:text-white transition-colors active:scale-95"
          title={t('settings_title')}
        >
          <Settings size={17} />
        </button>
      </div>

      {/* User Profile Card with Cover Banner matching 4.webp */}
      <div className="relative rounded-3xl bg-surface border border-line overflow-hidden shadow-xl">
        {/* Banner with 12-wk mini bar chart & Cover Button */}
        <div className="h-28 bg-gradient-to-r from-[#181824] via-[#221724] to-[#1a131b] relative p-3 flex items-end justify-between border-b border-white/5">
          {/* Mini 12-wk bar chart preview in header */}
          <div className="flex items-end gap-1 h-16 opacity-30 pointer-events-none">
            {[30, 45, 60, 40, 80, 50, 70, 90, 65, 85, 40, 95].map((h, i) => (
              <div
                key={i}
                className="w-3 rounded-t bg-accent"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className="px-2.5 py-1 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-[10px] font-bold text-white flex items-center gap-1 transition-colors"
          >
            <ImageIcon size={12} />
            <span>+ Cover</span>
          </button>
        </div>

        {/* User Info & Hexagonal Avatar matching 4.webp */}
        <div className="px-4 pb-4 -mt-10 space-y-3">
          <div className="flex items-end justify-between">
            {/* Hexagonal Avatar Container */}
            <div className="relative">
              <div
                onClick={startEditingName}
                className="size-20 rounded-2xl bg-gradient-to-tr from-accent-dim via-accent to-accent-bright p-[2.5px] cursor-pointer"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              >
                <div
                  className="w-full h-full bg-[#14141b] flex items-center justify-center overflow-hidden"
                  style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                >
                  <span className="text-2xl font-black text-text-muted uppercase">
                    {userName.slice(0, 2)}
                  </span>
                </div>
              </div>

              {/* Camera Icon Badge */}
              <button
                type="button"
                onClick={startEditingName}
                className="absolute -bottom-1 -right-1 size-6 rounded-full bg-surface-2 border border-line flex items-center justify-center text-text-muted hover:text-white"
              >
                <Camera size={12} />
              </button>
            </div>

            {/* Edit Profile Button */}
            <button
              type="button"
              onClick={startEditingName}
              className="px-3 py-1.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold text-text flex items-center gap-1.5 transition-colors"
            >
              <Edit3 size={13} />
              <span>{t('profile_edit')}</span>
            </button>
          </div>

          {/* Name & Lifetime Metrics */}
          <div>
            {isEditingName ? (
              <input
                autoFocus
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                placeholder={language === 'id' ? 'Nama Anda' : 'Your name'}
                className="text-xl font-black text-text tracking-tight bg-transparent border-b border-accent focus:outline-none w-full max-w-[240px]"
              />
            ) : (
              <h2
                onClick={startEditingName}
                className="text-xl font-black text-text tracking-tight flex items-center gap-2 cursor-pointer"
              >
                {userName}
              </h2>
            )}
            <p className="text-xs text-text-muted mt-0.5 font-medium">
              {totalWorkouts} {t('profile_workouts')} · {formatNumber(totalVolumeAllTime, language)}{' '}
              {settings.weightUnit} {t('profile_lifted')} · {streak} {t('profile_streak')}
            </p>
          </div>

          {/* Badges: Backed up & Weight / BMI */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-line text-[11px] font-bold text-text-muted">
              <Cloud size={12} className="text-sky-600 dark:text-sky-400" />
              <span>{t('profile_backed_up')}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-line text-[11px] font-bold text-text-muted">
              <Scale size={12} className="text-accent" />
              <span>
                {formatWeight(profile?.weightKg || 0, language)} {settings.weightUnit}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: Progress | Lifts matching 4.webp */}
      <div className="flex border-b border-line">
        <button
          type="button"
          onClick={() => setActiveSubTab('progress')}
          className={`flex-1 py-2 text-center text-sm font-black transition-colors relative ${
            activeSubTab === 'progress'
              ? 'text-text'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {t('profile_progress')}
          {activeSubTab === 'progress' && (
            <span className="absolute bottom-0 inset-x-8 h-0.5 bg-accent rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('lifts')}
          className={`flex-1 py-2 text-center text-sm font-black transition-colors relative ${
            activeSubTab === 'lifts'
              ? 'text-text'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {t('profile_lifts')}
          {activeSubTab === 'lifts' && (
            <span className="absolute bottom-0 inset-x-8 h-0.5 bg-accent rounded-full" />
          )}
        </button>
      </div>

            {/* SUBTAB 1: PROGRESS (Volume chart, consistency, history) */}
      {activeSubTab === 'progress' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Timeframe Filter Chips matching 4.webp (4 wk | 8 wk | 12 wk + Share) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {(['4wk', '8wk', '12wk'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    activeTimeframe === tf
                      ? 'bg-accent text-on-accent'
                      : 'bg-surface-2 text-text-muted hover:text-text border border-line'
                  }`}
                >
                  {tf.replace('wk', ' wk')}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowShareStory(true)}
              className="px-3 py-1 rounded-full bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold text-text flex items-center gap-1 transition-colors active:scale-95"
            >
              <span>Share ↗</span>
            </button>
          </div>

          {/* Volume Last X Weeks Interactive Card matching 4.webp */}
          <Card
            radius="card"
            padding="20px"
            variant="raised"
            className="space-y-4"
          >
            <div>
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">
                {currentTfData.title}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black font-mono text-text">
                  {formatNumber(currentTfData.volume, language)}
                </span>
                <span className="text-sm font-bold text-text-muted">
                  {settings.weightUnit}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                {!hasVolume
                  ? language === 'id'
                    ? 'Belum ada latihan tercatat. Selesaikan satu sesi untuk melihat progres di sini.'
                    : 'No workouts logged yet. Finish one session to see progress here.'
                  : language === 'id'
                    ? `${totalPrs} PR tercatat dari ${totalWorkouts} sesi.`
                    : `${totalPrs} PRs from ${totalWorkouts} sessions.`}
              </p>
            </div>

            {/* Dynamic Bar Chart Visualization matching 4.webp */}
            {hasVolume && (
            <div className="pt-2">
              <div className="flex items-end justify-between gap-1.5 h-28 px-1">
                {currentTfData.bars.map((bar, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full group"
                    title={`${bar.label}: ${formatNumber(bar.volume, language)} ${settings.weightUnit}`}
                  >
                    <div
                      className={`w-full rounded-t-lg transition duration-300 ${
                        bar.isCurrent
                          ? 'bg-accent'
                          : 'bg-surface-3 group-hover:bg-line-strong'
                      }`}
                      style={{ height: `${Math.max(bar.height, 4)}%` }}
                    />
                  </div>
                ))}
              </div>

              {/* 3 Metrics Footer below chart matching 4.webp (Workouts, Time, Sets) */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-line mt-3 text-center">
                <div>
                  <span className="block text-lg font-black font-mono text-text">
                    {currentTfData.workouts}
                  </span>
                  <span className="text-[10px] font-bold text-text-muted uppercase">
                    {t('profile_workouts')}
                  </span>
                </div>

                <div>
                  <span className="block text-lg font-black font-mono text-text">
                    {tfHours}h {tfMinutes}m
                  </span>
                  <span className="text-[10px] font-bold text-text-muted uppercase">
                    {t('profile_time')}
                  </span>
                </div>

                <div>
                  <span className="block text-lg font-black font-mono text-text">
                    {currentTfData.sets}
                  </span>
                  <span className="text-[10px] font-bold text-text-muted uppercase">
                    {t('profile_sets')}
                  </span>
                </div>
              </div>
            </div>
            )}
          </Card>

          {/* 8-Week Streak Consistency Dots matching 4.webp */}
          <Card
            radius="card"
            padding="16px"
            variant="raised"
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <Flame size={20} className="text-accent fill-accent" />
              <div>
                <span className="text-xs font-black text-text block">
                  {streak}-week streak
                </span>
                <span className="text-[10px] text-text-muted">
                  {streak} of 8 {t('profile_trained_streak')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {[...Array(8)].map((_, i) => (
                <span
                  key={i}
                  className={`size-2.5 rounded-full ${
                    i < streak
                      ? 'bg-accent'
                      : 'bg-surface-3'
                  }`}
                />
              ))}
            </div>
          </Card>

          {/* History Log Feed */}
          <div className="space-y-3 pt-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-text-muted">
              {t('past_sessions')} ({workoutHistory.length})
            </span>

            {workoutHistory.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-surface border border-line">
                <p className="text-sm font-semibold text-text-muted">{t('no_sessions_yet')}</p>
              </div>
            ) : (
              workoutHistory.map((session) => {
                const isExpanded = expandedId === session.id;
                const dateStr = new Date(session.startedAt).toLocaleDateString(
                  language === 'id' ? 'id-ID' : 'en-US',
                  {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  }
                );

                return (
                  <Card
                    radius="card"
                    key={session.id}
                    padding="0px"
                    variant="raised"
                    className="overflow-hidden transition"
                  >
                    <div
                      onClick={() => toggleExpand(session.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-2/60 transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="text-[11px] font-semibold text-text-muted block mb-0.5">
                          {dateStr}
                        </span>
                        <h3 className="text-sm font-bold text-text truncate">{session.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-text-muted mt-1 font-mono">
                          <span>{formatDuration(session.durationSeconds)}</span>
                          <span>·</span>
                          <span>{session.totalSets} {t('set_col')}</span>
                          <span>·</span>
                          <span className="text-accent font-bold">
                            {formatNumber(session.totalVolume, language)} {settings.weightUnit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {session.prCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-pr/20 border border-pr/40 text-[10px] font-bold text-pr">
                            ★ {session.prCount} PR
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp size={18} className="text-text-muted" />
                        ) : (
                          <ChevronDown size={18} className="text-text-muted" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-line/70 bg-surface-2/30 space-y-3 animate-in fade-in">
                        {session.exercises.map((item, exIdx) => {
                          const ex = INITIAL_EXERCISES.find((e) => e.id === item.exerciseId);
                          const completedSets = item.sets.filter((s) => s.completed);

                          return (
                            <div key={exIdx} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-bold text-text">
                                <span>{ex ? ex.name : item.exerciseId}</span>
                                <span className="text-[11px] font-mono text-text-muted">
                                  {completedSets.length} {t('set_col')}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                {completedSets.map((s, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 border ${
                                      s.isPR
                                        ? 'bg-pr/20 text-pr border-pr/40'
                                        : 'bg-surface-2 text-text-muted border-line'
                                    }`}
                                  >
                                    {s.weight}×{s.reps}
                                    {s.isPR && <Trophy size={10} />}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: LIFTS (Exercise PRs / 1RM progression list matching 4.webp) */}
      {activeSubTab === 'lifts' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-text uppercase tracking-tight">
                Exercise PRs & 1RM
              </h3>
              <span className="text-xs text-text-muted">Estimated 1RM Progression</span>
            </div>
            <span className="text-xs font-mono font-bold text-pr flex items-center gap-1">
              <Trophy size={13} /> {lifts.length} {language === 'id' ? 'Tercatat' : 'Tracked'}
            </span>
          </div>

          {lifts.length === 0 && (
            <Card radius="card" padding="20px" variant="default" className="text-center">
              <Trophy size={22} className="text-pr mx-auto mb-2" />
              <p className="text-xs text-text-muted">
                {language === 'id'
                  ? 'Belum ada PR. Selesaikan satu set untuk mulai melacak 1RM.'
                  : 'No PRs yet. Complete one set to start tracking 1RM.'}
              </p>
            </Card>
          )}

          <div className="space-y-2.5">
            {lifts.map((lift) => (
              <Card
                radius="card"
                key={lift.id}
                padding="14px 16px"
                variant="raised"
                className="flex items-center justify-between gap-3 hover:border-white/20 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="size-11 rounded-xl bg-surface-2 border border-line flex items-center justify-center text-accent shrink-0">
                    <Dumbbell size={18} />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-text truncate">{lift.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-text-muted font-mono mt-0.5">
                      <span>{language === 'id' ? 'Terbaik' : 'Best'}: {lift.bestSet}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pr/15 border border-pr/35 text-xs font-black font-mono text-pr">
                    <Trophy size={12} />
                    {formatWeight(lift.oneRepMax, language)} {settings.weightUnit} 1RM
                  </span>
                  <span className="text-[10px] text-text-muted block mt-0.5">
                    {lift.lastRecorded}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 9:16 Share Story Modal matching 7.webp */}
      {showShareStory && (
        <ShareStoryModal
          session={
            workoutHistory[0] || {
              id: 'profile-summary',
              title: language === 'id' ? 'Ringkasan' : 'Summary',
              startedAt: now,
              durationSeconds: 0,
              totalVolume: 0,
              totalSets: 0,
              prCount: 0,
              exercises: [],
              status: 'completed'
            }
          }
          onClose={() => setShowShareStory(false)}
        />
      )}
    </div>
  );
};
