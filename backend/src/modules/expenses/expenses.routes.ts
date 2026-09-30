import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { requireOwner } from '../../middleware/requireRole';
import * as controller from './expenses.controller';

const router = Router();

// Expense tracking is OWNER-only.
router.use(authenticate, requireOwner);

router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.create));
router.delete('/:id', asyncHandler(controller.remove));

export default router;
