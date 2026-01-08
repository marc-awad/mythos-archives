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
