"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const types_1 = require("../types");
class AuthMiddleware {
}
exports.AuthMiddleware = AuthMiddleware;
_a = AuthMiddleware;
AuthMiddleware.authenticate = async (req, res, next) => {
    try {
        // Récupérer le token depuis le header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: "Token d'authentification manquant",
            });
            return;
        }
        // Vérifier le format "Bearer TOKEN"
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            res.status(401).json({
                success: false,
                message: "Format du token invalide. Utilisez: Bearer <token>",
            });
            return;
        }
        const token = parts[1];
        // Vérifier et décoder le token
        try {
            const decoded = jwt_utils_1.JwtUtils.verifyToken(token);
            // Attacher les infos user à req.user
            req.user = decoded;
            next();
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: "Token invalide ou expiré",
            });
            return;
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la vérification du token",
        });
    }
};
/**
 * Middleware générique pour vérifier qu'un utilisateur a un rôle spécifique
 * @param role - Le rôle requis (USER, EXPERT, ADMIN)
 */
AuthMiddleware.requireRole = (role) => {
    return (req, res, next) => {
        // Vérifier que l'utilisateur est authentifié
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Authentification requise",
            });
            return;
        }
        // Vérifier que l'utilisateur a le bon rôle
        if (req.user.role !== role) {
            res.status(403).json({
                success: false,
                message: `Accès refusé. Rôle ${role} requis.`,
            });
            return;
        }
        next();
    };
};
/**
 * Middleware pour vérifier qu'un utilisateur a le rôle ADMIN
 * Doit être utilisé APRÈS authenticate
 */
AuthMiddleware.requireAdmin = (req, res, next) => {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Authentification requise",
        });
        return;
    }
    // Vérifier que l'utilisateur a le rôle ADMIN
    if (req.user.role !== types_1.Role.ADMIN) {
        res.status(403).json({
            success: false,
            message: "Accès refusé. Rôle ADMIN requis.",
        });
        return;
    }
    next();
};
/**
 * Middleware pour vérifier qu'un utilisateur a le rôle EXPERT
 * Doit être utilisé APRÈS authenticate
 */
AuthMiddleware.requireExpert = (req, res, next) => {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Authentification requise",
        });
        return;
    }
    // Vérifier que l'utilisateur a le rôle EXPERT
    if (req.user.role !== types_1.Role.EXPERT) {
        res.status(403).json({
            success: false,
            message: "Accès refusé. Rôle EXPERT requis.",
        });
        return;
    }
    next();
};
/**
 * Middleware pour vérifier qu'un utilisateur a au moins le rôle EXPERT (EXPERT ou ADMIN)
 * Utile pour les endpoints où ADMIN et EXPERT ont les mêmes droits
 */
AuthMiddleware.requireExpertOrAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Authentification requise",
        });
        return;
    }
    if (req.user.role !== types_1.Role.EXPERT && req.user.role !== types_1.Role.ADMIN) {
        res.status(403).json({
            success: false,
            message: "Accès refusé. Rôle EXPERT ou ADMIN requis.",
        });
        return;
    }
    next();
};
