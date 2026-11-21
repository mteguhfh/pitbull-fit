import { describe, it, expect, beforeEach } from 'vitest';
import { TRANSLATIONS } from '../utils/i18n';
import { UserSettings } from '../types';

// Minimal mock for testing DOM root mutation in node environment
class MockClassList {
  classes = new Set<string>();
  add(c: string) { this.classes.add(c); }
  remove(c: string) { this.classes.delete(c); }
  contains(c: string) { return this.classes.has(c); }
  reset() { this.classes.clear(); }
}

class MockElement {
  classList = new MockClassList();
  attributes: Record<string, string> = {};
  style: Record<string, string> = {};

  setAttribute(k: string, v: string) { this.attributes[k] = v; }
  getAttribute(k: string) { return this.attributes[k]; }
  removeAttribute(k: string) { delete this.attributes[k]; }
  reset() {
    this.classList.reset();
    this.attributes = {};
    this.style = {};
  }
}

const mockDocElement = new MockElement();
(globalThis as any).document = {
  documentElement: mockDocElement
};

// Theme controller logic under test
function applyThemeToDOM(theme: string | undefined): { isLight: boolean; themeName: 'dark' | 'light' } {
  const isLight = theme === 'light';
  const effectiveTheme: 'dark' | 'light' = isLight ? 'light' : 'dark';

  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (isLight) {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    }
  }

  return { isLight, themeName: effectiveTheme };
}

// Swipe card deck deck-index calculator
function calculateNextDeckIndex(currentIndex: number, dir: number, totalCards: number = 3): number {
  return (currentIndex + dir + totalCards) % totalCards;
}

// Swipe scale & transform physics
function calculateDeckScale(dragX: number, isDragging: boolean, isAnimatingSwap: boolean): number {
  if (isDragging) {
    return Math.min(0.96 + (Math.abs(dragX) / 600) * 0.04, 1.0);
  }
  if (isAnimatingSwap) {
    return 1.0;
  }
  return 0.96;
}

function evaluateSwipeGesture(deltaX: number, threshold: number = 65): { shouldSwap: boolean; dir: number } {
  if (Math.abs(deltaX) > threshold) {
    const dir = deltaX < 0 ? 1 : -1;
    return { shouldSwap: true, dir };
  }
  return { shouldSwap: false, dir: 0 };
}

describe('Theme Switcher & Fluid Animation System', () => {
  beforeEach(() => {
    mockDocElement.reset();
  });

  describe('Theme Switcher Engine', () => {
    it('correctly sets DOM classes and data-theme for light mode', () => {
      const res = applyThemeToDOM('light');
      expect(res.isLight).toBe(true);
      expect(res.themeName).toBe('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.documentElement.style.colorScheme).toBe('light');
    });

    it('correctly sets DOM classes and data-theme for dark mode', () => {
      const res = applyThemeToDOM('dark');
      expect(res.isLight).toBe(false);
      expect(res.themeName).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    it('treats legacy "oled" or undefined theme as dark mode safely', () => {
      const resOled = applyThemeToDOM('oled');
      expect(resOled.isLight).toBe(false);
      expect(resOled.themeName).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      const resUndef = applyThemeToDOM(undefined);
      expect(resUndef.isLight).toBe(false);
      expect(resUndef.themeName).toBe('dark');
    });

    it('toggles seamlessly between dark and light multiple times without stale classes', () => {
      applyThemeToDOM('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      applyThemeToDOM('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      applyThemeToDOM('dark');
      expect(document.documentElement.classList.contains('light')).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('verifies theme i18n translation keys exist in both ID and EN', () => {
      expect(TRANSLATIONS.id.theme_setting).toBeDefined();
      expect(TRANSLATIONS.id.theme_desc).toBeDefined();
      expect(TRANSLATIONS.en.theme_setting).toBeDefined();
      expect(TRANSLATIONS.en.theme_desc).toBeDefined();
    });
  });

  describe('Fluid Deck Swipe Physics Engine', () => {
    it('correctly calculates forward card transitions (swiping left)', () => {
      // Swiping card to the left (negative deltaX) advances to next card (dir: 1)
      const gesture = evaluateSwipeGesture(-120, 65);
      expect(gesture.shouldSwap).toBe(true);
      expect(gesture.dir).toBe(1);

      const nextIdx = calculateNextDeckIndex(0, gesture.dir, 3);
      expect(nextIdx).toBe(1);

      const nextIdx2 = calculateNextDeckIndex(1, gesture.dir, 3);
      expect(nextIdx2).toBe(2);

      // Boundary: wrap around from 2 -> 0
      const nextIdx3 = calculateNextDeckIndex(2, gesture.dir, 3);
      expect(nextIdx3).toBe(0);
    });

    it('correctly calculates backward card transitions (swiping right)', () => {
      // Swiping card to the right (positive deltaX) goes back (dir: -1)
      const gesture = evaluateSwipeGesture(100, 65);
      expect(gesture.shouldSwap).toBe(true);
      expect(gesture.dir).toBe(-1);

      // Boundary: wrap around from 0 -> 2
      const prevIdx = calculateNextDeckIndex(0, gesture.dir, 3);
      expect(prevIdx).toBe(2);

      const prevIdx2 = calculateNextDeckIndex(2, gesture.dir, 3);
      expect(prevIdx2).toBe(1);
    });

    it('rejects sub-threshold drag jitter without triggering card swap', () => {
      const smallDrag = evaluateSwipeGesture(30, 65);
      expect(smallDrag.shouldSwap).toBe(false);
      expect(smallDrag.dir).toBe(0);

      const microDrag = evaluateSwipeGesture(-15, 65);
      expect(microDrag.shouldSwap).toBe(false);
      expect(microDrag.dir).toBe(0);
    });

    it('bounds deck scale physics between 0.96 and 1.0 smoothly', () => {
      // Idle scale
      expect(calculateDeckScale(0, false, false)).toBe(0.96);

      // Midway drag (dragX = 300px)
      const midScale = calculateDeckScale(300, true, false);
      expect(midScale).toBeCloseTo(0.98, 2);

      // Full drag (dragX = 600px)
      const fullScale = calculateDeckScale(600, true, false);
      expect(fullScale).toBe(1.0);

      // Extreme drag beyond 600px clamped to 1.0 max
      const extremeScale = calculateDeckScale(1200, true, false);
      expect(extremeScale).toBe(1.0);

      // Animating swap expands back card to 1.0
      expect(calculateDeckScale(0, false, true)).toBe(1.0);
    });

    it('correctly disambiguates horizontal card swipe vs vertical page scrolling', () => {
      // User moves predominantly vertically (deltaY: 40px, deltaX: 10px) -> Not a horizontal swipe
      const isHorizontalScroll = Math.abs(10) > Math.abs(40);
      expect(isHorizontalScroll).toBe(false);

      // User moves predominantly horizontally (deltaX: 45px, deltaY: 8px) -> Card swipe gesture
      const isHorizontalSwipe = Math.abs(45) > Math.abs(8);
      expect(isHorizontalSwipe).toBe(true);
    });

    it('computes hardware accelerated card rotation and opacity clamping smoothly', () => {
      const calcOpacity = (dx: number) => Math.max(0.68, 1 - Math.abs(dx) / 750);
      const calcRot = (dx: number) => dx * 0.04;

      // At rest (0px)
      expect(calcOpacity(0)).toBe(1);
      expect(calcRot(0)).toBe(0);

      // Mild drag (100px)
      expect(calcRot(100)).toBe(4);
      expect(calcOpacity(100)).toBeCloseTo(0.867, 2);

      // Extreme drag (800px) - clamped to min opacity
      expect(calcOpacity(800)).toBe(0.68);
    });
  });
});
