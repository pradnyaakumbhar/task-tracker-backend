import taskDao from '../dao/taskDao'
import spaceService from './spaceService'
import { CreateTaskData } from '../types/taskTypes'
const taskService = {
  createTask: async (taskData: CreateTaskData, userId: string) => {
    // Verify space access through workspace validation
    await spaceService.getSpaceDetails(taskData.spaceId, userId)

    const task = await taskDao.createTask(taskData)

    return task
  },
}

export default taskService
