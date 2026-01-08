import { Request, Response, NextFunction } from "express"
import { AuthService } from "../services/auth.services"
import { RegisterDto } from "../types"

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const registerDto: RegisterDto = req.body

      const user = await this.authService.register(registerDto)

      res.status(201).json({
        success: true,
        message: "Utilisateur créé avec succès",
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }
}
