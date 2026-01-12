// lore-service/src/routes/testimony.routes.ts

import { Router } from "express"
import testimonyController from "../controllers/testimony.controller"
import {
  authMiddleware,
  requireExpertOrAdmin,
  requireAdmin,
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
 * GET /testimonies/:id
 * Récupérer un témoignage par ID
 * Accessible publiquement
 *
 * Réponse:
 * - 200: Témoignage trouvé
 * - 404: Témoignage non trouvé
 */
router.get("/:id", testimonyController.getTestimonyById)

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
router.delete(
  "/:id",
  authMiddleware,
  requireExpertOrAdmin,
  testimonyController.deleteTestimony
)

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
router.post(
  "/:id/restore",
  authMiddleware,
  requireAdmin,
  testimonyController.restoreTestimony
)

export default router
