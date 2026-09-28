import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { requireOwner } from '../../middleware/requireRole';
import * as usersController from './users.controller';

const router = Router();

// Every route here requires a valid token AND the OWNER role.
router.use(authenticate, requireOwner);

router.get('/', asyncHandler(usersController.list));

export default router;
