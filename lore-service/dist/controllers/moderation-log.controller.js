"use strict";
// lore-service/src/controllers/moderation-log.controller.ts
// MOD-2: Controller optionnel pour consulter les logs (ADMIN uniquement)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationLogController = void 0;
const moderation_log_service_1 = __importDefault(require("../services/moderation-log.service"));
class ModerationLogController {
    /**
     * GET /moderation-logs
     * Récupérer tous les logs de modération (ADMIN uniquement)
     * Query params: userId, action, targetId, startDate, endDate
     */
    async getAllLogs(req, res) {
        try {
            const { userId, action, targetId, startDate, endDate } = req.query;
            const filters = {};
            if (userId)
                filters.userId = userId;
            if (action)
                filters.action = action;
            if (targetId)
                filters.targetId = targetId;
            if (startDate)
                filters.startDate = new Date(startDate);
            if (endDate)
                filters.endDate = new Date(endDate);
            const logs = await moderation_log_service_1.default.getAllLogs(filters);
            res.status(200).json({
                success: true,
                count: logs.length,
                data: logs,
            });
        }
        catch (error) {
            console.error("Error fetching moderation logs:", error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des logs",
                error: error.message,
            });
        }
    }
    /**
     * GET /moderation-logs/user/:userId
     * Récupérer les logs d'un utilisateur spécifique (ADMIN uniquement)
     */
    async getLogsByUser(req, res) {
        try {
            const { userId } = req.params;
            const logs = await moderation_log_service_1.default.getLogsByUser(userId);
            res.status(200).json({
                success: true,
                count: logs.length,
                data: logs,
            });
        }
        catch (error) {
            console.error("Error fetching user logs:", error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des logs utilisateur",
                error: error.message,
            });
        }
    }
    /**
     * GET /moderation-logs/target/:targetId
     * Récupérer les logs d'une cible spécifique (ADMIN uniquement)
     */
    async getLogsByTarget(req, res) {
        try {
            const { targetId } = req.params;
            const logs = await moderation_log_service_1.default.getLogsByTarget(targetId);
            res.status(200).json({
                success: true,
                count: logs.length,
                data: logs,
            });
        }
        catch (error) {
            console.error("Error fetching target logs:", error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des logs de la cible",
                error: error.message,
            });
        }
    }
    /**
     * GET /moderation-logs/stats
     * Récupérer les statistiques de modération (ADMIN uniquement)
     */
    async getStats(req, res) {
        try {
            const stats = await moderation_log_service_1.default.getStats();
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error("Error fetching moderation stats:", error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des statistiques",
                error: error.message,
            });
        }
    }
}
exports.ModerationLogController = ModerationLogController;
exports.default = new ModerationLogController();
