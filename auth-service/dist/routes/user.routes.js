"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// Routes ADMIN uniquement
// GET /admin/users - Récupérer tous les utilisateurs
router.get("/admin/users", auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requireAdmin, userController.getAllUsers);
// PATCH /users/:id/role - Modifier le rôle d'un utilisateur
router.patch("/users/:id/role", auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requireAdmin, userController.updateUserRole);
// DELETE /users/:id - Supprimer un utilisateur
router.delete("/users/:id", auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requireAdmin, userController.deleteUser);
// Routes pour utilisateurs authentifiés
// GET /users/:id - Récupérer un utilisateur spécifique
router.get("/users/:id", auth_middleware_1.AuthMiddleware.authenticate, userController.getUserById);
router.patch("/users/:id/reputation", userController.updateReputation);
exports.default = router;
