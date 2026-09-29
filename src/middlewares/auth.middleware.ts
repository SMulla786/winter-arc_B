import { Role } from '@prisma/client';
import { authenticate, requireAdmin, checkRole, verifyJWT } from './auth';

const checkAdmin = requireAdmin;
const checkUser = checkRole([Role.USER]);

export {
  verifyJWT,
  authenticate,
  checkRole,
  requireAdmin,
  checkAdmin,
  checkUser,
};

