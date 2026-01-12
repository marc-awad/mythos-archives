// auth-service/src/controllers/user.controller.ts

import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import userService from '../services/user.service';
import { Role } from '../types';

export class UserController {
  private userRepository: UserRepository;
  private userService = userService;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * GET /admin/users
   * Récupère tous les utilisateurs (ADMIN uniquement)
   */
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();

      res.status(200).json({
        success: true,
        message: 'Utilisateurs récupérés avec succès',
        data: users,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des utilisateurs',
      });
    }
  };

  /**
   * GET /users/:id
   * Récupère un utilisateur par son ID
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'ID utilisateur invalide',
        });
        return;
      }

      const user = await this.userService.getUserById(userId);

      res.status(200).json({
        success: true,
        message: 'Utilisateur récupéré avec succès',
        data: user,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Utilisateur non trouvé'
      ) {
        res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé',
        });
        return;
      }

      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de l'utilisateur",
      });
    }
  };

  /**
   * PATCH /users/:id/role
   * Met à jour le rôle d'un utilisateur (ADMIN uniquement)
   */
  updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      // Validation de l'ID
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'ID utilisateur invalide',
        });
        return;
      }

      // Validation du rôle
      if (!role || !Object.values(Role).includes(role)) {
        res.status(400).json({
          success: false,
          message: `Rôle invalide. Valeurs acceptées: ${Object.values(
            Role,
          ).join(', ')}`,
        });
        return;
      }

      // Vérifier que l'admin ne modifie pas son propre rôle
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentification requise',
        });
        return;
      }

      const updatedUser = await this.userService.updateUserRole(
        userId,
        role,
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: 'Rôle mis à jour avec succès',
        data: updatedUser,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Utilisateur non trouvé') {
          res.status(404).json({
            success: false,
            message: 'Utilisateur non trouvé',
          });
          return;
        }

        if (error.message === 'Vous ne pouvez pas modifier votre propre rôle') {
          res.status(403).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      console.error('Erreur lors de la mise à jour du rôle:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du rôle',
      });
    }
  };

  /**
   * DELETE /users/:id
   * Supprime un utilisateur (ADMIN uniquement)
   */
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'ID utilisateur invalide',
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentification requise',
        });
        return;
      }

      await this.userService.deleteUser(userId, req.user.id);

      res.status(200).json({
        success: true,
        message: 'Utilisateur supprimé avec succès',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Utilisateur non trouvé') {
          res.status(404).json({
            success: false,
            message: 'Utilisateur non trouvé',
          });
          return;
        }

        if (
          error.message === 'Vous ne pouvez pas supprimer votre propre compte'
        ) {
          res.status(403).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de l'utilisateur",
      });
    }
  };

  /**
   * EVL-3: PATCH /users/:id/reputation
   * Met à jour la réputation d'un utilisateur (appel interne depuis lore-service)
   * Promotion automatique à EXPERT si réputation >= 10
   */
  updateReputation = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const { reputationChange } = req.body;

      // Validation de l'ID
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'ID utilisateur invalide',
        });
        return;
      }

      // Validation de reputationChange
      if (typeof reputationChange !== 'number' || isNaN(reputationChange)) {
        res.status(400).json({
          success: false,
          message: 'La variation de réputation doit être un nombre',
        });
        return;
      }

      // Validation: empêcher des variations absurdes
      if (Math.abs(reputationChange) > 100) {
        res.status(400).json({
          success: false,
          message: 'La variation de réputation ne peut pas dépasser ±100',
        });
        return;
      }

      // Mettre à jour la réputation via le service
      const updatedUser = await this.userService.updateReputation(
        userId,
        reputationChange,
      );

      // Retirer le mot de passe
      const { password, ...userWithoutPassword } = updatedUser;

      res.status(200).json({
        success: true,
        message: 'Réputation mise à jour avec succès',
        data: {
          ...userWithoutPassword,
          reputationChange, // Inclure la variation pour info
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Utilisateur non trouvé') {
          res.status(404).json({
            success: false,
            message: 'Utilisateur non trouvé',
          });
          return;
        }
      }

      console.error('Erreur lors de la mise à jour de la réputation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la réputation',
      });
    }
  };
}

export default new UserController();
