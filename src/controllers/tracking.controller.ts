import { Request, Response } from 'express';
import prisma from '../client';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { getUserIdFromReq } from '../utils/auth';

export const logWater = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const { glassCount = 1, amountMl = 250 } = req.body;

  const waterLog = await prisma.waterLog.create({
    data: {
      userId,
      glassCount: Number(glassCount),
      amountMl: Number(amountMl),
    },
  });

  res.status(201).json(
    new ApiResponse(201, { waterLog }, 'Water intake logged successfully')
  );
});

export const getDailyWater = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const logs = await prisma.waterLog.findMany({
    where: {
      userId,
      loggedDate: { gte: startOfDay },
    },
  });

  const totalGlasses = logs.reduce((sum, log) => sum + log.glassCount, 0);
  const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0);

  res.status(200).json(
    new ApiResponse(200, { totalGlasses, totalMl }, 'Daily water log fetched successfully')
  );
});

export const logWeight = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const { weightKg, waistCm, chestCm, armsCm, thighCm } = req.body;

  if (!weightKg) {
    throw new ApiError(400, 'weightKg is required.');
  }

  const weightLog = await prisma.weightLog.create({
    data: {
      userId,
      weightKg: Number(weightKg),
      waistCm: waistCm ? Number(waistCm) : null,
      chestCm: chestCm ? Number(chestCm) : null,
      armsCm: armsCm ? Number(armsCm) : null,
      thighCm: thighCm ? Number(thighCm) : null,
    },
  });

  await prisma.userProfile.update({
    where: { userId },
    data: { weightKg: Number(weightKg) },
  }).catch(() => {});

  res.status(201).json(
    new ApiResponse(201, { weightLog }, 'Weight logged successfully')
  );
});

export const getWeightHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);

  const weightLogs = await prisma.weightLog.findMany({
    where: { userId },
    orderBy: { loggedDate: 'asc' },
    take: 30,
  });

  res.status(200).json(
    new ApiResponse(200, { weightLogs }, 'Weight history fetched successfully')
  );
});
