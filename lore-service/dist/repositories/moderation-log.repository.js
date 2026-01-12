"use strict";
// lore-service/src/repositories/moderation-log.repository.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationLogRepository = void 0;
const ModerationLog_1 = __importDefault(require("../models/ModerationLog"));
/**
 * MOD-2: Repository pour les logs de modération
 */
class ModerationLogRepository {
    /**
     * Créer un nouveau log de modération
     */
    async create(data) {
        const log = new ModerationLog_1.default({
            userId: data.userId,
            action: data.action,
            targetId: data.targetId,
            targetType: data.targetType,
            metadata: data.metadata || {},
            timestamp: new Date(),
        });
        return await log.save();
    }
    /**
     * Récupérer tous les logs avec filtres optionnels
     */
    async findAll(filters = {}) {
        const query = {};
        if (filters.userId) {
            query.userId = filters.userId;
        }
        if (filters.action) {
            query.action = filters.action;
        }
        if (filters.targetId) {
            query.targetId = filters.targetId;
        }
        if (filters.targetType) {
            query.targetType = filters.targetType;
        }
        if (filters.startDate || filters.endDate) {
            query.timestamp = {};
            if (filters.startDate) {
                query.timestamp.$gte = filters.startDate;
            }
            if (filters.endDate) {
                query.timestamp.$lte = filters.endDate;
            }
        }
        return await ModerationLog_1.default.find(query).sort({ timestamp: -1 }).lean();
    }
    /**
     * Récupérer les logs d'un utilisateur spécifique
     */
    async findByUser(userId) {
        return await ModerationLog_1.default.find({ userId }).sort({ timestamp: -1 }).lean();
    }
    /**
     * Récupérer les logs d'une cible spécifique (testimony, creature)
     */
    async findByTarget(targetId) {
        return await ModerationLog_1.default.find({ targetId }).sort({ timestamp: -1 }).lean();
    }
    /**
     * Récupérer les logs par action
     */
    async findByAction(action) {
        return await ModerationLog_1.default.find({ action }).sort({ timestamp: -1 }).lean();
    }
    /**
     * Compter les logs avec filtres
     */
    async count(filters = {}) {
        const query = {};
        if (filters.userId) {
            query.userId = filters.userId;
        }
        if (filters.action) {
            query.action = filters.action;
        }
        if (filters.targetId) {
            query.targetId = filters.targetId;
        }
        if (filters.targetType) {
            query.targetType = filters.targetType;
        }
        if (filters.startDate || filters.endDate) {
            query.timestamp = {};
            if (filters.startDate) {
                query.timestamp.$gte = filters.startDate;
            }
            if (filters.endDate) {
                query.timestamp.$lte = filters.endDate;
            }
        }
        return await ModerationLog_1.default.countDocuments(query);
    }
    /**
     * Récupérer les statistiques de modération
     */
    async getStats() {
        const stats = await ModerationLog_1.default.aggregate([
            {
                $group: {
                    _id: "$action",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);
        return stats;
    }
}
exports.ModerationLogRepository = ModerationLogRepository;
exports.default = new ModerationLogRepository();
