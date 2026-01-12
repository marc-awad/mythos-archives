import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error('❌ Error:', error.message);

  const statusCode =
    error.message.includes('déjà utilisé') ||
    error.message.includes('invalide') ||
    error.message.includes('requis') ||
    error.message.includes('au moins')
      ? 400
      : 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};
