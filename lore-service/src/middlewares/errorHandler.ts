import { Request, Response, NextFunction } from "express"
import { Error as MongooseError } from "mongoose"

interface CustomError extends Error {
  status?: number
  code?: number
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", err)

  // Erreur de validation Mongoose
  if (err instanceof MongooseError.ValidationError) {
    res.status(400).json({
      error: "Erreur de validation",
      details: err.message,
    })
    return
  }

  // Erreur de duplication (unique constraint)
  if (err.code === 11000) {
    res.status(409).json({
      error: "Conflit: cette ressource existe déjà",
    })
    return
  }

  // Erreur générique
  res.status(err.status || 500).json({
    error: err.message || "Erreur serveur interne",
  })
}
