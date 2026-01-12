// src/app.ts

import express, { Application } from "express"
import cors from "cors"
import routes from "./routes"
import { errorHandler } from "./middlewares/errorHandler"

const app: Application = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/", routes)

// Error handler (doit être en dernier)
app.use(errorHandler)

export default app
