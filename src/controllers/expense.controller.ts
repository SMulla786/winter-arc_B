import { Request, Response } from 'express';
import prisma from '../client';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { getUserIdFromReq } from '../utils/auth';

export const getExpenses = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);

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

  res.status(200).json(
    new ApiResponse(
      200,
      { expenses, totalSpent, categoryTotals },
      'Expenses fetched successfully'
    )
  );
});

export const createExpense = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);

  const { category, foodName, amount, restaurantName } = req.body;

  if (!amount || isNaN(Number(amount))) {
    throw new ApiError(400, 'Valid expense amount is required.');
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

  res.status(201).json(
    new ApiResponse(201, { expense }, 'Expense logged successfully')
  );
});

export const deleteExpense = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const { id } = req.params;

  const expense = await prisma.expense.findFirst({ where: { id, userId } });
  if (!expense) {
    throw new ApiError(404, 'Expense not found or unauthorized.');
  }

  await prisma.expense.delete({ where: { id } });

  res.status(200).json(
    new ApiResponse(200, { id }, 'Expense deleted successfully')
  );
});
