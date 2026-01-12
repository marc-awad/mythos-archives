import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes protégées (nécessitent un JWT)
router.get('/me', AuthMiddleware.authenticate, authController.me);

export default router;
