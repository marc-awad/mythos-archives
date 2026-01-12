// src/routes/index.ts

import { Router } from 'express';
import mythologyRoutes from './mythology.routes';
import classificationRoutes from './classification.routes';

const router = Router();

/**
 * Route de santé du service (pas d'auth requise)
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mythology service is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Routes principales
 */
router.use('/mythology/stats', mythologyRoutes);
router.use('/mythology/classification', classificationRoutes);

export default router;
