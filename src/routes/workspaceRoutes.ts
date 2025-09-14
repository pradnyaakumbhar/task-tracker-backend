import express from 'express'
import workspaceController from '../controllers/workspaceController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = express.Router()
router.use(authenticateToken)

router.post('/create', workspaceController.createWorkspace)
router.post('/details', workspaceController.getWorkspaceDetails)
router.get('/spaces', workspaceController.getSpaces)
router.post('/dashboardData', workspaceController.getWorkspaceDashboardData)
export default router
