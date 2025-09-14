import workspaceDao from '../dao/workspaceDao'
import invitationService from '../services/invitationServices'
import userDao from '../dao/userDao'

const workspaceService = {
  createWorkspaceWithInvites: async (
    name: string,
    description: string,
    ownerId: string,
    memberEmails: string[]
  ) => {
    // Create workspace
    const workspace = await workspaceDao.createWorkspace({
      name,
      description,
      ownerId,
      memberEmails,
    })

    const owner = await userDao.findUserById(ownerId)
    if (!owner) {
      throw new Error('Owner not found')
    }
    // Send invitations to all member emails
    if (memberEmails.length > 0) {
      for (const email of memberEmails) {
        try {
          const invitationResult = await invitationService.sendInvitation({
            email,
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            senderName: owner.name,
            senderId: owner.id,
          })
          if (!invitationResult.success) {
            console.error(
              `Failed to send invitation to ${email}:`,
              invitationResult.error
            )
          } else {
            console.log(`Invitation sent successfully to ${email}`)
          }
        } catch (error) {
          console.error(`Failed to send invitation to ${email}:`, error)
        }
      }
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

  getWorkspaceDashboardData: async (workspaceId: string, userId: string) => {
    // Validate workspace access
    await workspaceService.validateWorkspaceAccess(userId, workspaceId)

    const [todayTasks, upcomingTasks, spacesWithTasks] = await Promise.all([
      workspaceDao.getTodayDueTasks(workspaceId),
      workspaceDao.getUpcomingTasks(workspaceId),
      workspaceDao.getWorkspaceTasksWithStatus(workspaceId),
    ])

    // Calculate space progress
    const spaceProgress = spacesWithTasks.map((space) => {
      const statusCounts = space.tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const completedTasks = statusCounts.DONE || 0
      const inProgressTasks =
        (statusCounts.IN_PROGRESS || 0) + (statusCounts.IN_REVIEW || 0)
      const todoTasks = (statusCounts.TODO || 0) + (statusCounts.CANCELLED || 0)

      const progressPercentage =
        space._count.tasks > 0
          ? Math.round((completedTasks / space._count.tasks) * 100)
          : 0

      return {
        id: space.id,
        name: space.name,
        spaceNumber: space.spaceNumber,
        totalTasks: space._count.tasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        progress: progressPercentage,
      }
    })

    return {
      todayTasks,
      upcomingTasks,
      spaceProgress,
    }
  },
}

export default workspaceService
