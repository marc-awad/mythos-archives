"use strict";
// src/services/creature.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatureService = void 0;
const creature_repository_1 = __importDefault(require("../repositories/creature.repository"));
const testimony_repository_1 = __importDefault(require("../repositories/testimony.repository"));
const types_1 = require("../types");
class CreatureService {
    /**
     * EVL-1: Calculer le legendScore d'une créature
     * Formule: legendScore = 1 + (nombreDeTestimoniesValidés / 5)
     *
     * @param creatureId - ID de la créature
     * @returns Le nouveau legendScore calculé
     */
    async calculateLegendScore(creatureId) {
        // Compter le nombre de témoignages validés pour cette créature
        const validatedCount = await testimony_repository_1.default.countByCreatureAndStatus(creatureId, types_1.TestimonyStatus.VALIDATED);
        // Appliquer la formule
        const legendScore = 1 + validatedCount / 5;
        return legendScore;
    }
    /**
     * EVL-1: Mettre à jour automatiquement le legendScore d'une créature
     * Cette méthode recalcule et sauvegarde le nouveau score
     *
     * @param creatureId - ID de la créature à mettre à jour
     */
    async updateLegendScore(creatureId) {
        const newScore = await this.calculateLegendScore(creatureId);
        await creature_repository_1.default.updateLegendScore(creatureId, newScore);
    }
    /**
     * Créer une nouvelle créature
     * Vérifie l'unicité du nom
     */
    async createCreature(data, authorId) {
        // Validation: vérifier que le nom n'existe pas déjà
        const existingCreature = await creature_repository_1.default.existsByName(data.name);
        if (existingCreature) {
            throw new Error(`Une créature avec le nom "${data.name}" existe déjà. Veuillez choisir un autre nom.`);
        }
        // Validation: nom minimum 2 caractères
        if (data.name.trim().length < 2) {
            throw new Error("Le nom doit contenir au moins 2 caractères");
        }
        // Validation: nom maximum 100 caractères
        if (data.name.trim().length > 100) {
            throw new Error("Le nom ne peut pas dépasser 100 caractères");
        }
        // Validation: origin maximum 200 caractères
        if (data.origin && data.origin.trim().length > 200) {
            throw new Error("L'origine ne peut pas dépasser 200 caractères");
        }
        // Créer la créature
        const creature = await creature_repository_1.default.create({
            name: data.name.trim(),
            origin: data.origin?.trim(),
        }, authorId);
        return creature;
    }
    /**
     * Récupérer toutes les créatures avec pagination et filtres
     */
    async getAllCreatures(options) {
        // Validation des paramètres
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(100, Math.max(1, options.limit || 10)); // Max 100 items par page
        return await creature_repository_1.default.findAll({
            page,
            limit,
            sort: options.sort,
            search: options.search,
            authorId: options.authorId,
        });
    }
    /**
     * Récupérer une créature par ID
     */
    async getCreatureById(id) {
        // Validation: vérifier que l'ID est un ObjectId MongoDB valide
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("ID de créature invalide");
        }
        const creature = await creature_repository_1.default.findById(id);
        if (!creature) {
            throw new Error("Créature non trouvée");
        }
        return creature;
    }
    /**
     * Mettre à jour une créature
     */
    async updateCreature(id, data, authorId, userRole) {
        // Validation: vérifier que l'ID est valide
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("ID de créature invalide");
        }
        const creature = await creature_repository_1.default.findById(id);
        if (!creature) {
            throw new Error("Créature non trouvée");
        }
        // Vérification des permissions: seul l'auteur ou un ADMIN peut modifier
        if (creature.authorId !== authorId && userRole !== "ADMIN") {
            throw new Error("Vous n'avez pas la permission de modifier cette créature");
        }
        // Validation: si le nom change, vérifier l'unicité
        if (data.name && data.name !== creature.name) {
            const existingCreature = await creature_repository_1.default.existsByName(data.name, id);
            if (existingCreature) {
                throw new Error(`Une créature avec le nom "${data.name}" existe déjà`);
            }
        }
        // Mettre à jour
        const updatedCreature = await creature_repository_1.default.update(id, {
            name: data.name?.trim(),
            origin: data.origin?.trim(),
        });
        if (!updatedCreature) {
            throw new Error("Erreur lors de la mise à jour");
        }
        return updatedCreature;
    }
    /**
     * Supprimer une créature
     */
    async deleteCreature(id, authorId, userRole) {
        // Validation: vérifier que l'ID est valide
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("ID de créature invalide");
        }
        const creature = await creature_repository_1.default.findById(id);
        if (!creature) {
            throw new Error("Créature non trouvée");
        }
        // Vérification des permissions: seul l'auteur ou un ADMIN peut supprimer
        if (creature.authorId !== authorId && userRole !== "ADMIN") {
            throw new Error("Vous n'avez pas la permission de supprimer cette créature");
        }
        await creature_repository_1.default.delete(id);
    }
    /**
     * Récupérer les créatures d'un auteur
     */
    async getCreaturesByAuthor(authorId, limit) {
        return await creature_repository_1.default.findByAuthor(authorId, limit);
    }
    /**
     * Compter les créatures d'un auteur
     */
    async countCreaturesByAuthor(authorId) {
        return await creature_repository_1.default.countByAuthor(authorId);
    }
}
exports.CreatureService = CreatureService;
exports.default = new CreatureService();
