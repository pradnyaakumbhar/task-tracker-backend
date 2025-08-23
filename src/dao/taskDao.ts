import { CreateTaskData } from '../types/taskTypes'
import generateNumbers from '../utils/generateNumbers'
import prisma from '../utils/prisma'

const taskDao = {
  createTask: async (data: CreateTaskData) => {
    // Generate task number within space
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
}

export default taskDao
