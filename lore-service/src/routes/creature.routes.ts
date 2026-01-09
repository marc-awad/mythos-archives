import { Router } from "express"
import creatureController from "../controllers/creature.controller"
import {
  authMiddleware,
  requireExpertOrAdmin,
} from "../middlewares/auth.middleware"

const router = Router()

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
router.get("/", creatureController.getAllCreatures)

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
router.get("/:id", creatureController.getCreatureById)

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
router.post(
  "/",
  authMiddleware,
  requireExpertOrAdmin,
  creatureController.createCreature
)

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
router.put("/:id", authMiddleware, creatureController.updateCreature)

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
router.delete("/:id", authMiddleware, creatureController.deleteCreature)

export default router
