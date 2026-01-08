import { PrismaClient, User, Role } from "@prisma/client"

const prisma = new PrismaClient()

export class UserRepository {
  async create(data: {
    email: string
    username: string
    password: string
    role?: Role
  }): Promise<User> {
    return prisma.user.create({ data })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } })
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  }

  async findAll(): Promise<User[]> {
    return prisma.user.findMany()
  }

  async updateRole(id: number, role: Role): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { role },
    })
  }

  async updateReputation(id: number, reputation: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { reputation },
    })
  }
}
