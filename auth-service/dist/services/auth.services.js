"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_repository_1 = __importDefault(require("../repositories/user.repository"));
const jwt_utils_1 = require("../utils/jwt.utils");
class AuthService {
    constructor() {
        this.SALT_ROUNDS = 10;
    }
    async register(registerDto) {
        const { email, username, password } = registerDto;
        // Validation des champs requis
        if (!email || !username || !password) {
            throw new Error("Tous les champs sont requis");
        }
        // Validation du format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Format d'email invalide");
        }
        // Validation de la longueur du mot de passe
        if (password.length < 6) {
            throw new Error("Le mot de passe doit contenir au moins 6 caractères");
        }
        // Validation du username (longueur minimale)
        if (username.length < 3) {
            throw new Error("Le nom d'utilisateur doit contenir au moins 3 caractères");
        }
        // Vérifier si l'email existe déjà
        const existingUserByEmail = await user_repository_1.default.findByEmail(email);
        if (existingUserByEmail) {
            throw new Error("Cet email est déjà utilisé");
        }
        // Vérifier si le username existe déjà
        const existingUserByUsername = await user_repository_1.default.findByUsername(username);
        if (existingUserByUsername) {
            throw new Error("Ce nom d'utilisateur est déjà utilisé");
        }
        // Hash du mot de passe
        const hashedPassword = await bcrypt_1.default.hash(password, this.SALT_ROUNDS);
        // Créer l'utilisateur
        const user = await user_repository_1.default.create({
            email,
            username,
            password: hashedPassword,
        });
        // Retourner l'utilisateur sans le mot de passe
        return this.formatUserResponse(user);
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        // Validation des champs requis
        if (!email || !password) {
            throw new Error("Email et mot de passe requis");
        }
        // Vérifier si l'utilisateur existe
        const user = await user_repository_1.default.findByEmail(email);
        if (!user) {
            throw new Error("Email ou mot de passe incorrect");
        }
        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Email ou mot de passe incorrect");
        }
        // Générer le JWT
        const token = jwt_utils_1.JwtUtils.generateToken({
            id: user.id,
            role: user.role,
        });
        // Retourner le token et les infos user (sans le password)
        return {
            token,
            user: this.formatUserResponse(user),
        };
    }
    formatUserResponse(user) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            reputation: user.reputation,
            createdAt: user.createdAt,
        };
    }
}
exports.AuthService = AuthService;
