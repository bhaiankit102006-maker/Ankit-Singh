export interface BiometricProfileInput {
  age?: number | null;
  gender?: string | null;
  height_cm?: number | null;
  current_weight_kg?: number | null;
  target_weight_kg?: number | null;
  activity_level?: string | null;
  goal?: string | null;
  dietary_preference?: string | null;
}

export interface CalculatedNutritionTargets {
  bmr: number;
  tdee: number;
  daily_calorie_target: number;
  protein_target_g: number;
  carbs_target_g: number;
  fat_target_g: number;
  water_target_ml: number;
  bmi: number;
  bmi_category: string;
}

export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string } {
  if (!weightKg || !heightCm || heightCm <= 0) return { bmi: 0, category: 'N/A' };
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  
  let category = 'Normal weight';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi >= 18.5 && bmi < 25) category = 'Normal weight';
  else if (bmi >= 25 && bmi < 30) category = 'Overweight';
  else category = 'Obesity';

  return { bmi, category };
}

export function calculateMifflinStJeor(profile: BiometricProfileInput): CalculatedNutritionTargets {
  const weight = profile.current_weight_kg || 70;
  const height = profile.height_cm || 170;
  const age = profile.age || 28;
  const gender = (profile.gender || 'prefer_not_to_say').toLowerCase();
  const activity = profile.activity_level || 'sedentary';
  const goal = profile.goal || 'maintain_weight';

  // 1. Basal Metabolic Rate (BMR)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    // Average baseline when gender is unspecified or neutral
    bmr -= 78;
  }
  bmr = Math.max(1000, Math.round(bmr));

  // 2. Activity Multiplier -> Total Daily Energy Expenditure (TDEE)
  let activityMultiplier = 1.2; // Sedentary
  if (activity === 'light') activityMultiplier = 1.375;
  else if (activity === 'moderate') activityMultiplier = 1.55;
  else if (activity === 'active') activityMultiplier = 1.725;
  else if (activity === 'very_active') activityMultiplier = 1.9;

  const tdee = Math.round(bmr * activityMultiplier);

  // 3. Goal Adjustment (Conservative, health-protective limits)
  let calorieTarget = tdee;
  if (goal === 'lose_weight') {
    // Safe deficit: 400 kcal deficit
    calorieTarget = Math.max(gender === 'male' ? 1500 : 1250, tdee - 400);
  } else if (goal === 'gain_weight') {
    // Conservative surplus: +350 kcal
    calorieTarget = tdee + 350;
  }

  // 4. Macro Distribution
  // Protein: 1.8g - 2.0g per kg of body weight
  let proteinTarget = Math.round(weight * 1.8);
  if (profile.dietary_preference === 'vegan') {
    proteinTarget = Math.round(weight * 1.7);
  }
  // Ensure protein does not exceed 35% of total calories
  const maxProteinG = Math.round((calorieTarget * 0.35) / 4);
  const minProteinG = Math.round((calorieTarget * 0.15) / 4);
  proteinTarget = Math.min(maxProteinG, Math.max(minProteinG, proteinTarget));

  // Fat: ~25-28% of total calories (9 kcal/g)
  const fatCalories = calorieTarget * 0.27;
  const fatTarget = Math.round(fatCalories / 9);

  // Carbs: Remainder of calories (4 kcal/g)
  const carbCalories = Math.max(200, calorieTarget - (proteinTarget * 4 + fatTarget * 9));
  const carbsTarget = Math.round(carbCalories / 4);

  // 5. Water Target: ~35ml per kg of body weight, baseline 2500ml
  const waterTarget = Math.max(2000, Math.min(4500, Math.round(weight * 35)));

  const { bmi, category } = calculateBMI(weight, height);

  return {
    bmr,
    tdee,
    daily_calorie_target: calorieTarget,
    protein_target_g: proteinTarget,
    carbs_target_g: carbsTarget,
    fat_target_g: fatTarget,
    water_target_ml: waterTarget,
    bmi,
    bmi_category: category,
  };
}

/**
 * Calculates proportional nutrition based on selected portion vs food item reference serving
 */
export function calculatePortionNutrition(
  referenceServing: number,
  portionQuantity: number,
  nutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  }
) {
  const ratio = (portionQuantity || 0) / (referenceServing || 100);
  return {
    calories: Math.round(nutrients.calories * ratio * 10) / 10,
    protein: Math.round(nutrients.protein * ratio * 10) / 10,
    carbs: Math.round(nutrients.carbs * ratio * 10) / 10,
    fat: Math.round(nutrients.fat * ratio * 10) / 10,
    fiber: Math.round((nutrients.fiber || 0) * ratio * 10) / 10,
    sugar: Math.round((nutrients.sugar || 0) * ratio * 10) / 10,
    sodium: Math.round((nutrients.sodium || 0) * ratio * 10) / 10,
  };
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}
