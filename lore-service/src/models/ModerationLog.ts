// lore-service/src/models/ModerationLog.ts

import mongoose, { Document, Schema } from "mongoose"

/**
 * MOD-2: Enum des actions de modération
 */
export enum ModerationAction {
  VALIDATE = "validate",
  REJECT = "reject",
  DELETE = "delete",
  RESTORE = "restore", // Bonus pour la restauration
}

/**
 * MOD-2: Enum des types de cibles
 */
export enum TargetType {
  TESTIMONY = "testimony",
  CREATURE = "creature", // Extensible pour le futur
}

/**
 * MOD-2: Interface du log de modération
 */
export interface IModerationLog extends Document {
  userId: string // ID de l'utilisateur qui effectue l'action
  action: ModerationAction // validate | reject | delete | restore
  targetId: string // ID de la ressource concernée (testimony, creature)
  targetType: TargetType // Type de ressource (testimony, creature)
  metadata?: {
    // Métadonnées optionnelles pour contexte supplémentaire
    reason?: string
    previousStatus?: string
    newStatus?: string
    [key: string]: any
  }
  timestamp: Date
  createdAt: Date
}

const moderationLogSchema = new Schema<IModerationLog>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    action: {
      type: String,
      enum: {
        values: Object.values(ModerationAction),
        message: "{VALUE} is not a valid moderation action",
      },
      required: [true, "Action is required"],
      index: true,
    },
    targetId: {
      type: String,
      required: [true, "Target ID is required"],
      index: true,
    },
    targetType: {
      type: String,
      enum: {
        values: Object.values(TargetType),
        message: "{VALUE} is not a valid target type",
      },
      required: [true, "Target type is required"],
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Seulement createdAt
    collection: "moderation_logs",
  }
)

// Index composés pour optimiser les requêtes fréquentes
moderationLogSchema.index({ userId: 1, timestamp: -1 })
moderationLogSchema.index({ targetId: 1, timestamp: -1 })
moderationLogSchema.index({ action: 1, timestamp: -1 })
moderationLogSchema.index({ targetType: 1, action: 1, timestamp: -1 })

export default mongoose.model<IModerationLog>(
  "ModerationLog",
  moderationLogSchema
)
