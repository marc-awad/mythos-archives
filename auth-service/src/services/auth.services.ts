import { UserRepository } from "../repositories/user.repository"

export class AuthService {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  // TODO: Ajouter les méthodes métier
}
