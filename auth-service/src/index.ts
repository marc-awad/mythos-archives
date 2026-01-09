import express from "express"
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
import { errorMiddleware } from "./middlewares/error.middleware"

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(express.json())

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "auth-service" })
})

// Routes
app.use("/auth", authRoutes)
app.use("/api", userRoutes)

// Error handling (doit être en dernier)
app.use(errorMiddleware)

app.listen(PORT, () => {
  console.log(`🚀 Auth service running on port ${PORT}`)
})
