"use strict";
// lore-service/src/repositories/testimony.repository.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonyRepository = void 0;
const Testimony_1 = __importDefault(require("../models/Testimony"));
const types_1 = require("../types");
class TestimonyRepository {
    /**
     * Créer un témoignage
     */
    async create(data, authorId) {
        const testimony = new Testimony_1.default({
            creatureId: data.creatureId,
            authorId,
            description: data.description,
            status: types_1.TestimonyStatus.PENDING,
        });
        return await testimony.save();
    }
    /**
     * MOD-1: Trouver un témoignage par ID (exclut les supprimés)
     */
    async findById(id) {
        return await Testimony_1.default.findOne({ _id: id, deletedAt: null });
    }
    /**
     * MOD-1: Trouver un témoignage par ID (inclut les supprimés)
     * Utilisé pour la restauration
     */
    async findByIdIncludingDeleted(id) {
        return await Testimony_1.default.findById(id);
    }
    /**
     * MOD-1: Récupérer tous les témoignages d'une créature (exclut les supprimés)
     * Avec filtre optionnel par statut
     */
    async findByCreatureId(creatureId, status) {
        const filter = { creatureId, deletedAt: null };
        if (status) {
            filter.status = status;
        }
        return await Testimony_1.default.find(filter).sort({ createdAt: -1 });
    }
    /**
     * MOD-1: Vérifier si un utilisateur a déjà témoigné récemment pour une créature
     * Exclut les témoignages supprimés
     */
    async findRecentTestimony(authorId, creatureId, withinMinutes) {
        const timeLimit = new Date(Date.now() - withinMinutes * 60 * 1000);
        return await Testimony_1.default.findOne({
            authorId,
            creatureId,
            createdAt: { $gte: timeLimit },
            deletedAt: null, // MOD-1: Exclure les supprimés
        }).sort({ createdAt: -1 });
    }
    /**
     * MOD-1: Récupérer tous les témoignages d'un auteur (exclut les supprimés)
     */
    async findByAuthor(authorId) {
        return await Testimony_1.default.find({ authorId, deletedAt: null }).sort({
            createdAt: -1,
        });
    }
    /**
     * MOD-1: Compter les témoignages d'une créature par statut (exclut les supprimés)
     */
    async countByCreatureAndStatus(creatureId, status) {
        const filter = { creatureId, deletedAt: null };
        if (status) {
            filter.status = status;
        }
        return await Testimony_1.default.countDocuments(filter);
    }
    /**
     * Mettre à jour le statut d'un témoignage
     */
    async updateStatus(id, status, validatedBy) {
        return await Testimony_1.default.findByIdAndUpdate(id, {
            status,
            validatedBy,
            validatedAt: new Date(),
        }, { new: true });
    }
    /**
     * MOD-1: Soft delete d'un témoignage
     */
    async softDelete(id, deletedBy) {
        return await Testimony_1.default.findOneAndUpdate({ _id: id, deletedAt: null }, // Ne supprimer que si pas déjà supprimé
        {
            deletedAt: new Date(),
            deletedBy,
        }, { new: true });
    }
    /**
     * MOD-1: Restaurer un témoignage supprimé
     */
    async restore(id) {
        return await Testimony_1.default.findOneAndUpdate({ _id: id, deletedAt: { $ne: null } }, // Ne restaurer que si supprimé
        {
            deletedAt: null,
            deletedBy: null,
        }, { new: true });
    }
    /**
     * Supprimer définitivement un témoignage (hard delete)
     * À utiliser avec précaution - préférer soft delete
     */
    async delete(id) {
        return await Testimony_1.default.findByIdAndDelete(id);
    }
}
exports.TestimonyRepository = TestimonyRepository;
exports.default = new TestimonyRepository();
