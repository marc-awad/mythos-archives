"use strict";
// lore-service/src/routes/moderation-log.routes.ts
// MOD-2: Routes optionnelles pour consulter les logs (ADMIN uniquement)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moderation_log_controller_1 = __importDefault(require("../controllers/moderation-log.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
/**
 * Toutes les routes de moderation-logs sont protégées et réservées aux ADMIN
 */
/**
 * GET /moderation-logs
 * Récupérer tous les logs avec filtres optionnels
 * Query params: userId, action, targetId, startDate, endDate
 *
 * Exemple: GET /moderation-logs?action=delete&startDate=2026-01-01
 */
router.get("/", auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, moderation_log_controller_1.default.getAllLogs);
/**
 * GET /moderation-logs/user/:userId
 * Récupérer tous les logs d'un utilisateur spécifique
 */
router.get("/user/:userId", auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, moderation_log_controller_1.default.getLogsByUser);
/**
 * GET /moderation-logs/target/:targetId
 * Récupérer tous les logs d'une cible spécifique (testimony, creature)
 */
router.get("/target/:targetId", auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, moderation_log_controller_1.default.getLogsByTarget);
/**
 * GET /moderation-logs/stats
 * Récupérer les statistiques de modération
 */
router.get("/stats", auth_middleware_1.authMiddleware, auth_middleware_1.requireAdmin, moderation_log_controller_1.default.getStats);
exports.default = router;
