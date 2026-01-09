import { Router } from "express"
import testimonyController from "../controllers/testimony.controller"
import {
  authMiddleware,
  requireExpertOrAdmin,
} from "../middlewares/auth.middleware"

const router = Router()

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
router.post("/", authMiddleware, testimonyController.createTestimony)

/**
 * GET /testimonies/me
 * Récupérer tous les témoignages de l'utilisateur connecté
 * Accessible par l'utilisateur authentifié
 *
 * Réponse:
 * - 200: Liste des témoignages
 * - 401: Non authentifié
 */
router.get("/me", authMiddleware, testimonyController.getMyTestimonies)

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
router.put(
  "/:id/validate",
  authMiddleware,
  requireExpertOrAdmin,
  testimonyController.validateTestimony
)

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
router.put(
  "/:id/reject",
  authMiddleware,
  requireExpertOrAdmin,
  testimonyController.rejectTestimony
)

export default router
