import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { requireOwner } from '../../middleware/requireRole';
import * as controller from './dashboard.controller';

const router = Router();

// Dashboard is OWNER-only (contains aggregated business figures).
router.use(authenticate, requireOwner);

router.get('/summary', asyncHandler(controller.summary));

export default router;
