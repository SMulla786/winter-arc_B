import { Request } from 'express';
import ApiError from './ApiError';

export const getUserIdFromReq = (req: Request): string => {
  const userId = req.user?.userId || req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Authentication required. Please log in.');
  }
  return userId;
};
