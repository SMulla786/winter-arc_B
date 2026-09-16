import {File} from 'multer';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
                email: string;
                fullname: string;
                role: Role;
                phoneNumber?: string;
                marketerId?: string;
            };
            file?: File;
            files?:
                | {
                      [fieldname: string]: Express.Multer.File[];
                  }
                | Express.Multer.File[];
        }
    }
}
