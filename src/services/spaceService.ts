import spaceDao from '../dao/spaceDao'
import workspaceService from './workspaceService'
const spaceService = {
  createSpaceInWorkspace: async (
    workspaceId: string,
    name: string,
    description: string,
    userId: string
  ) => {
    // Validate workspace access
    await workspaceService.validateWorkspaceAccess(userId, workspaceId)

    return await spaceDao.createSpace({
      name,
      description,
      workspaceId,
    })
  },

  getSpaceDetails: async (spaceId: string, userId: string) => {
    const space = await spaceDao.findSpaceById(spaceId)
    if (!space) {
      throw new Error('Space not found')
    }

    // Validate workspace access
    await workspaceService.validateWorkspaceAccess(userId, space.workspace.id)

    return space
  },

  getTasksBySpace: async (spaceId: string, userId: string) => {
    // Verify space access
    await spaceService.getSpaceDetails(spaceId, userId)

    return await spaceDao.findTasksBySpaceId(spaceId)
  },

  deleteSpace: async (spaceId: string, userId: string) => {
    const space = await spaceDao.findSpaceById(spaceId)
    if (!space) {
      throw new Error('Space not found')
    }

    // Validate workspace access
    await workspaceService.validateWorkspaceAccess(userId, space.workspace.id)

    return await spaceDao.deleteSpace(spaceId)
  },
}

export default spaceService
