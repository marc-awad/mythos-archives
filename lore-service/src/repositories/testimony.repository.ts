import Testimony, { ITestimony } from "../models/Testimony"
import { CreateTestimonyDto } from "../types/testimony.types"
import { TestimonyStatus } from "../types"

export class TestimonyRepository {
  /**
   * Créer un témoignage
   */
  async create(
    data: CreateTestimonyDto,
    authorId: string
  ): Promise<ITestimony> {
    const testimony = new Testimony({
      creatureId: data.creatureId,
      authorId,
      description: data.description,
      status: TestimonyStatus.PENDING,
    })
    return await testimony.save()
  }

  /**
   * Trouver un témoignage par ID
   */
  async findById(id: string): Promise<ITestimony | null> {
    return await Testimony.findById(id)
  }

  /**
   * Récupérer tous les témoignages d'une créature
   * Avec filtre optionnel par statut
   */
  async findByCreatureId(
    creatureId: string,
    status?: TestimonyStatus
  ): Promise<ITestimony[]> {
    const filter: any = { creatureId }

    if (status) {
      filter.status = status
    }

    return await Testimony.find(filter).sort({ createdAt: -1 })
  }

  /**
   * Vérifier si un utilisateur a déjà témoigné récemment pour une créature
   * Retourne le dernier témoignage dans la période donnée (en minutes)
   */
  async findRecentTestimony(
    authorId: string,
    creatureId: string,
    withinMinutes: number
  ): Promise<ITestimony | null> {
    const timeLimit = new Date(Date.now() - withinMinutes * 60 * 1000)

    return await Testimony.findOne({
      authorId,
      creatureId,
      createdAt: { $gte: timeLimit },
    }).sort({ createdAt: -1 })
  }

  /**
   * Récupérer tous les témoignages d'un auteur
   */
  async findByAuthor(authorId: string): Promise<ITestimony[]> {
    return await Testimony.find({ authorId }).sort({ createdAt: -1 })
  }

  /**
   * Compter les témoignages d'une créature par statut
   */
  async countByCreatureAndStatus(
    creatureId: string,
    status?: TestimonyStatus
  ): Promise<number> {
    const filter: any = { creatureId }

    if (status) {
      filter.status = status
    }

    return await Testimony.countDocuments(filter)
  }

  /**
   * Mettre à jour le statut d'un témoignage
   */
  async updateStatus(
    id: string,
    status: TestimonyStatus,
    validatedBy: string
  ): Promise<ITestimony | null> {
    return await Testimony.findByIdAndUpdate(
      id,
      {
        status,
        validatedBy,
        validatedAt: new Date(),
      },
      { new: true }
    )
  }

  /**
   * Supprimer un témoignage
   */
  async delete(id: string): Promise<ITestimony | null> {
    return await Testimony.findByIdAndDelete(id)
  }
}

export default new TestimonyRepository()
