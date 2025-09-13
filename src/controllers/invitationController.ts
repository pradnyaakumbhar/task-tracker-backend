import invitationService from '../services/invitationServices'
import { Request, Response } from 'express'
import { AuthRequest } from '../types/authTypes'
import { isValidEmail } from '../utils/validators'
import jwt from 'jsonwebtoken'

const invitationController = {
  sendInvitation: async (req: AuthRequest, res: Response) => {
    try {
      const { email, workspaceId, workspaceName } = req.body
      const sender = req.user!

      if (!email || !workspaceId || !workspaceName) {
        return res
          .status(400)
          .json({
            success: false,
            error: 'Email, workspaceId, and workspaceName are required',
          })
      }

      if (!isValidEmail(email)) {
        return res
          .status(400)
          .json({ success: false, error: 'Invalid email address' })
      }

      const result = await invitationService.sendInvitation({
        email,
        workspaceId,
        workspaceName,
        senderName: sender.name,
        senderId: sender.userId,
      })

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error })
      }

      res.status(201).json({
        success: true,
        message: 'Invitation sent successfully',
        invitationId: result.invitationId,
        userExists: result.userExists,
      })
    } catch (error: any) {
      console.error('Send invitation error:', error)
      res
        .status(500)
        .json({ success: false, error: 'Failed to send invitation' })
    }
  },

  handleInvitationLink: async (req: Request, res: Response) => {
    try {
      const { invitationId } = req.params

      if (!invitationId) {
        return res
          .status(400)
          .json({ success: false, error: 'Invitation ID is required' })
      }

      let userId: string | undefined
      let userEmail: string | undefined

      const authToken = req.headers.authorization?.replace('Bearer ', '')

      if (authToken) {
        try {
          const decoded = jwt.verify(authToken, process.env.JWT_SECRET!) as any
          userId = decoded.userId
          userEmail = decoded.email
        } catch (error) {
          // Invalid token - continue as unauthenticated
        }
      }

      const result = await invitationService.joinInvitation(
        invitationId,
        userId,
        userEmail
      )

      const response: any = {
        action: result.action,
        invitation: result.invitation,
        message: result.message,
        error: result.error,
      }

      if (result.workspace) {
        response.workspace = result.workspace
        response.workspaceNumber = result.workspace.number
      } else if (result.workspaceNumber) {
        response.workspaceNumber = result.workspaceNumber
      }

      let statusCode = 200
      if (result.action === 'error') statusCode = 400
      else if (result.action === 'expired') statusCode = 410

      res.status(statusCode).json(response)
    } catch (error: any) {
      console.error('Handle invitation link error:', error)
      res
        .status(500)
        .json({
          success: false,
          action: 'error',
          error: 'Failed to process invitation',
        })
    }
  },

  acceptInvitation: async (req: AuthRequest, res: Response) => {
    try {
      const { invitationId } = req.body
      const user = req.user!

      if (!invitationId) {
        return res
          .status(400)
          .json({ success: false, error: 'Invitation ID is required' })
      }

      const result = await invitationService.acceptInvitation(
        invitationId,
        user.userId,
        user.email
      )

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error })
      }

      res.status(200).json({
        success: true,
        message: 'Invitation accepted successfully',
        workspace: result.workspace,
        workspaceNumber: result.workspace?.number,
      })
    } catch (error: any) {
      console.error('Accept invitation error:', error)
      res
        .status(500)
        .json({ success: false, error: 'Failed to accept invitation' })
    }
  },
}

export default invitationController
