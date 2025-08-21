import workspaceDao from '../dao/workspaceDao'
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
      // Send email invites to all members
    }
    return workspace
  },
}

export default workspaceService
