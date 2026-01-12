// src/types/index.ts

import { Request } from "express"

// Extension de Request pour inclure l'utilisateur authentifié
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    username: string
    role: "USER" | "EXPERT" | "ADMIN"
  }
}

// Types pour les créatures depuis lore-service
export interface Creature {
  _id: string
  authorId: string
  name: string
  origin?: string
  legendScore: number
  createdAt: string
  updatedAt: string
}

// Types pour les témoignages depuis lore-service
export enum TestimonyStatus {
  PENDING = "PENDING",
  VALIDATED = "VALIDATED",
  REJECTED = "REJECTED",
}

export interface Testimony {
  _id: string
  creatureId: string
  authorId: string
  description: string
  status: TestimonyStatus
  validatedBy?: string
  validatedAt?: string
  createdAt: string
  updatedAt: string
}

// Types pour les réponses de lore-service
export interface LoreServiceCreaturesResponse {
  success: boolean
  message: string
  data: Creature[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface LoreServiceTestimoniesResponse {
  success: boolean
  message: string
  data: Testimony[]
  count: number
}

// Types pour les statistiques mythology-service
export interface CreatureStats {
  id: string
  name: string
  origin?: string
  legendScore: number
  totalTestimonies: number
  validatedTestimonies: number
  pendingTestimonies: number
  rejectedTestimonies: number
}

export interface MythologyStats {
  totalCreatures: number
  averageTestimoniesPerCreature: number
  totalTestimonies: number
  totalValidatedTestimonies: number
  totalPendingTestimonies: number
  totalRejectedTestimonies: number
  creatures: CreatureStats[]
}

// Types pour les erreurs
export interface ApiError extends Error {
  statusCode?: number
  code?: string
}
