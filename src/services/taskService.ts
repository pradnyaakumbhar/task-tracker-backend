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
    updateData: CreateTaskData,
    userId: string
  ) => {
    // Check if user can edit this task (assignee, reporter, or creator)
    const canEdit = await taskDao.canUserEditTask(taskId, userId)
    if (!canEdit) {
      throw new Error(
        'Only task creator, assignee, or reporter can update this task'
      )
    }

    const existingTask = await taskDao.findTaskById(taskId)
    if (!existingTask) {
      throw new Error('Task not found')
    }
    await workspaceService.validateWorkspaceAccess(
      userId,
      existingTask.space.workspace.id
    )

    const updatedTask = await taskDao.updateTask(taskId, updateData, userId)
    return updatedTask
  },

  deleteTask: async (taskId: string, userId: string) => {
    // Only creator can delete tasks
    const isCreator = await taskDao.isTaskCreator(taskId, userId)
    if (!isCreator) {
      throw new Error('Only task creator can delete this task')
    }

    return await taskDao.deleteTask(taskId)
  },

  getTaskVersions: async (taskId: string, userId: string) => {
    const task = await taskDao.findTaskById(taskId)
    if (!task) {
      throw new Error('Task not found')
    }

    await workspaceService.validateWorkspaceAccess(
      userId,
      task.space.workspace.id
    )

    return await taskDao.getTaskVersions(taskId)
  },
}

export default taskService
