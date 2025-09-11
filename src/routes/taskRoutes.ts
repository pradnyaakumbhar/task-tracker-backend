import express from 'express'
import taskController from '../controllers/taskController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = express.Router()

router.use(authenticateToken)

router.post('/create', taskController.createTask)
router.post('/details', taskController.getTaskDetails)
router.put('/update/:taskId', taskController.updateTask)
router.delete('/delete/:taskId', taskController.deleteTask)

//all versions for task
router.post('/versions', taskController.getTaskVersions)
// specific version details
router.post('/versionDetails', taskController.getTaskVersionDetails)
// revert to specific version
// router.post('/version/revert', taskController.revertToVersion)

export default router
