import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../client';
import config from '../config/config';
import catchAsync from '../utils/catchAsync';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { getUserIdFromReq } from '../utils/auth';

export const register = catchAsync(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new ApiError(400, 'Email, password, and name are required.');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, 'A user with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const defaultPlan = await prisma.plan.findFirst({ where: { isDefault: true } });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'USER',
      profile: {
        create: {
          goal: 'WEIGHT_LOSS',
          dietType: 'NON_VEGETARIAN',
          dailyBudget: 300,
        },
      },
      ...(defaultPlan
        ? {
            subscriptions: {
              create: {
                planId: defaultPlan.id,
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            },
          }
        : {}),
    },
    include: {
      profile: true,
      subscriptions: { include: { plan: { include: { features: true } } } },
    },
  });

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    config.jwt.secret,
    { expiresIn: `${config.jwt.accessExpirationMinutes}m` }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, tokenType: 'refresh' },
    config.jwt.secret,
    { expiresIn: `${config.jwt.refreshExpirationDays}d` }
  );

  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile,
          subscription: user.subscriptions[0] || null,
        },
        accessToken,
        refreshToken,
      },
      'Registration successful'
    )
  );
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { plan: { include: { features: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account has been deactivated. Please contact support.');
  }

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    config.jwt.secret,
    { expiresIn: `${config.jwt.accessExpirationMinutes}m` }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, tokenType: 'refresh' },
    config.jwt.secret,
    { expiresIn: `${config.jwt.refreshExpirationDays}d` }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile,
          subscription: user.subscriptions[0] || null,
        },
        accessToken,
        refreshToken,
      },
      'Login successful'
    )
  );
});

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;
  if (!token) {
    throw new ApiError(400, 'refreshToken parameter is required.');
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, config.jwt.secret);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }

  if (decoded.tokenType !== 'refresh') {
    throw new ApiError(400, 'Invalid token type.');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found or inactive.');
  }

  const newAccessToken = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    config.jwt.secret,
    { expiresIn: `${config.jwt.accessExpirationMinutes}m` }
  );

  res.status(200).json(new ApiResponse(200, { accessToken: newAccessToken }, 'Access token refreshed successfully'));
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      profile: true,
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { plan: { include: { features: true } } },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          ...user,
          subscription: user.subscriptions[0] || null,
        },
      },
      'User profile fetched successfully'
    )
  );
});
