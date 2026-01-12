// src/config/index.ts

import dotenv from "dotenv"

dotenv.config()

export const config = {
  port: process.env.PORT || 3003,
  nodeEnv: process.env.NODE_ENV || "development",
  loreServiceUrl: process.env.LORE_SERVICE_URL || "http://localhost:3002",
  authServiceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
}

// Validation des variables d'environnement critiques
const requiredEnvVars = ["LORE_SERVICE_URL"]

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(` Warning: ${envVar} is not defined in environment variables`)
  }
})

export default config
