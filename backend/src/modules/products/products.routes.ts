import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { requireOwner } from '../../middleware/requireRole';
import { uploadProductImage } from '../../config/upload';
import * as productsController from './products.controller';

const router = Router();

// All product routes require authentication.
router.use(authenticate);

// Reads: available to OWNER and KASIR (cashier sees active products only).
router.get('/', asyncHandler(productsController.list));
router.get('/:id', asyncHandler(productsController.getOne));
router.get('/:id/stock-adjustments', requireOwner, asyncHandler(productsController.listAdjustments));

// Mutations: OWNER only (authorization enforced here on the backend).
router.post('/', requireOwner, asyncHandler(productsController.create));
router.patch('/:id', requireOwner, asyncHandler(productsController.update));
router.delete('/:id', requireOwner, asyncHandler(productsController.remove));
router.post(
  '/:id/stock-adjustments',
  requireOwner,
  asyncHandler(productsController.adjustStock),
);
router.post('/upload', requireOwner, uploadProductImage, asyncHandler(productsController.upload));

export default router;
