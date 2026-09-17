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

    const workoutSessions = await prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    res.status(200).json({ activities, workoutSessions });
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

export const logWorkoutSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { title, durationMinutes, caloriesBurned, notes } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Workout session title is required.' });
      return;
    }

    const session = await prisma.workoutSession.create({
      data: {
        userId,
        title,
        durationMinutes: Number(durationMinutes || 0),
        caloriesBurned: Number(caloriesBurned || 0),
        notes,
      },
    });

    res.status(201).json({ message: 'Workout session logged successfully', session });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to log workout session.' });
  }
};

export const getExerciseLibrary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, difficulty, search } = req.query;

    const whereClause: any = {};
    if (category) whereClause.category = String(category);
    if (difficulty) whereClause.difficulty = String(difficulty);
    if (search) {
      whereClause.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { muscleGroup: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    res.status(200).json({ exercises });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch exercise library.' });
  }
};
