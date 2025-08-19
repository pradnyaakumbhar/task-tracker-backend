import express from 'express';
import workspaceController from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();
router.use(authenticateToken); // Apply authentication to all workspace routes

// router.post('/create', workspaceController.createWorkspace);
// router.post('/details', workspaceController.getDetails);
// router.get('/spaces', workspaceController.getSpaces);

export default router;