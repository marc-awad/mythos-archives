// lore-service/src/types/moderation-log.types.ts

import { ModerationAction, TargetType } from '../models/ModerationLog';

/**
 * MOD-2: DTO pour créer un log de modération
 */
export interface CreateModerationLogDto {
  userId: string
  action: ModerationAction
  targetId: string
  targetType: TargetType
  metadata?: {
    reason?: string
    previousStatus?: string
    newStatus?: string
    [key: string]: any
  }
}

/**
 * MOD-2: Filtres pour récupérer les logs
 */
export interface ModerationLogFilters {
  userId?: string
  action?: ModerationAction
  targetId?: string
  targetType?: TargetType
  startDate?: Date
  endDate?: Date
}

/**
 * MOD-2: Réponse d'un log de modération
 */
export interface ModerationLogResponse {
  _id: string
  userId: string
  action: ModerationAction
  targetId: string
  targetType: TargetType
  metadata?: {
    reason?: string
    previousStatus?: string
    newStatus?: string
    [key: string]: any
  }
  timestamp: Date
  createdAt: Date
}
