import { Request, Response, NextFunction } from "express"
import { AuthService } from "../services/auth.services"
import { RegisterDto, LoginDto } from "../types"
import userRepository from "../repositories/user.repository"

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

  me = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // req.user est défini par le middleware authenticate
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Non authentifié",
        })
        return
      }

      // Récupérer les infos complètes de l'utilisateur
      const user = await userRepository.findById(req.user.id)

      if (!user) {
        res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        })
        return
      }

      // Retourner l'utilisateur sans le mot de passe
      const { password, ...userWithoutPassword } = user

      res.status(200).json({
        success: true,
        message: "Utilisateur récupéré avec succès",
        data: userWithoutPassword,
      })
    } catch (error) {
      next(error)
    }
  }
}
