import { describe, it, expect } from 'vitest';
import { calculateBMI, lbsToKg, kgToLbs } from '../utils/bmi';
import { TRANSLATIONS } from '../utils/i18n';

describe('BMI & Nutritional Target Engine', () => {
  it('correctly calculates normal BMI for standard adult metrics', () => {
    // 70kg at 175cm -> BMI = 70 / (1.75 * 1.75) = 22.857... -> 22.9
    const res = calculateBMI(70, 175, 25, 'male', 'maintain');
    expect(res.bmi).toBe(22.9);
    expect(res.category).toBe('normal');
    expect(res.idealWeightRange[0]).toBeCloseTo(56.7, 1);
    expect(res.idealWeightRange[1]).toBeCloseTo(76.3, 1);
    expect(res.dailyCalories).toBeGreaterThan(1800);
    expect(res.dailyProteinGrams).toBe(126); // 70 * 1.8
  });

  it('correctly classifies underweight BMI (< 18.5)', () => {
    // 45kg at 170cm -> BMI = 45 / (1.7^2) = 15.57 -> 15.6
    const res = calculateBMI(45, 170, 22, 'female', 'bulk');
    expect(res.bmi).toBe(15.6);
    expect(res.category).toBe('underweight');
    expect(res.dailyCalories).toBeGreaterThan(1200);
    expect(res.dailyProteinGrams).toBe(90); // 45 * 2.0 (bulk)
  });

  it('correctly classifies overweight BMI (25.0 - 29.9)', () => {
    // 85kg at 175cm -> BMI = 85 / (1.75^2) = 27.755 -> 27.8
    const res = calculateBMI(85, 175, 30, 'male', 'cut');
    expect(res.bmi).toBe(27.8);
    expect(res.category).toBe('overweight');
    // Cutting protein is higher: 85 * 2.2 = 187
    expect(res.dailyProteinGrams).toBe(187);
  });

  it('correctly classifies obese BMI (>= 30)', () => {
    // 100kg at 170cm -> BMI = 100 / (1.7^2) = 34.6
    const res = calculateBMI(100, 170, 35, 'male', 'cut');
    expect(res.bmi).toBe(34.6);
    expect(res.category).toBe('obese');
  });

  it('handles invalid or zero inputs gracefully', () => {
    const res = calculateBMI(0, 0);
    expect(res.bmi).toBe(0);
    expect(res.category).toBe('normal');
    expect(res.dailyCalories).toBe(2000);
  });

  it('accurately converts lbs to kg and vice-versa', () => {
    expect(lbsToKg(154.32)).toBeCloseTo(70, 0);
    expect(kgToLbs(70)).toBeCloseTo(154.3, 0);
  });
  it('handles extreme heights and weights without NaN or infinity', () => {
    // Extreme short height
    const resShort = calculateBMI(40, 110, 20, 'female', 'maintain');
    expect(resShort.bmi).toBeGreaterThan(0);
    expect(Number.isFinite(resShort.bmi)).toBe(true);
    expect(Number.isFinite(resShort.dailyCalories)).toBe(true);

    // Extreme tall height
    const resTall = calculateBMI(120, 230, 28, 'male', 'bulk');
    expect(resTall.bmi).toBeGreaterThan(0);
    expect(Number.isFinite(resTall.bmi)).toBe(true);
    expect(Number.isFinite(resTall.dailyCalories)).toBe(true);
  });
});

describe('Bilingual (ID/EN) i18n Dictionary Integrity', () => {
  it('contains complete matching keys across Indonesian and English dictionaries', () => {
    const idKeys = Object.keys(TRANSLATIONS.id).sort();
    const enKeys = Object.keys(TRANSLATIONS.en).sort();

    expect(idKeys).toEqual(enKeys);
    expect(idKeys.length).toBeGreaterThan(40);
  });

  it('ensures cancel_btn exists and is localized', () => {
    expect(TRANSLATIONS.id.cancel_btn).toBe('Batal');
    expect(TRANSLATIONS.en.cancel_btn).toBe('Cancel');
  });

  it('ensures Indonesian translations are non-empty and authentic', () => {
    expect(TRANSLATIONS.id.nav_home).toBe('Beranda');
    expect(TRANSLATIONS.id.nav_workout).toBe('Latihan');
    expect(TRANSLATIONS.id.nav_exercises).toBe('Gerakan');
    expect(TRANSLATIONS.id.nav_history).toBe('Riwayat');
    expect(TRANSLATIONS.id.nav_settings).toBe('Pengaturan');
    expect(TRANSLATIONS.id.bmi_normal).toBe('Berat Ideal');
    expect(TRANSLATIONS.id.bmi_overweight).toBe('Berat Berlebih');
    expect(TRANSLATIONS.id.onboarding_title_1).toContain('BMI');
    expect(TRANSLATIONS.id.today_label).toBe('Hari Ini');
    expect(TRANSLATIONS.id.this_week_label).toBe('Minggu Ini');
    expect(TRANSLATIONS.id.next_up_label).toBe('Selanjutnya');
    expect(TRANSLATIONS.id.hide_exercises).toBe('Tutup Gerakan');
  });

  it('ensures English translations are non-empty and authentic', () => {
    expect(TRANSLATIONS.en.nav_home).toBe('Home');
    expect(TRANSLATIONS.en.nav_workout).toBe('Workout');
    expect(TRANSLATIONS.en.nav_exercises).toBe('Exercises');
    expect(TRANSLATIONS.en.nav_history).toBe('History');
    expect(TRANSLATIONS.en.bmi_normal).toBe('Normal Weight');
    expect(TRANSLATIONS.en.today_label).toBe('Today');
    expect(TRANSLATIONS.en.this_week_label).toBe('This week');
    expect(TRANSLATIONS.en.next_up_label).toBe('Next up');
    expect(TRANSLATIONS.en.hide_exercises).toBe('Hide exercises');
  });
});

describe('Stacked Card Swipe Deck Physics & Logic', () => {
  it('correctly calculates cyclic next/peek card indices', () => {
    const totalCards = 3;
    const getPeekIndex = (front: number) => (front + 1) % totalCards;
    expect(getPeekIndex(0)).toBe(1);
    expect(getPeekIndex(1)).toBe(2);
    expect(getPeekIndex(2)).toBe(0);
  });

  it('computes scale factor smoothly during horizontal swipe drag', () => {
    const calculateBackCardScale = (dragX: number) =>
      Math.min(0.96 + (Math.abs(dragX) / 600) * 0.04, 1.0);

    // At rest (0px drag)
    expect(calculateBackCardScale(0)).toBe(0.96);
    // Halfway drag (300px drag)
    expect(calculateBackCardScale(300)).toBeCloseTo(0.98, 2);
    // Full drag / swipe threshold (600px drag)
    expect(calculateBackCardScale(600)).toBe(1.0);
    // Overswipe (>600px drag clamped at 1.0)
    expect(calculateBackCardScale(800)).toBe(1.0);
  });

  it('computes rotation angle with natural counter-clockwise tilt when dragged left', () => {
    const calculateRotation = (dragX: number) => dragX * 0.045;
    expect(calculateRotation(-100)).toBeCloseTo(-4.5, 1);
    expect(calculateRotation(100)).toBeCloseTo(4.5, 1);
  });
});

import { FITNESS_MOTIVATIONS, getDailyMotivationIndex, getMotivationText } from '../data/motivations';

describe('Daily Rotating Fitness Motivation Engine', () => {
  it('provides a valid non-empty list of fitness quotes in Indonesian and English', () => {
    expect(FITNESS_MOTIVATIONS.length).toBeGreaterThanOrEqual(10);
    for (const q of FITNESS_MOTIVATIONS) {
      expect(q.en.length).toBeGreaterThan(10);
      expect(q.id_lang.length).toBeGreaterThan(10);
    }
  });

  it('determines a valid deterministic daily motivation index within bounds', () => {
    const idx = getDailyMotivationIndex();
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(FITNESS_MOTIVATIONS.length);
  });

  it('retrieves authentic language text based on language parameter', () => {
    const quoteId = getMotivationText(0, 'id');
    const quoteEn = getMotivationText(0, 'en');

    expect(quoteId).toBe(FITNESS_MOTIVATIONS[0].id_lang);
    expect(quoteEn).toBe(FITNESS_MOTIVATIONS[0].en);
    expect(quoteId).not.toBe(quoteEn);
  });
});


