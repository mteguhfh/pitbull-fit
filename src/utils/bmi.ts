export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';
export type FitnessGoal = 'cut' | 'maintain' | 'bulk';
export type Gender = 'male' | 'female' | 'other';

export interface BMIResult {
  bmi: number;
  category: BMICategory;
  idealWeightRange: [number, number]; // [minKg, maxKg] for BMI 18.5 - 24.9
  dailyCalories: number;
  dailyProteinGrams: number;
  waterLiters: number;
}

/**
 * Calculates Body Mass Index (BMI) and physiological macro targets.
 * Formula: BMI = weight (kg) / (height (m) ^ 2)
 */
export function calculateBMI(
  weightKg: number,
  heightCm: number,
  age: number = 25,
  gender: Gender = 'male',
  goal: FitnessGoal = 'maintain'
): BMIResult {
  if (weightKg <= 0 || heightCm <= 0) {
    return {
      bmi: 0,
      category: 'normal',
      idealWeightRange: [0, 0],
      dailyCalories: 2000,
      dailyProteinGrams: 120,
      waterLiters: 2.5
    };
  }

  const heightM = heightCm / 100;
  const rawBmi = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBmi * 10) / 10;

  let category: BMICategory = 'normal';
  if (bmi < 18.5) {
    category = 'underweight';
  } else if (bmi < 25) {
    category = 'normal';
  } else if (bmi < 30) {
    category = 'overweight';
  } else {
    category = 'obese';
  }

  // Ideal weight range for normal BMI 18.5 to 24.9
  const minIdealKg = Math.round(18.5 * heightM * heightM * 10) / 10;
  const maxIdealKg = Math.round(24.9 * heightM * heightM * 10) / 10;

  // Mifflin-St Jeor BMR calculation
  // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr += 5;
  }

  // TDEE with moderate strength training multiplier (1.45x)
  let tdee = Math.round(bmr * 1.45);

  // Goal adjustments
  if (goal === 'cut') {
    tdee = Math.round(tdee * 0.82); // 18% deficit
  } else if (goal === 'bulk') {
    tdee = Math.round(tdee * 1.12); // 12% surplus
  }

  // Protein targets for resistance training (1.8g to 2.2g per kg bodyweight)
  const proteinMultiplier = goal === 'cut' ? 2.2 : goal === 'bulk' ? 2.0 : 1.8;
  const dailyProteinGrams = Math.round(weightKg * proteinMultiplier);

  // Daily water target: approx 35-40ml per kg
  const waterLiters = Math.round((weightKg * 0.038) * 10) / 10;

  return {
    bmi,
    category,
    idealWeightRange: [minIdealKg, maxIdealKg],
    dailyCalories: Math.max(1200, tdee),
    dailyProteinGrams,
    waterLiters
  };
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}
