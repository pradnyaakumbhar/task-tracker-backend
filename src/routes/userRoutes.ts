import express from 'express';
import userController from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
const router = express.Router();

router.use(authenticateToken);

router.get('/profile', userController.getProfile);
router.get('/workspaces', userController.getWorkspaces);
export default router;