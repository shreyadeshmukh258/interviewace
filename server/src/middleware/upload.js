import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const make = (mimes, maxMb) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxMb * 1024 * 1024 },
    fileFilter: (_req, file, cb) =>
      mimes.includes(file.mimetype) ? cb(null, true) : cb(new ApiError(415, 'Unsupported file type')),
  });

export const uploadPdf = make(['application/pdf'], 5).single('resume');
export const uploadAvatar = make(['image/png', 'image/jpeg', 'image/webp'], 2).single('avatar');
