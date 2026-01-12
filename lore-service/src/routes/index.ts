import { Router, Request, Response } from 'express';
import creatureRoutes from './creature.routes';
import testimonyRoutes from './testimony.routes';
import creatureController from '../controllers/creature.controller';

const router = Router();

// ============================================
// HEALTH CHECK (route de base)
// ============================================
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'lore-service',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// ROUTES PRINCIPALES
// ============================================

// Routes pour les créatures
router.use('/creatures', creatureRoutes);

// Routes pour les témoignages
router.use('/testimonies', testimonyRoutes);

// LORE-6: Route spéciale pour récupérer les témoignages d'une créature
// GET /creatures/:id/testimonies
router.get(
  '/creatures/:id/testimonies',
  creatureController.getTestimoniesByCreature,
);

export default router;
