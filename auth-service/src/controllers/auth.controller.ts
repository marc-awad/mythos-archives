import { Request, Response, NextFunction } from "express"
import { AuthService } from "../services/auth.services"

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Implémenter la logique
      res.status(501).json({ message: "Not implemented yet" })
    } catch (error) {
      next(error)
    }
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Implémenter la logique
      res.status(501).json({ message: "Not implemented yet" })
    } catch (error) {
      next(error)
    }
  }

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // TODO: Implémenter la logique
      res.status(501).json({ message: "Not implemented yet" })
    } catch (error) {
      next(error)
    }
  }
}
