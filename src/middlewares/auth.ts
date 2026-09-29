import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  id?: string;
  role: string | Role;
  email?: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if ((req as any).cookies?.accessToken) {
    token = (req as any).cookies.accessToken;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please provide a Bearer token.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
    const userId = decoded.userId || decoded.id || '';
    
    (req as any).user = {
      id: userId,
      userId: userId,
      role: decoded.role,
      email: decoded.email,
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired access token.' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  if (!user || (user.role !== 'ADMIN' && user.role !== Role.ADMIN)) {
    res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
    return;
  }
  next();
};

export const checkRole = (allowedRoles: (Role | string)[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        error: `Access denied: Your role (${user.role}) does not have permission.`,
      });
      return;
    }
    next();
  };
};

export const verifyJWT = authenticate;

