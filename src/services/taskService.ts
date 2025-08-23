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

  updateTask: async (
    taskId: string,
    updateData: Partial<CreateTaskData>,
    userId: string
  ) => {
    // Check if user can edit this task (assignee, reporter, or creator)
    const canEdit = await taskDao.canUserEditTask(taskId, userId)
    if (!canEdit) {
      throw new Error(
        'Only task creator, assignee, or reporter can update this task'
      )
    }

    const originalTask = await taskDao.findTaskById(taskId)
    const updatedTask = await taskDao.updateTask(taskId, updateData)

    return updatedTask
  },
}

export default taskService
