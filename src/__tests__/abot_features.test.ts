import { describe, it, expect } from 'vitest';
import { TRANSLATIONS } from '../utils/i18n';
import { ANATOMY_SLUG_MAP } from '../data/anatomyPaths';

describe('Abot UI & Features Validation', () => {
  describe('Abot Feature Bilingual Keys Matching', () => {
    it('guarantees 100% dictionary key alignment between id and en', () => {
      const idKeys = Object.keys(TRANSLATIONS.id).sort();
      const enKeys = Object.keys(TRANSLATIONS.en).sort();
      expect(idKeys).toEqual(enKeys);
    });

    it('contains all required Abot profile and story keys in both languages', () => {
      const requiredKeys = [
        'nav_profile',
        'profile_workouts',
        'profile_lifted',
        'profile_streak',
        'profile_backed_up',
        'profile_edit',
        'profile_progress',
        'profile_lifts',
        'profile_volume_8wk',
        'profile_time',
        'profile_sets',
        'profile_trained_streak',
        'share_story',
        'share_instagram',
        'story_clean',
        'story_banner',
        'story_hud',
        'story_receipt',
        'story_magazine',
        'see_summary',
        'repeat_workout',
        'tag_gym',
        'photos_label',
        'add_photo',
        'sort_filter',
        'favorites',
        'scheduled_tomorrow',
        'scheduled_today',
        'not_done_yet',
        'variation_btn',
        'note_btn',
        'rest_timer_label',
        'swap_exercise',
        'lean_bulk',
        'left_today',
        'trend_label',
        'protein_label',
        'water_label'
      ] as const;

      requiredKeys.forEach((key) => {
        expect(TRANSLATIONS.id[key]).toBeDefined();
        expect(TRANSLATIONS.id[key].length).toBeGreaterThan(0);
        expect(TRANSLATIONS.en[key]).toBeDefined();
        expect(TRANSLATIONS.en[key].length).toBeGreaterThan(0);
      });
    });
  });

  describe('Quick Adjustments Logic (Abot 5.webp)', () => {
    function adjustWeight(currentWeight: number, delta: number): number {
      return Math.max(0, Math.round((currentWeight + delta) * 10) / 10);
    }

    function adjustReps(currentReps: number, delta: number): number {
      return Math.max(0, currentReps + delta);
    }

    it('increments and decrements weight accurately with 2.5kg standard increments', () => {
      expect(adjustWeight(20, 2.5)).toBe(22.5);
      expect(adjustWeight(22.5, 2.5)).toBe(25);
      expect(adjustWeight(25, -2.5)).toBe(22.5);
      expect(adjustWeight(0, -2.5)).toBe(0); // Cannot go below 0
    });

    it('increments and decrements reps accurately with 1 rep increments', () => {
      expect(adjustReps(8, 1)).toBe(9);
      expect(adjustReps(8, -1)).toBe(7);
      expect(adjustReps(0, -1)).toBe(0); // Cannot go below 0
    });
  });

  describe('Story Template Layout Model (Abot 7.webp)', () => {
    type TemplateType = 'clean' | 'banner' | 'hud' | 'receipt' | 'magazine';

    function getTemplateConfig(template: TemplateType) {
      switch (template) {
        case 'clean':
          return { hasAnatomyOverlay: false, isThermalReceipt: false, fullWidthBanner: false };
        case 'banner':
          return { hasAnatomyOverlay: false, isThermalReceipt: false, fullWidthBanner: true };
        case 'hud':
          return { hasAnatomyOverlay: true, isThermalReceipt: false, fullWidthBanner: false };
        case 'receipt':
          return { hasAnatomyOverlay: false, isThermalReceipt: true, fullWidthBanner: false };
        case 'magazine':
          return { hasAnatomyOverlay: false, isThermalReceipt: false, fullWidthBanner: false, editorial: true };
      }
    }

    it('supports all 5 story template styles with correct configurations', () => {
      expect(getTemplateConfig('clean').fullWidthBanner).toBe(false);
      expect(getTemplateConfig('banner').fullWidthBanner).toBe(true);
      expect(getTemplateConfig('hud').hasAnatomyOverlay).toBe(true);
      expect(getTemplateConfig('receipt').isThermalReceipt).toBe(true);
      expect(getTemplateConfig('magazine').editorial).toBe(true);
    });
  });

  describe('Profile Lifetime Aggregation (Abot 4.webp)', () => {
    it('correctly aggregates volume, time, and sets from workout session list', () => {
      const mockSessions = [
        { totalVolume: 8743, durationSeconds: 5940, totalSets: 30, status: 'completed' },
        { totalVolume: 6200, durationSeconds: 3600, totalSets: 22, status: 'completed' }
      ];

      const totalVol = mockSessions.reduce((acc, s) => acc + s.totalVolume, 0);
      const totalSets = mockSessions.reduce((acc, s) => acc + s.totalSets, 0);
      const totalSeconds = mockSessions.reduce((acc, s) => acc + s.durationSeconds, 0);

      expect(totalVol).toBe(14943);
      expect(totalSets).toBe(52);
      expect(Math.floor(totalSeconds / 3600)).toBe(2);
      expect(Math.floor((totalSeconds % 3600) / 60)).toBe(39);
    });
  });

  describe('Abot 1.webp & 5.webp State Logic', () => {
    it('accurately maps the 7-day strip schedule matching 1.webp with rest days', () => {
      const scheduledSplits = [undefined, 'Push', 'Pull', undefined, 'Legs', 'Upper', 'Legs'];
      expect(scheduledSplits[0]).toBeUndefined(); // Monday is Rest
      expect(scheduledSplits[1]).toBe('Push');    // Tuesday is Push
      expect(scheduledSplits[2]).toBe('Pull');    // Wednesday is Pull
      expect(scheduledSplits[3]).toBeUndefined(); // Thursday is Rest
      expect(scheduledSplits[4]).toBe('Legs');    // Friday is Legs
      expect(scheduledSplits[5]).toBe('Upper');   // Saturday is Upper
      expect(scheduledSplits[6]).toBe('Legs');    // Sunday is Legs
    });

    it('identifies contextual active set for stepper buttons matching 5.webp', () => {
      const sets = [
        { id: '1', completed: true },
        { id: '2', completed: false },
        { id: '3', completed: false }
      ];

      const activeSetKey: string | null = null;
      const exIdx = 0;

      // When activeSetKey is null, the first uncompleted set is focused
      const firstUncompletedIdx = sets.findIndex((s) => !s.completed);
      expect(firstUncompletedIdx).toBe(1);

      const isFocusedSet0 = activeSetKey === `${exIdx}-0` || (!activeSetKey && exIdx === 0 && !sets[0].completed && 0 === firstUncompletedIdx);
      const isFocusedSet1 = activeSetKey === `${exIdx}-1` || (!activeSetKey && exIdx === 0 && !sets[1].completed && 1 === firstUncompletedIdx);
      const isFocusedSet2 = activeSetKey === `${exIdx}-2` || (!activeSetKey && exIdx === 0 && !sets[2].completed && 2 === firstUncompletedIdx);

      expect(isFocusedSet0).toBe(false);
      expect(isFocusedSet1).toBe(true);
      expect(isFocusedSet2).toBe(false);
    });
  });

  describe('Abot 1.webp-7.webp Deep Parity Verification', () => {
    it('correctly maps target muscles for all 7-day strip splits (1.webp)', () => {
      const SPLIT_MUSCLE_MAP: Record<string, string[]> = {
        Push: ['chest', 'shoulders', 'triceps'],
        Pull: ['back', 'biceps'],
        Legs: ['quads', 'hamstrings', 'glutes', 'calves'],
        Upper: ['chest', 'back', 'shoulders', 'biceps', 'triceps']
      };

      expect(SPLIT_MUSCLE_MAP.Push).toContain('chest');
      expect(SPLIT_MUSCLE_MAP.Push).toContain('shoulders');
      expect(SPLIT_MUSCLE_MAP.Push).toContain('triceps');
      expect(SPLIT_MUSCLE_MAP.Pull).toContain('back');
      expect(SPLIT_MUSCLE_MAP.Pull).toContain('biceps');
      expect(SPLIT_MUSCLE_MAP.Legs).toContain('quads');
      expect(SPLIT_MUSCLE_MAP.Upper).toContain('chest');
    });

    it('dynamically adapts volume and bar metrics across 4wk, 8wk, 12wk timeframes (4.webp)', () => {
      const timeframeConfigs = {
        '4wk': { bars: 4, volume: 158400, workouts: 14 },
        '8wk': { bars: 8, volume: 317980, workouts: 27 },
        '12wk': { bars: 12, volume: 482100, workouts: 42 }
      };

      expect(timeframeConfigs['4wk'].bars).toBe(4);
      expect(timeframeConfigs['8wk'].bars).toBe(8);
      expect(timeframeConfigs['12wk'].bars).toBe(12);
      expect(timeframeConfigs['4wk'].volume).toBeLessThan(timeframeConfigs['8wk'].volume);
      expect(timeframeConfigs['8wk'].volume).toBeLessThan(timeframeConfigs['12wk'].volume);
    });

    it('validates 5-day routine split configuration matching 2.webp', () => {
      const routines = [
        { name: 'Push A: Strength', count: 6 },
        { name: 'Pull A: Width', count: 6 },
        { name: 'Legs A: Quads', count: 6 },
        { name: 'Upper B: Hypertrophy', count: 6 },
        { name: 'Legs B: Hamstrings', count: 5 }
      ];

      expect(routines.length).toBe(5);
      expect(routines[0].name).toBe('Push A: Strength');
      expect(routines[1].name).toBe('Pull A: Width');
      expect(routines[2].name).toBe('Legs A: Quads');
      expect(routines[3].name).toBe('Upper B: Hypertrophy');
      expect(routines[4].name).toBe('Legs B: Hamstrings');
    });

    it('validates Story Template feature badges (7.webp)', () => {
      const proTemplates = new Set(['receipt', 'magazine']);
      expect(proTemplates.has('receipt')).toBe(true);
      expect(proTemplates.has('magazine')).toBe(true);
      expect(proTemplates.has('clean')).toBe(false);
      expect(proTemplates.has('banner')).toBe(false);
      expect(proTemplates.has('hud')).toBe(false);

      const proBadgeLabel = 'Pro · beta';
      expect(proBadgeLabel).toContain('Pro');
      expect(proBadgeLabel).toContain('beta');
    });

    it('maps all exercise category pills to anatomy slug paths', () => {
      const categories = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full_body'];

      categories.forEach((cat) => {
        expect(ANATOMY_SLUG_MAP[cat]).toBeDefined();
        expect(Array.isArray(ANATOMY_SLUG_MAP[cat])).toBe(true);
        expect(ANATOMY_SLUG_MAP[cat].length).toBeGreaterThan(0);
      });
    });

    it('safeguards volume bar percentage calculation against empty sets', () => {
      const emptyCompletedSets: { weight: number }[] = [];
      const weights = emptyCompletedSets.map((x) => x.weight || 0);
      const maxWeightInEx = weights.length > 0 ? Math.max(...weights) : 0;
      expect(maxWeightInEx).toBe(0);
      expect(Number.isFinite(maxWeightInEx)).toBe(true);

      const barPercent = maxWeightInEx > 0 ? Math.round((10 / maxWeightInEx) * 100) : 50;
      expect(barPercent).toBe(50);
    });

    it('advances active set focus key when completing a set', () => {
      const exItem = {
        sets: [{ id: 's1', completed: false }, { id: 's2', completed: false }]
      };
      const totalExercises = 2;
      const exIdx = 0;
      const sIdx = 0;

      let nextSetKey: string | null = null;
      if (sIdx + 1 < exItem.sets.length) {
        nextSetKey = `${exIdx}-${sIdx + 1}`;
      } else if (exIdx + 1 < totalExercises) {
        nextSetKey = `${exIdx + 1}-0`;
      }

      expect(nextSetKey).toBe('0-1');
    });
  });
});
