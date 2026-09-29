import { Request, Response } from 'express';
import prisma from '../client';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';

export const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const totalUsers = await prisma.user.count();
  const activeUsers = await prisma.user.count({ where: { isActive: true } });
  const paidSubscribers = await prisma.subscription.count({ where: { status: 'ACTIVE' } });
  const totalMeals = await prisma.meal.count();
  const totalAiScans = await prisma.foodAnalysis.count();
  const plans = await prisma.plan.findMany({ include: { features: true } });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalUsers,
          activeUsers,
          paidSubscribers,
          totalMeals,
          totalAiScans,
          monthlyRevenue: paidSubscribers * 299, // Calculated from active subscriptions
        },
        plans,
      },
      'Admin stats fetched successfully'
    )
  );
});


export const getUsersList = catchAsync(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      subscriptions: {
        include: { plan: true },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json(
    new ApiResponse(200, { users }, 'Users list fetched successfully')
  );
});

export const toggleUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { user: updated },
      `User status changed to ${updated.isActive ? 'Active' : 'Inactive'}`
    )
  );
});
