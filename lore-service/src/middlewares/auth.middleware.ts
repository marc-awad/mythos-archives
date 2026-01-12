import { Request, Response, NextFunction } from 'express';
import { authServiceClient } from '../services/auth.service';
import { JWTPayload } from '../types';

// Étendre Request pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

/**
 * Middleware d'authentification qui vérifie le token via auth-service
 * Appelle GET /auth/me sur auth-service pour valider le token
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Extraire le token du header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: "Token d'authentification manquant",
        message: 'Veuillez fournir un token dans le header Authorization',
      });
      return;
    }

    // 2. Vérifier le format "Bearer TOKEN"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: 'Format du token invalide',
        message: 'Utilisez le format: Bearer <token>',
      });
      return;
    }

    const token = parts[1];

    // 3. Appeler auth-service pour vérifier le token
    try {
      const user = await authServiceClient.verifyToken(token);

      // 4. Attacher les infos utilisateur à la requête
      req.user = user;

      // 5. Continuer vers le prochain middleware/handler
      next();
    } catch (error) {
      // Erreur de vérification du token
      const errorMessage =
        error instanceof Error ? error.message : 'Token invalide';

      // Si c'est une erreur de connexion au service auth
      if (errorMessage.includes('Impossible de contacter')) {
        res.status(503).json({
          success: false,
          error: 'Service temporairement indisponible',
          message:
            "Le service d'authentification est momentanément indisponible. Veuillez réessayer.",
        });
        return;
      }

      // Si c'est un timeout
      if (errorMessage.includes('Timeout')) {
        res.status(504).json({
          success: false,
          error: 'Timeout',
          message: 'La vérification du token a pris trop de temps.',
        });
        return;
      }

      // Token invalide ou expiré
      res.status(401).json({
        success: false,
        error: 'Authentification échouée',
        message: errorMessage,
      });
      return;
    }
  } catch (error) {
    // Erreur inattendue
    console.error('Erreur inattendue dans authMiddleware:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur',
      message: 'Une erreur est survenue lors de la vérification du token',
    });
  }
};

/**
 * Middleware pour vérifier qu'un utilisateur a un ou plusieurs rôles spécifiques
 * Doit être utilisé APRÈS authMiddleware
 */
export const requireRole = (roles: Array<'USER' | 'EXPERT' | 'ADMIN'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Non authentifié',
        message: 'Authentification requise pour accéder à cette ressource',
      });
      return;
    }

    // Vérifier que l'utilisateur a l'un des rôles requis
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Accès refusé',
        message: `Rôle insuffisant. Rôles acceptés: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware pour vérifier qu'un utilisateur a le rôle EXPERT ou ADMIN
 */
export const requireExpertOrAdmin = requireRole(['EXPERT', 'ADMIN']);

/**
 * Middleware pour vérifier qu'un utilisateur a le rôle ADMIN
 */
export const requireAdmin = requireRole(['ADMIN']);

/**
 * Middleware optionnel: attache l'utilisateur si le token est présent et valide,
 * mais ne bloque pas si le token est absent
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // Pas de token, on continue sans user
      next();
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      // Token malformé, on continue sans user
      next();
      return;
    }

    const token = parts[1];

    try {
      const user = await authServiceClient.verifyToken(token);
      req.user = user;
    } catch (error) {
      // Token invalide, on continue sans user
      console.warn('Token invalide dans optionalAuth:', error);
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans user
    console.error('Erreur dans optionalAuth:', error);
    next();
  }
};
