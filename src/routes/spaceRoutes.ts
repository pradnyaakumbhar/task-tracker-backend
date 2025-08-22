import express from 'express'
import spaceController from '../controllers/spaceController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = express.Router()

router.use(authenticateToken)

router.post('/create', spaceController.createSpace)
router.post('/tasks', spaceController.getTasks)
// router.delete('/:id', spaceController.deleteSpace);
// router.put('/:id', spaceController.updateSpace);

export default router
