import { Request, Response } from 'express';
import prisma from '../client';
import catchAsync from '../utils/catchAsync';
import ApiResponse from '../utils/ApiResponse';
import { getUserIdFromReq } from '../utils/auth';
import { targetService } from '../services';


export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  res.status(200).json(
    new ApiResponse(200, { profile }, 'User profile fetched successfully')
  );
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);

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

  res.status(200).json(
    new ApiResponse(200, { profile: updatedProfile }, 'Profile updated successfully')
  );
});

export const getTargets = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const targets = await targetService.getUserHealthTargets(userId);

  res.status(200).json(
    new ApiResponse(200, { targets }, 'Health targets retrieved successfully')
  );
});

