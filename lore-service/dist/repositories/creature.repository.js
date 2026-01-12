"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatureRepository = void 0;
const Creature_1 = __importDefault(require("../models/Creature"));
class CreatureRepository {
    /**
     * Créer une créature
     */
    async create(data, authorId) {
        const creature = new Creature_1.default({
            ...data,
            authorId,
        });
        return await creature.save();
    }
    /**
     * Trouver une créature par ID
     */
    async findById(id) {
        return await Creature_1.default.findById(id);
    }
    /**
     * Trouver une créature par nom (pour vérifier l'unicité)
     */
    async findByName(name) {
        return await Creature_1.default.findOne({ name });
    }
    /**
     * Vérifier si un nom existe déjà (case insensitive)
     */
    async existsByName(name, excludeId) {
        const query = {
            name: { $regex: new RegExp(`^${name}$`, "i") },
        };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        const count = await Creature_1.default.countDocuments(query);
        return count > 0;
    }
    /**
     * Récupérer toutes les créatures avec pagination et filtres
     */
    async findAll(options) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;
        // Construction du filtre
        const filter = {};
        if (options.search) {
            filter.name = { $regex: options.search, $options: "i" };
        }
        if (options.authorId) {
            filter.authorId = options.authorId;
        }
        // Construction du tri
        let sortOption = { createdAt: -1 }; // Par défaut: plus récent d'abord
        if (options.sort) {
            switch (options.sort) {
                case "legendScore":
                    sortOption = { legendScore: -1, createdAt: -1 };
                    break;
                case "-legendScore":
                    sortOption = { legendScore: 1, createdAt: -1 };
                    break;
                case "createdAt":
                    sortOption = { createdAt: 1 };
                    break;
                case "-createdAt":
                    sortOption = { createdAt: -1 };
                    break;
                case "name":
                    sortOption = { name: 1 };
                    break;
                case "-name":
                    sortOption = { name: -1 };
                    break;
            }
        }
        // Exécution des requêtes
        const [creatures, total] = await Promise.all([
            Creature_1.default.find(filter).sort(sortOption).skip(skip).limit(limit),
            Creature_1.default.countDocuments(filter),
        ]);
        return {
            creatures,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    /**
     * Mettre à jour une créature
     */
    async update(id, data) {
        return await Creature_1.default.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }
    /**
     * Supprimer une créature
     */
    async delete(id) {
        return await Creature_1.default.findByIdAndDelete(id);
    }
    /**
     * Incrémenter le legend score
     */
    async incrementLegendScore(id, amount = 1) {
        await Creature_1.default.findByIdAndUpdate(id, {
            $inc: { legendScore: amount },
        });
    }
    async updateLegendScore(id, score) {
        await Creature_1.default.findByIdAndUpdate(id, {
            $set: { legendScore: score },
        });
    }
    /**
     * Récupérer les créatures d'un auteur
     */
    async findByAuthor(authorId, limit) {
        const query = Creature_1.default.find({ authorId }).sort({ createdAt: -1 });
        if (limit) {
            query.limit(limit);
        }
        return await query;
    }
    /**
     * Compter les créatures d'un auteur
     */
    async countByAuthor(authorId) {
        return await Creature_1.default.countDocuments({ authorId });
    }
}
exports.CreatureRepository = CreatureRepository;
exports.default = new CreatureRepository();
