"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authServiceClient = exports.AuthServiceClient = void 0;
const axios_1 = __importDefault(require("axios"));
class AuthServiceClient {
    constructor() {
        this.baseURL = process.env.AUTH_SERVICE_URL || "http://localhost:3001";
        this.client = axios_1.default.create({
            baseURL: this.baseURL,
            timeout: 5000, // 5 secondes de timeout
            headers: {
                "Content-Type": "application/json",
            },
        });
        // Intercepteur pour logger les erreurs
        this.client.interceptors.response.use((response) => response, (error) => {
            this.handleError(error);
            return Promise.reject(error);
        });
    }
    /**
     * Vérifie un token JWT via auth-service
     * Appelle GET /auth/me
     */
    async verifyToken(token) {
        try {
            const response = await this.client.get("/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.data.success) {
                throw new Error("Token invalide");
            }
            // Transformer la réponse en JWTPayload
            const user = response.data.data;
            return {
                id: user.id.toString(),
                email: user.email,
                username: user.username,
                role: user.role,
            };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                // Erreur 401/403 = token invalide
                if (axiosError.response?.status === 401 ||
                    axiosError.response?.status === 403) {
                    throw new Error("Token invalide ou expiré");
                }
                // Erreur réseau
                if (axiosError.code === "ECONNREFUSED") {
                    throw new Error("Impossible de contacter le service d'authentification");
                }
                // Timeout
                if (axiosError.code === "ECONNABORTED") {
                    throw new Error("Timeout lors de la vérification du token");
                }
                // Autre erreur HTTP
                throw new Error(axiosError.response?.data?.message ||
                    "Erreur lors de la vérification du token");
            }
            // Erreur non-Axios
            throw error;
        }
    }
    /**
     * Vérifie la santé du service auth
     */
    async healthCheck() {
        try {
            const response = await this.client.get("/health");
            return response.status === 200;
        }
        catch (error) {
            console.error("Auth service health check failed:", error);
            return false;
        }
    }
    /**
     * Gestion centralisée des erreurs
     */
    handleError(error) {
        if (error.response) {
            // Le serveur a répondu avec un code d'erreur
            console.error("Auth Service Error:", {
                status: error.response.status,
                data: error.response.data,
                url: error.config?.url,
            });
        }
        else if (error.request) {
            // La requête a été envoyée mais pas de réponse
            console.error("Auth Service No Response:", {
                url: error.config?.url,
                message: error.message,
            });
        }
        else {
            // Erreur lors de la configuration de la requête
            console.error("Auth Service Request Error:", error.message);
        }
    }
    /**
     * EVL-3: Mettre à jour la réputation d'un utilisateur via auth-service
     * Appelé après validation/rejet de témoignage
     *
     * @param userId - ID de l'utilisateur (en string car vient du JWT)
     * @param reputationChange - Variation de réputation (+3, -1, +1)
     */
    async updateUserReputation(userId, reputationChange) {
        try {
            const response = await this.client.patch(`/users/${userId}/reputation`, {
                reputationChange,
            });
            if (!response.data.success) {
                throw new Error("Échec de la mise à jour de la réputation");
            }
            // Log pour debug
            console.log(`✅ Réputation mise à jour pour l'utilisateur ${userId}: ${reputationChange > 0 ? "+" : ""}${reputationChange} points`);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                // Log l'erreur mais ne pas bloquer le processus principal
                console.error("Erreur lors de la mise à jour de la réputation:", {
                    userId,
                    reputationChange,
                    status: axiosError.response?.status,
                    message: axiosError.response?.data?.message || axiosError.message,
                });
                // Erreur réseau
                if (axiosError.code === "ECONNREFUSED") {
                    throw new Error("Impossible de contacter le service d'authentification pour mettre à jour la réputation");
                }
                // Erreur 404 = utilisateur non trouvé
                if (axiosError.response?.status === 404) {
                    throw new Error("Utilisateur non trouvé dans le service d'authentification");
                }
                throw new Error(axiosError.response?.data?.message ||
                    "Erreur lors de la mise à jour de la réputation");
            }
            throw error;
        }
    }
}
exports.AuthServiceClient = AuthServiceClient;
// Export d'une instance singleton
exports.authServiceClient = new AuthServiceClient();
