import taskDao from '../dao/taskDao'
import spaceService from './spaceService'
import workspaceService from './workspaceService'
import { CreateTaskData } from '../types/taskTypes'

const taskService = {
  createTask: async (taskData: CreateTaskData, userId: string) => {
    await spaceService.getSpaceDetails(taskData.spaceId, userId)

    const task = await taskDao.createTask(taskData)

    return task
  },

  getTaskDetails: async (taskId: string, userId: string) => {
    const task = await taskDao.findTaskById(taskId)
    if (!task) {
      throw new Error('Task not found')
    }

    // Validate workspace access
    await workspaceService.validateWorkspaceAccess(
      userId,
      task.space.workspace.id
    )

    return task
  },
}

export default taskService
