// lore-service/src/controllers/testimony.controller.ts

import { Request, Response, NextFunction } from "express"
import testimonyService from "../services/testimony.service"
import { CreateTestimonyDto } from "../types/testimony.types"

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
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentification requise",
        })
        return
      }

      const { creatureId, description } = req.body as CreateTestimonyDto

      // Validation des données
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
          error.message.includes("ID de créature invalide") ||
          error.message.includes("description") ||
          error.message.includes("caractères")
        ) {
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
   * LORE-6: GET /testimonies/:id
   * Récupérer un témoignage par son ID
   * Route publique
   */
  async getTestimonyById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de témoignage requis",
        })
        return
      }

      const testimony = await testimonyService.getTestimonyById(id)

      res.status(200).json({
        success: true,
        message: "Témoignage récupéré avec succès",
        data: {
          _id: testimony._id,
          creatureId: testimony.creatureId,
          authorId: testimony.authorId,
          description: testimony.description,
          status: testimony.status,
          validatedBy: testimony.validatedBy,
          validatedAt: testimony.validatedAt,
          createdAt: testimony.createdAt,
          updatedAt: testimony.updatedAt,
        },
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Témoignage non trouvé") {
          res.status(404).json({
            success: false,
            message: "Témoignage non trouvé",
          })
          return
        }

        if (error.message === "ID de témoignage invalide") {
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
   * LORE-7 + EVL-3: POST /testimonies/:id/validate
   * Valider un témoignage (EXPERT/ADMIN uniquement)
   * Applique les règles de réputation
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

      // EVL-3: Passer le rôle du validateur au service
      const testimony = await testimonyService.validateTestimony(
        id,
        req.user.id,
        req.user.role
      )

      res.status(200).json({
        success: true,
        message: "Témoignage validé avec succès",
        data: {
          _id: testimony._id,
          creatureId: testimony.creatureId,
          authorId: testimony.authorId,
          description: testimony.description,
          status: testimony.status,
          validatedBy: testimony.validatedBy,
          validatedAt: testimony.validatedAt,
          createdAt: testimony.createdAt,
          updatedAt: testimony.updatedAt,
        },
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Témoignage non trouvé") {
          res.status(404).json({
            success: false,
            message: "Témoignage non trouvé",
          })
          return
        }

        if (
          error.message === "Vous ne pouvez pas valider votre propre témoignage"
        ) {
          res.status(403).json({
            success: false,
            message: error.message,
          })
          return
        }

        if (
          error.message ===
          "Seuls les témoignages en attente peuvent être validés"
        ) {
          res.status(400).json({
            success: false,
            message: error.message,
          })
          return
        }

        if (error.message === "ID de témoignage invalide") {
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
   * LORE-8 + EVL-3: POST /testimonies/:id/reject
   * Rejeter un témoignage (EXPERT/ADMIN uniquement)
   * Applique les règles de réputation
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
        data: {
          _id: testimony._id,
          creatureId: testimony.creatureId,
          authorId: testimony.authorId,
          description: testimony.description,
          status: testimony.status,
          validatedBy: testimony.validatedBy,
          validatedAt: testimony.validatedAt,
          createdAt: testimony.createdAt,
          updatedAt: testimony.updatedAt,
        },
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Témoignage non trouvé") {
          res.status(404).json({
            success: false,
            message: "Témoignage non trouvé",
          })
          return
        }

        if (
          error.message === "Vous ne pouvez pas rejeter votre propre témoignage"
        ) {
          res.status(403).json({
            success: false,
            message: error.message,
          })
          return
        }

        if (
          error.message ===
          "Seuls les témoignages en attente peuvent être rejetés"
        ) {
          res.status(400).json({
            success: false,
            message: error.message,
          })
          return
        }

        if (error.message === "ID de témoignage invalide") {
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
      next(error)
    }
  }

  /**
   * MOD-1: DELETE /testimonies/:id
   * Soft delete d'un témoignage (EXPERT/ADMIN uniquement)
   */
  async deleteTestimony(
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

      await testimonyService.softDeleteTestimony(id, req.user.id)

      res.status(200).json({
        success: true,
        message: "Testimony soft deleted",
        id: id,
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Témoignage non trouvé ou déjà supprimé") {
          res.status(404).json({
            success: false,
            message: "Témoignage non trouvé",
          })
          return
        }

        if (error.message === "ID de témoignage invalide") {
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
   * MOD-1: POST /testimonies/:id/restore
   * Restaurer un témoignage supprimé (ADMIN uniquement)
   */
  async restoreTestimony(
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

      const testimony = await testimonyService.restoreTestimony(id)

      res.status(200).json({
        success: true,
        message: "Témoignage restauré avec succès",
        data: {
          _id: testimony._id,
          creatureId: testimony.creatureId,
          authorId: testimony.authorId,
          description: testimony.description,
          status: testimony.status,
          validatedBy: testimony.validatedBy,
          validatedAt: testimony.validatedAt,
          createdAt: testimony.createdAt,
          updatedAt: testimony.updatedAt,
        },
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Témoignage non trouvé") {
          res.status(404).json({
            success: false,
            message: "Témoignage non trouvé",
          })
          return
        }

        if (error.message === "Ce témoignage n'est pas supprimé") {
          res.status(400).json({
            success: false,
            message: error.message,
          })
          return
        }

        if (error.message === "ID de témoignage invalide") {
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
}

export default new TestimonyController()
