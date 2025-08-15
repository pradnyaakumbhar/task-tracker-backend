import express from 'express';
import userController from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
const router = express.Router();

router.get('/profile',authenticateToken, userController.getProfile);

export default router;