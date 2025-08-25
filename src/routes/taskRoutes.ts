import express from 'express'
import taskController from '../controllers/taskController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = express.Router()

router.use(authenticateToken)

router.post('/create', taskController.createTask)
router.post('/details', taskController.getTaskDetails)
router.put('/update/:taskId', taskController.updateTask)
router.delete('/delete/:taskId', taskController.deleteTask)

export default router
