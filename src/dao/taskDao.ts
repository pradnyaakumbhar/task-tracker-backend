import { CreateTaskData } from '../types/taskTypes'
import generateNumbers from '../utils/generateNumbers'
import prisma from '../utils/prisma'

const taskDao = {
  createTask: async (data: CreateTaskData) => {
    // Generate task number within space, should be unique
    const taskNumber = await generateNumbers.generateTaskNumber(data.spaceId)

    return await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        comment: data.comment,
        priority: data.priority,
        status: data.status || 'TODO',
        tags: data.tags || [],
        dueDate: data.dueDate,
        taskNumber: taskNumber,
        spaceId: data.spaceId,
        creatorId: data.creatorId,
        assigneeId: data.assigneeId,
        reporterId: data.reporterId || data.creatorId,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true, email: true } },
        space: {
          select: {
            id: true,
            name: true,
            spaceNumber: true,
            workspace: { select: { id: true, name: true, number: true } },
          },
        },
      },
    })
  },

  findTaskById: async (taskId: string) => {
    return await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true, email: true } },
        space: {
          select: {
            id: true,
            name: true,
            spaceNumber: true,
            workspace: {
              select: {
                id: true,
                name: true,
                number: true,
                ownerId: true,
                members: { select: { id: true } },
              },
            },
          },
        },
      },
    })
  },

  canUserEditTask: async (taskId: string, userId: string): Promise<boolean> => {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        creatorId: true,
        assigneeId: true,
        reporterId: true,
      },
    })

    if (!task) return false

    return (
      task.creatorId === userId ||
      task.assigneeId === userId ||
      task.reporterId === userId
    )
  },

  updateTask: async (taskId: string, data: Partial<CreateTaskData>) => {
    return await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        comment: data.comment,
        priority: data.priority,
        status: data.status,
        tags: data.tags,
        dueDate: data.dueDate,
        assigneeId: data.assigneeId,
        reporterId: data.reporterId,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true, email: true } },
        space: {
          select: {
            id: true,
            name: true,
            spaceNumber: true,
            workspace: { select: { id: true, name: true, number: true } },
          },
        },
      },
    })
  },

  isTaskCreator: async (taskId: string, userId: string): Promise<boolean> => {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { creatorId: true },
    })

    return task?.creatorId === userId || false
  },

  deleteTask: async (taskId: string) => {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { taskNumber: true, spaceId: true },
    })

    if (!task) {
      throw new Error('Task not found')
    }

    await prisma.task.delete({
      where: { id: taskId },
    })

    return { message: 'Task deleted' }
  },
}

export default taskDao
