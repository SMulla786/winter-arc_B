import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist locally
const mealsUploadDir = path.join(__dirname, '../../public/uploads/meals');
const receiptsUploadDir = path.join(__dirname, '../../public/uploads/receipts');

if (!fs.existsSync(mealsUploadDir)) {
  fs.mkdirSync(mealsUploadDir, { recursive: true });
}
if (!fs.existsSync(receiptsUploadDir)) {
  fs.mkdirSync(receiptsUploadDir, { recursive: true });
}

// Storage engine for Food Photos
const foodStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mealsUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `meal_${Date.now()}_${Math.round(Math.random() * 1e4)}${ext}`;
    cb(null, uniqueName);
  },
});

// Storage engine for Receipts
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, receiptsUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueName = `receipt_${Date.now()}_${Math.round(Math.random() * 1e4)}${ext}`;
    cb(null, uniqueName);
  },
});

// Allowed file filter
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Only JPEG, PNG, and WebP are allowed.'));
  }
};

export const uploadFoodPhoto = multer({
  storage: foodStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export const uploadReceiptPhoto = multer({
  storage: receiptStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
