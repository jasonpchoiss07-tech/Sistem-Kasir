import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { requireOwner } from '../../middleware/requireRole';
import * as controller from './customers.controller';

const router = Router();

// Customer management is OWNER-only.
router.use(authenticate, requireOwner);

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getOne));
router.post('/', asyncHandler(controller.create));
router.patch('/:id', asyncHandler(controller.update));

export default router;
