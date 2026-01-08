export enum Role {
  USER = "USER",
  EXPERT = "EXPERT",
  ADMIN = "ADMIN",
}

export interface UserPayload {
  id: number
  email: string
  username: string
  role: Role
}

export interface CreateUserDTO {
  email: string
  username: string
  password: string
  role?: Role
}

export interface UpdateUserRoleDTO {
  role: Role
}

export interface RegisterDto {
  email: string
  username: string
  password: string
}

export interface UserResponse {
  id: number
  email: string
  username: string
  role: string
  reputation: number
  createdAt: Date
}
export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: UserResponse
  }
}
