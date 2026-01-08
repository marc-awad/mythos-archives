import bcrypt from "bcrypt"
import userRepository from "../repositories/user.repository"
import { RegisterDto, UserResponse } from "../types"
import { User } from "@prisma/client"

export class AuthService {
  private readonly SALT_ROUNDS = 10

  async register(registerDto: RegisterDto): Promise<UserResponse> {
    const { email, username, password } = registerDto

    // Validation des champs requis
    if (!email || !username || !password) {
      throw new Error("Tous les champs sont requis")
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error("Format d'email invalide")
    }

    // Validation de la longueur du mot de passe
    if (password.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères")
    }

    // Validation du username (longueur minimale)
    if (username.length < 3) {
      throw new Error(
        "Le nom d'utilisateur doit contenir au moins 3 caractères"
      )
    }

    // Vérifier si l'email existe déjà
    const existingUserByEmail = await userRepository.findByEmail(email)
    if (existingUserByEmail) {
      throw new Error("Cet email est déjà utilisé")
    }

    // Vérifier si le username existe déjà
    const existingUserByUsername = await userRepository.findByUsername(username)
    if (existingUserByUsername) {
      throw new Error("Ce nom d'utilisateur est déjà utilisé")
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS)

    // Créer l'utilisateur
    const user = await userRepository.create({
      email,
      username,
      password: hashedPassword,
    })

    // Retourner l'utilisateur sans le mot de passe
    return this.formatUserResponse(user)
  }

  private formatUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      reputation: user.reputation,
      createdAt: user.createdAt,
    }
  }
}
