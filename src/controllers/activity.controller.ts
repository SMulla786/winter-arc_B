import { Request, Response } from 'express';
import prisma from '../client';

export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      take: 20,
    });

    res.status(200).json({ activities });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch activities.' });
  }
};

export const logActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { activityType, durationMinutes, steps, caloriesBurned } = req.body;

    const activity = await prisma.activity.create({
      data: {
        userId,
        activityType: activityType || 'WALKING',
        durationMinutes: Number(durationMinutes || 0),
        steps: Number(steps || 0),
        caloriesBurned: Number(caloriesBurned || 0),
      },
    });

    res.status(201).json({ message: 'Activity logged successfully', activity });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to log activity.' });
  }
};

export const getExerciseLibrary = async (req: Request, res: Response): Promise<void> => {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { name: 'asc' },
    });

    res.status(200).json({ exercises });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch exercise library.' });
  }
};
