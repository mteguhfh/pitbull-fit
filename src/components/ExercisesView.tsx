import React, { useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { Search, Dumbbell, ChevronRight, Filter } from 'lucide-react';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { Exercise } from '../types';

export const ExercisesView: React.FC = () => {
  const { exercises, addExerciseToWorkout, activeWorkout } = useWorkout();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [activeExerciseDetail, setActiveExerciseDetail] = useState<Exercise | null>(null);

  const filtered = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.primaryMuscles.some((m) => m.toLowerCase().includes(search.toLowerCase())) ||
      ex.equipment.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchesEq = selectedEquipment === 'all' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesCat && matchesEq;
  });

  return (
    <div className="pb-28 pt-4 px-4 max-w-[500px] mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-text tracking-tight uppercase">Exercises Library</h1>
          <span className="text-xs text-text-muted">{exercises.length} movements available</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by exercise or muscle group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface border border-line text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'chest', 'back', 'shoulders', 'arms', 'legs', 'core'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-accent text-on-accent'
                : 'bg-surface text-text-muted hover:text-text border border-line'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Equipment Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'].map((eq) => (
          <button
            key={eq}
            type="button"
            onClick={() => setSelectedEquipment(eq)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize whitespace-nowrap transition-colors ${
              selectedEquipment === eq
                ? 'bg-surface-3 text-accent border border-accent/40'
                : 'bg-surface-2 text-text-muted hover:text-text border border-line'
            }`}
          >
            {eq}
          </button>
        ))}
      </div>

      {/* Exercise Card List */}
      <div className="space-y-2 pt-1">
        {filtered.map((ex) => (
          <div
            key={ex.id}
            onClick={() => setActiveExerciseDetail(ex)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-surface hover:bg-surface-2 border border-line hover:border-line-strong transition-all cursor-pointer shadow-md active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-11 rounded-xl bg-surface-2 border border-line flex items-center justify-center text-accent shrink-0">
                <Dumbbell size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-text truncate">{ex.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-accent font-semibold capitalize">
                    {ex.primaryMuscles.join(', ')}
                  </span>
                  <span className="text-[10px] text-text-muted capitalize">· {ex.equipment}</span>
                </div>
              </div>
            </div>

            <ChevronRight size={18} className="text-text-muted shrink-0 ml-2" />
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-text-muted text-xs">
            No exercises match your search query.
          </div>
        )}
      </div>

      {/* Modal */}
      <ExerciseDetailModal
        exercise={activeExerciseDetail}
        onClose={() => setActiveExerciseDetail(null)}
        onAddToWorkout={activeWorkout ? addExerciseToWorkout : undefined}
      />
    </div>
  );
};
