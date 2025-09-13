import invitationDao from '../dao/invitationDao'
import userDao from '../dao/userDao'
import workspaceDao from '../dao/workspaceDao'
import { sendInvitationEmail } from '../utils/emailService'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import {
  InvitationData,
  InvitationResult,
  JoinInvitationResult,
  AcceptInvitationResult,
} from '../types/invitationTypes'

const INVITATION_EXPIRY_DAYS = 7
const INVITATION_EXPIRY_SECONDS = INVITATION_EXPIRY_DAYS * 24 * 60 * 60

interface SendInvitationRequest {
  email: string
  workspaceId: string
  workspaceName: string
  senderName: string
  senderId: string
}

const invitationService = {
  sendInvitation: async (
    request: SendInvitationRequest
  ): Promise<InvitationResult> => {
    try {
      const { email, workspaceId, workspaceName, senderName, senderId } =
        request

      const existingUser = await userDao.findUserByEmail(email)

      if (existingUser) {
        const isAlreadyMember = await workspaceDao.checkUserWorkspaceAccess?.(
          existingUser.id,
          workspaceId
        )
        if (isAlreadyMember) {
          return {
            success: false,
            error: 'User is already a member of this workspace',
          }
        }
      }

      const hasExistingInvitation = await invitationDao.hasExistingInvitation(
        email,
        workspaceId
      )
      if (hasExistingInvitation) {
        return {
          success: false,
          error: 'An invitation has already been sent to this email',
        }
      }

      const invitationId = uuidv4()
      const now = new Date()
      const expiresAt = new Date(
        now.getTime() + INVITATION_EXPIRY_SECONDS * 1000
      )

      const invitationData: InvitationData = {
        id: invitationId,
        email,
        workspaceId,
        workspaceName,
        senderName,
        senderId,
        status: 'pending',
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        userExists: !!existingUser,
      }

      await invitationDao.storeInvitation(invitationData)

      const emailSent = await sendInvitationEmail(
        email,
        workspaceName,
        senderName,
        invitationId,
        !!existingUser
      )

      if (!emailSent) {
        await invitationDao.removeInvitation(invitationId, email)
        return { success: false, error: 'Failed to send invitation email' }
      }

      return { success: true, invitationId, userExists: !!existingUser }
    } catch (error) {
      console.error('Failed to send invitation:', error)
      return { success: false, error: 'Internal server error' }
    }
  },

  joinInvitation: async (
    invitationId: string,
    userId?: string,
    userEmail?: string
  ): Promise<JoinInvitationResult> => {
    try {
      const invitation = await invitationDao.getInvitation(invitationId)

      if (!invitation) {
        return { action: 'expired', error: 'Invitation not found or expired' }
      }

      if (userId && userEmail) {
        if (userEmail !== invitation.email) {
          return {
            action: 'error',
            error: 'This invitation is for a different email address',
          }
        }

        const result = await invitationService.acceptInvitation(
          invitationId,
          userId,
          userEmail
        )

        if (result.success) {
          return {
            action: 'accepted',
            invitation,
            workspace: result.workspace,
            workspaceNumber: result.workspace?.number,
          }
        } else {
          return {
            action: 'error',
            error: result.error || 'Failed to accept invitation',
          }
        }
      }

      const existingUser = await userDao.findUserByEmail(invitation.email)

      if (existingUser) {
        return {
          action: 'login',
          invitation,
          workspaceNumber: invitation.workspaceNumber,
        }
      } else {
        return {
          action: 'register',
          invitation,
          workspaceNumber: invitation.workspaceNumber,
        }
      }
    } catch (error) {
      console.error('Failed to process invitation:', error)
      return { action: 'error', error: 'Failed to process invitation' }
    }
  },

  acceptInvitation: async (
    invitationId: string,
    userId: string,
    userEmail: string
  ): Promise<AcceptInvitationResult> => {
    try {
      const invitation = await invitationDao.getInvitation(invitationId)

      if (!invitation) {
        return { success: false, error: 'Invitation not found or expired' }
      }

      if (invitation.email !== userEmail) {
        return {
          success: false,
          error: 'Invitation email does not match user email',
        }
      }

      const isAlreadyMember = await workspaceDao.checkUserWorkspaceAccess?.(
        userId,
        invitation.workspaceId
      )

      if (isAlreadyMember) {
        await invitationDao.removeInvitation(invitationId, invitation.email)
        const workspace = await workspaceDao.findWorkspaceById?.(
          invitation.workspaceId
        )
        return { success: true, workspace }
      }

      const updatedWorkspace = await workspaceDao.addMembersToWorkspace?.(
        invitation.workspaceId,
        [userId]
      )
      await invitationDao.removeInvitation(invitationId, invitation.email)

      return { success: true, workspace: updatedWorkspace }
    } catch (error) {
      console.error('Failed to accept invitation:', error)
      return { success: false, error: 'Internal server error' }
    }
  },

  acceptInvitationAfterRegistration: async (
    invitationId: string,
    newUserId: string,
    userEmail: string
  ): Promise<AcceptInvitationResult> => {
    try {
      const invitation = await invitationDao.getInvitation(invitationId)

      if (!invitation) {
        return { success: false, error: 'Invitation not found or expired' }
      }

      if (invitation.email !== userEmail) {
        return {
          success: false,
          error: 'Invitation email does not match user email',
        }
      }

      const updatedWorkspace = await workspaceDao.addMembersToWorkspace?.(
        invitation.workspaceId,
        [newUserId]
      )
      await invitationDao.removeInvitation(invitationId, invitation.email)

      return { success: true, workspace: updatedWorkspace }
    } catch (error) {
      console.error('Failed to accept invitation after registration:', error)
      return { success: false, error: 'Internal server error' }
    }
  },
}

export default invitationService
