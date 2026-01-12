import mongoose, { Document, Schema } from 'mongoose';
import { TestimonyStatus } from '../types';

export interface ITestimony extends Document {
  creatureId: mongoose.Types.ObjectId
  authorId: string
  description: string
  status: TestimonyStatus
  validatedBy: string | null
  validatedAt: Date | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const testimonySchema = new Schema<ITestimony>(
  {
    creatureId: {
      type: Schema.Types.ObjectId,
      ref: 'Creature',
      required: [true, 'Creature ID is required'],
      index: true,
    },
    authorId: {
      type: String,
      required: [true, 'Author ID is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TestimonyStatus),
        message: '{VALUE} is not a valid status',
      },
      default: TestimonyStatus.PENDING,
      index: true,
    },
    validatedBy: {
      type: String,
      default: null,
    },
    validatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Index composés pour optimiser les requêtes
testimonySchema.index({ creatureId: 1, status: 1 });
testimonySchema.index({ authorId: 1, creatureId: 1 });
testimonySchema.index({ authorId: 1, createdAt: -1 });
testimonySchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<ITestimony>('Testimony', testimonySchema);
