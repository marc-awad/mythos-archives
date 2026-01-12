// src/controllers/mythology.controller.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import mythologyService from '../services/mythology.service';

export class MythologyController {
  /**
   * MYTH-1: GET /mythology/stats
   * Génère les statistiques globales du bestiaire
   * Nécessite un JWT valide
   */
  async getStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Extraire le token du header Authorization
      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7) || '';

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Token d'authentification requis",
        });
        return;
      }

      // Générer les statistiques
      const stats = await mythologyService.generateStats(token);

      res.status(200).json({
        success: true,
        message: 'Statistiques générées avec succès',
        data: stats,
      });
    } catch (error) {
      // Gestion des erreurs spécifiques
      if (error instanceof Error) {
        // Erreur d'authentification
        if (error.message.includes('Token invalide')) {
          res.status(401).json({
            success: false,
            message: 'Token invalide ou expiré',
          });
          return;
        }

        // Erreur de connexion au lore-service
        if (error.message.includes('Impossible de contacter')) {
          res.status(503).json({
            success: false,
            message: 'Le service de bestiaire est temporairement indisponible',
          });
          return;
        }

        // Timeout
        if (error.message.includes('Timeout')) {
          res.status(504).json({
            success: false,
            message:
              "Délai d'attente dépassé lors de la génération des statistiques",
          });
          return;
        }
      }

      // Autres erreurs
      next(error);
    }
  }

  /**
   * GET /mythology/health
   * Vérifier l'état du service
   */
  async healthCheck(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Mythology service is running',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MythologyController();
