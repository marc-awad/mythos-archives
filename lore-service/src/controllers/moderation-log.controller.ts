// lore-service/src/controllers/moderation-log.controller.ts
// MOD-2: Controller optionnel pour consulter les logs (ADMIN uniquement)

import { Response } from "express"
import moderationLogService from "../services/moderation-log.service"
import { AuthRequest } from "../types"
import { ModerationAction } from "../models/ModerationLog"

export class ModerationLogController {
  /**
   * GET /moderation-logs
   * Récupérer tous les logs de modération (ADMIN uniquement)
   * Query params: userId, action, targetId, startDate, endDate
   */
  async getAllLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, action, targetId, startDate, endDate } = req.query

      const filters: any = {}

      if (userId) filters.userId = userId as string
      if (action) filters.action = action as ModerationAction
      if (targetId) filters.targetId = targetId as string
      if (startDate) filters.startDate = new Date(startDate as string)
      if (endDate) filters.endDate = new Date(endDate as string)

      const logs = await moderationLogService.getAllLogs(filters)

      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
      })
    } catch (error: any) {
      console.error("Error fetching moderation logs:", error)
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des logs",
        error: error.message,
      })
    }
  }

  /**
   * GET /moderation-logs/user/:userId
   * Récupérer les logs d'un utilisateur spécifique (ADMIN uniquement)
   */
  async getLogsByUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params

      const logs = await moderationLogService.getLogsByUser(userId)

      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
      })
    } catch (error: any) {
      console.error("Error fetching user logs:", error)
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des logs utilisateur",
        error: error.message,
      })
    }
  }

  /**
   * GET /moderation-logs/target/:targetId
   * Récupérer les logs d'une cible spécifique (ADMIN uniquement)
   */
  async getLogsByTarget(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { targetId } = req.params

      const logs = await moderationLogService.getLogsByTarget(targetId)

      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
      })
    } catch (error: any) {
      console.error("Error fetching target logs:", error)
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des logs de la cible",
        error: error.message,
      })
    }
  }

  /**
   * GET /moderation-logs/stats
   * Récupérer les statistiques de modération (ADMIN uniquement)
   */
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await moderationLogService.getStats()

      res.status(200).json({
        success: true,
        data: stats,
      })
    } catch (error: any) {
      console.error("Error fetching moderation stats:", error)
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques",
        error: error.message,
      })
    }
  }
}

export default new ModerationLogController()
