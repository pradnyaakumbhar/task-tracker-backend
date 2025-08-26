import invitationDao from "../dao/invitationDao";
import { v4 as uuidv4 } from 'uuid';
import { InvitationData, CreateInvitationRequest, InvitationResult } from '../types/invitationTypes';
import userDao from '../dao/userDao';
import workspaceDao from '../dao/workspaceDao';
import authService from './authService';
import { sendInvitationEmail } from '../utils/emailService';

const INVITATION_EXPIRY_DAYS = 7;
const INVITATION_EXPIRY_SECONDS = INVITATION_EXPIRY_DAYS * 24 * 60 * 60;

const invitationService = {
    createAndSendInvitation: async (
        invitationRequest: CreateInvitationRequest & { senderName: string; senderId: string }
      ): Promise<InvitationResult> => {
        try {
          const { email, workspaceId, workspaceName, senderName, senderId } = invitationRequest;
          
          // Check if user is already a workspace member
          const isAlreadyMember = await workspaceDao.checkUserWorkspaceAccessByEmail(email, workspaceId);
          if (isAlreadyMember) {
            return { 
              success: false, 
              error: 'User is already a member of this workspace' 
            };
          }
    
          // Check if invitation already exists
          const existingInvitation = await invitationService.findExistingInvitation(email, workspaceId);
          if (existingInvitation) {
            return {
              success: false,
              error: 'Invitation already sent to this email for this workspace'
            };
          }
    
          // Generate invitation data
          const invitationId = uuidv4();
          const now = new Date();
          const expiresAt = new Date(now.getTime() + INVITATION_EXPIRY_SECONDS * 1000);
    
          const invitationData: InvitationData = {
            id: invitationId,
            email,
            workspaceId,
            workspaceName,
            senderName,
            senderId,
            status: 'pending',
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString()
          };
    
          console.log(`Sending invitation email to ${email}...`);
    
          // Send email 
          const emailSent = await sendInvitationEmail(email, workspaceName, senderName, invitationId);
          
          if (!emailSent) {
            return {
              success: false,
              error: 'Failed to send invitation email'
            };
          }
    
          // Store in Redis 
          await invitationDao.storeInvitation(invitationData);
    
          console.log(`Invitation created and stored: ${invitationId}`);
    
          return {
            success: true,
            invitationId
          };
    
        } catch (error) {
          console.error('Failed to create invitation:', error);
          return {
            success: false,
            error: 'Internal server error'
          };
        }
      },

      findExistingInvitation: async (
        email: string, 
        workspaceId: string
      ): Promise<InvitationData | null> => {
        try {
          const userInvitations = await invitationDao.getUserInvitations(email);
          
          for (const invitationId of userInvitations) {
            const invitation = await invitationDao.getInvitation(invitationId);
            if (invitation && 
                invitation.workspaceId === workspaceId && 
                invitation.status === 'pending') {
              return invitation;
            }
          }
          
          return null;
        } catch (error) {
          console.error('Failed to find existing invitation:', error);
          return null;
        }
      },
}

export default invitationService