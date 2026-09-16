import { Request, Response } from 'express';
import prisma from '../client';

export const logWater = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { glassCount = 1, amountMl = 250 } = req.body;

    const waterLog = await prisma.waterLog.create({
      data: {
        userId,
        glassCount: Number(glassCount),
        amountMl: Number(amountMl),
      },
    });

    res.status(201).json({ message: 'Water logged successfully', waterLog });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to log water intake.' });
  }
};

export const getDailyWater = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

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

    res.status(200).json({ totalGlasses, totalMl });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch water log.' });
  }
};

export const logWeight = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { weightKg, waistCm, chestCm, armsCm, thighCm } = req.body;

    if (!weightKg) {
      res.status(400).json({ error: 'weightKg is required.' });
      return;
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

    // Also update current weight in user profile
    await prisma.userProfile.update({
      where: { userId },
      data: { weightKg: Number(weightKg) },
    });

    res.status(201).json({ message: 'Weight logged successfully', weightLog });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to log weight.' });
  }
};

export const getWeightHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const weightLogs = await prisma.weightLog.findMany({
      where: { userId },
      orderBy: { loggedDate: 'asc' },
      take: 30,
    });

    res.status(200).json({ weightLogs });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch weight history.' });
  }
};
