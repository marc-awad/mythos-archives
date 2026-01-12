"use strict";
// lore-service/src/services/moderation-log.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationLogService = void 0;
const moderation_log_repository_1 = __importDefault(require("../repositories/moderation-log.repository"));
const ModerationLog_1 = require("../models/ModerationLog");
/**
 * MOD-2: Service pour gérer les logs de modération
 */
class ModerationLogService {
    /**
     * Logger une action de modération
     * Méthode principale utilisée par les autres services
     */
    async logAction(data) {
        try {
            await moderation_log_repository_1.default.create(data);
            console.log(`[ModerationLog] Action logged: ${data.action} by user ${data.userId} on ${data.targetType} ${data.targetId}`);
        }
        catch (error) {
            // On ne veut pas bloquer l'opération principale si le logging échoue
            console.error("[ModerationLog] Failed to log action:", error);
            // Ne pas throw l'erreur pour ne pas impacter les opérations critiques
        }
    }
    /**
     * Logger une validation de témoignage
     */
    async logValidate(userId, testimonyId, metadata) {
        await this.logAction({
            userId,
            action: ModerationLog_1.ModerationAction.VALIDATE,
            targetId: testimonyId,
            targetType: ModerationLog_1.TargetType.TESTIMONY,
            metadata: {
                ...metadata,
                previousStatus: "PENDING",
                newStatus: "VALIDATED",
            },
        });
    }
    /**
     * Logger un rejet de témoignage
     */
    async logReject(userId, testimonyId, metadata) {
        await this.logAction({
            userId,
            action: ModerationLog_1.ModerationAction.REJECT,
            targetId: testimonyId,
            targetType: ModerationLog_1.TargetType.TESTIMONY,
            metadata: {
                ...metadata,
                previousStatus: "PENDING",
                newStatus: "REJECTED",
            },
        });
    }
    /**
     * Logger une suppression de témoignage
     */
    async logDelete(userId, testimonyId, metadata) {
        await this.logAction({
            userId,
            action: ModerationLog_1.ModerationAction.DELETE,
            targetId: testimonyId,
            targetType: ModerationLog_1.TargetType.TESTIMONY,
            metadata,
        });
    }
    /**
     * Logger une restauration de témoignage
     */
    async logRestore(userId, testimonyId, metadata) {
        await this.logAction({
            userId,
            action: ModerationLog_1.ModerationAction.RESTORE,
            targetId: testimonyId,
            targetType: ModerationLog_1.TargetType.TESTIMONY,
            metadata,
        });
    }
    /**
     * Récupérer tous les logs avec filtres
     */
    async getAllLogs(filters) {
        return await moderation_log_repository_1.default.findAll(filters);
    }
    /**
     * Récupérer les logs d'un utilisateur
     */
    async getLogsByUser(userId) {
        return await moderation_log_repository_1.default.findByUser(userId);
    }
    /**
     * Récupérer les logs d'une cible (testimony, creature)
     */
    async getLogsByTarget(targetId) {
        return await moderation_log_repository_1.default.findByTarget(targetId);
    }
    /**
     * Récupérer les logs par type d'action
     */
    async getLogsByAction(action) {
        return await moderation_log_repository_1.default.findByAction(action);
    }
    /**
     * Compter les logs avec filtres
     */
    async countLogs(filters) {
        return await moderation_log_repository_1.default.count(filters);
    }
    /**
     * Récupérer les statistiques de modération
     */
    async getStats() {
        return await moderation_log_repository_1.default.getStats();
    }
}
exports.ModerationLogService = ModerationLogService;
exports.default = new ModerationLogService();
