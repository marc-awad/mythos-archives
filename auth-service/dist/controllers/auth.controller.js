"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_services_1 = require("../services/auth.services");
const user_repository_1 = __importDefault(require("../repositories/user.repository"));
class AuthController {
    constructor() {
        this.register = async (req, res, next) => {
            try {
                const registerDto = req.body;
                const user = await this.authService.register(registerDto);
                res.status(201).json({
                    success: true,
                    message: "Utilisateur créé avec succès",
                    data: user,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const loginDto = req.body;
                const result = await this.authService.login(loginDto);
                res.status(200).json({
                    success: true,
                    message: "Connexion réussie",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.me = async (req, res, next) => {
            try {
                // req.user est défini par le middleware authenticate
                if (!req.user) {
                    res.status(401).json({
                        success: false,
                        message: "Non authentifié",
                    });
                    return;
                }
                // Récupérer les infos complètes de l'utilisateur
                const user = await user_repository_1.default.findById(req.user.id);
                if (!user) {
                    res.status(404).json({
                        success: false,
                        message: "Utilisateur non trouvé",
                    });
                    return;
                }
                // Retourner l'utilisateur sans le mot de passe
                const { password, ...userWithoutPassword } = user;
                res.status(200).json({
                    success: true,
                    message: "Utilisateur récupéré avec succès",
                    data: userWithoutPassword,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.authService = new auth_services_1.AuthService();
    }
}
exports.AuthController = AuthController;
