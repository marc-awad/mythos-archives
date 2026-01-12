"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const client_1 = require("@prisma/client");
const types_1 = require("../types");
const prisma = new client_1.PrismaClient();
class UserRepository {
    // Créer un utilisateur
    async create(data) {
        return prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                password: data.password,
                role: data.role || types_1.Role.USER,
            },
        });
    }
    // Trouver par email
    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
        });
    }
    // Trouver par username
    async findByUsername(username) {
        return prisma.user.findUnique({
            where: { username },
        });
    }
    // Trouver par ID
    async findById(id) {
        return prisma.user.findUnique({
            where: { id },
        });
    }
    // Récupérer tous les users (sans les passwords)
    async findAll() {
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
                createdAt: "desc",
            },
        });
    }
    // Mettre à jour le rôle
    async updateRole(id, role) {
        return prisma.user.update({
            where: { id },
            data: { role },
        });
    }
    // Supprimer un utilisateur
    async delete(id) {
        return prisma.user.delete({
            where: { id },
        });
    }
    // Mettre à jour la réputation
    async updateReputation(id, reputation) {
        return prisma.user.update({
            where: { id },
            data: { reputation },
        });
    }
    // Incrémenter la réputation (utile pour les témoignages validés)
    async incrementReputation(id, points) {
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
    async decrementReputation(id, points) {
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
    async countByRole(role) {
        return prisma.user.count({
            where: { role },
        });
    }
}
exports.UserRepository = UserRepository;
// Export singleton
exports.default = new UserRepository();
