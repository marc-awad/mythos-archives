// src/services/lore.service.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import config from '../config';
import {
  Creature,
  Testimony,
  LoreServiceCreaturesResponse,
  LoreServiceTestimoniesResponse,
} from '../types';

export class LoreService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.loreServiceUrl,
      timeout: 10000, // 10 secondes
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour logger les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleError(error);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Récupérer toutes les créatures depuis lore-service
   * Relaye le JWT pour l'authentification
   */
  async getAllCreatures(token: string): Promise<Creature[]> {
    try {
      console.log('[LoreService] Fetching creatures from /api/creatures');

      const response = await this.client.get<LoreServiceCreaturesResponse>(
        '/api/creatures', // ✅ CORRECTION: endpoint correct
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 100, // Récupérer maximum de créatures
          },
        },
      );

      console.log('[LoreService] Response received:', {
        success: response.data.success,
        count: response.data.data?.length || 0,
      });

      if (!response.data.success) {
        throw new Error('Échec de la récupération des créatures');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;

        // Erreur d'authentification
        if (axiosError.response?.status === 401) {
          throw new Error('Token invalide ou expiré');
        }

        // Erreur réseau
        if (axiosError.code === 'ECONNREFUSED') {
          throw new Error('Impossible de contacter le lore-service');
        }

        // Timeout
        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Timeout lors de la récupération des créatures');
        }

        throw new Error(
          axiosError.response?.data?.message ||
            'Erreur lors de la récupération des créatures',
        );
      }

      throw error;
    }
  }

  /**
   * Récupérer tous les témoignages d'une créature
   * Relaye le JWT pour l'authentification
   */
  async getTestimoniesByCreature(
    creatureId: string,
    token: string,
  ): Promise<Testimony[]> {
    try {
      console.log(
        `[LoreService] Fetching testimonies for creature ${creatureId}`,
      );

      const response = await this.client.get<LoreServiceTestimoniesResponse>(
        `/api/creatures/${creatureId}/testimonies`, // ✅ CORRECTION: endpoint correct
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.data.success) {
        throw new Error(
          `Échec de la récupération des témoignages pour la créature ${creatureId}`,
        );
      }

      console.log(
        `[LoreService] Found ${response.data.data.length} testimonies`,
      );

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;

        // Si la créature n'existe pas, retourner un tableau vide
        if (axiosError.response?.status === 404) {
          console.warn(`Créature ${creatureId} non trouvée, témoignages = []`);
          return [];
        }

        // Erreur d'authentification
        if (axiosError.response?.status === 401) {
          throw new Error('Token invalide ou expiré');
        }

        // Erreur réseau
        if (axiosError.code === 'ECONNREFUSED') {
          throw new Error('Impossible de contacter le lore-service');
        }

        console.error(
          `Erreur lors de la récupération des témoignages pour ${creatureId}:`,
          axiosError.response?.data?.message || axiosError.message,
        );

        // Ne pas bloquer toute l'analyse si une créature échoue
        return [];
      }

      throw error;
    }
  }

  /**
   * Vérifier la santé du lore-service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Lore service health check failed:', error);
      return false;
    }
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError(error: AxiosError): void {
    if (error.response) {
      console.error('Lore Service Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      console.error('Lore Service No Response:', {
        url: error.config?.url,
        message: error.message,
      });
    } else {
      console.error('Lore Service Request Error:', error.message);
    }
  }
}

export default new LoreService();
