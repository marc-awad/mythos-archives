import mongoose, { Document, Schema } from "mongoose"

export interface ICreature extends Document {
  authorId: string
  name: string
  origin?: string
  legendScore: number
  createdAt: Date
}

const creatureSchema = new Schema<ICreature>(
  {
    authorId: {
      type: String,
      required: [true, "Author ID is required"],
      index: true, // Index pour optimiser les recherches par auteur
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    origin: {
      type: String,
      trim: true,
      maxlength: [200, "Origin cannot exceed 200 characters"],
    },
    legendScore: {
      type: Number,
      default: 1,
      min: [1, "Legend score cannot be less than 1"],
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  }
)

// Index composé pour optimiser les recherches
creatureSchema.index({ name: 1 }) // Déjà assuré par unique: true
creatureSchema.index({ legendScore: -1 }) // Pour trier par score
creatureSchema.index({ authorId: 1, createdAt: -1 }) // Pour récupérer les créatures d'un auteur

// Méthode virtuelle pour obtenir le nombre de témoignages (optionnel)
creatureSchema.virtual("testimonies", {
  ref: "Testimony",
  localField: "_id",
  foreignField: "creatureId",
})

export default mongoose.model<ICreature>("Creature", creatureSchema)
