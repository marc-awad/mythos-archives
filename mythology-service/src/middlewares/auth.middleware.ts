// src/middlewares/auth.middleware.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

export class AuthMiddleware {
  /**
   * Vérifie la présence du token JWT
   * Le token sera validé par lore-service lors des appels
   */
  static authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({
          success: false,
          message: "Token d'authentification manquant",
        });
        return;
      }

      if (!authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: "Format de token invalide. Utilisez 'Bearer <token>'",
        });
        return;
      }

      const token = authHeader.substring(7);

      if (!token || token.trim() === '') {
        res.status(401).json({
          success: false,
          message: 'Token vide',
        });
        return;
      }

      // On ne décode pas le token ici, il sera validé par lore-service
      // On passe simplement au prochain middleware
      next();
    } catch (error) {
      console.error("Erreur dans le middleware d'authentification:", error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification du token',
      });
    }
  }
}

export default AuthMiddleware;
