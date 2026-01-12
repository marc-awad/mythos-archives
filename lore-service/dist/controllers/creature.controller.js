"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatureController = void 0;
const creature_service_1 = __importDefault(require("../services/creature.service"));
const testimony_service_1 = __importDefault(require("../services/testimony.service"));
const types_1 = require("../types");
class CreatureController {
    /**
     * LORE-3: POST /creatures
     * Créer une nouvelle créature
     * Accessible par EXPERT et ADMIN uniquement
     */
    async createCreature(req, res, next) {
        try {
            // req.user est défini par authMiddleware
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: "Authentification requise",
                });
                return;
            }
            // Validation des données
            const { name, origin } = req.body;
            if (!name || !name.trim()) {
                res.status(400).json({
                    success: false,
                    message: "Le nom de la créature est requis",
                });
                return;
            }
            // Créer la créature avec l'authorId depuis le JWT
            const creature = await creature_service_1.default.createCreature({ name, origin }, req.user.id);
            res.status(201).json({
                success: true,
                message: "Créature créée avec succès",
                data: {
                    _id: creature._id,
                    name: creature.name,
                    origin: creature.origin,
                    legendScore: creature.legendScore,
                    authorId: creature.authorId,
                    createdAt: creature.createdAt,
                },
            });
        }
        catch (error) {
            // Gestion des erreurs métier
            if (error instanceof Error) {
                // Erreur de nom déjà existant
                if (error.message.includes("existe déjà")) {
                    res.status(409).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
                // Erreurs de validation
                if (error.message.includes("caractères") ||
                    error.message.includes("requis")) {
                    res.status(400).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
            }
            // Autres erreurs
            next(error);
        }
    }
    /**
     * LORE-4: GET /creatures
     * Récupérer la liste de toutes les créatures avec pagination et filtres
     * Route publique
     */
    async getAllCreatures(req, res, next) {
        try {
            const query = req.query;
            // Extraire et valider les paramètres
            const page = query.page ? parseInt(query.page, 10) : 1;
            const limit = query.limit ? parseInt(query.limit, 10) : 10;
            const sort = query.sort;
            const search = query.search;
            const authorId = query.authorId;
            // Validation
            if (isNaN(page) || page < 1) {
                res.status(400).json({
                    success: false,
                    message: "Le paramètre 'page' doit être un nombre positif",
                });
                return;
            }
            if (isNaN(limit) || limit < 1 || limit > 100) {
                res.status(400).json({
                    success: false,
                    message: "Le paramètre 'limit' doit être entre 1 et 100",
                });
                return;
            }
            // Récupérer les créatures
            const result = await creature_service_1.default.getAllCreatures({
                page,
                limit,
                sort,
                search,
                authorId,
            });
            res.status(200).json({
                success: true,
                message: "Créatures récupérées avec succès",
                data: result.creatures,
                pagination: {
                    page: result.page,
                    limit,
                    total: result.total,
                    totalPages: result.totalPages,
                    hasNextPage: result.page < result.totalPages,
                    hasPrevPage: result.page > 1,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * LORE-4: GET /creatures/:id
     * Récupérer une créature par son ID
     * Route publique
     */
    async getCreatureById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de créature requis",
                });
                return;
            }
            const creature = await creature_service_1.default.getCreatureById(id);
            res.status(200).json({
                success: true,
                message: "Créature récupérée avec succès",
                data: {
                    _id: creature._id,
                    name: creature.name,
                    origin: creature.origin,
                    legendScore: creature.legendScore,
                    authorId: creature.authorId,
                    createdAt: creature.createdAt,
                    updatedAt: creature.updatedAt,
                },
            });
        }
        catch (error) {
            // Gestion des erreurs 404
            if (error instanceof Error) {
                if (error.message === "Créature non trouvée") {
                    res.status(404).json({
                        success: false,
                        message: "Créature non trouvée",
                    });
                    return;
                }
                if (error.message === "ID de créature invalide") {
                    res.status(400).json({
                        success: false,
                        message: "Format d'ID invalide",
                    });
                    return;
                }
            }
            next(error);
        }
    }
    /**
     * PUT /creatures/:id
     * Mettre à jour une créature
     * Accessible par l'auteur ou ADMIN
     */
    async updateCreature(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: "Authentification requise",
                });
                return;
            }
            const { id } = req.params;
            const { name, origin } = req.body;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de créature requis",
                });
                return;
            }
            const creature = await creature_service_1.default.updateCreature(id, { name, origin }, req.user.id, req.user.role);
            res.status(200).json({
                success: true,
                message: "Créature mise à jour avec succès",
                data: creature,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "Créature non trouvée") {
                    res.status(404).json({
                        success: false,
                        message: "Créature non trouvée",
                    });
                    return;
                }
                if (error.message.includes("permission")) {
                    res.status(403).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
                if (error.message.includes("existe déjà")) {
                    res.status(409).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
            }
            next(error);
        }
    }
    /**
     * DELETE /creatures/:id
     * Supprimer une créature
     * Accessible par l'auteur ou ADMIN
     */
    async deleteCreature(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: "Authentification requise",
                });
                return;
            }
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de créature requis",
                });
                return;
            }
            await creature_service_1.default.deleteCreature(id, req.user.id, req.user.role);
            res.status(200).json({
                success: true,
                message: "Créature supprimée avec succès",
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "Créature non trouvée") {
                    res.status(404).json({
                        success: false,
                        message: "Créature non trouvée",
                    });
                    return;
                }
                if (error.message.includes("permission")) {
                    res.status(403).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
            }
            next(error);
        }
    }
    /**
     * LORE-6: GET /creatures/:id/testimonies
     * Récupérer tous les témoignages d'une créature
     * Route publique avec filtre optionnel par statut
     */
    async getTestimoniesByCreature(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.query;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: "ID de créature requis",
                });
                return;
            }
            // Validation du statut si fourni
            let testimonyStatus;
            if (status) {
                const upperStatus = status.toUpperCase();
                if (!Object.values(types_1.TestimonyStatus).includes(upperStatus)) {
                    res.status(400).json({
                        success: false,
                        message: `Statut invalide. Valeurs acceptées: ${Object.values(types_1.TestimonyStatus).join(", ")}`,
                    });
                    return;
                }
                testimonyStatus = upperStatus;
            }
            // Récupérer les témoignages
            const testimonies = await testimony_service_1.default.getTestimoniesByCreature(id, testimonyStatus);
            res.status(200).json({
                success: true,
                message: "Témoignages récupérés avec succès",
                data: testimonies.map((t) => ({
                    _id: t._id,
                    creatureId: t.creatureId,
                    authorId: t.authorId,
                    description: t.description,
                    status: t.status,
                    validatedBy: t.validatedBy,
                    validatedAt: t.validatedAt,
                    createdAt: t.createdAt,
                    updatedAt: t.updatedAt,
                })),
                count: testimonies.length,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "Créature non trouvée") {
                    res.status(404).json({
                        success: false,
                        message: "Créature non trouvée",
                    });
                    return;
                }
                if (error.message === "ID de créature invalide") {
                    res.status(400).json({
                        success: false,
                        message: "Format d'ID invalide",
                    });
                    return;
                }
            }
            next(error);
        }
    }
}
exports.CreatureController = CreatureController;
exports.default = new CreatureController();
