import { PrismaClient, User } from '@prisma/client';
import { Role } from '../types';

const prisma = new PrismaClient();

export class UserRepository {
  // Créer un utilisateur
  async create(data: {
    email: string
    username: string
    password: string
    role?: Role
  }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: data.password,
        role: data.role || Role.USER,
      },
    });
  }

  // Trouver par email
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  // Trouver par username
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  // Trouver par ID
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  // Récupérer tous les users (sans les passwords)
  async findAll(): Promise<Omit<User, 'password'>[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        reputation: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Mettre à jour le rôle
  async updateRole(id: number, role: Role): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  // Supprimer un utilisateur
  async delete(id: number): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  // Mettre à jour la réputation
  async updateReputation(id: number, reputation: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { reputation },
    });
  }

  // Incrémenter la réputation (utile pour les témoignages validés)
  async incrementReputation(id: number, points: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        reputation: {
          increment: points,
        },
      },
    });
  }

  // Décrémenter la réputation
  async decrementReputation(id: number, points: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        reputation: {
          decrement: points,
        },
      },
    });
  }

  // Compter les utilisateurs par rôle (utile pour les stats)
  async countByRole(role: Role): Promise<number> {
    return prisma.user.count({
      where: { role },
    });
  }
}

// Export singleton
export default new UserRepository();
