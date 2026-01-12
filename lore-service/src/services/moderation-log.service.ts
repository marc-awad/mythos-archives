// lore-service/src/services/moderation-log.service.ts

import moderationLogRepository from '../repositories/moderation-log.repository';
import {
  ModerationAction,
  TargetType,
  IModerationLog,
} from '../models/ModerationLog';
import {
  CreateModerationLogDto,
  ModerationLogFilters,
} from '../types/moderation-log.types';

/**
 * MOD-2: Service pour gérer les logs de modération
 */
export class ModerationLogService {
  /**
   * Logger une action de modération
   * Méthode principale utilisée par les autres services
   */
  async logAction(data: CreateModerationLogDto): Promise<void> {
    try {
      await moderationLogRepository.create(data);
      console.log(
        `[ModerationLog] Action logged: ${data.action} by user ${data.userId} on ${data.targetType} ${data.targetId}`,
      );
    } catch (error) {
      // On ne veut pas bloquer l'opération principale si le logging échoue
      console.error('[ModerationLog] Failed to log action:', error);
      // Ne pas throw l'erreur pour ne pas impacter les opérations critiques
    }
  }

  /**
   * Logger une validation de témoignage
   */
  async logValidate(
    userId: string,
    testimonyId: string,
    metadata?: any,
  ): Promise<void> {
    await this.logAction({
      userId,
      action: ModerationAction.VALIDATE,
      targetId: testimonyId,
      targetType: TargetType.TESTIMONY,
      metadata: {
        ...metadata,
        previousStatus: 'PENDING',
        newStatus: 'VALIDATED',
      },
    });
  }

  /**
   * Logger un rejet de témoignage
   */
  async logReject(
    userId: string,
    testimonyId: string,
    metadata?: any,
  ): Promise<void> {
    await this.logAction({
      userId,
      action: ModerationAction.REJECT,
      targetId: testimonyId,
      targetType: TargetType.TESTIMONY,
      metadata: {
        ...metadata,
        previousStatus: 'PENDING',
        newStatus: 'REJECTED',
      },
    });
  }

  /**
   * Logger une suppression de témoignage
   */
  async logDelete(
    userId: string,
    testimonyId: string,
    metadata?: any,
  ): Promise<void> {
    await this.logAction({
      userId,
      action: ModerationAction.DELETE,
      targetId: testimonyId,
      targetType: TargetType.TESTIMONY,
      metadata,
    });
  }

  /**
   * Logger une restauration de témoignage
   */
  async logRestore(
    userId: string,
    testimonyId: string,
    metadata?: any,
  ): Promise<void> {
    await this.logAction({
      userId,
      action: ModerationAction.RESTORE,
      targetId: testimonyId,
      targetType: TargetType.TESTIMONY,
      metadata,
    });
  }

  /**
   * Récupérer tous les logs avec filtres
   */
  async getAllLogs(filters?: ModerationLogFilters): Promise<IModerationLog[]> {
    return await moderationLogRepository.findAll(filters);
  }

  /**
   * Récupérer les logs d'un utilisateur
   */
  async getLogsByUser(userId: string): Promise<IModerationLog[]> {
    return await moderationLogRepository.findByUser(userId);
  }

  /**
   * Récupérer les logs d'une cible (testimony, creature)
   */
  async getLogsByTarget(targetId: string): Promise<IModerationLog[]> {
    return await moderationLogRepository.findByTarget(targetId);
  }

  /**
   * Récupérer les logs par type d'action
   */
  async getLogsByAction(action: ModerationAction): Promise<IModerationLog[]> {
    return await moderationLogRepository.findByAction(action);
  }

  /**
   * Compter les logs avec filtres
   */
  async countLogs(filters?: ModerationLogFilters): Promise<number> {
    return await moderationLogRepository.count(filters);
  }

  /**
   * Récupérer les statistiques de modération
   */
  async getStats() {
    return await moderationLogRepository.getStats();
  }
}

export default new ModerationLogService();
