import { Request, Response, NextFunction } from "express"
import { AuthService } from "../services/auth.services"
import { RegisterDto, LoginDto } from "../types"

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

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const loginDto: LoginDto = req.body

      const result = await this.authService.login(loginDto)

      res.status(200).json({
        success: true,
        message: "Connexion réussie",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
}
