import React, { useState } from 'react';
import { Card } from './Card';
import { useWorkout } from '../context/WorkoutContext';
import {
  Search,
  Star,
  SlidersHorizontal,
  Plus,
  Play,
  Video,
  Info,
  Dumbbell,
  Activity,
  Layers,
  X
} from 'lucide-react';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { ExerciseVideoModal } from './ExerciseVideoModal';
import { MuscleAnatomy } from './MuscleAnatomy';
import { Exercise, MuscleGroup } from '../types';

function getEquipmentIcon(equipment: string) {
  switch (equipment.toLowerCase()) {
    case 'dumbbell':
      return <Dumbbell size={11} className="-rotate-45" />;
    case 'barbell':
      return <Dumbbell size={11} />;
    case 'cable':
      return <Activity size={11} />;
    case 'machine':
      return <Layers size={11} />;
    default:
      return <Dumbbell size={11} />;
  }
}

export const ExercisesView: React.FC = () => {
  const {
    exercises,
    addExerciseToWorkout,
    addCustomExercise,
    activeWorkout,
    settings,
    language,
    t
  } = useWorkout();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(['bench-press', 'incline-dumbbell-press', 'lat-pulldown', 'barbell-squat'])
  );
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [activeExerciseDetail, setActiveExerciseDetail] = useState<Exercise | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<Exercise | null>(null);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.primaryMuscles.some((m) => m.toLowerCase().includes(search.toLowerCase())) ||
      ex.equipment.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchesFav = !filterFavoritesOnly || favorites.has(ex.id);
    const matchesEquip = equipmentFilter === 'all' || ex.equipment.toLowerCase() === equipmentFilter;
    return matchesSearch && matchesCat && matchesFav && matchesEquip;
  });

  return (
    <div className="pb-4 pt-3 px-4 max-w-[500px] mx-auto space-y-4 select-none">
      {/* Header matching 3.webp (Exercises, count, + New button) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text tracking-tight uppercase">
            {t('nav_exercises')}
          </h1>
          <span className="text-xs text-text-muted font-medium">
            {exercises.length} {t('nav_exercises').toLowerCase()}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowNewExercise(true)}
          className="px-3 py-1.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-line text-xs font-bold text-text flex items-center gap-1.5 transition-colors active:scale-95"
        >
          <Plus size={14} className="text-accent" />
          <span>+ New</span>
        </button>
      </div>

      {/* Search Input matching 3.webp ("🔍 Name, muscle or equipment") */}
      <div className="w-full">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t('search_exercise_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-9 pr-9 rounded-ctl bg-surface border border-line text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-full text-text-muted hover:text-text flex items-center justify-center"
              aria-label={t('close_video_modal')}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Filter Chips matching 3.webp (All | ⭐ My favorites | Chest | Back | ...) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* All Chip */}
        <button
          type="button"
          onClick={() => {
            setSelectedCategory('all');
            setFilterFavoritesOnly(false);
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
            selectedCategory === 'all' && !filterFavoritesOnly
              ? 'bg-accent text-on-accent'
              : 'bg-surface-2 text-text-muted hover:text-text border border-line'
          }`}
        >
          All
        </button>

        {/* My Favorites Chip */}
        <button
          type="button"
          onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition ${
            filterFavoritesOnly
              ? 'bg-accent text-on-accent'
              : 'bg-surface-2 text-text-muted hover:text-text border border-line'
          }`}
        >
          <Star size={13} className={filterFavoritesOnly ? 'fill-current' : 'text-amber-600 dark:text-amber-400'} />
          <span>{t('favorites')}</span>
        </button>

        {/* Categories with mini anatomy icon matching 3.webp */}
        {(['chest', 'back', 'shoulders', 'arms', 'legs', 'core'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setSelectedCategory(cat);
              setFilterFavoritesOnly(false);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCategory === cat && !filterFavoritesOnly
                ? 'bg-accent text-on-accent'
                : 'bg-surface-2 text-text-muted hover:text-text border border-line'
            }`}
          >
            <div className="w-3.5 h-4 flex items-center justify-center overflow-hidden pointer-events-none">
              <MuscleAnatomy
                compact={true}
                showToggle={false}
                showDetailCard={false}
                activeView={cat === 'back' ? 'back' : 'front'}
                primaryMuscles={[cat as MuscleGroup]}
                width={14}
              />
            </div>
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Section Header matching 3.webp (e.g. Chest 89 with mini muscle icon) */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {selectedCategory !== 'all' && (
            <div className="w-5 h-6 flex items-center justify-center overflow-hidden bg-surface-2/60 rounded-md p-0.5 border border-line">
              <MuscleAnatomy
                compact={true}
                showToggle={false}
                showDetailCard={false}
                activeView={selectedCategory === 'back' ? 'back' : 'front'}
                primaryMuscles={[selectedCategory as MuscleGroup]}
                width={18}
              />
            </div>
          )}
          <h2 className="text-base font-black text-text capitalize">
            {selectedCategory === 'all' ? 'All Movements' : selectedCategory}
          </h2>
        </div>
        <span className="text-xs font-mono font-bold text-text-muted">{filtered.length}</span>
      </div>

      {/* Exercise Items List matching 3.webp */}
      <div className="space-y-2">
        {filtered.map((ex) => {
          const isFav = favorites.has(ex.id);

          return (
            <Card
              radius="card"
              key={ex.id}
              padding="12px 14px"
              style={{ contentVisibility: 'auto', containIntrinsicSize: '0 80px' }}
              variant="raised"
              className="flex items-center justify-between gap-3 cursor-pointer hover:border-white/20 transition group"
            >
              {/* Rich gym exercise visual thumbnail on the left with small dark equipment badge in bottom-right corner matching 3.webp */}
              <div
                onClick={() => setActiveExerciseDetail(ex)}
                className="flex items-center gap-3 min-w-0 flex-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-line flex items-center justify-center text-accent shrink-0 relative overflow-hidden group-hover:border-accent/40 transition-colors p-1">
                  <MuscleAnatomy
                    compact={true}
                    showToggle={false}
                    showDetailCard={false}
                    activeView={ex.primaryMuscles.includes('back') ? 'back' : 'front'}
                    primaryMuscles={ex.primaryMuscles}
                    width={28}
                  />
                  {/* Small dark rounded badge in bottom-right corner displaying equipment icon in accent crimson matching 3.webp */}
                  <div
                    className="absolute bottom-0.5 right-0.5 size-5 rounded-md bg-[#0a0a0f]/95 border border-white/15 flex items-center justify-center text-accent shadow-sm"
                    title={ex.equipment}
                  >
                    {getEquipmentIcon(ex.equipment)}
                  </div>
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-black text-text truncate group-hover:text-accent transition-colors">
                    {ex.name}
                  </h3>
                  <span className="text-[11px] text-text-muted block truncate capitalize">
                    {ex.primaryMuscles.join(', ')} · {ex.equipment}
                    {ex.id === 'bench-press' && ' · best 55 kg × 5'}
                    {ex.id === 'barbell-squat' && ' · best 100 kg × 5'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Video Trigger & Star Favorite matching 3.webp */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveVideoModal(ex);
                  }}
                  className="size-8 rounded-full bg-surface-2 hover:bg-surface-3 border border-line text-accent flex items-center justify-center transition-colors"
                  title="Watch Video"
                >
                  <Video size={14} />
                </button>

                {activeWorkout && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addExerciseToWorkout(ex.id);
                    }}
                    className="size-8 rounded-full bg-accent text-on-accent flex items-center justify-center"
                    title="Add to Workout"
                  >
                    <Plus size={15} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => toggleFavorite(ex.id, e)}
                  className="size-8 rounded-full bg-surface-2 hover:bg-surface-3 border border-line flex items-center justify-center transition-colors"
                  title="Toggle Favorite"
                >
                  <Star
                    size={16}
                    className={
                      isFav
                        ? 'fill-amber-400 text-amber-600 dark:text-amber-400'
                        : 'text-text-muted hover:text-white'
                    }
                  />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Floating Bottom Pill: Sort & filter matching 3.webp */}
      <div className="fixed bottom-24 inset-x-0 z-30 flex justify-center pointer-events-none">
        <button
          type="button"
          onClick={() => setShowFilters(true)}
          className="pointer-events-auto px-4 py-2 rounded-full bg-[#181824]/90 hover:bg-[#20202e] border border-white/15 text-xs font-bold text-white flex items-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.7)] active:scale-95 transition"
        >
          <SlidersHorizontal size={14} className="text-accent" />
          <span>{t('sort_filter')}</span>
        </button>
      </div>

      {/* Equipment filter sheet */}
      {showFilters && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 animate-in fade-in"
          onClick={() => setShowFilters(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-surface rounded-t-sheet border border-line-strong p-5 pb-8 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-text">
                {language === 'id' ? 'Filter Peralatan' : 'Equipment Filter'}
              </h2>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="size-8 rounded-full bg-surface-2 border border-line text-text-muted hover:text-text flex items-center justify-center"
                aria-label={t('close_video_modal')}
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['all', 'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'].map((eq) => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => {
                    setEquipmentFilter(eq);
                    setShowFilters(false);
                  }}
                  className={`py-2.5 rounded-ctl text-xs font-bold capitalize transition-colors ${
                    equipmentFilter === eq
                      ? 'bg-accent text-on-accent'
                      : 'bg-surface-2 text-text-muted border border-line hover:text-text'
                  }`}
                >
                  {eq === 'all' ? (language === 'id' ? 'Semua' : 'All') : eq}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New custom exercise sheet */}
      {showNewExercise && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 animate-in fade-in"
          onClick={() => setShowNewExercise(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-surface rounded-t-sheet border border-line-strong p-5 pb-8 shadow-card space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-text">
                {language === 'id' ? 'Gerakan Baru' : 'New Exercise'}
              </h2>
              <button
                type="button"
                onClick={() => setShowNewExercise(false)}
                className="size-8 rounded-full bg-surface-2 border border-line text-text-muted hover:text-text flex items-center justify-center"
                aria-label={t('close_video_modal')}
              >
                <X size={16} />
              </button>
            </div>

            <input
              autoFocus
              type="text"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newExerciseName.trim()) {
                  addCustomExercise({
                    name: newExerciseName.trim(),
                    category: 'chest',
                    equipment: 'barbell',
                    primaryMuscles: ['chest'],
                    secondaryMuscles: [],
                    defaultRestSeconds: settings.defaultRestSeconds,
                    tips: [],
                    instructions: []
                  });
                  setNewExerciseName('');
                  setShowNewExercise(false);
                }
              }}
              placeholder={language === 'id' ? 'Nama gerakan' : 'Exercise name'}
              className="w-full h-11 px-3 rounded-ctl bg-surface-2 border border-line text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
            />

            <button
              type="button"
              disabled={!newExerciseName.trim()}
              onClick={() => {
                addCustomExercise({
                  name: newExerciseName.trim(),
                  category: 'chest',
                  equipment: 'barbell',
                  primaryMuscles: ['chest'],
                  secondaryMuscles: [],
                  defaultRestSeconds: settings.defaultRestSeconds,
                  tips: [],
                  instructions: []
                });
                setNewExerciseName('');
                setShowNewExercise(false);
              }}
              className="w-full py-3 rounded-ctl bg-accent text-on-accent font-black text-sm disabled:opacity-40 active:scale-[0.98] transition"
            >
              {language === 'id' ? 'Tambah Gerakan' : 'Add Exercise'}
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ExerciseDetailModal
        exercise={activeExerciseDetail}
        onClose={() => setActiveExerciseDetail(null)}
      />

      <ExerciseVideoModal
        exercise={activeVideoModal}
        onClose={() => setActiveVideoModal(null)}
      />
    </div>
  );
};
