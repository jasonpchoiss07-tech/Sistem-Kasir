import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { requireOwner } from '../../middleware/requireRole';
import { listAuditLogs } from '../../services/audit';

const router = Router();

// Audit log is OWNER-only.
router.use(authenticate, requireOwner);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const logs = await listAuditLogs();
    res.json({ success: true, data: { logs } });
  }),
);

export default router;
