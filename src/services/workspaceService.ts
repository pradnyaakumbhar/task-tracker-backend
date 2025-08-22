import workspaceDao from '../dao/workspaceDao'
import invitationDao from '../dao/invitationDao'
import userDao from '../dao/userDao'

const workspaceService = {
  createWorkspaceWithInvites: async (
    name: string,
    description: string,
    ownerId: string,
    memberEmails: string[]
  ) => {
    const workspace = await workspaceDao.createWorkspace({
      name,
      description,
      ownerId,
      memberEmails,
    })

    if (memberEmails.length > 0) {
      // Find existing users
      const existingUsers = await userDao.findUsersByEmails(memberEmails)
      const existingUserEmails = existingUsers.map((user) => user.email)
      const existingUserIds = existingUsers.map((user) => user.id)

      // Add existing users directly to workspace
      if (existingUserIds.length > 0) {
        await workspaceDao.addMembersToWorkspace(workspace.id, existingUserIds)
      }

      // Create invitations for non-existing users
      const newUserEmails = memberEmails.filter(
        (email) => !existingUserEmails.includes(email)
      )

      for (const email of newUserEmails) {
        try {
          // Check if invitation already exists
          const existingInvitation = await invitationDao.findExistingInvitation(
            email,
            workspace.id
          )
          if (!existingInvitation) {
            await invitationDao.createInvitation({
              email,
              workspaceId: workspace.id,
            })
          }
        } catch (error) {
          console.error(`Failed to create invitation for ${email}:`, error)
        }
      }
      // Send email invites to all members
    }
    return workspace
  },

  getWorkspaceDetails: async (workspaceId: string, userId: string) => {
    // Check if user has access to this workspace
    const hasAccess = await workspaceDao.checkUserWorkspaceAccess(
      userId,
      workspaceId
    )
    if (!hasAccess) {
      throw new Error('Access denied to this workspace')
    }

    const workspace = await workspaceDao.findWorkspaceById(workspaceId)

    if (!workspace) {
      throw new Error('Workspace not found')
    }

    return workspace
  },

  getWorkspaceSpaces: async (workspaceId: string, userId: string) => {
    // Validate workspace access
    const hasAccess = await workspaceDao.checkUserWorkspaceAccess(
      userId,
      workspaceId
    )
    if (!hasAccess) {
      throw new Error('Access denied to this workspace')
    }

    return await workspaceDao.findSpacesByWorkspaceId(workspaceId)
  },

  validateWorkspaceAccess: async (userId: string, workspaceId: string) => {
    const hasAccess = await workspaceDao.checkUserWorkspaceAccess(
      userId,
      workspaceId
    )
    if (!hasAccess) {
      throw new Error('Access denied to this workspace')
    }
    return true
  },
}

export default workspaceService
