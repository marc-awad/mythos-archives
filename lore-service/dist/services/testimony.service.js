"use strict";
// lore-service/src/services/testimony.service.ts
// MISE À JOUR MOD-2 : Ajout du logging des actions de modération
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonyService = void 0;
const testimony_repository_1 = __importDefault(require("../repositories/testimony.repository"));
const creature_repository_1 = __importDefault(require("../repositories/creature.repository"));
const creature_service_1 = __importDefault(require("./creature.service"));
const auth_service_1 = require("./auth.service");
const moderation_log_service_1 = __importDefault(require("./moderation-log.service")); // 🆕 MOD-2
const types_1 = require("../types");
class TestimonyService {
    /**
     * LORE-5: Créer un nouveau témoignage
     * - Vérifie que la créature existe
     * - Vérifie le délai de 5 minutes (même user, même créature)
     * - Crée le témoignage en statut PENDING
     */
    async createTestimony(data, authorId) {
        // Validation: vérifier que le creatureId est un ObjectId MongoDB valide
        if (!data.creatureId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("ID de créature invalide");
        }
        // 1. Vérifier que la créature existe
        const creature = await creature_repository_1.default.findById(data.creatureId);
        if (!creature) {
            throw new Error("Créature non trouvée");
        }
        // 2. Validation: description obligatoire et longueur
        if (!data.description || !data.description.trim()) {
            throw new Error("La description est requise");
        }
        if (data.description.trim().length < 10) {
            throw new Error("La description doit contenir au moins 10 caractères");
        }
        if (data.description.trim().length > 2000) {
            throw new Error("La description ne peut pas dépasser 2000 caractères");
        }
        // 3. Vérifier le délai de 5 minutes (même user, même créature)
        const recentTestimony = await testimony_repository_1.default.findRecentTestimony(authorId, data.creatureId, 5 // 5 minutes
        );
        if (recentTestimony) {
            const timeSinceLastTestimony = Math.ceil((Date.now() - recentTestimony.createdAt.getTime()) / 1000 / 60);
            const timeRemaining = 5 - timeSinceLastTestimony;
            throw new Error(`Vous avez déjà témoigné pour cette créature récemment. Veuillez attendre ${timeRemaining} minute(s) avant de témoigner à nouveau.`);
        }
        // 4. Créer le témoignage en statut PENDING
        const testimony = await testimony_repository_1.default.create({
            creatureId: data.creatureId,
            description: data.description.trim(),
        }, authorId);
        return testimony;
    }
    /**
     * LORE-6: Récupérer tous les témoignages d'une créature
     * Avec possibilité de filtrer par statut
     */
    async getTestimoniesByCreature(creatureId, status) {
        // Validation: vérifier que le creatureId est un ObjectId MongoDB valide
        if (!creatureId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("ID de créature invalide");
        }
        // Vérifier que la créature existe
        const creature = await creature_repository_1.default.findById(creatureId);
        if (!creature) {
            throw new Error("Créature non trouvée");
        }
        // Récupérer les témoignages
        const testimonies = await testimony_repository_1.default.findByCreatureId(creatureId, status);
        return testimonies;
    }
    /**
     * Récupérer un témoignage par ID
     */
    async getTestimonyById(id) {
        // Validation: vérifier que l'ID est un ObjectId MongoDB valide
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("ID de témoignage invalide");
        }
        const testimony = await testimony_repository_1.default.findById(id);
        if (!testimony) {
            throw new Error("Témoignage non trouvé");
        }
        return testimony;
    }
    /**
     * Récupérer tous les témoignages d'un auteur
     */
    async getTestimoniesByAuthor(authorId) {
        return await testimony_repository_1.default.findByAuthor(authorId);
    }
    /**
     * LORE-7 + EVL-3 + MOD-2: Valider un témoignage (EXPERT/ADMIN)
     * - Vérifier que l'user n'est pas l'auteur
     * - Mettre à jour le statut, validatedBy et validatedAt
     * - Appliquer les règles de réputation :
     *   * +3 pour l'auteur du témoignage
     *   * +1 pour le validateur s'il est EXPERT
     * - Recalculer le legendScore de la créature
     * - 🆕 Logger l'action dans ModerationLog
     */
    async validateTestimony(id, validatedBy, validatorRole) {
        const testimony = await this.getTestimonyById(id);
        // Vérifier que l'utilisateur n'est pas l'auteur du témoignage
        if (testimony.authorId === validatedBy) {
            throw new Error("Vous ne pouvez pas valider votre propre témoignage");
        }
        if (testimony.status !== types_1.TestimonyStatus.PENDING) {
            throw new Error("Seuls les témoignages en attente peuvent être validés");
        }
        const updatedTestimony = await testimony_repository_1.default.updateStatus(id, types_1.TestimonyStatus.VALIDATED, validatedBy);
        if (!updatedTestimony) {
            throw new Error("Erreur lors de la validation du témoignage");
        }
        // EVL-1: Recalculer le legendScore après validation
        await creature_service_1.default.updateLegendScore(testimony.creatureId.toString());
        // EVL-3: Appliquer les règles de réputation
        try {
            // Règle 1: +3 pour l'auteur du témoignage validé
            await auth_service_1.authServiceClient.updateUserReputation(testimony.authorId, 3);
            // Règle 2: +1 pour le validateur s'il est EXPERT
            if (validatorRole === "EXPERT") {
                await auth_service_1.authServiceClient.updateUserReputation(validatedBy, 1);
            }
        }
        catch (error) {
            // Log l'erreur mais ne pas bloquer la validation du témoignage
            console.error("Erreur lors de la mise à jour de la réputation après validation:", error);
            // On ne throw pas l'erreur pour ne pas annuler la validation
        }
        // 🆕 MOD-2: Logger l'action de validation
        await moderation_log_service_1.default.logValidate(validatedBy, id, {
            validatorRole,
            creatureId: testimony.creatureId.toString(),
        });
        return updatedTestimony;
    }
    /**
     * LORE-8 + EVL-3 + MOD-2: Rejeter un témoignage (EXPERT/ADMIN)
     * - Vérifier que l'user n'est pas l'auteur
     * - Mettre à jour le statut
     * - Appliquer la règle de réputation : -1 pour l'auteur
     * - Recalculer le legendScore de la créature
     * - 🆕 Logger l'action dans ModerationLog
     */
    async rejectTestimony(id, rejectedBy) {
        const testimony = await this.getTestimonyById(id);
        // Vérifier que l'utilisateur n'est pas l'auteur du témoignage
        if (testimony.authorId === rejectedBy) {
            throw new Error("Vous ne pouvez pas rejeter votre propre témoignage");
        }
        if (testimony.status !== types_1.TestimonyStatus.PENDING) {
            throw new Error("Seuls les témoignages en attente peuvent être rejetés");
        }
        const updatedTestimony = await testimony_repository_1.default.updateStatus(id, types_1.TestimonyStatus.REJECTED, rejectedBy);
        if (!updatedTestimony) {
            throw new Error("Erreur lors du rejet du témoignage");
        }
        // EVL-1: Recalculer le legendScore après rejet
        await creature_service_1.default.updateLegendScore(testimony.creatureId.toString());
        // EVL-3: Appliquer la règle de réputation : -1 pour l'auteur
        try {
            await auth_service_1.authServiceClient.updateUserReputation(testimony.authorId, -1);
        }
        catch (error) {
            // Log l'erreur mais ne pas bloquer le rejet du témoignage
            console.error("Erreur lors de la mise à jour de la réputation après rejet:", error);
            // On ne throw pas l'erreur pour ne pas annuler le rejet
        }
        // 🆕 MOD-2: Logger l'action de rejet
        await moderation_log_service_1.default.logReject(rejectedBy, id, {
            creatureId: testimony.creatureId.toString(),
        });
        return updatedTestimony;
    }
    /**
     * MOD-1 + MOD-2: Soft delete d'un témoignage (EXPERT/ADMIN)
     * - Vérifie que le témoignage existe
     * - Marque le témoignage comme supprimé
     * - Recalcule le legendScore de la créature
     * - 🆕 Logger l'action dans ModerationLog
     */
    async softDeleteTestimony(id, deletedBy) {
        // Validation: vérifier que l'ID est un ObjectId MongoDB valide
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("ID de témoignage invalide");
        }
        // Vérifier que le témoignage existe et n'est pas déjà supprimé
        const testimony = await testimony_repository_1.default.findById(id);
        if (!testimony) {
            throw new Error("Témoignage non trouvé ou déjà supprimé");
        }
        // Soft delete
        const deletedTestimony = await testimony_repository_1.default.softDelete(id, deletedBy);
        if (!deletedTestimony) {
            throw new Error("Erreur lors de la suppression du témoignage");
        }
        // Recalculer le legendScore de la créature
        try {
            await creature_service_1.default.updateLegendScore(deletedTestimony.creatureId.toString());
        }
        catch (error) {
            console.error("Erreur lors du recalcul du legendScore après suppression:", error);
            // On ne throw pas pour ne pas annuler la suppression
        }
        // 🆕 MOD-2: Logger l'action de suppression
        await moderation_log_service_1.default.logDelete(deletedBy, id, {
            creatureId: deletedTestimony.creatureId.toString(),
            previousStatus: testimony.status,
        });
        return deletedTestimony;
    }
    /**
     * MOD-1 + MOD-2: Restaurer un témoignage supprimé (ADMIN)
     * - Vérifie que le témoignage existe et est supprimé
     * - Restaure le témoignage
     * - Recalcule le legendScore de la créature
     * - 🆕 Logger l'action dans ModerationLog
     */
    async restoreTestimony(id, restoredBy) {
        // Validation: vérifier que l'ID est un ObjectId MongoDB valide
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error("ID de témoignage invalide");
        }
        // Vérifier que le témoignage existe et est supprimé
        const testimony = await testimony_repository_1.default.findByIdIncludingDeleted(id);
        if (!testimony) {
            throw new Error("Témoignage non trouvé");
        }
        if (!testimony.deletedAt) {
            throw new Error("Ce témoignage n'est pas supprimé");
        }
        // Restaurer
        const restoredTestimony = await testimony_repository_1.default.restore(id);
        if (!restoredTestimony) {
            throw new Error("Erreur lors de la restauration du témoignage");
        }
        // Recalculer le legendScore de la créature
        try {
            await creature_service_1.default.updateLegendScore(restoredTestimony.creatureId.toString());
        }
        catch (error) {
            console.error("Erreur lors du recalcul du legendScore après restauration:", error);
            // On ne throw pas pour ne pas annuler la restauration
        }
        // 🆕 MOD-2: Logger l'action de restauration
        await moderation_log_service_1.default.logRestore(restoredBy, id, {
            creatureId: restoredTestimony.creatureId.toString(),
        });
        return restoredTestimony;
    }
}
exports.TestimonyService = TestimonyService;
exports.default = new TestimonyService();
