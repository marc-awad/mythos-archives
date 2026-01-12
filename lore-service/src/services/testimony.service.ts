// lore-service/src/services/testimony.service.ts
// MISE À JOUR MOD-2 : Ajout du logging des actions de modération

import testimonyRepository from "../repositories/testimony.repository"
import creatureRepository from "../repositories/creature.repository"
import creatureService from "./creature.service"
import { authServiceClient } from "./auth.service"
import moderationLogService from "./moderation-log.service" // 🆕 MOD-2
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
   * LORE-7 + EVL-3 + MOD-2: Valider un témoignage (EXPERT/ADMIN)
   * - Vérifier que l'user n'est pas l'auteur
   * - Mettre à jour le statut, validatedBy et validatedAt
   * - Appliquer les règles de réputation :
   *   * +3 pour l'auteur du témoignage
   *   * +1 pour le validateur s'il est EXPERT
   * - Recalculer le legendScore de la créature
   * - 🆕 Logger l'action dans ModerationLog
   */
  async validateTestimony(
    id: string,
    validatedBy: string,
    validatorRole: string
  ): Promise<ITestimony> {
    const testimony = await this.getTestimonyById(id)

    // Vérifier que l'utilisateur n'est pas l'auteur du témoignage
    if (testimony.authorId === validatedBy) {
      throw new Error("Vous ne pouvez pas valider votre propre témoignage")
    }

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

    // EVL-1: Recalculer le legendScore après validation
    await creatureService.updateLegendScore(testimony.creatureId.toString())

    // EVL-3: Appliquer les règles de réputation
    try {
      // Règle 1: +3 pour l'auteur du témoignage validé
      await authServiceClient.updateUserReputation(testimony.authorId, 3)

      // Règle 2: +1 pour le validateur s'il est EXPERT
      if (validatorRole === "EXPERT") {
        await authServiceClient.updateUserReputation(validatedBy, 1)
      }
    } catch (error) {
      // Log l'erreur mais ne pas bloquer la validation du témoignage
      console.error(
        "Erreur lors de la mise à jour de la réputation après validation:",
        error
      )
      // On ne throw pas l'erreur pour ne pas annuler la validation
    }

    // 🆕 MOD-2: Logger l'action de validation
    await moderationLogService.logValidate(validatedBy, id, {
      validatorRole,
      creatureId: testimony.creatureId.toString(),
    })

    return updatedTestimony
  }

  /**
   * LORE-8 + EVL-3 + MOD-2: Rejeter un témoignage (EXPERT/ADMIN)
   * - Vérifier que l'user n'est pas l'auteur
   * - Mettre à jour le statut
   * - Appliquer la règle de réputation : -1 pour l'auteur
   * - Recalculer le legendScore de la créature
   * - 🆕 Logger l'action dans ModerationLog
   */
  async rejectTestimony(id: string, rejectedBy: string): Promise<ITestimony> {
    const testimony = await this.getTestimonyById(id)

    // Vérifier que l'utilisateur n'est pas l'auteur du témoignage
    if (testimony.authorId === rejectedBy) {
      throw new Error("Vous ne pouvez pas rejeter votre propre témoignage")
    }

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

    // EVL-1: Recalculer le legendScore après rejet
    await creatureService.updateLegendScore(testimony.creatureId.toString())

    // EVL-3: Appliquer la règle de réputation : -1 pour l'auteur
    try {
      await authServiceClient.updateUserReputation(testimony.authorId, -1)
    } catch (error) {
      // Log l'erreur mais ne pas bloquer le rejet du témoignage
      console.error(
        "Erreur lors de la mise à jour de la réputation après rejet:",
        error
      )
      // On ne throw pas l'erreur pour ne pas annuler le rejet
    }

    // 🆕 MOD-2: Logger l'action de rejet
    await moderationLogService.logReject(rejectedBy, id, {
      creatureId: testimony.creatureId.toString(),
    })

    return updatedTestimony
  }

  /**
   * MOD-1 + MOD-2: Soft delete d'un témoignage (EXPERT/ADMIN)
   * - Vérifie que le témoignage existe
   * - Marque le témoignage comme supprimé
   * - Recalcule le legendScore de la créature
   * - 🆕 Logger l'action dans ModerationLog
   */
  async softDeleteTestimony(
    id: string,
    deletedBy: string
  ): Promise<ITestimony> {
    // Validation: vérifier que l'ID est un ObjectId MongoDB valide
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("ID de témoignage invalide")
    }

    // Vérifier que le témoignage existe et n'est pas déjà supprimé
    const testimony = await testimonyRepository.findById(id)

    if (!testimony) {
      throw new Error("Témoignage non trouvé ou déjà supprimé")
    }

    // Soft delete
    const deletedTestimony = await testimonyRepository.softDelete(id, deletedBy)

    if (!deletedTestimony) {
      throw new Error("Erreur lors de la suppression du témoignage")
    }

    // Recalculer le legendScore de la créature
    try {
      await creatureService.updateLegendScore(
        deletedTestimony.creatureId.toString()
      )
    } catch (error) {
      console.error(
        "Erreur lors du recalcul du legendScore après suppression:",
        error
      )
      // On ne throw pas pour ne pas annuler la suppression
    }

    // 🆕 MOD-2: Logger l'action de suppression
    await moderationLogService.logDelete(deletedBy, id, {
      creatureId: deletedTestimony.creatureId.toString(),
      previousStatus: testimony.status,
    })

    return deletedTestimony
  }

  /**
   * MOD-1 + MOD-2: Restaurer un témoignage supprimé (ADMIN)
   * - Vérifie que le témoignage existe et est supprimé
   * - Restaure le témoignage
   * - Recalcule le legendScore de la créature
   * - 🆕 Logger l'action dans ModerationLog
   */
  async restoreTestimony(id: string, restoredBy: string): Promise<ITestimony> {
    // Validation: vérifier que l'ID est un ObjectId MongoDB valide
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("ID de témoignage invalide")
    }

    // Vérifier que le témoignage existe et est supprimé
    const testimony = await testimonyRepository.findByIdIncludingDeleted(id)

    if (!testimony) {
      throw new Error("Témoignage non trouvé")
    }

    if (!testimony.deletedAt) {
      throw new Error("Ce témoignage n'est pas supprimé")
    }

    // Restaurer
    const restoredTestimony = await testimonyRepository.restore(id)

    if (!restoredTestimony) {
      throw new Error("Erreur lors de la restauration du témoignage")
    }

    // Recalculer le legendScore de la créature
    try {
      await creatureService.updateLegendScore(
        restoredTestimony.creatureId.toString()
      )
    } catch (error) {
      console.error(
        "Erreur lors du recalcul du legendScore après restauration:",
        error
      )
      // On ne throw pas pour ne pas annuler la restauration
    }

    // 🆕 MOD-2: Logger l'action de restauration
    await moderationLogService.logRestore(restoredBy, id, {
      creatureId: restoredTestimony.creatureId.toString(),
    })

    return restoredTestimony
  }
}

export default new TestimonyService()
