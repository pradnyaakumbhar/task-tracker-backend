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
}

export default spaceService
