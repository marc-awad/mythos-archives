// src/controllers/classification.controller.ts

import { Request, Response } from "express"
import classificationService from "../services/classification.service"

/**
 * GET /mythology/classification
 * Récupère la classification hiérarchique des créatures
 */
export const getClassification = async (req: Request, res: Response) => {
  try {
    // Récupérer le token JWT
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token manquant",
      })
    }

    // Vérifier si le client veut les détails complets
    const includeDetails = req.query.details === "true"

    // Générer la classification
    const { classification, details } =
      await classificationService.classifyCreatures(token)

    // Calculer les statistiques
    const stats = classificationService.getClassificationStats(classification)

    // Construire la réponse
    const responseData: any = {
      totalCreatures: details.length,
      totalFamilies: stats.totalFamilies,
      familyDistribution: stats.familyDistribution,
      classification,
    }

    // Ajouter les détails si demandés
    if (includeDetails) {
      responseData.details = details
    }

    return res.status(200).json({
      success: true,
      message: "Classification générée avec succès",
      data: responseData,
    })
  } catch (error: any) {
    console.error("Erreur dans getClassification:", error)

    // Gestion spécifique des erreurs
    if (error.message === "Lore service non disponible") {
      return res.status(503).json({
        success: false,
        message: "Le service lore n'est pas disponible",
        error: error.message,
      })
    }

    if (error.message === "Token invalide ou expiré") {
      return res.status(401).json({
        success: false,
        message: "Token invalide ou expiré",
        error: error.message,
      })
    }

    // Erreur générique
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la génération de la classification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

/**
 * GET /mythology/classification/families
 * Liste uniquement les familles disponibles
 */
export const getFamilies = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token manquant",
      })
    }

    const { classification } = await classificationService.classifyCreatures(
      token
    )
    const stats = classificationService.getClassificationStats(classification)

    return res.status(200).json({
      success: true,
      message: "Familles récupérées avec succès",
      data: {
        families: Object.keys(classification.families),
        distribution: stats.familyDistribution,
      },
    })
  } catch (error: any) {
    console.error("Erreur dans getFamilies:", error)

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des familles",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}
