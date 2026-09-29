import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        userId?: string;
        email?: string;
        name?: string;
        role?: Role | string;
      };
      file?: Express.Multer.File;
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    }
  }
}
