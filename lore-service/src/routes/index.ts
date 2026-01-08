import { Router, Request, Response } from "express"

const router = Router()

// Routes à ajouter plus tard
// import creatureRoutes from './creature.routes';
// import testimonyRoutes from './testimony.routes';

router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "lore-service",
    timestamp: new Date().toISOString(),
  })
})

// router.use('/creatures', creatureRoutes);
// router.use('/testimonies', testimonyRoutes);

export default router
