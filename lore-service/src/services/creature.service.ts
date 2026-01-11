// src/services/creature.service.ts

import creatureRepository from "../repositories/creature.repository"
import testimonyRepository from "../repositories/testimony.repository"
import { CreateCreatureDto, UpdateCreatureDto } from "../types/creature.types"
import { ICreature } from "../models/Creature"
import { TestimonyStatus } from "../types"

export class CreatureService {
  /**
   * EVL-1: Calculer le legendScore d'une créature
   * Formule: legendScore = 1 + (nombreDeTestimoniesValidés / 5)
   *
   * @param creatureId - ID de la créature
   * @returns Le nouveau legendScore calculé
   */
  async calculateLegendScore(creatureId: string): Promise<number> {
    // Compter le nombre de témoignages validés pour cette créature
    const validatedCount = await testimonyRepository.countByCreatureAndStatus(
      creatureId,
      TestimonyStatus.VALIDATED
    )

    // Appliquer la formule
    const legendScore = 1 + validatedCount / 5

    return legendScore
  }

  /**
   * EVL-1: Mettre à jour automatiquement le legendScore d'une créature
   * Cette méthode recalcule et sauvegarde le nouveau score
   *
   * @param creatureId - ID de la créature à mettre à jour
   */
  async updateLegendScore(creatureId: string): Promise<void> {
    const newScore = await this.calculateLegendScore(creatureId)
    await creatureRepository.updateLegendScore(creatureId, newScore)
  }

  /**
   * Créer une nouvelle créature
   * Vérifie l'unicité du nom
   */
  async createCreature(
    data: CreateCreatureDto,
    authorId: string
  ): Promise<ICreature> {
    // Validation: vérifier que le nom n'existe pas déjà
    const existingCreature = await creatureRepository.existsByName(data.name)

    if (existingCreature) {
      throw new Error(
        `Une créature avec le nom "${data.name}" existe déjà. Veuillez choisir un autre nom.`
      )
    }

    // Validation: nom minimum 2 caractères
    if (data.name.trim().length < 2) {
      throw new Error("Le nom doit contenir au moins 2 caractères")
    }

    // Validation: nom maximum 100 caractères
    if (data.name.trim().length > 100) {
      throw new Error("Le nom ne peut pas dépasser 100 caractères")
    }

    // Validation: origin maximum 200 caractères
    if (data.origin && data.origin.trim().length > 200) {
      throw new Error("L'origine ne peut pas dépasser 200 caractères")
    }

    // Créer la créature
    const creature = await creatureRepository.create(
      {
        name: data.name.trim(),
        origin: data.origin?.trim(),
      },
      authorId
    )

    return creature
  }

  /**
   * Récupérer toutes les créatures avec pagination et filtres
   */
  async getAllCreatures(options: {
    page?: number
    limit?: number
    sort?: string
    search?: string
    authorId?: string
  }) {
    // Validation des paramètres
    const page = Math.max(1, options.page || 1)
    const limit = Math.min(100, Math.max(1, options.limit || 10)) // Max 100 items par page

    return await creatureRepository.findAll({
      page,
      limit,
      sort: options.sort,
      search: options.search,
      authorId: options.authorId,
    })
  }

  /**
   * Récupérer une créature par ID
   */
  async getCreatureById(id: string): Promise<ICreature> {
    // Validation: vérifier que l'ID est un ObjectId MongoDB valide
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("ID de créature invalide")
    }

    const creature = await creatureRepository.findById(id)

    if (!creature) {
      throw new Error("Créature non trouvée")
    }

    return creature
  }

  /**
   * Mettre à jour une créature
   */
  async updateCreature(
    id: string,
    data: UpdateCreatureDto,
    authorId: string,
    userRole: string
  ): Promise<ICreature> {
    // Validation: vérifier que l'ID est valide
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("ID de créature invalide")
    }

    const creature = await creatureRepository.findById(id)

    if (!creature) {
      throw new Error("Créature non trouvée")
    }

    // Vérification des permissions: seul l'auteur ou un ADMIN peut modifier
    if (creature.authorId !== authorId && userRole !== "ADMIN") {
      throw new Error(
        "Vous n'avez pas la permission de modifier cette créature"
      )
    }

    // Validation: si le nom change, vérifier l'unicité
    if (data.name && data.name !== creature.name) {
      const existingCreature = await creatureRepository.existsByName(
        data.name,
        id
      )

      if (existingCreature) {
        throw new Error(`Une créature avec le nom "${data.name}" existe déjà`)
      }
    }

    // Mettre à jour
    const updatedCreature = await creatureRepository.update(id, {
      name: data.name?.trim(),
      origin: data.origin?.trim(),
    })

    if (!updatedCreature) {
      throw new Error("Erreur lors de la mise à jour")
    }

    return updatedCreature
  }

  /**
   * Supprimer une créature
   */
  async deleteCreature(
    id: string,
    authorId: string,
    userRole: string
  ): Promise<void> {
    // Validation: vérifier que l'ID est valide
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("ID de créature invalide")
    }

    const creature = await creatureRepository.findById(id)

    if (!creature) {
      throw new Error("Créature non trouvée")
    }

    // Vérification des permissions: seul l'auteur ou un ADMIN peut supprimer
    if (creature.authorId !== authorId && userRole !== "ADMIN") {
      throw new Error(
        "Vous n'avez pas la permission de supprimer cette créature"
      )
    }

    await creatureRepository.delete(id)
  }

  /**
   * Récupérer les créatures d'un auteur
   */
  async getCreaturesByAuthor(
    authorId: string,
    limit?: number
  ): Promise<ICreature[]> {
    return await creatureRepository.findByAuthor(authorId, limit)
  }

  /**
   * Compter les créatures d'un auteur
   */
  async countCreaturesByAuthor(authorId: string): Promise<number> {
    return await creatureRepository.countByAuthor(authorId)
  }
}

export default new CreatureService()
