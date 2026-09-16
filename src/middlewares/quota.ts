import { Request, Response, NextFunction } from 'express';
import prisma from '../client';

export const checkQuota = (featureKey: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized. Please login.' });
        return;
      }

      // 1. Fetch user active subscription & plan features
      const activeSubscription = await prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: { plan: { include: { features: true } } },
        orderBy: { createdAt: 'desc' },
      });

      if (!activeSubscription) {
        res.status(403).json({ error: 'No active subscription found. Please subscribe to a plan.' });
        return;
      }

      const featureConfig = activeSubscription.plan.features.find((f) => f.featureKey === featureKey);

      if (!featureConfig || !featureConfig.isEnabled) {
        res.status(403).json({
          error: `The feature '${featureKey}' is not included in your current '${activeSubscription.plan.name}' plan. Please upgrade to access this feature.`,
          featureKey,
          upgradeRequired: true,
        });
        return;
      }

      // If limitValue is null, feature is unlimited
      if (featureConfig.limitValue === null) {
        next();
        return;
      }

      // 2. Check current period usage in UsageLog
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const usage = await prisma.usageLog.findUnique({
        where: {
          userId_featureKey_periodStart: {
            userId,
            featureKey,
            periodStart,
          },
        },
      });

      const currentCount = usage ? usage.count : 0;

      if (currentCount >= featureConfig.limitValue) {
        res.status(403).json({
          error: `Monthly limit of ${featureConfig.limitValue} for '${featureKey}' reached on your ${activeSubscription.plan.name} plan.`,
          featureKey,
          used: currentCount,
          limit: featureConfig.limitValue,
          quotaExceeded: true,
        });
        return;
      }

      // Save request context for incrementing after success
      (req as any).quotaInfo = {
        userId,
        featureKey,
        periodStart,
        periodEnd,
      };

      next();
    } catch (err: any) {
      console.error('Quota check error:', err);
      res.status(500).json({ error: 'Failed to verify feature usage quota.' });
    }
  };
};

export const recordUsage = async (userId: string, featureKey: string): Promise<void> => {
  try {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    await prisma.usageLog.upsert({
      where: {
        userId_featureKey_periodStart: {
          userId,
          featureKey,
          periodStart,
        },
      },
      update: { count: { increment: 1 } },
      create: {
        userId,
        featureKey,
        periodStart,
        periodEnd,
        count: 1,
      },
    });
  } catch (err: any) {
    console.error('Record usage error:', err);
  }
};
