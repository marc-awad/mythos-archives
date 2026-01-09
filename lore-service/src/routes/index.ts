import { Router, Request, Response } from "express"
import {
  authMiddleware,
  requireExpertOrAdmin,
  requireAdmin,
  optionalAuth,
} from "../middlewares/auth.middleware"

const router = Router()

// ============================================
// HEALTH CHECK (route de base)
// ============================================
router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "lore-service",
    timestamp: new Date().toISOString(),
  })
})

// ============================================
// ROUTES CREATURES (temporaires pour tester l'auth)
// ============================================

// Route publique - Liste des créatures
router.get("/creatures", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Liste des créatures (route publique)",
    data: [],
  })
})

// Route avec auth optionnelle - Détails d'une créature
router.get("/creatures/:id", optionalAuth, (req: Request, res: Response) => {
  if (req.user) {
    res.json({
      success: true,
      message:
        "Détails de la créature (version complète pour utilisateur connecté)",
      data: {
        id: req.params.id,
        name: "Exemple Créature",
        details: "Informations complètes",
        userId: req.user.id,
        username: req.user.username,
      },
    })
  } else {
    res.json({
      success: true,
      message: "Détails de la créature (version publique)",
      data: {
        id: req.params.id,
        name: "Exemple Créature",
        details: "Informations limitées",
      },
    })
  }
})

// Route protégée EXPERT/ADMIN - Créer une créature
router.post(
  "/creatures",
  authMiddleware,
  requireExpertOrAdmin,
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Créature créée avec succès (EXPERT/ADMIN uniquement)",
      data: {
        createdBy: req.user!.username,
        role: req.user!.role,
      },
    })
  }
)

// Route protégée ADMIN - Supprimer une créature
router.delete(
  "/creatures/:id",
  authMiddleware,
  requireAdmin,
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Créature supprimée avec succès (ADMIN uniquement)",
      data: {
        deletedBy: req.user!.username,
        creatureId: req.params.id,
      },
    })
  }
)

// ============================================
// ROUTES TESTIMONIES (temporaires pour tester l'auth)
// ============================================

// Route publique - Liste des témoignages validés
router.get("/testimonies", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Liste des témoignages validés (route publique)",
    data: [],
  })
})

// Route protégée - Créer un témoignage (tous les utilisateurs authentifiés)
router.post("/testimonies", authMiddleware, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Témoignage créé avec succès",
    data: {
      createdBy: req.user!.username,
      userId: req.user!.id,
      role: req.user!.role,
      status: "PENDING",
    },
  })
})

// Route protégée - Mes témoignages
router.get("/testimonies/me", authMiddleware, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Vos témoignages",
    data: {
      userId: req.user!.id,
      username: req.user!.username,
      testimonies: [],
    },
  })
})

// Route protégée EXPERT/ADMIN - Valider un témoignage
router.put(
  "/testimonies/:id/validate",
  authMiddleware,
  requireExpertOrAdmin,
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Témoignage validé avec succès (EXPERT/ADMIN uniquement)",
      data: {
        validatedBy: req.user!.username,
        role: req.user!.role,
        testimonyId: req.params.id,
      },
    })
  }
)

// Route protégée EXPERT/ADMIN - Rejeter un témoignage
router.put(
  "/testimonies/:id/reject",
  authMiddleware,
  requireExpertOrAdmin,
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Témoignage rejeté avec succès (EXPERT/ADMIN uniquement)",
      data: {
        rejectedBy: req.user!.username,
        role: req.user!.role,
        testimonyId: req.params.id,
      },
    })
  }
)

// ============================================
// ROUTES À VENIR (décommentez quand prêt)
// ============================================
// import creatureRoutes from './creature.routes';
// import testimonyRoutes from './testimony.routes';
// router.use('/creatures', creatureRoutes);
// router.use('/testimonies', testimonyRoutes);

export default router
