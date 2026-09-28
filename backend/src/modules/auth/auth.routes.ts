import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import * as authController from './auth.controller';

const router = Router();

router.post('/login', asyncHandler(authController.login));
router.get('/me', authenticate, asyncHandler(authController.me));
router.post('/logout', authenticate, asyncHandler(authController.logout));

export default router;
