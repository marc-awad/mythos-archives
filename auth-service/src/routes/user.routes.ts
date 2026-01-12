import { Router } from "express"
import { AuthMiddleware } from "../middlewares/auth.middleware"
import { UserController } from "../controllers/user.controller"

const router = Router()
const userController = new UserController()

// Routes ADMIN uniquement
// GET /admin/users - Récupérer tous les utilisateurs
router.get(
  "/admin/users",
  AuthMiddleware.authenticate,
  AuthMiddleware.requireAdmin,
  userController.getAllUsers
)

// PATCH /users/:id/role - Modifier le rôle d'un utilisateur
router.patch(
  "/users/:id/role",
  AuthMiddleware.authenticate,
  AuthMiddleware.requireAdmin,
  userController.updateUserRole
)

// DELETE /users/:id - Supprimer un utilisateur
router.delete(
  "/users/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.requireAdmin,
  userController.deleteUser
)

// Routes pour utilisateurs authentifiés
// GET /users/:id - Récupérer un utilisateur spécifique
router.get(
  "/users/:id",
  AuthMiddleware.authenticate,
  userController.getUserById
)

router.patch("/users/:id/reputation", userController.updateReputation)

export default router
