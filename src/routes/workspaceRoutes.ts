import express from 'express'
import workspaceController from '../controllers/workspaceController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = express.Router()
router.use(authenticateToken)

router.post('/create', authenticateToken, workspaceController.createWorkspace)
router.post(
  '/details',
  authenticateToken,
  workspaceController.getWorkspaceDetails
)
router.get('/spaces', authenticateToken, workspaceController.getSpaces)
router.post(
  '/dashboardData',
  authenticateToken,
  workspaceController.getWorkspaceDashboardData
)

export default router
