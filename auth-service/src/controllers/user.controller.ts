import { Request, Response } from "express"
import { UserRepository } from "../repositories/user.repository"
import { Role } from "../types"

export class UserController {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  /**
   * GET /admin/users
   * Récupère tous les utilisateurs (ADMIN uniquement)
   */
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.findAll()

      res.status(200).json({
        success: true,
        message: "Utilisateurs récupérés avec succès",
        data: users,
      })
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error)
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des utilisateurs",
      })
    }
  }

  /**
   * GET /users/:id
   * Récupère un utilisateur par son ID
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id)

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "ID utilisateur invalide",
        })
        return
      }

      const user = await this.userRepository.findById(userId)

      if (!user) {
        res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        })
        return
      }

      // Retirer le mot de passe
      const { password, ...userWithoutPassword } = user

      res.status(200).json({
        success: true,
        message: "Utilisateur récupéré avec succès",
        data: userWithoutPassword,
      })
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error)
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de l'utilisateur",
      })
    }
  }

  /**
   * PATCH /users/:id/role
   * Met à jour le rôle d'un utilisateur (ADMIN uniquement)
   */
  updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id)
      const { role } = req.body

      // Validation de l'ID
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "ID utilisateur invalide",
        })
        return
      }

      // Validation du rôle
      if (!role || !Object.values(Role).includes(role)) {
        res.status(400).json({
          success: false,
          message: `Rôle invalide. Valeurs acceptées: ${Object.values(
            Role
          ).join(", ")}`,
        })
        return
      }

      // Vérifier que l'utilisateur existe
      const existingUser = await this.userRepository.findById(userId)
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        })
        return
      }

      // Empêcher un admin de modifier son propre rôle
      if (req.user && req.user.id === userId) {
        res.status(403).json({
          success: false,
          message: "Vous ne pouvez pas modifier votre propre rôle",
        })
        return
      }

      // Mettre à jour le rôle
      const updatedUser = await this.userRepository.updateRole(userId, role)

      // Retirer le mot de passe
      const { password, ...userWithoutPassword } = updatedUser

      res.status(200).json({
        success: true,
        message: "Rôle mis à jour avec succès",
        data: userWithoutPassword,
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error)
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du rôle",
      })
    }
  }

  /**
   * DELETE /users/:id
   * Supprime un utilisateur (ADMIN uniquement)
   */
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id)

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "ID utilisateur invalide",
        })
        return
      }

      // Vérifier que l'utilisateur existe
      const existingUser = await this.userRepository.findById(userId)
      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        })
        return
      }

      // Empêcher un admin de se supprimer lui-même
      if (req.user && req.user.id === userId) {
        res.status(403).json({
          success: false,
          message: "Vous ne pouvez pas supprimer votre propre compte",
        })
        return
      }

      await this.userRepository.delete(userId)

      res.status(200).json({
        success: true,
        message: "Utilisateur supprimé avec succès",
      })
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error)
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de l'utilisateur",
      })
    }
  }
}
