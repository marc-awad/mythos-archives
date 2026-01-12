// lore-service/src/types/index.ts
import { Request } from 'express';

/**
 * Interface représentant un utilisateur
 */
export interface IUser {
  id: string
  email: string
  username: string
  role: 'USER' | 'EXPERT' | 'ADMIN'
  reputation: number
}

/**
 * Payload JWT
 */
export interface JWTPayload {
  id: string
  email: string
  username: string
  role: 'USER' | 'EXPERT' | 'ADMIN'
  iat?: number
  exp?: number
}

/**
 * Statuts possibles d'un témoignage
 */
export enum TestimonyStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
}

/**
 * Interface pour les requêtes authentifiées
 * Étend Request d'Express avec les informations utilisateur du JWT
 * ✅ FIX: user doit être de type JWTPayload pour correspondre au middleware auth
 */
export interface AuthRequest extends Request {
  userId?: string
  user?: JWTPayload // ✅ Utilise JWTPayload au lieu d'un type custom
}

/**
 * Actions de modération possibles (MOD-2)
 */
export enum ModerationAction {
  VALIDATE = 'VALIDATE',
  REJECT = 'REJECT',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE',
}

/**
 * Interface pour un log de modération (MOD-2)
 */
export interface IModerationLog {
  userId: string
  action: ModerationAction
  targetId: string
  targetType: 'testimony' | 'creature'
  timestamp: Date
  reason?: string
}
