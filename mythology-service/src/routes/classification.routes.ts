// src/routes/classification.routes.ts

import { Router } from "express"
import {
  getClassification,
  getFamilies,
} from "../controllers/classification.controller"
import { AuthMiddleware } from "../middlewares/auth.middleware"

const router = Router()

/**
 * @route   GET /mythology/classification
 * @desc    Récupère la classification complète des créatures
 * @access  Private (JWT requis)
 * @query   ?details=true pour inclure les détails complets de chaque créature
 */
router.get("/", AuthMiddleware.authenticate, getClassification)

/**
 * @route   GET /mythology/classification/families
 * @desc    Liste uniquement les familles mythologiques disponibles
 * @access  Private (JWT requis)
 */
router.get("/families", AuthMiddleware.authenticate, getFamilies)

export default router
