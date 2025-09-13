import { setJSON, getJSON, deleteKey, setJSONWithExpiry } from './redisDao'
import { InvitationData } from '../types/invitationTypes'

const INVITATION_PREFIX = 'invitation:'
const USER_INVITATIONS_PREFIX = 'user_invitations:'
const INVITATION_EXPIRY_DAYS = 7
const INVITATION_EXPIRY_SECONDS = INVITATION_EXPIRY_DAYS * 24 * 60 * 60

const getInvitationKey = (invitationId: string): string =>
  `${INVITATION_PREFIX}${invitationId}`
const getUserInvitationsKey = (email: string): string =>
  `${USER_INVITATIONS_PREFIX}${email}`

const invitationDao = {
  storeInvitation: async (invitationData: InvitationData): Promise<void> => {
    try {
      const invitationKey = getInvitationKey(invitationData.id)
      const userInvitationsKey = getUserInvitationsKey(invitationData.email)

      await setJSONWithExpiry(
        invitationKey,
        invitationData,
        INVITATION_EXPIRY_SECONDS
      )

      const userInvitations =
        (await getJSON<string[]>(userInvitationsKey)) || []
      if (!userInvitations.includes(invitationData.id)) {
        userInvitations.push(invitationData.id)
        await setJSONWithExpiry(
          userInvitationsKey,
          userInvitations,
          INVITATION_EXPIRY_SECONDS
        )
      }

      console.log(
        `Invitation stored in Redis with ${INVITATION_EXPIRY_DAYS} day TTL: ${invitationData.id}`
      )
    } catch (error) {
      console.error('Failed to store invitation in Redis:', error)
      throw error
    }
  },

  getInvitation: async (
    invitationId: string
  ): Promise<InvitationData | null> => {
    try {
      const invitationKey = getInvitationKey(invitationId)
      const invitation = await getJSON<InvitationData>(invitationKey)

      if (!invitation) {
        return null
      }

      if (new Date(invitation.expiresAt) < new Date()) {
        await invitationDao.removeInvitation(invitationId, invitation.email)
        return null
      }

      return invitation
    } catch (error) {
      console.error('Failed to get invitation from Redis:', error)
      return null
    }
  },

  removeInvitation: async (
    invitationId: string,
    email: string
  ): Promise<void> => {
    try {
      const invitationKey = getInvitationKey(invitationId)
      const userInvitationsKey = getUserInvitationsKey(email)

      await deleteKey(invitationKey)

      const userInvitations =
        (await getJSON<string[]>(userInvitationsKey)) || []
      const updatedInvitations = userInvitations.filter(
        (id) => id !== invitationId
      )

      if (updatedInvitations.length === 0) {
        await deleteKey(userInvitationsKey)
      } else {
        await setJSONWithExpiry(
          userInvitationsKey,
          updatedInvitations,
          INVITATION_EXPIRY_SECONDS
        )
      }

      console.log(`Removed invitation ${invitationId} from Redis`)
    } catch (error) {
      console.error('Failed to remove invitation from Redis:', error)
      throw error
    }
  },

  hasExistingInvitation: async (
    email: string,
    workspaceId: string
  ): Promise<boolean> => {
    try {
      const userInvitationsKey = getUserInvitationsKey(email)
      const userInvitations =
        (await getJSON<string[]>(userInvitationsKey)) || []

      for (const invitationId of userInvitations) {
        const invitation = await invitationDao.getInvitation(invitationId)
        if (
          invitation &&
          invitation.workspaceId === workspaceId &&
          invitation.status === 'pending'
        ) {
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Failed to check existing invitation:', error)
      return false
    }
  },
}

export default invitationDao
