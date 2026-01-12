"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const creature_routes_1 = __importDefault(require("./creature.routes"));
const testimony_routes_1 = __importDefault(require("./testimony.routes"));
const creature_controller_1 = __importDefault(require("../controllers/creature.controller"));
const router = (0, express_1.Router)();
// ============================================
// HEALTH CHECK (route de base)
// ============================================
router.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "lore-service",
        timestamp: new Date().toISOString(),
    });
});
// ============================================
// ROUTES PRINCIPALES
// ============================================
// Routes pour les créatures
router.use("/creatures", creature_routes_1.default);
// Routes pour les témoignages
router.use("/testimonies", testimony_routes_1.default);
// LORE-6: Route spéciale pour récupérer les témoignages d'une créature
// GET /creatures/:id/testimonies
router.get("/creatures/:id/testimonies", creature_controller_1.default.getTestimoniesByCreature);
exports.default = router;
