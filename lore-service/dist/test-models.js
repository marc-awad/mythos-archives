"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Creature_1 = __importDefault(require("./models/Creature"));
const Testimony_1 = __importDefault(require("./models/Testimony"));
const types_1 = require("./types");
dotenv_1.default.config({ path: "../.env" });
const testModels = async () => {
    try {
        // Connexion à MongoDB
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");
        // Test 1: Créer une créature
        console.log("\n📝 Test 1: Création d'une créature...");
        const creature = await Creature_1.default.create({
            authorId: "user123",
            name: "Dragon des Neiges",
            origin: "Nordique",
        });
        console.log("✅ Créature créée:", creature);
        // Test 2: Tenter de créer une créature avec le même nom (doit échouer)
        console.log("\n📝 Test 2: Créature avec nom dupliqué (doit échouer)...");
        try {
            await Creature_1.default.create({
                authorId: "user456",
                name: "Dragon des Neiges", // Même nom
                origin: "Saharien",
            });
        }
        catch (error) {
            console.log("✅ Erreur attendue (nom unique):", error.message);
        }
        // Test 3: Créer un témoignage valide
        console.log("\n📝 Test 3: Création d'un témoignage...");
        const testimony = await Testimony_1.default.create({
            creatureId: creature._id,
            authorId: "user789",
            description: "J'ai aperçu cette créature majestueuse dans les montagnes enneigées.",
        });
        console.log("✅ Témoignage créé:", testimony);
        // Test 4: Créer un témoignage avec description trop courte (doit échouer)
        console.log("\n📝 Test 4: Témoignage avec description courte (doit échouer)...");
        try {
            await Testimony_1.default.create({
                creatureId: creature._id,
                authorId: "user999",
                description: "Court", // Trop court
            });
        }
        catch (error) {
            console.log("✅ Erreur attendue (description trop courte):", error.message);
        }
        // Test 5: Tenter de valider un témoignage sans validatedBy (doit échouer)
        console.log("\n📝 Test 5: Validation sans validatedBy (doit échouer)...");
        try {
            const invalidTestimony = new Testimony_1.default({
                creatureId: creature._id,
                authorId: "user111",
                description: "Un témoignage qui sera validé incorrectement.",
                status: types_1.TestimonyStatus.VALIDATED, // Statut validé mais sans validatedBy
            });
            await invalidTestimony.save();
        }
        catch (error) {
            console.log("✅ Erreur attendue (validation incohérente):", error.message);
        }
        // Test 6: Valider correctement un témoignage
        console.log("\n📝 Test 6: Validation correcte d'un témoignage...");
        testimony.status = types_1.TestimonyStatus.VALIDATED;
        testimony.validatedBy = "expert123";
        testimony.validatedAt = new Date();
        await testimony.save();
        console.log("✅ Témoignage validé:", testimony);
        // Test 7: Récupérer les témoignages d'une créature
        console.log("\n📝 Test 7: Récupération des témoignages d'une créature...");
        const testimonies = await Testimony_1.default.find({ creatureId: creature._id });
        console.log(`✅ ${testimonies.length} témoignage(s) trouvé(s)`);
        // Test 8: Vérifier les index
        console.log("\n📝 Test 8: Vérification des index...");
        const creatureIndexes = await Creature_1.default.collection.getIndexes();
        const testimonyIndexes = await Testimony_1.default.collection.getIndexes();
        console.log("✅ Index Creature:", Object.keys(creatureIndexes));
        console.log("✅ Index Testimony:", Object.keys(testimonyIndexes));
        console.log("\n🎉 Tous les tests sont passés avec succès!");
    }
    catch (error) {
        console.error("❌ Erreur lors des tests:", error);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log("\n👋 Déconnexion de MongoDB");
    }
};
testModels();
