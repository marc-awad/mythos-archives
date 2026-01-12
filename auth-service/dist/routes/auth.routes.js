"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Routes publiques
router.post("/register", authController.register);
router.post("/login", authController.login);
// Routes protégées (nécessitent un JWT)
router.get("/me", auth_middleware_1.AuthMiddleware.authenticate, authController.me);
exports.default = router;
