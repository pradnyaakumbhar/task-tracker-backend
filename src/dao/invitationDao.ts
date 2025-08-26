import prisma from '../utils/prisma'
import { InvitationData } from '../types/invitationTypes';
import { setJSON, getJSON, deleteKey, setJSONWithExpiry } from './redisDao';

const INVITATION_PREFIX = 'invitation:';
const USER_INVITATIONS_PREFIX = 'user_invitations:';
const INVITATION_EXPIRY_DAYS = 7;
const INVITATION_EXPIRY_SECONDS = INVITATION_EXPIRY_DAYS * 24 * 60 * 60;

const getInvitationKey = (invitationId: string): string => `${INVITATION_PREFIX}${invitationId}`;
const getUserInvitationsKey = (email: string): string => `${USER_INVITATIONS_PREFIX}${email}`;


export interface CreateInvitationData {
  email: string
  workspaceId: string
}

const invitationDao = {
  createInvitation: async (data: CreateInvitationData) => {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    return await prisma.invitation.create({
      data: {
        email: data.email,
        workspaceId: data.workspaceId,
        expiresAt,
        status: 'PENDING',
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            number: true,
            owner: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })
  },

  storeInvitation: async (invitationData: InvitationData): Promise<void> => {
    try {
      const invitationKey = getInvitationKey(invitationData.id);
      const userInvitationsKey = getUserInvitationsKey(invitationData.email);

      // Store invitation with TTL
      await setJSONWithExpiry(invitationKey, invitationData, INVITATION_EXPIRY_SECONDS);
      
      // Add to user's invitation list
      const userInvitations = await getJSON<string[]>(userInvitationsKey) || [];
      userInvitations.push(invitationData.id);
      await setJSONWithExpiry(userInvitationsKey, userInvitations, INVITATION_EXPIRY_SECONDS);
      
      console.log(`Invitation stored in Redis: ${invitationData.id}`);
    } catch (error) {
      console.error('Failed to store invitation in Redis:', error);
      throw error;
    }
  },

  getUserInvitations: async (email: string): Promise<string[]> => {
    try {
      const userInvitationsKey = getUserInvitationsKey(email);
      return await getJSON<string[]>(userInvitationsKey) || [];
    } catch (error) {
      console.error('Failed to get user invitations from Redis:', error);
      return [];
    }
  },

  getInvitation: async (invitationId: string): Promise<InvitationData | null> => {
    try {
      const invitationKey = getInvitationKey(invitationId);
      const invitation = await getJSON<InvitationData>(invitationKey);
      
      if (!invitation) {
        return null;
      }

      // Check if expired
      if (new Date(invitation.expiresAt) < new Date()) {
        await invitationDao.cleanupInvitation(invitationId, invitation.email);
        return null;
      }

      return invitation;
    } catch (error) {
      console.error('Failed to get invitation from Redis:', error);
      return null;
    }
  },

  cleanupInvitation: async (invitationId: string, email: string): Promise<void> => {
    try {
      const invitationKey = getInvitationKey(invitationId);
      const userInvitationsKey = getUserInvitationsKey(email);
      
      // Remove invitation data
      await deleteKey(invitationKey);
      
      // Remove from user's invitation list
      const userInvitations = await getJSON<string[]>(userInvitationsKey) || [];
      const updatedInvitations = userInvitations.filter(id => id !== invitationId);
      
      if (updatedInvitations.length === 0) {
        // No more invitations for this user, remove the key
        await deleteKey(userInvitationsKey);
      } else {
        // Update the list
        await setJSON(userInvitationsKey, updatedInvitations);
      }
      
      console.log(`Cleaned up invitation ${invitationId} from Redis`);
    } catch (error) {
      console.error('Failed to cleanup invitation from Redis:', error);
      throw error;
    }
  }, 

  findExistingInvitation: async (email: string, workspaceId: string) => {
    return await prisma.invitation.findFirst({
      where: {
        email,
        workspaceId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    })
  },
}

export default invitationDao
