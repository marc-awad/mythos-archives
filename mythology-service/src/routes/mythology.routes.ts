// src/routes/mythology.routes.ts

import { Router } from "express"
import mythologyController from "../controllers/mythology.controller"
import AuthMiddleware from "../middlewares/auth.middleware"

const router = Router()

/**
 * GET /mythology/stats
 * Récupérer les statistiques du bestiaire
 * Requiert un JWT valide
 */
router.get("/stats", AuthMiddleware.authenticate, mythologyController.getStats)

export default router
