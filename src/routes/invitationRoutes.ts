import express from 'express'
import invitationController from '../controllers/invitationController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = express.Router()

router.get('/join/:invitationId', invitationController.handleInvitationLink)

// router.use(authenticateToken)
router.post('/send', authenticateToken, invitationController.sendInvitation)
router.post('/accept', authenticateToken, invitationController.acceptInvitation)

export default router
