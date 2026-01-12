// lore-service/src/routes/moderation-log.routes.ts
// MOD-2: Routes optionnelles pour consulter les logs (ADMIN uniquement)

import { Router } from "express"
import moderationLogController from "../controllers/moderation-log.controller"
import { authMiddleware, requireAdmin } from "../middlewares/auth.middleware"

const router = Router()

/**
 * Toutes les routes de moderation-logs sont protégées et réservées aux ADMIN
 */

/**
 * GET /moderation-logs
 * Récupérer tous les logs avec filtres optionnels
 * Query params: userId, action, targetId, startDate, endDate
 *
 * Exemple: GET /moderation-logs?action=delete&startDate=2026-01-01
 */
router.get(
  "/",
  authMiddleware,
  requireAdmin,
  moderationLogController.getAllLogs
)

/**
 * GET /moderation-logs/user/:userId
 * Récupérer tous les logs d'un utilisateur spécifique
 */
router.get(
  "/user/:userId",
  authMiddleware,
  requireAdmin,
  moderationLogController.getLogsByUser
)

/**
 * GET /moderation-logs/target/:targetId
 * Récupérer tous les logs d'une cible spécifique (testimony, creature)
 */
router.get(
  "/target/:targetId",
  authMiddleware,
  requireAdmin,
  moderationLogController.getLogsByTarget
)

/**
 * GET /moderation-logs/stats
 * Récupérer les statistiques de modération
 */
router.get(
  "/stats",
  authMiddleware,
  requireAdmin,
  moderationLogController.getStats
)

export default router
