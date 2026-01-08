import mongoose, { Document, Schema } from "mongoose"
import { TestimonyStatus } from "../types"

export interface ITestimony extends Document {
  creatureId: mongoose.Types.ObjectId
  authorId: string
  description: string
  status: TestimonyStatus
  validatedBy: string | null
  validatedAt: Date | null
  createdAt: Date
}

const testimonySchema = new Schema<ITestimony>({
  creatureId: {
    type: Schema.Types.ObjectId,
    ref: "Creature",
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: Object.values(TestimonyStatus),
    default: TestimonyStatus.PENDING,
  },
  validatedBy: {
    type: String,
    default: null,
  },
  validatedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index pour optimiser les requêtes
testimonySchema.index({ creatureId: 1 })
testimonySchema.index({ authorId: 1 })
testimonySchema.index({ status: 1 })

export default mongoose.model<ITestimony>("Testimony", testimonySchema)
