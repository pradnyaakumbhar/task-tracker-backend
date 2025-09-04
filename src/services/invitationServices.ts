import invitationDao from '../dao/invitationDao'
import { v4 as uuidv4 } from 'uuid'
import {
  InvitationData,
  CreateInvitationRequest,
  InvitationResult,
} from '../types/invitationTypes'
import userDao from '../dao/userDao'
import workspaceDao from '../dao/workspaceDao'
import authService from './authService'
import { sendInvitationEmail } from '../utils/emailService'

const INVITATION_EXPIRY_DAYS = 7
const INVITATION_EXPIRY_SECONDS = INVITATION_EXPIRY_DAYS * 24 * 60 * 60

interface AcceptInvitationResult {
  success: boolean
  error?: string
  workspace?: any
}

interface InvitationLinkResult {
  action: 'register' | 'login' | 'accepted' | 'expired' | 'error'
  invitation?: InvitationData
  message?: string
  workspace?: any
  error?: string
}
const invitationService = {
  createAndSendInvitation: async (
    invitationRequest: CreateInvitationRequest & {
      senderName: string
      senderId: string
    }
  ): Promise<InvitationResult> => {
    try {
      const { email, workspaceId, workspaceName, senderName, senderId } =
        invitationRequest

      // Check if user is already a workspace member
      const isAlreadyMember =
        await workspaceDao.checkUserWorkspaceAccessByEmail(email, workspaceId)
      if (isAlreadyMember) {
        return {
          success: false,
          error: 'User is already a member of this workspace',
        }
      }

      // Check if invitation already exists
      const existingInvitation = await invitationService.findExistingInvitation(
        email,
        workspaceId
      )
      if (existingInvitation) {
        return {
          success: false,
          error: 'Invitation already sent to this email for this workspace',
        }
      }

      // Generate invitation data
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
      }

      console.log(`Sending invitation email to ${email}...`)

      // Send email
      const emailSent = await sendInvitationEmail(
        email,
        workspaceName,
        senderName,
        invitationId
      )

      if (!emailSent) {
        return {
          success: false,
          error: 'Failed to send invitation email',
        }
      }

      // Store in Redis
      await invitationDao.storeInvitation(invitationData)

      console.log(`Invitation created and stored: ${invitationId}`)

      return {
        success: true,
        invitationId,
      }
    } catch (error) {
      console.error('Failed to create invitation:', error)
      return {
        success: false,
        error: 'Internal server error',
      }
    }
  },

  findExistingInvitation: async (
    email: string,
    workspaceId: string
  ): Promise<InvitationData | null> => {
    try {
      const userInvitations = await invitationDao.getUserInvitations(email)

      for (const invitationId of userInvitations) {
        const invitation = await invitationDao.getInvitation(invitationId)
        if (
          invitation &&
          invitation.workspaceId === workspaceId &&
          invitation.status === 'pending'
        ) {
          return invitation
        }
      }

      return null
    } catch (error) {
      console.error('Failed to find existing invitation:', error)
      return null
    }
  },

  processInvitationLink: async (
    invitationId: string,
    authToken?: string
  ): Promise<InvitationLinkResult> => {
    try {
      // Get invitation details
      const invitation = await invitationDao.getInvitation(invitationId)

      if (!invitation) {
        return {
          action: 'expired',
          error: 'Invitation not found or expired',
        }
      }

      // Check if user exists in database
      const existingUser = await userDao.findUserByEmail(invitation.email)

      if (!existingUser) {
        // User needs to register
        return {
          action: 'register',
          invitation,
        }
      }

      // User exists - check if they have valid auth token
      if (!authToken) {
        // User needs to login
        return {
          action: 'login',
          invitation,
        }
      }

      // Verify token and auto-accept if valid
      const tokenResult = await invitationService.verifyTokenAndAccept(
        authToken,
        invitation,
        existingUser.id
      )

      return tokenResult
    } catch (error) {
      console.error('Failed to process invitation link:', error)
      return {
        action: 'error',
        error: 'Internal server error',
      }
    }
  },

  verifyTokenAndAccept: async (
    token: string,
    invitation: InvitationData,
    userId: string
  ): Promise<InvitationLinkResult> => {
    try {
      // Verify token using your auth service
      const tokenPayload = await authService.verifyToken(token)

      if (!tokenPayload || tokenPayload.email !== invitation.email) {
        return {
          action: 'login',
          invitation,
        }
      }

      // Auto-accept the invitation
      const acceptResult = await invitationService.acceptInvitation(
        invitation.id,
        userId,
        tokenPayload.email
      )

      if (!acceptResult.success) {
        return {
          action: 'error',
          error: acceptResult.error,
        }
      }

      return {
        action: 'accepted',
        message: 'Successfully joined workspace',
        workspace: acceptResult.workspace,
      }
    } catch (error) {
      console.error('Failed to verify token and accept:', error)
      return {
        action: 'login',
        invitation,
      }
    }
  },

  acceptInvitation: async (
    invitationId: string,
    userId: string,
    userEmail: string
  ): Promise<AcceptInvitationResult> => {
    try {
      // Get invitation from Redis
      const invitation = await invitationDao.getInvitation(invitationId)

      if (!invitation) {
        return {
          success: false,
          error: 'Invitation not found or expired',
        }
      }

      // Validate invitation
      const validationResult = invitationService.validateInvitation(
        invitation,
        userEmail
      )
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error,
        }
      }

      // Check if user is already a member
      const isAlreadyMember = await workspaceDao.checkUserWorkspaceAccess(
        userId,
        invitation.workspaceId
      )
      if (isAlreadyMember) {
        // Cleanup invitation and return error
        await invitationDao.cleanupInvitation(invitationId, invitation.email)
        return {
          success: false,
          error: 'User is already a member of this workspace',
        }
      }

      // Add user to workspace
      const updatedWorkspace = await workspaceDao.addMembersToWorkspace(
        invitation.workspaceId,
        [userId]
      )

      // Cleanup invitation
      await invitationDao.cleanupInvitation(invitationId, invitation.email)

      console.log(
        `User ${userId} accepted invitation to workspace ${invitation.workspaceId}`
      )

      return {
        success: true,
        workspace: updatedWorkspace,
      }
    } catch (error) {
      console.error('Failed to accept invitation:', error)
      return {
        success: false,
        error: 'Internal server error',
      }
    }
  },

  validateInvitation: (
    invitation: InvitationData,
    userEmail: string
  ): { isValid: boolean; error?: string } => {
    if (invitation.status !== 'pending') {
      return {
        isValid: false,
        error: 'Invitation is no longer pending',
      }
    }

    if (invitation.email !== userEmail) {
      return {
        isValid: false,
        error: 'Invitation email does not match user email',
      }
    }

    return { isValid: true }
  },

  addUserToWorkspaceAndCleanup: async (
    invitation: InvitationData,
    userId: string
  ): Promise<{ success: boolean; workspace?: any; error?: string }> => {
    try {
      // Add user in workspace
      const updatedWorkspace = await workspaceDao.addMembersToWorkspace(
        invitation.workspaceId,
        [userId]
      )

      // cleanup Redis invitation
      await invitationDao.cleanupInvitation(invitation.id, invitation.email)

      console.log(
        `User ${userId} successfully added to workspace ${invitation.workspaceId}, invitation cleaned up`
      )

      return {
        success: true,
        workspace: updatedWorkspace,
      }
    } catch (error) {
      console.error(
        'Failed to add user to workspace or cleanup invitation:',
        error
      )
      return {
        success: false,
        error: 'Failed to complete workspace addition',
      }
    }
  },
}

export default invitationService
