import express from 'express'
import spaceController from '../controllers/spaceController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = express.Router()

// router.use(authenticateToken)

router.post('/create', authenticateToken, spaceController.createSpace)
router.post('/tasks', authenticateToken, spaceController.getTasks)
router.delete('/delete/:id', authenticateToken, spaceController.deleteSpace)
router.put('/update', authenticateToken, spaceController.updateSpace)

export default router
