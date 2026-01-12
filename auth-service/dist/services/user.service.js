"use strict";
// auth-service/src/services/user.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const types_1 = require("../types");
class UserService {
    constructor() {
        this.userRepository = new user_repository_1.UserRepository();
    }
    /**
     * EVL-3: Mettre à jour la réputation d'un utilisateur
     * et promouvoir automatiquement à EXPERT si réputation >= 10
     *
     * @param userId - ID de l'utilisateur
     * @param reputationChange - Variation de réputation (+3, -1, +1, etc.)
     * @returns Utilisateur mis à jour
     */
    async updateReputation(userId, reputationChange) {
        // 1. Vérifier que l'utilisateur existe
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }
        // 2. Calculer la nouvelle réputation
        const newReputation = user.reputation + reputationChange;
        // 3. Mettre à jour la réputation
        const updatedUser = await this.userRepository.updateReputation(userId, newReputation);
        // 4. EVL-3: Promotion automatique à EXPERT si réputation >= 10
        if (updatedUser.reputation >= 10 && updatedUser.role === types_1.Role.USER) {
            // Promouvoir l'utilisateur à EXPERT
            const promotedUser = await this.userRepository.updateRole(userId, types_1.Role.EXPERT);
            console.log(`✨ Promotion automatique: ${promotedUser.username} (ID: ${userId}) est devenu EXPERT avec ${promotedUser.reputation} points de réputation`);
            return promotedUser;
        }
        return updatedUser;
    }
    /**
     * Récupérer un utilisateur par ID
     */
    async getUserById(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }
        // Retirer le mot de passe
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    /**
     * Récupérer tous les utilisateurs
     */
    async getAllUsers() {
        return await this.userRepository.findAll();
    }
    /**
     * Mettre à jour le rôle d'un utilisateur
     */
    async updateUserRole(userId, newRole, requestingUserId) {
        // Vérifier que l'utilisateur existe
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }
        // Empêcher un admin de modifier son propre rôle
        if (userId === requestingUserId) {
            throw new Error("Vous ne pouvez pas modifier votre propre rôle");
        }
        // Mettre à jour le rôle
        const updatedUser = await this.userRepository.updateRole(userId, newRole);
        // Retirer le mot de passe
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    /**
     * Supprimer un utilisateur
     */
    async deleteUser(userId, requestingUserId) {
        // Vérifier que l'utilisateur existe
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("Utilisateur non trouvé");
        }
        // Empêcher un admin de se supprimer lui-même
        if (userId === requestingUserId) {
            throw new Error("Vous ne pouvez pas supprimer votre propre compte");
        }
        await this.userRepository.delete(userId);
    }
}
exports.UserService = UserService;
exports.default = new UserService();
