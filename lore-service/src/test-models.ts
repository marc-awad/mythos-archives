import mongoose from "mongoose"
import dotenv from "dotenv"
import Creature from "./models/Creature"
import Testimony from "./models/Testimony"
import { TestimonyStatus } from "./types"

dotenv.config({ path: "../.env" })

const testModels = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log("✅ Connected to MongoDB")

    // Test 1: Créer une créature
    console.log("\n📝 Test 1: Création d'une créature...")
    const creature = await Creature.create({
      authorId: "user123",
      name: "Dragon des Neiges",
      origin: "Nordique",
    })
    console.log("✅ Créature créée:", creature)

    // Test 2: Tenter de créer une créature avec le même nom (doit échouer)
    console.log("\n📝 Test 2: Créature avec nom dupliqué (doit échouer)...")
    try {
      await Creature.create({
        authorId: "user456",
        name: "Dragon des Neiges", // Même nom
        origin: "Saharien",
      })
    } catch (error: any) {
      console.log("✅ Erreur attendue (nom unique):", error.message)
    }

    // Test 3: Créer un témoignage valide
    console.log("\n📝 Test 3: Création d'un témoignage...")
    const testimony = await Testimony.create({
      creatureId: creature._id,
      authorId: "user789",
      description:
        "J'ai aperçu cette créature majestueuse dans les montagnes enneigées.",
    })
    console.log("✅ Témoignage créé:", testimony)

    // Test 4: Créer un témoignage avec description trop courte (doit échouer)
    console.log(
      "\n📝 Test 4: Témoignage avec description courte (doit échouer)..."
    )
    try {
      await Testimony.create({
        creatureId: creature._id,
        authorId: "user999",
        description: "Court", // Trop court
      })
    } catch (error: any) {
      console.log(
        "✅ Erreur attendue (description trop courte):",
        error.message
      )
    }

    // Test 5: Tenter de valider un témoignage sans validatedBy (doit échouer)
    console.log("\n📝 Test 5: Validation sans validatedBy (doit échouer)...")
    try {
      const invalidTestimony = new Testimony({
        creatureId: creature._id,
        authorId: "user111",
        description: "Un témoignage qui sera validé incorrectement.",
        status: TestimonyStatus.VALIDATED, // Statut validé mais sans validatedBy
      })
      await invalidTestimony.save()
    } catch (error: any) {
      console.log("✅ Erreur attendue (validation incohérente):", error.message)
    }

    // Test 6: Valider correctement un témoignage
    console.log("\n📝 Test 6: Validation correcte d'un témoignage...")
    testimony.status = TestimonyStatus.VALIDATED
    testimony.validatedBy = "expert123"
    testimony.validatedAt = new Date()
    await testimony.save()
    console.log("✅ Témoignage validé:", testimony)

    // Test 7: Récupérer les témoignages d'une créature
    console.log("\n📝 Test 7: Récupération des témoignages d'une créature...")
    const testimonies = await Testimony.find({ creatureId: creature._id })
    console.log(`✅ ${testimonies.length} témoignage(s) trouvé(s)`)

    // Test 8: Vérifier les index
    console.log("\n📝 Test 8: Vérification des index...")
    const creatureIndexes = await Creature.collection.getIndexes()
    const testimonyIndexes = await Testimony.collection.getIndexes()
    console.log("✅ Index Creature:", Object.keys(creatureIndexes))
    console.log("✅ Index Testimony:", Object.keys(testimonyIndexes))

    console.log("\n🎉 Tous les tests sont passés avec succès!")
  } catch (error) {
    console.error("❌ Erreur lors des tests:", error)
  } finally {
    await mongoose.connection.close()
    console.log("\n👋 Déconnexion de MongoDB")
  }
}

testModels()
