import { Request, Response } from 'express';
import prisma from '../client';

// Calculate daily recommended calories & macros using Mifflin-St Jeor equation
const calculateUserTargets = (profile: any) => {
  if (!profile || !profile.weightKg || !profile.heightCm || !profile.age) {
    return { targetCalories: 2000, targetProtein: 80, targetCarbs: 250, targetFat: 65 };
  }

  const weight = Number(profile.weightKg);
  const height = Number(profile.heightCm);
  const age = Number(profile.age);

  // BMR Calculation
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += profile.gender === 'FEMALE' ? -161 : 5;

  // Activity multiplier default (Moderately active = 1.375)
  let tdee = bmr * 1.375;

  // Adjust for goal
  if (profile.goal === 'WEIGHT_LOSS') {
    tdee -= 400;
  } else if (profile.goal === 'BUILD_MUSCLE') {
    tdee += 350;
  } else if (profile.goal === 'WEIGHT_GAIN') {
    tdee += 500;
  }

  const targetCalories = Math.round(tdee);
  const targetProtein = Math.round((tdee * 0.25) / 4); // 25% calories from protein
  const targetCarbs = Math.round((tdee * 0.50) / 4);   // 50% calories from carbs
  const targetFat = Math.round((tdee * 0.25) / 9);     // 25% calories from fat

  return { targetCalories, targetProtein, targetCarbs, targetFat };
};

export const getDailyMeals = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const meals = await prisma.meal.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: { items: true },
      orderBy: { loggedAt: 'desc' },
    });

    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const targets = calculateUserTargets(profile);

    const totals = meals.reduce(
      (acc, meal) => {
        acc.calories += meal.totalCalories;
        acc.proteinG += meal.totalProteinG;
        acc.carbsG += meal.totalCarbsG;
        acc.fatG += meal.totalFatG;
        return acc;
      },
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    );

    res.status(200).json({ meals, totals, targets });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch daily meals.' });
  }
};

export const createMeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { mealType, name, totalCalories, totalProteinG, totalCarbsG, totalFatG, notes, items } = req.body;

    if (!mealType || !name) {
      res.status(400).json({ error: 'mealType and name are required.' });
      return;
    }

    const meal = await prisma.meal.create({
      data: {
        userId,
        mealType,
        name,
        totalCalories: Number(totalCalories || 0),
        totalProteinG: Number(totalProteinG || 0),
        totalCarbsG: Number(totalCarbsG || 0),
        totalFatG: Number(totalFatG || 0),
        notes,
        items: items && Array.isArray(items) ? { create: items } : undefined,
      },
      include: { items: true },
    });

    res.status(201).json({ message: 'Meal logged successfully', meal });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to log meal.' });
  }
};

export const deleteMeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    const meal = await prisma.meal.findFirst({ where: { id, userId } });
    if (!meal) {
      res.status(404).json({ error: 'Meal not found or unauthorized.' });
      return;
    }

    await prisma.meal.delete({ where: { id } });
    res.status(200).json({ message: 'Meal deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete meal.' });
  }
};
