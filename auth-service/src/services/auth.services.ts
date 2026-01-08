import userRepository from "../repositories/user.repository"
import { Role } from "../types"
import bcrypt from "bcrypt"

export class AuthService {
  async register(email: string, username: string, password: string) {
    // Vérifier si l'email existe déjà
    const existingEmail = await userRepository.findByEmail(email)
    if (existingEmail) {
      throw new Error("Email already exists")
    }

    // Vérifier si le username existe déjà
    const existingUsername = await userRepository.findByUsername(username)
    if (existingUsername) {
      throw new Error("Username already exists")
    }

    // Hasher le password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const user = await userRepository.create({
      email,
      username,
      password: hashedPassword,
      role: Role.USER,
    })

    return user
  }
}
