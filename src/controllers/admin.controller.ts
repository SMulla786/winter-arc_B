import { Request, Response } from 'express';
import prisma from '../client';

export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const totalMeals = await prisma.meal.count();
    const totalAiScans = await prisma.foodAnalysis.count();
    const plans = await prisma.plan.findMany({ include: { features: true } });

    res.status(200).json({
      stats: {
        totalUsers,
        activeUsers,
        totalMeals,
        totalAiScans,
      },
      plans,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch admin stats.' });
  }
};

export const getUsersList = async (req: Request, res: Response): Promise<void> => {
  try {
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

    res.status(200).json({ users });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch users list.' });
  }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });

    res.status(200).json({ message: `User status changed to ${updated.isActive ? 'Active' : 'Inactive'}`, user: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to toggle user status.' });
  }
};
