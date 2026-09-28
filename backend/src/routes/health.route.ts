import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Liveness probe. Does not touch the database so it works before PostgreSQL
 * is configured.
 */
router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'pos-toko-bangunan-backend',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
