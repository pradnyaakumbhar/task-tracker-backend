import express from 'express'
import userController from '../controllers/userController'
import { authenticateToken } from '../middleware/authMiddleware'
const router = express.Router()

// router.use(authenticateToken);

router.get('/profile', authenticateToken, userController.getProfile)
router.get('/workspaces', authenticateToken, userController.getWorkspaces)
export default router
