import mongoose, { Document, Schema } from "mongoose"

export interface ICreature extends Document {
  authorId: string
  name: string
  origin?: string
  legendScore: number
  createdAt: Date
}

const creatureSchema = new Schema<ICreature>({
  authorId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  origin: {
    type: String,
    trim: true,
  },
  legendScore: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index pour optimiser les recherches
creatureSchema.index({ name: 1 })
creatureSchema.index({ legendScore: -1 })

export default mongoose.model<ICreature>("Creature", creatureSchema)
