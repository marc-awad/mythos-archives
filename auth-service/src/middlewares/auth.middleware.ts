import { Request, Response, NextFunction } from "express"
import { JwtUtils, JwtPayload } from "../utils/jwt.utils"

// Étendre l'interface Request pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export class AuthMiddleware {
  static authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Récupérer le token depuis le header Authorization
      const authHeader = req.headers.authorization

      if (!authHeader) {
        res.status(401).json({
          success: false,
          message: "Token d'authentification manquant",
        })
        return
      }

      // Vérifier le format "Bearer TOKEN"
      const parts = authHeader.split(" ")
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        res.status(401).json({
          success: false,
          message: "Format du token invalide. Utilisez: Bearer <token>",
        })
        return
      }

      const token = parts[1]

      // Vérifier et décoder le token
      try {
        const decoded = JwtUtils.verifyToken(token)

        // Attacher les infos user à req.user
        req.user = decoded

        next()
      } catch (error) {
        res.status(401).json({
          success: false,
          message: "Token invalide ou expiré",
        })
        return
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification du token",
      })
    }
  }
}
