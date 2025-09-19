import express from 'express'
import taskController from '../controllers/taskController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = express.Router()

router.use(authenticateToken)

router.post('/create', authenticateToken, taskController.createTask)
router.post('/details', authenticateToken, taskController.getTaskDetails)
router.put('/update/:taskId', authenticateToken, taskController.updateTask)
router.delete('/delete/:taskId', authenticateToken, taskController.deleteTask)
router.post('/analytics', authenticateToken, taskController.getTaskAnalytics)
//all versions for task
router.post('/versions', authenticateToken, taskController.getTaskVersions)
// specific version details
router.post(
  '/versionDetails',
  authenticateToken,
  taskController.getTaskVersionDetails
)
// revert to specific version
router.post(
  '/version/revert',
  authenticateToken,
  taskController.revertToVersion
)

export default router
