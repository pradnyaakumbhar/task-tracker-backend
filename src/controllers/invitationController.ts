import invitationService from '../services/invitationServices'
import { Request, Response } from 'express'
import { AuthRequest } from '../types/authTypes'
import { isValidEmail } from '../utils/validators'

const invitationcontroller = {
  sendInvitation: async (req: AuthRequest, res: Response) => {
    try {
      const { email, workspaceId, workspaceName } = req.body
      const sender = req.user!

      // Validation
      if (!email || !workspaceId || !workspaceName) {
        return res.status(400).json({
          error: 'Email, workspaceId, and workspaceName are required',
        })
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          error: 'Invalid email address',
        })
      }

      const result = await invitationService.createAndSendInvitation({
        email,
        workspaceId,
        workspaceName,
        senderName: sender.name,
        senderId: sender.userId,
      })

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        })
      }

      res.status(201).json({
        message: 'Invitation sent successfully',
        invitationId: result.invitationId,
      })
    } catch (error: any) {
      console.error('Send invitation error:', error)
      res.status(500).json({
        error: 'Failed to send invitation',
      })
    }
  },

  handleInvitationLink: async (req: Request, res: Response) => {
    try {
      const { invitationId } = req.params

      if (!invitationId) {
        return res.status(400).json({
          error: 'Invitation ID is required',
        })
      }

      // Check if user has auth token in headers
      const authToken = req.headers.authorization?.replace('Bearer ', '')

      const result = await invitationService.processInvitationLink(
        invitationId,
        authToken
      )

      res.status(200).json(result)
    } catch (error: any) {
      console.error('Handle invitation link error:', error)
      res.status(500).json({
        error: 'Failed to process invitation',
      })
    }
  },

  // when user is authenticated (inside app)
  acceptInvitation: async (req: AuthRequest, res: Response) => {
    try {
      const { invitationId } = req.body
      const user = req.user!

      if (!invitationId) {
        return res.status(400).json({
          error: 'Invitation ID is required',
        })
      }

      const result = await invitationService.acceptInvitation(
        invitationId,
        user.userId,
        user.email
      )

      if (!result.success) {
        return res.status(400).json({
          error: result.error,
        })
      }

      res.status(200).json({
        message: 'Invitation accepted successfully',
        workspace: result.workspace,
      })
    } catch (error: any) {
      console.error('Accept invitation error:', error)
      res.status(500).json({
        error: 'Failed to accept invitation',
      })
    }
  },
}

export default invitationcontroller
