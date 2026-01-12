// src/services/mythology.service.ts

import loreService from './lore.service';
import {
  MythologyStats,
  CreatureStats,
  Testimony,
  TestimonyStatus,
} from '../types';

export class MythologyService {
  /**
   * MYTH-1: Générer les statistiques globales du bestiaire
   *
   * Calcule :
   * - Nombre total de créatures
   * - Moyenne de témoignages par créature
   * - Statistiques détaillées par créature
   */
  async generateStats(token: string): Promise<MythologyStats> {
    try {
      // 1. Récupérer toutes les créatures
      const creatures = await loreService.getAllCreatures(token);

      if (creatures.length === 0) {
        return this.getEmptyStats();
      }

      // 2. Pour chaque créature, récupérer ses témoignages
      const creaturesWithStats: CreatureStats[] = await Promise.all(
        creatures.map(async (creature) => {
          const testimonies = await loreService.getTestimoniesByCreature(
            creature._id,
            token,
          );

          return this.calculateCreatureStats(creature, testimonies);
        }),
      );

      // 3. Calculer les statistiques globales
      const stats = this.calculateGlobalStats(creaturesWithStats);

      return stats;
    } catch (error) {
      console.error('Erreur lors de la génération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Calculer les statistiques d'une créature
   */
  private calculateCreatureStats(
    creature: any,
    testimonies: Testimony[],
  ): CreatureStats {
    const validatedCount = testimonies.filter(
      (t) => t.status === TestimonyStatus.VALIDATED,
    ).length;

    const pendingCount = testimonies.filter(
      (t) => t.status === TestimonyStatus.PENDING,
    ).length;

    const rejectedCount = testimonies.filter(
      (t) => t.status === TestimonyStatus.REJECTED,
    ).length;

    return {
      id: creature._id,
      name: creature.name,
      origin: creature.origin,
      legendScore: creature.legendScore,
      totalTestimonies: testimonies.length,
      validatedTestimonies: validatedCount,
      pendingTestimonies: pendingCount,
      rejectedTestimonies: rejectedCount,
    };
  }

  /**
   * Calculer les statistiques globales
   */
  private calculateGlobalStats(creatures: CreatureStats[]): MythologyStats {
    const totalCreatures = creatures.length;

    const totalTestimonies = creatures.reduce(
      (sum, creature) => sum + creature.totalTestimonies,
      0,
    );

    const totalValidatedTestimonies = creatures.reduce(
      (sum, creature) => sum + creature.validatedTestimonies,
      0,
    );

    const totalPendingTestimonies = creatures.reduce(
      (sum, creature) => sum + creature.pendingTestimonies,
      0,
    );

    const totalRejectedTestimonies = creatures.reduce(
      (sum, creature) => sum + creature.rejectedTestimonies,
      0,
    );

    const averageTestimoniesPerCreature =
      totalCreatures > 0
        ? Math.round((totalTestimonies / totalCreatures) * 100) / 100
        : 0;

    return {
      totalCreatures,
      averageTestimoniesPerCreature,
      totalTestimonies,
      totalValidatedTestimonies,
      totalPendingTestimonies,
      totalRejectedTestimonies,
      creatures,
    };
  }

  /**
   * Retourner des statistiques vides si aucune créature
   */
  private getEmptyStats(): MythologyStats {
    return {
      totalCreatures: 0,
      averageTestimoniesPerCreature: 0,
      totalTestimonies: 0,
      totalValidatedTestimonies: 0,
      totalPendingTestimonies: 0,
      totalRejectedTestimonies: 0,
      creatures: [],
    };
  }
}

export default new MythologyService();
