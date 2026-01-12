// lore-service/src/repositories/testimony.repository.ts

import Testimony, { ITestimony } from '../models/Testimony';
import { CreateTestimonyDto } from '../types/testimony.types';
import { TestimonyStatus } from '../types';

export class TestimonyRepository {
  /**
   * Créer un témoignage
   */
  async create(
    data: CreateTestimonyDto,
    authorId: string,
  ): Promise<ITestimony> {
    const testimony = new Testimony({
      creatureId: data.creatureId,
      authorId,
      description: data.description,
      status: TestimonyStatus.PENDING,
    });
    return await testimony.save();
  }

  /**
   * MOD-1: Trouver un témoignage par ID (exclut les supprimés)
   */
  async findById(id: string): Promise<ITestimony | null> {
    return await Testimony.findOne({ _id: id, deletedAt: null });
  }

  /**
   * MOD-1: Trouver un témoignage par ID (inclut les supprimés)
   * Utilisé pour la restauration
   */
  async findByIdIncludingDeleted(id: string): Promise<ITestimony | null> {
    return await Testimony.findById(id);
  }

  /**
   * MOD-1: Récupérer tous les témoignages d'une créature (exclut les supprimés)
   * Avec filtre optionnel par statut
   */
  async findByCreatureId(
    creatureId: string,
    status?: TestimonyStatus,
  ): Promise<ITestimony[]> {
    const filter: any = { creatureId, deletedAt: null };

    if (status) {
      filter.status = status;
    }

    return await Testimony.find(filter).sort({ createdAt: -1 });
  }

  /**
   * MOD-1: Vérifier si un utilisateur a déjà témoigné récemment pour une créature
   * Exclut les témoignages supprimés
   */
  async findRecentTestimony(
    authorId: string,
    creatureId: string,
    withinMinutes: number,
  ): Promise<ITestimony | null> {
    const timeLimit = new Date(Date.now() - withinMinutes * 60 * 1000);

    return await Testimony.findOne({
      authorId,
      creatureId,
      createdAt: { $gte: timeLimit },
      deletedAt: null, // MOD-1: Exclure les supprimés
    }).sort({ createdAt: -1 });
  }

  /**
   * MOD-1: Récupérer tous les témoignages d'un auteur (exclut les supprimés)
   */
  async findByAuthor(authorId: string): Promise<ITestimony[]> {
    return await Testimony.find({ authorId, deletedAt: null }).sort({
      createdAt: -1,
    });
  }

  /**
   * MOD-1: Compter les témoignages d'une créature par statut (exclut les supprimés)
   */
  async countByCreatureAndStatus(
    creatureId: string,
    status?: TestimonyStatus,
  ): Promise<number> {
    const filter: any = { creatureId, deletedAt: null };

    if (status) {
      filter.status = status;
    }

    return await Testimony.countDocuments(filter);
  }

  /**
   * Mettre à jour le statut d'un témoignage
   */
  async updateStatus(
    id: string,
    status: TestimonyStatus,
    validatedBy: string,
  ): Promise<ITestimony | null> {
    return await Testimony.findByIdAndUpdate(
      id,
      {
        status,
        validatedBy,
        validatedAt: new Date(),
      },
      { new: true },
    );
  }

  /**
   * MOD-1: Soft delete d'un témoignage
   */
  async softDelete(id: string, deletedBy: string): Promise<ITestimony | null> {
    return await Testimony.findOneAndUpdate(
      { _id: id, deletedAt: null }, // Ne supprimer que si pas déjà supprimé
      {
        deletedAt: new Date(),
        deletedBy,
      },
      { new: true },
    );
  }

  /**
   * MOD-1: Restaurer un témoignage supprimé
   */
  async restore(id: string): Promise<ITestimony | null> {
    return await Testimony.findOneAndUpdate(
      { _id: id, deletedAt: { $ne: null } }, // Ne restaurer que si supprimé
      {
        deletedAt: null,
        deletedBy: null,
      },
      { new: true },
    );
  }

  /**
   * Supprimer définitivement un témoignage (hard delete)
   * À utiliser avec précaution - préférer soft delete
   */
  async delete(id: string): Promise<ITestimony | null> {
    return await Testimony.findByIdAndDelete(id);
  }
}

export default new TestimonyRepository();
