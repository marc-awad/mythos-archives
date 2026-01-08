import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import axios from "axios"
import { JWTPayload } from "../types"

// Étendre Request pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      res.status(401).json({ error: "Token manquant" })
      return
    }

    // Vérifier le token localement
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JWTPayload

    req.user = decoded

    // Option alternative: Appeler auth-service pour validation complète
    /*
    try {
      const response = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      req.user = response.data;
    } catch (error) {
      res.status(401).json({ error: 'Token invalide' });
      return;
    }
    */

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({ error: "Token invalide ou expiré" })
    return
  }
}

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Accès refusé: rôle insuffisant" })
      return
    }
    next()
  }
}
