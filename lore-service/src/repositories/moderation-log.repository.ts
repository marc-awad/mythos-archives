// lore-service/src/repositories/moderation-log.repository.ts

import ModerationLog, { IModerationLog } from '../models/ModerationLog';
import {
  CreateModerationLogDto,
  ModerationLogFilters,
} from '../types/moderation-log.types';

/**
 * MOD-2: Repository pour les logs de modération
 */
export class ModerationLogRepository {
  /**
   * Créer un nouveau log de modération
   */
  async create(data: CreateModerationLogDto): Promise<IModerationLog> {
    const log = new ModerationLog({
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
  async findAll(filters: ModerationLogFilters = {}): Promise<IModerationLog[]> {
    const query: any = {};

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

    return await ModerationLog.find(query).sort({ timestamp: -1 }).lean();
  }

  /**
   * Récupérer les logs d'un utilisateur spécifique
   */
  async findByUser(userId: string): Promise<IModerationLog[]> {
    return await ModerationLog.find({ userId }).sort({ timestamp: -1 }).lean();
  }

  /**
   * Récupérer les logs d'une cible spécifique (testimony, creature)
   */
  async findByTarget(targetId: string): Promise<IModerationLog[]> {
    return await ModerationLog.find({ targetId }).sort({ timestamp: -1 }).lean();
  }

  /**
   * Récupérer les logs par action
   */
  async findByAction(action: string): Promise<IModerationLog[]> {
    return await ModerationLog.find({ action }).sort({ timestamp: -1 }).lean();
  }

  /**
   * Compter les logs avec filtres
   */
  async count(filters: ModerationLogFilters = {}): Promise<number> {
    const query: any = {};

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

    return await ModerationLog.countDocuments(query);
  }

  /**
   * Récupérer les statistiques de modération
   */
  async getStats() {
    const stats = await ModerationLog.aggregate([
      {
        $group: {
          _id: '$action',
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

export default new ModerationLogRepository();
