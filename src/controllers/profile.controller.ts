import { Request, Response } from 'express';
import prisma from '../client';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    res.status(200).json({ profile });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      age,
      gender,
      heightCm,
      weightKg,
      targetWeightKg,
      goal,
      lifestyleType,
      workTiming,
      wakeTime,
      sleepTime,
      dietType,
      favoriteFoods,
      avoidedFoods,
      allergies,
      cuisinePreferences,
      dailyBudget,
      monthlyBudget,
      city,
      area,
    } = req.body;

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(age !== undefined && { age: Number(age) }),
        ...(gender && { gender }),
        ...(heightCm !== undefined && { heightCm: Number(heightCm) }),
        ...(weightKg !== undefined && { weightKg: Number(weightKg) }),
        ...(targetWeightKg !== undefined && { targetWeightKg: Number(targetWeightKg) }),
        ...(goal && { goal }),
        ...(lifestyleType && { lifestyleType }),
        ...(workTiming && { workTiming }),
        ...(wakeTime && { wakeTime }),
        ...(sleepTime && { sleepTime }),
        ...(dietType && { dietType }),
        ...(favoriteFoods && { favoriteFoods }),
        ...(avoidedFoods && { avoidedFoods }),
        ...(allergies && { allergies }),
        ...(cuisinePreferences && { cuisinePreferences }),
        ...(dailyBudget !== undefined && { dailyBudget: Number(dailyBudget) }),
        ...(monthlyBudget !== undefined && { monthlyBudget: Number(monthlyBudget) }),
        ...(city && { city }),
        ...(area && { area }),
      },
      create: {
        userId,
        age: age ? Number(age) : null,
        gender,
        heightCm: heightCm ? Number(heightCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        targetWeightKg: targetWeightKg ? Number(targetWeightKg) : null,
        goal: goal || 'WEIGHT_LOSS',
        lifestyleType: lifestyleType || 'OFFICE_WORKER',
        workTiming,
        wakeTime,
        sleepTime,
        dietType: dietType || 'NON_VEGETARIAN',
        favoriteFoods: favoriteFoods || [],
        avoidedFoods: avoidedFoods || [],
        allergies: allergies || [],
        cuisinePreferences: cuisinePreferences || [],
        dailyBudget: dailyBudget ? Number(dailyBudget) : 300,
        monthlyBudget: monthlyBudget ? Number(monthlyBudget) : null,
        city,
        area,
      },
    });

    res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile.' });
  }
};
