import { Request, Response } from 'express';
import prisma from '../client';

export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { days = '30' } = req.query;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - Number(days));

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        loggedAt: { gte: sinceDate },
      },
      include: { receipt: true },
      orderBy: { loggedAt: 'desc' },
    });

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryTotals = expenses.reduce((acc: Record<string, number>, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    res.status(200).json({ expenses, totalSpent, categoryTotals });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
};

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { category, foodName, amount, restaurantName } = req.body;

    if (!amount || isNaN(Number(amount))) {
      res.status(400).json({ error: 'Valid amount is required.' });
      return;
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        category: category || 'LUNCH',
        foodName,
        amount: Number(amount),
        restaurantName,
      },
    });

    res.status(201).json({ message: 'Expense logged successfully', expense });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to log expense.' });
  }
};
