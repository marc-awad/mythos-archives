// DTOs pour les créatures
export interface CreateCreatureDto {
  name: string
  origin?: string
}

export interface UpdateCreatureDto {
  name?: string
  origin?: string
}

export interface CreatureResponse {
  _id: string
  authorId: string
  name: string
  origin?: string
  legendScore: number
  createdAt: Date
  updatedAt: Date
}

export interface CreatureWithAuthor extends CreatureResponse {
  author?: {
    id: string
    username: string
    role: string
  }
}

// Query params pour la liste
export interface GetCreaturesQuery {
  page?: string
  limit?: string
  sort?: string // 'legendScore' | '-legendScore' | 'createdAt' | '-createdAt'
  search?: string // Recherche par nom
  authorId?: string // Filtrer par auteur
}
