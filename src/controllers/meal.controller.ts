import { Request, Response } from 'express';
import prisma from '../client';

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

    res.status(200).json({ meals, totals });
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
