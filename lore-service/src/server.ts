import dotenv from "dotenv"
dotenv.config()

import app from "./app"
import connectDB from "./config/database"

const PORT = process.env.PORT || 3002

const startServer = async (): Promise<void> => {
  try {
    // Connexion à MongoDB
    await connectDB()

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`Lore Service running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV}`)
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
