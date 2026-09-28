import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { requireOwner } from '../../middleware/requireRole';
import * as controller from './returns.controller';

const router = Router();

// Returns are OWNER-only (enforced on the backend).
router.use(authenticate, requireOwner);

router.post('/', asyncHandler(controller.create));
router.get('/', asyncHandler(controller.list));

export default router;
