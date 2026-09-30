import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/**
 * Multer with in-memory storage (no local disk write here) so the buffer can be
 * forwarded to object storage. Safe on serverless (read-only filesystem).
 * Rejects non-image types and files larger than 5 MB.
 */
const productImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(ApiError.badRequest('Only image files (jpeg, png, webp, gif) are allowed'));
      return;
    }
    cb(null, true);
  },
}).single('photo');

/**
 * Wraps the multer middleware so multer-specific errors (e.g. file too large)
 * become clean 400 responses via the central error handler.
 */
export function uploadProductImage(req: Request, res: Response, next: NextFunction): void {
  productImageUpload(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      next(ApiError.badRequest(`Upload gagal: ${err.message}`));
      return;
    }
    if (err) {
      next(err);
      return;
    }
    next();
  });
}
