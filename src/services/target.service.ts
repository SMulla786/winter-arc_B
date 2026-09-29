import prisma from '../client';
import { UserProfile, GoalType, LifestyleType } from '@prisma/client';

export interface CalculatedHealthTargets {
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  waterTargetMl: number;
  waterTargetGlasses: number;
  stepTarget: number;
  dailyBudget: number;
}

export const calculateHealthTargets = (profile?: UserProfile | null): CalculatedHealthTargets => {
  if (!profile) {
    return {
      calorieTarget: 2000,
      proteinTarget: 130,
      carbsTarget: 220,
      fatTarget: 65,
      waterTargetMl: 2500,
      waterTargetGlasses: 10,
      stepTarget: 10000,
      dailyBudget: 300,
    };
  }

  const weight = profile.weightKg || 70;
  const height = profile.heightCm || 170;
  const age = profile.age || 25;
  const gender = profile.gender?.toUpperCase() || 'MALE';

  // 1. Basal Metabolic Rate (BMR) - Mifflin-St Jeor
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'FEMALE') {
    bmr -= 161;
  } else {
    bmr += 5;
  }

  // 2. Activity Multiplier (TDEE) based on lifestyleType
  let activityMultiplier = 1.375; // Moderate default
  if (profile.lifestyleType === LifestyleType.WORK_FROM_HOME) {
    activityMultiplier = 1.2;
  } else if (profile.lifestyleType === LifestyleType.OFFICE_WORKER || profile.lifestyleType === LifestyleType.STUDENT) {
    activityMultiplier = 1.45;
  } else if (profile.lifestyleType === LifestyleType.OTHER) {
    activityMultiplier = 1.6;
  }

  let tdee = Math.round(bmr * activityMultiplier);

  // 3. Goal Adjustment
  if (profile.goal === GoalType.WEIGHT_LOSS) {
    tdee = Math.max(1200, tdee - 500);
  } else if (profile.goal === GoalType.BUILD_MUSCLE || profile.goal === GoalType.WEIGHT_GAIN) {
    tdee = tdee + 350;
  }

  // 4. Macro Calculation
  const isMuscleGoal = profile.goal === GoalType.BUILD_MUSCLE || profile.goal === GoalType.WEIGHT_GAIN;
  const proteinGrams = Math.round(isMuscleGoal ? weight * 2.2 : weight * 1.8);
  const proteinCalories = proteinGrams * 4;

  // Fat: 25% of total calories
  const fatCalories = tdee * 0.25;
  const fatGrams = Math.round(fatCalories / 9);

  // Carbs: Remaining calories
  const carbCalories = Math.max(0, tdee - proteinCalories - fatCalories);
  const carbGrams = Math.round(carbCalories / 4);

  // 5. Water Target (~35ml / kg)
  const waterTargetMl = Math.round(weight * 35);
  const waterTargetGlasses = Math.round(waterTargetMl / 250);

  // 6. Step Target
  let stepTarget = 10000;
  if (profile.lifestyleType === LifestyleType.WORK_FROM_HOME) stepTarget = 8000;
  if (profile.lifestyleType === LifestyleType.OTHER) stepTarget = 12000;

  return {
    calorieTarget: tdee,
    proteinTarget: proteinGrams,
    carbsTarget: carbGrams,
    fatTarget: fatGrams,
    waterTargetMl,
    waterTargetGlasses,
    stepTarget,
    dailyBudget: profile.dailyBudget || 300,
  };
};

export const getUserHealthTargets = async (userId: string): Promise<CalculatedHealthTargets> => {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  return calculateHealthTargets(profile);
};
