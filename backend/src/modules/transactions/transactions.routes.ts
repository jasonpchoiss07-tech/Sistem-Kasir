import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import * as controller from './transactions.controller';

const router = Router();

// Both OWNER and KASIR can create and view transactions.
router.use(authenticate);

router.post('/', asyncHandler(controller.checkout));
router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getOne));
// Shipment status update allowed for both roles (per approved decision).
router.patch('/:id/shipment', asyncHandler(controller.updateShipment));

export default router;
