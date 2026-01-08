import express, { Application } from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
import { errorHandler } from "./middlewares/error.middleware"

dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/admin", userRoutes)

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "auth-service" })
})

// Error handling
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`)
})

export default app
