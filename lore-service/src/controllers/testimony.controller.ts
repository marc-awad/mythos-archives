import { Request, Response, NextFunction } from "express"
import testimonyService from "../services/testimony.service"
import {
  CreateTestimonyDto,
  GetTestimoniesQuery,
} from "../types/testimony.types"
import { TestimonyStatus } from "../types"

export class TestimonyController {
  /**
   * LORE-5: POST /testimonies
   * Créer un nouveau témoignage
   * Accessible par tous les utilisateurs authentifiés
   */
  async createTestimony(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Vérifier l'authentification
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentification requise",
        })
        return
      }

      // Validation des données
      const { creatureId, description } = req.body as CreateTestimonyDto

      if (!creatureId) {
        res.status(400).json({
          success: false,
          message: "L'ID de la créature est requis",
        })
        return
      }

      if (!description || !description.trim()) {
        res.status(400).json({
          success: false,
          message: "La description est requise",
        })
        return
      }

      // Créer le témoignage
      const testimony = await testimonyService.createTestimony(
        { creatureId, description },
        req.user.id
      )

      res.status(201).json({
        success: true,
        message: "Témoignage créé avec succès",
        data: {
          _id: testimony._id,
          creatureId: testimony.creatureId,
          authorId: testimony.authorId,
          description: testimony.description,
          status: testimony.status,
          createdAt: testimony.createdAt,
        },
      })
    } catch (error) {
      // Gestion des erreurs métier
      if (error instanceof Error) {
        // Erreur de créature non trouvée
        if (error.message === "Créature non trouvée") {
          res.status(404).json({
            success: false,
            message: error.message,
          })
          return
        }

        // Erreur de délai de 5 minutes
        if (error.message.includes("déjà témoigné")) {
          res.status(429).json({
            success: false,
            message: error.message,
          })
          return
        }

        // Erreurs de validation
        if (
          error.message.includes("caractères") ||
          error.message.includes("requis") ||
          error.message.includes("invalide")
        ) {
          res.status(400).json({
            success: false,
            message: error.message,
          })
          return
        }
      }

      // Autres erreurs
      next(error)
    }
  }

  /**
   * LORE-6: GET /creatures/:id/testimonies
   * Récupérer tous les témoignages d'une créature
   * Route publique avec filtre optionnel par statut
   */
  async getTestimoniesByCreature(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params
      const query = req.query as GetTestimoniesQuery

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de créature requis",
        })
        return
      }

      // Validation du statut si fourni
      let status: TestimonyStatus | undefined

      if (query.status) {
        const upperStatus = query.status.toUpperCase()

        if (
          !Object.values(TestimonyStatus).includes(
            upperStatus as TestimonyStatus
          )
        ) {
          res.status(400).json({
            success: false,
            message: `Statut invalide. Valeurs acceptées: ${Object.values(
              TestimonyStatus
            ).join(", ")}`,
          })
          return
        }

        status = upperStatus as TestimonyStatus
      }

      // Récupérer les témoignages
      const testimonies = await testimonyService.getTestimoniesByCreature(
        id,
        status
      )

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
      })
    } catch (error) {
      // Gestion des erreurs 404
      if (error instanceof Error) {
        if (error.message === "Créature non trouvée") {
          res.status(404).json({
            success: false,
            message: "Créature non trouvée",
          })
          return
        }

        if (error.message === "ID de créature invalide") {
          res.status(400).json({
            success: false,
            message: "Format d'ID invalide",
          })
          return
        }
      }

      next(error)
    }
  }

  /**
   * GET /testimonies/me
   * Récupérer tous les témoignages de l'utilisateur connecté
   */
  async getMyTestimonies(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentification requise",
        })
        return
      }

      const testimonies = await testimonyService.getTestimoniesByAuthor(
        req.user.id
      )

      res.status(200).json({
        success: true,
        message: "Vos témoignages récupérés avec succès",
        data: testimonies,
        count: testimonies.length,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * PUT /testimonies/:id/validate
   * Valider un témoignage (EXPERT/ADMIN uniquement)
   */
  async validateTestimony(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentification requise",
        })
        return
      }

      const { id } = req.params

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de témoignage requis",
        })
        return
      }

      const testimony = await testimonyService.validateTestimony(
        id,
        req.user.id
      )

      res.status(200).json({
        success: true,
        message: "Témoignage validé avec succès",
        data: testimony,
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Témoignage non trouvé") {
          res.status(404).json({
            success: false,
            message: error.message,
          })
          return
        }

        if (error.message.includes("en attente")) {
          res.status(400).json({
            success: false,
            message: error.message,
          })
          return
        }
      }

      next(error)
    }
  }

  /**
   * PUT /testimonies/:id/reject
   * Rejeter un témoignage (EXPERT/ADMIN uniquement)
   */
  async rejectTestimony(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentification requise",
        })
        return
      }

      const { id } = req.params

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de témoignage requis",
        })
        return
      }

      const testimony = await testimonyService.rejectTestimony(id, req.user.id)

      res.status(200).json({
        success: true,
        message: "Témoignage rejeté avec succès",
        data: testimony,
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Témoignage non trouvé") {
          res.status(404).json({
            success: false,
            message: error.message,
          })
          return
        }

        if (error.message.includes("en attente")) {
          res.status(400).json({
            success: false,
            message: error.message,
          })
          return
        }
      }

      next(error)
    }
  }
}

export default new TestimonyController()
