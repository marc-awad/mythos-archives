"use strict";
// lore-service/src/routes/testimony.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const testimony_controller_1 = __importDefault(require("../controllers/testimony.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
/**
 * LORE-5: POST /testimonies
 * Créer un nouveau témoignage
 * Accessible par tous les utilisateurs authentifiés
 *
 * Body:
 * - creatureId: string (requis, ID MongoDB)
 * - description: string (requis, 10-2000 caractères)
 *
 * Réponse:
 * - 201: Témoignage créé avec succès
 * - 400: Données invalides
 * - 401: Non authentifié
 * - 404: Créature non trouvée
 * - 429: Délai de 5 minutes non respecté
 */
router.post("/", auth_middleware_1.authMiddleware, testimony_controller_1.default.createTestimony);
/**
 * GET /testimonies/me
 * Récupérer tous les témoignages de l'utilisateur connecté
 * Accessible par l'utilisateur authentifié
 *
 * Réponse:
 * - 200: Liste des témoignages
 * - 401: Non authentifié
 */
router.get("/me", auth_middleware_1.authMiddleware, testimony_controller_1.default.getMyTestimonies);
/**
 * GET /testimonies/:id
 * Récupérer un témoignage par ID
 * Accessible publiquement
 *
 * Réponse:
 * - 200: Témoignage trouvé
 * - 404: Témoignage non trouvé
 */
router.get("/:id", testimony_controller_1.default.getTestimonyById);
/**
 * PUT /testimonies/:id/validate
 * Valider un témoignage
 * Accessible par EXPERT et ADMIN uniquement
 *
 * Params:
 * - id: ID MongoDB du témoignage
 *
 * Réponse:
 * - 200: Témoignage validé
 * - 400: Témoignage pas en statut PENDING
 * - 401: Non authentifié
 * - 403: Rôle insuffisant
 * - 404: Témoignage non trouvé
 */
router.put("/:id/validate", auth_middleware_1.authMiddleware, auth_middleware_1.requireExpertOrAdmin, testimony_controller_1.default.validateTestimony);
/**
 * PUT /testimonies/:id/reject
 * Rejeter un témoignage
 * Accessible par EXPERT et ADMIN uniquement
 *
 * Params:
 * - id: ID MongoDB du témoignage
 *
 * Réponse:
 * - 200: Témoignage rejeté
 * - 400: Témoignage pas en statut PENDING
 * - 401: Non authentifié
 * - 403: Rôle insuffisant
 * - 404: Témoignage non trouvé
 */
router.put("/:id/reject", auth_middleware_1.authMiddleware, auth_middleware_1.requireExpertOrAdmin, testimony_controller_1.default.rejectTestimony);
/**
 * MOD-1: DELETE /testimonies/:id
 * Soft delete d'un témoignage
 * Accessible par EXPERT et ADMIN uniquement
 *
 * Params:
 * - id: ID MongoDB du témoignage
 *
 * Réponse:
 * - 200: Témoignage supprimé (soft delete)
 * - 400: Format d'ID invalide
 * - 401: Non authentifié
 * - 403: Rôle insuffisant
 * - 404: Témoignage non trouvé
 */
router.delete("/:id", auth_middleware_1.authMiddleware, auth_middleware_1.requireExpertOrAdmin, testimony_controller_1.default.deleteTestimony);
/**
 * MOD-1: POST /testimonies/:id/restore
 * Restaurer un témoignage supprimé
 * Accessible par ADMIN uniquement
 *
 * Params:
 * - id: ID MongoDB du témoignage
 *
 * Réponse:
 * - 200: Témoignage restauré
 * - 400: Témoignage pas supprimé ou format d'ID invalide
 * - 401: Non authentifié
 * - 403: Rôle insuffisant (ADMIN requis)
 * - 404: Témoignage non trouvé
 */
router.post("/:id/restore", auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, testimony_controller_1.default.restoreTestimony);
exports.default = router;
