import express from 'express'
import invitationController from '../controllers/invitationController'
import { authenticateToken } from '../middleware/authMiddleware'

const router = express.Router()

router.get('/join/:invitationId', invitationController.handleInvitationLink)
router.use(authenticateToken)

router.post('/send', invitationController.sendInvitation)
// router.post('/accept', invitationController.acceptInvitation);
// router.post('/decline', invitationController.declineInvitation);
// router.get('/pending', invitationController.getPendingInvitations);

export default router
