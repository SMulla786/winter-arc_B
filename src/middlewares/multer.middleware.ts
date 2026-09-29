import multer from 'multer';
import {Request} from 'express';
import path from 'path';
import fs from 'fs';
import {ApiError} from '@utils/index';
import {logger} from '@config/index';

// Define the temp directory path
const tempDir = path.join(__dirname, '../../public/temp');

// Ensure the temp directory exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, {recursive: true});
}

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        cb(null, tempDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const uniqueFilename = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueFilename);

        // Log the complete path of the uploaded file
        const filePath = path.join(tempDir, uniqueFilename);
        logger.info(`File uploaded: ${filePath}`);
    },
});

// Configure multer for file uploads
// const upload = multer({
//     storage,
//     fileFilter: (req: Request, file: Express.Multer.File, cb) => {
//         const allowedMimetypes = [
//             'image/jpeg',
//             'image/jpg',
//             'image/png',
//             'image/gif',
//             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
//             'application/vnd.ms-excel', // .xls
//             'text/csv', // .csv
//         ];

//         const extname = path.extname(file.originalname).toLowerCase();
//         const isMimetypeAllowed = allowedMimetypes.includes(file.mimetype);
//         const isExtnameAllowed = [
//             '.jpeg',
//             '.jpg',
//             '.png',
//             '.gif',
//             '.xlsx',
//             '.xls',
//             '.csv',
//         ].includes(extname);

//         if (isMimetypeAllowed && isExtnameAllowed) {
//             cb(null, true);
//         } else {
//             logger.error('File type not allowed.');
//             cb(new ApiError(400, 'File type not allowed.'));
//         }
//     },
//     limits: {fileSize: 32 * 1024 * 1024}, // Limit size to 32 MB
// });
// Replace with your actual ApiError class

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimetypes = [
            // Images
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',

            // PDFs
            'application/pdf',

            // Documents
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-powerpoint', // .ppt
            'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
            'text/plain', // .txt
            'text/csv', // .csv

            // Audio
            'audio/mpeg', // .mp3
            'audio/wav', // .wav
            'audio/ogg', // .ogg
            'audio/mp4', // .mp4 (audio-only)
            'audio/x-wav', // .wav

            // Videos
            'video/mp4', // .mp4
            'video/x-msvideo', // .avi
            'video/x-matroska', // .mkv
            'video/webm', // .webm
            'video/quicktime', // .mov
            'video/x-flv', // .flv
            'video/x-ms-wmv', // .wmv
        ];

        const extname = path.extname(file.originalname).toLowerCase();
        const isMimetypeAllowed = allowedMimetypes.includes(file.mimetype);
        const isExtnameAllowed = [
            '.jpeg',
            '.jpg',
            '.png',
            '.gif',
            '.webp',
            '.pdf',
            '.doc',
            '.docx',
            '.xls',
            '.xlsx',
            '.ppt',
            '.pptx',
            '.txt',
            '.csv',
            '.mp3',
            '.wav',
            '.ogg',
            '.mp4',
            '.avi',
            '.mkv',
            '.webm',
            '.mov',
            '.flv',
            '.wmv',
        ].includes(extname);

        if (isMimetypeAllowed && isExtnameAllowed) {
            cb(null, true);
        } else {
            logger.error('File type not allowed:', file.mimetype, file.originalname);
            cb(new ApiError(400, 'File type not allowed.'));
        }
    },
    limits: {fileSize: 32 * 1024 * 1024}, // Limit size to 32 MB
});

export const cleanTempFile = (filePath: string) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                logger.error(`Failed to delete temp file ${filePath}:`, err);
            } else {
                logger.info(`Temp file deleted: ${filePath}`);
            }
        });
    }
};

export {upload};
