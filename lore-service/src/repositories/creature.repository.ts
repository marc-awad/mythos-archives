import Creature, { ICreature } from "../models/Creature"
import { CreateCreatureDto, UpdateCreatureDto } from "../types/creature.types"

export class CreatureRepository {
  /**
   * Créer une créature
   */
  async create(data: CreateCreatureDto, authorId: string): Promise<ICreature> {
    const creature = new Creature({
      ...data,
      authorId,
    })
    return await creature.save()
  }

  /**
   * Trouver une créature par ID
   */
  async findById(id: string): Promise<ICreature | null> {
    return await Creature.findById(id)
  }

  /**
   * Trouver une créature par nom (pour vérifier l'unicité)
   */
  async findByName(name: string): Promise<ICreature | null> {
    return await Creature.findOne({ name })
  }

  /**
   * Vérifier si un nom existe déjà (case insensitive)
   */
  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const query: any = {
      name: { $regex: new RegExp(`^${name}$`, "i") },
    }

    if (excludeId) {
      query._id = { $ne: excludeId }
    }

    const count = await Creature.countDocuments(query)
    return count > 0
  }

  /**
   * Récupérer toutes les créatures avec pagination et filtres
   */
  async findAll(options: {
    page?: number
    limit?: number
    sort?: string
    search?: string
    authorId?: string
  }): Promise<{
    creatures: ICreature[]
    total: number
    page: number
    totalPages: number
  }> {
    const page = options.page || 1
    const limit = options.limit || 10
    const skip = (page - 1) * limit

    // Construction du filtre
    const filter: any = {}

    if (options.search) {
      filter.name = { $regex: options.search, $options: "i" }
    }

    if (options.authorId) {
      filter.authorId = options.authorId
    }

    // Construction du tri
    let sortOption: any = { createdAt: -1 } // Par défaut: plus récent d'abord

    if (options.sort) {
      switch (options.sort) {
        case "legendScore":
          sortOption = { legendScore: -1, createdAt: -1 }
          break
        case "-legendScore":
          sortOption = { legendScore: 1, createdAt: -1 }
          break
        case "createdAt":
          sortOption = { createdAt: 1 }
          break
        case "-createdAt":
          sortOption = { createdAt: -1 }
          break
        case "name":
          sortOption = { name: 1 }
          break
        case "-name":
          sortOption = { name: -1 }
          break
      }
    }

    // Exécution des requêtes
    const [creatures, total] = await Promise.all([
      Creature.find(filter).sort(sortOption).skip(skip).limit(limit),
      Creature.countDocuments(filter),
    ])

    return {
      creatures,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Mettre à jour une créature
   */
  async update(id: string, data: UpdateCreatureDto): Promise<ICreature | null> {
    return await Creature.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
  }

  /**
   * Supprimer une créature
   */
  async delete(id: string): Promise<ICreature | null> {
    return await Creature.findByIdAndDelete(id)
  }

  /**
   * Incrémenter le legend score
   */
  async incrementLegendScore(id: string, amount: number = 1): Promise<void> {
    await Creature.findByIdAndUpdate(id, {
      $inc: { legendScore: amount },
    })
  }

  async updateLegendScore(id: string, score: number): Promise<void> {
    await Creature.findByIdAndUpdate(id, {
      $set: { legendScore: score },
    })
  }
  /**
   * Récupérer les créatures d'un auteur
   */
  async findByAuthor(authorId: string, limit?: number): Promise<ICreature[]> {
    const query = Creature.find({ authorId }).sort({ createdAt: -1 })

    if (limit) {
      query.limit(limit)
    }

    return await query
  }

  /**
   * Compter les créatures d'un auteur
   */
  async countByAuthor(authorId: string): Promise<number> {
    return await Creature.countDocuments({ authorId })
  }
}

export default new CreatureRepository()
