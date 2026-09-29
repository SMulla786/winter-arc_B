import { Request, Response } from 'express';
import prisma from '../client';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { getUserIdFromReq } from '../utils/auth';

export const getActivities = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);

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

  res.status(200).json(
    new ApiResponse(
      200,
      { activities, workoutSessions },
      'Activities fetched successfully'
    )
  );
});

export const logActivity = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
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

  res.status(201).json(
    new ApiResponse(201, { activity }, 'Activity logged successfully')
  );
});

export const logWorkoutSession = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const { title, durationMinutes, caloriesBurned, notes } = req.body;

  if (!title) {
    throw new ApiError(400, 'Workout session title is required.');
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

  res.status(201).json(
    new ApiResponse(201, { session }, 'Workout session logged successfully')
  );
});

export const getExerciseLibrary = catchAsync(async (req: Request, res: Response) => {
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

  res.status(200).json(
    new ApiResponse(200, { exercises }, 'Exercise library fetched successfully')
  );
});

export const deleteActivity = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const { id } = req.params;

  const activity = await prisma.activity.findFirst({ where: { id, userId } });
  if (!activity) {
    throw new ApiError(404, 'Activity not found or unauthorized.');
  }

  await prisma.activity.delete({ where: { id } });

  res.status(200).json(
    new ApiResponse(200, { id }, 'Activity deleted successfully')
  );
});
