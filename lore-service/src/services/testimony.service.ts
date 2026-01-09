import testimonyRepository from "../repositories/testimony.repository"
import creatureRepository from "../repositories/creature.repository"
import { CreateTestimonyDto } from "../types/testimony.types"
import { ITestimony } from "../models/Testimony"
import { TestimonyStatus } from "../types"

export class TestimonyService {
  /**
   * LORE-5: Créer un nouveau témoignage
   * - Vérifie que la créature existe
   * - Vérifie le délai de 5 minutes (même user, même créature)
   * - Crée le témoignage en statut PENDING
   */
  async createTestimony(
    data: CreateTestimonyDto,
    authorId: string
  ): Promise<ITestimony> {
    // Validation: vérifier que le creatureId est un ObjectId MongoDB valide
    if (!data.creatureId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("ID de créature invalide")
    }

    // 1. Vérifier que la créature existe
    const creature = await creatureRepository.findById(data.creatureId)

    if (!creature) {
      throw new Error("Créature non trouvée")
    }

    // 2. Validation: description obligatoire et longueur
    if (!data.description || !data.description.trim()) {
      throw new Error("La description est requise")
    }

    if (data.description.trim().length < 10) {
      throw new Error("La description doit contenir au moins 10 caractères")
    }

    if (data.description.trim().length > 2000) {
      throw new Error("La description ne peut pas dépasser 2000 caractères")
    }

    // 3. Vérifier le délai de 5 minutes (même user, même créature)
    const recentTestimony = await testimonyRepository.findRecentTestimony(
      authorId,
      data.creatureId,
      5 // 5 minutes
    )

    if (recentTestimony) {
      const timeSinceLastTestimony = Math.ceil(
        (Date.now() - recentTestimony.createdAt.getTime()) / 1000 / 60
      )
      const timeRemaining = 5 - timeSinceLastTestimony

      throw new Error(
        `Vous avez déjà témoigné pour cette créature récemment. Veuillez attendre ${timeRemaining} minute(s) avant de témoigner à nouveau.`
      )
    }

    // 4. Créer le témoignage en statut PENDING
    const testimony = await testimonyRepository.create(
      {
        creatureId: data.creatureId,
        description: data.description.trim(),
      },
      authorId
    )

    // 5. Incrémenter le legend score de la créature
    await creatureRepository.incrementLegendScore(data.creatureId, 1)

    return testimony
  }

  /**
   * LORE-6: Récupérer tous les témoignages d'une créature
   * Avec possibilité de filtrer par statut
   */
  async getTestimoniesByCreature(
    creatureId: string,
    status?: TestimonyStatus
  ): Promise<ITestimony[]> {
    // Validation: vérifier que le creatureId est un ObjectId MongoDB valide
    if (!creatureId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("ID de créature invalide")
    }

    // Vérifier que la créature existe
    const creature = await creatureRepository.findById(creatureId)

    if (!creature) {
      throw new Error("Créature non trouvée")
    }

    // Récupérer les témoignages
    const testimonies = await testimonyRepository.findByCreatureId(
      creatureId,
      status
    )

    return testimonies
  }

  /**
   * Récupérer un témoignage par ID
   */
  async getTestimonyById(id: string): Promise<ITestimony> {
    // Validation: vérifier que l'ID est un ObjectId MongoDB valide
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("ID de témoignage invalide")
    }

    const testimony = await testimonyRepository.findById(id)

    if (!testimony) {
      throw new Error("Témoignage non trouvé")
    }

    return testimony
  }

  /**
   * Récupérer tous les témoignages d'un auteur
   */
  async getTestimoniesByAuthor(authorId: string): Promise<ITestimony[]> {
    return await testimonyRepository.findByAuthor(authorId)
  }

  /**
   * Valider un témoignage (EXPERT/ADMIN)
   */
  async validateTestimony(
    id: string,
    validatedBy: string
  ): Promise<ITestimony> {
    const testimony = await this.getTestimonyById(id)

    if (testimony.status !== TestimonyStatus.PENDING) {
      throw new Error("Seuls les témoignages en attente peuvent être validés")
    }

    const updatedTestimony = await testimonyRepository.updateStatus(
      id,
      TestimonyStatus.VALIDATED,
      validatedBy
    )

    if (!updatedTestimony) {
      throw new Error("Erreur lors de la validation du témoignage")
    }

    return updatedTestimony
  }

  /**
   * Rejeter un témoignage (EXPERT/ADMIN)
   */
  async rejectTestimony(id: string, rejectedBy: string): Promise<ITestimony> {
    const testimony = await this.getTestimonyById(id)

    if (testimony.status !== TestimonyStatus.PENDING) {
      throw new Error("Seuls les témoignages en attente peuvent être rejetés")
    }

    const updatedTestimony = await testimonyRepository.updateStatus(
      id,
      TestimonyStatus.REJECTED,
      rejectedBy
    )

    if (!updatedTestimony) {
      throw new Error("Erreur lors du rejet du témoignage")
    }

    // Décrémenter le legend score de la créature
    await creatureRepository.incrementLegendScore(
      testimony.creatureId.toString(),
      -1
    )

    return updatedTestimony
  }
}

export default new TestimonyService()
