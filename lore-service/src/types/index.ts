export interface IUser {
  id: string
  email: string
  username: string
  role: "USER" | "EXPERT" | "ADMIN"
  reputation: number
}

export interface JWTPayload {
  id: string
  email: string
  username: string
  role: "USER" | "EXPERT" | "ADMIN"
  iat?: number
  exp?: number
}

export enum TestimonyStatus {
  PENDING = "PENDING",
  VALIDATED = "VALIDATED",
  REJECTED = "REJECTED",
}
