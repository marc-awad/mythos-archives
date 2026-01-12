// src/services/classification.service.ts

import loreService from './lore.service';
import { Creature, ClassificationResult, ClassifiedCreature } from '../types';

/**
 * Service de classification automatique des créatures mythologiques
 * Analyse les origines et regroupe les créatures par familles
 */
export class ClassificationService {
  // Mapping des mots-clés vers les familles mythologiques
  private readonly FAMILY_KEYWORDS: { [key: string]: string[] } = {
    Nordique: ['nordique', 'norse', 'viking', 'scandinave', 'odin', 'thor'],
    Grec: ['grec', 'grèce', 'olympe', 'zeus', 'athènes', 'hellenique'],
    Égyptien: ['égyptien', 'egyptien', 'egypt', 'pharaon', 'nil', 'ankh'],
    Celtique: [
      'celtique',
      'celte',
      'irlandais',
      'breton',
      'gaulois',
      'druidique',
    ],
    Asiatique: ['asiatique', 'chinois', 'japonais', 'oriental', 'asia'],
    Amérindien: [
      'amérindien',
      'amerindien',
      'natif',
      'aztèque',
      'maya',
      'inca',
    ],
    Africain: ['africain', 'afrique', 'subsaharien', 'tribal'],
    'Moyen-Orient': [
      'perse',
      'arabe',
      'mesopotamien',
      'babylonien',
      'sumerien',
    ],
    Slave: ['slave', 'russe', 'polonais', 'balkanique'],
    Inventé: ['inventé', 'fiction', 'moderne', 'contemporain', 'original'],
  };

  // Mots-clés pour détecter les sous-types
  private readonly SUBTYPE_KEYWORDS: { [key: string]: string[] } = {
    Dragon: ['dragon', 'drake', 'wyvern', 'wyrm'],
    Serpent: ['serpent', 'snake', 'hydra', 'basilic'],
    Loup: ['loup', 'wolf', 'lycanthrope'],
    Oiseau: ['oiseau', 'bird', 'phoenix', 'phénix', 'aigle'],
    Géant: ['géant', 'giant', 'titan', 'colosse'],
    Esprit: ['esprit', 'spirit', 'fantôme', 'ghost', 'âme'],
    Démon: ['démon', 'demon', 'diable', 'devil'],
    Fée: ['fée', 'fairy', 'elfe', 'lutin'],
  };

  /**
   * Classifier toutes les créatures en familles mythologiques
   */
  async classifyCreatures(token: string): Promise<{
    classification: ClassificationResult
    details: ClassifiedCreature[]
  }> {
    // 1. Récupérer toutes les créatures
    const creatures = await loreService.getAllCreatures(token);

    if (!creatures || creatures.length === 0) {
      return {
        classification: { families: { Unknown: { Default: [] } } },
        details: [],
      };
    }

    // 2. Classifier chaque créature
    const classifiedCreatures: ClassifiedCreature[] = [];
    const familyMap: { [family: string]: { [subtype: string]: string[] } } = {};

    for (const creature of creatures) {
      const classified = this.classifySingleCreature(creature);
      classifiedCreatures.push(classified);

      // Construire la structure hiérarchique
      if (!familyMap[classified.family]) {
        familyMap[classified.family] = {};
      }
      if (!familyMap[classified.family][classified.subtype]) {
        familyMap[classified.family][classified.subtype] = [];
      }
      familyMap[classified.family][classified.subtype].push(classified.name);
    }

    return {
      classification: { families: familyMap },
      details: classifiedCreatures,
    };
  }

  /**
   * Classifier une créature individuelle
   */
  private classifySingleCreature(creature: Creature): ClassifiedCreature {
    const origin = (creature.origin || '').toLowerCase().trim();

    // Si pas d'origine, classifier comme Unknown
    if (!origin) {
      return {
        id: creature._id,
        name: creature.name,
        origin: creature.origin || 'Non spécifiée',
        family: 'Unknown',
        subtype: 'Default',
        legendScore: creature.legendScore,
      };
    }

    // Détecter la famille mythologique
    const family = this.detectFamily(origin, creature.name);

    // Détecter le sous-type
    const subtype = this.detectSubtype(origin, creature.name);

    return {
      id: creature._id,
      name: creature.name,
      origin: creature.origin ?? 'Non spécifiée', // Utilise ?? pour garantir une string
      family,
      subtype,
      legendScore: creature.legendScore,
    };
  }

  /**
   * Détecter la famille mythologique à partir de l'origine et du nom
   */
  private detectFamily(origin: string, name: string): string {
    const searchText = `${origin} ${name}`.toLowerCase();

    // Chercher dans les mots-clés de chaque famille
    for (const [family, keywords] of Object.entries(this.FAMILY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (searchText.includes(keyword)) {
          return family;
        }
      }
    }

    // Vérifier si l'origine contient des indices géographiques
    const geographicFamily = this.detectGeographicFamily(origin);
    if (geographicFamily) {
      return geographicFamily;
    }

    // Par défaut : Unknown
    return 'Unknown';
  }

  /**
   * Détecter une famille basée sur des indices géographiques
   */
  private detectGeographicFamily(origin: string): string | null {
    const geo: { [key: string]: string[] } = {
      Nordique: ['nord', 'islande', 'norvège', 'suède', 'danemark'],
      Grec: ['grèce', 'méditerranée', 'égée'],
      Égyptien: ['égypte', 'nil', 'sahara'],
      Asiatique: ['chine', 'japon', 'inde', 'himalaya'],
      Celtique: ['irlande', 'écosse', 'bretagne', 'galles'],
    };

    for (const [family, locations] of Object.entries(geo)) {
      for (const location of locations) {
        if (origin.includes(location)) {
          return family;
        }
      }
    }

    return null;
  }

  /**
   * Détecter le sous-type de créature
   */
  private detectSubtype(origin: string, name: string): string {
    const searchText = `${origin} ${name}`.toLowerCase();

    // Chercher dans les mots-clés de chaque sous-type
    for (const [subtype, keywords] of Object.entries(this.SUBTYPE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (searchText.includes(keyword)) {
          return subtype;
        }
      }
    }

    // Par défaut : Default
    return 'Default';
  }

  /**
   * Obtenir des statistiques sur la classification
   */
  getClassificationStats(classification: ClassificationResult): {
    totalFamilies: number
    totalSubtypes: number
    familyDistribution: { [family: string]: number }
  } {
    let totalSubtypes = 0;
    const familyDistribution: { [family: string]: number } = {};

    for (const [family, subtypes] of Object.entries(classification.families)) {
      let familyCount = 0;

      for (const creatures of Object.values(subtypes)) {
        totalSubtypes++;
        familyCount += creatures.length;
      }

      familyDistribution[family] = familyCount;
    }

    return {
      totalFamilies: Object.keys(classification.families).length,
      totalSubtypes,
      familyDistribution,
    };
  }
}

export default new ClassificationService();
