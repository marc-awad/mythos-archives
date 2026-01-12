// src/routes/index.ts

import { Router, Request, Response } from "express"
import mythologyRoutes from "./mythology.routes"
import mythologyController from "../controllers/mythology.controller"

const router = Router()

// Route de santé (pas d'auth requise)
router.get("/health", mythologyController.healthCheck)

// Routes mythology
router.use("/mythology", mythologyRoutes)

// Route par défaut
router.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Mythology Service API",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      stats: "GET /mythology/stats (JWT required)",
    },
  })
})

export default router
