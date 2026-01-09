import { TestimonyStatus } from "./index"

// DTOs pour les témoignages
export interface CreateTestimonyDto {
  creatureId: string
  description: string
}

export interface TestimonyResponse {
  _id: string
  creatureId: string
  authorId: string
  description: string
  status: TestimonyStatus
  validatedBy: string | null
  validatedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface GetTestimoniesQuery {
  status?: string // 'PENDING' | 'VALIDATED' | 'REJECTED'
}

export interface TestimonyWithAuthor extends TestimonyResponse {
  author?: {
    id: string
    username: string
    role: string
  }
}
