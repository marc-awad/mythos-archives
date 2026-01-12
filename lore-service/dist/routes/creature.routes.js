"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const creature_controller_1 = __importDefault(require("../controllers/creature.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
/**
 * LORE-4: GET /creatures
 * Liste de toutes les créatures avec pagination et filtres
 * Route publique
 *
 * Query params:
 * - page: numéro de page (défaut: 1)
 * - limit: nombre de résultats par page (défaut: 10, max: 100)
 * - sort: tri (-legendScore, legendScore, -createdAt, createdAt, name, -name)
 * - search: recherche par nom
 * - authorId: filtrer par auteur
 */
router.get("/", creature_controller_1.default.getAllCreatures);
/**
 * LORE-4: GET /creatures/:id
 * Détails d'une créature par ID
 * Route publique
 *
 * Params:
 * - id: ID MongoDB de la créature
 *
 * Erreurs:
 * - 400: ID invalide
 * - 404: Créature non trouvée
 */
router.get("/:id", creature_controller_1.default.getCreatureById);
/**
 * LORE-3: POST /creatures
 * Créer une nouvelle créature
 * Accessible par EXPERT et ADMIN uniquement
 *
 * Body:
 * - name: string (requis, unique, 2-100 caractères)
 * - origin: string (optionnel, max 200 caractères)
 *
 * Réponse:
 * - 201: Créature créée
 * - 400: Données invalides
 * - 401: Non authentifié
 * - 403: Rôle insuffisant (besoin EXPERT/ADMIN)
 * - 409: Nom déjà existant
 */
router.post("/", auth_middleware_1.authMiddleware, auth_middleware_1.requireExpertOrAdmin, creature_controller_1.default.createCreature);
/**
 * PUT /creatures/:id
 * Mettre à jour une créature
 * Accessible par l'auteur ou ADMIN
 *
 * Body:
 * - name: string (optionnel, unique, 2-100 caractères)
 * - origin: string (optionnel, max 200 caractères)
 *
 * Erreurs:
 * - 400: Données invalides
 * - 401: Non authentifié
 * - 403: Pas la permission (pas l'auteur ni ADMIN)
 * - 404: Créature non trouvée
 * - 409: Nom déjà existant
 */
router.put("/:id", auth_middleware_1.authMiddleware, creature_controller_1.default.updateCreature);
/**
 * DELETE /creatures/:id
 * Supprimer une créature
 * Accessible par l'auteur ou ADMIN
 *
 * Erreurs:
 * - 401: Non authentifié
 * - 403: Pas la permission (pas l'auteur ni ADMIN)
 * - 404: Créature non trouvée
 */
router.delete("/:id", auth_middleware_1.authMiddleware, creature_controller_1.default.deleteCreature);
exports.default = router;
