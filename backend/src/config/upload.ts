import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import { ApiError } from '../utils/ApiError';

/** Absolute path to the local uploads directory (served statically at /uploads). */
export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure the directory exists at startup.
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    const name = `product_${Date.now()}_${randomBytes(6).toString('hex')}${ext}`;
    cb(null, name);
  },
});

/**
 * Multer instance for a single product image.
 * Rejects non-image types and files larger than 5 MB.
 */
export const productImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(ApiError.badRequest('Only image files (jpeg, png, webp, gif) are allowed'));
      return;
    }
    cb(null, true);
  },
}).single('photo');

import type { Request, Response, NextFunction } from 'express';

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
