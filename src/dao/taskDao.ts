import { CreateTaskData } from '../types/taskTypes'
import generateNumbers from '../utils/generateNumbers'
import prisma from '../utils/prisma'
import { Prisma } from '../generated/prisma'

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
        version: 1,
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

  updateTask: async (taskId: string, data: CreateTaskData, userId: string) => {
    return await prisma.$transaction(async (tx) => {
      // Get current task
      const currentTask = await tx.task.findUnique({
        where: { id: taskId },
      })

      if (!currentTask) {
        throw new Error('Task not found')
      }

      const newVersion = currentTask.version + 1

      // Save current state to versions table
      await tx.taskVersion.create({
        data: {
          taskId: currentTask.id,
          version: currentTask.version,
          title: currentTask.title,
          description: currentTask.description,
          comment: currentTask.comment,
          status: currentTask.status,
          priority: currentTask.priority,
          tags: currentTask.tags,
          dueDate: currentTask.dueDate,
          taskNumber: currentTask.taskNumber,
          spaceId: currentTask.spaceId,
          creatorId: currentTask.creatorId,
          assigneeId: currentTask.assigneeId,
          reporterId: currentTask.reporterId,
          taskCreatedAt: currentTask.createdAt,
          updatedBy: userId,
        },
      })

      // Update main task
      const updateData: Prisma.TaskUpdateInput = {
        version: newVersion,
        updatedAt: new Date(),
      }

      if (data.title !== undefined) updateData.title = data.title
      if (data.description !== undefined)
        updateData.description = data.description
      if (data.comment !== undefined) updateData.comment = data.comment
      if (data.status !== undefined) updateData.status = data.status
      if (data.priority !== undefined) updateData.priority = data.priority
      if (data.tags !== undefined) updateData.tags = data.tags
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate

      if (data.assigneeId !== undefined) {
        updateData.assignee = data.assigneeId
          ? { connect: { id: data.assigneeId } }
          : { disconnect: true }
      }
      if (data.reporterId !== undefined) {
        updateData.reporter = { connect: { id: data.reporterId } }
      }

      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: updateData,
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

      return updatedTask
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

  getTaskVersions: async (taskId: string) => {
    return await prisma.taskVersion.findMany({
      where: { taskId },
      include: {
        updater: { select: { id: true, name: true, email: true } },
      },
      orderBy: { version: 'desc' },
    })
  },

  getTaskVersionDetails: async (taskId: string, version: number) => {
    return await prisma.taskVersion.findUnique({
      where: {
        taskId_version: { taskId, version },
      },
      include: {
        updater: { select: { id: true, name: true, email: true } },
      },
    })
  },

  revertToVersion: async (
    taskId: string,
    targetVersion: number,
    userId: string,
    reason?: string
  ) => {
    return await prisma.$transaction(async (tx) => {
      // Get the target version data
      const targetVersionData = await tx.taskVersion.findUnique({
        where: {
          taskId_version: { taskId, version: targetVersion },
        },
      })

      if (!targetVersionData) {
        throw new Error(`Version ${targetVersion} not found for task ${taskId}`)
      }

      // Get current task data to store in version table
      const currentTask = await tx.task.findUnique({
        where: { id: taskId },
      })

      if (!currentTask) {
        throw new Error('Task not found')
      }

      const newVersion = currentTask.version + 1

      // store current task
      await tx.taskVersion.create({
        data: {
          taskId: currentTask.id,
          version: currentTask.version,
          title: currentTask.title,
          description: currentTask.description,
          comment: currentTask.comment,
          status: currentTask.status,
          priority: currentTask.priority,
          tags: currentTask.tags,
          dueDate: currentTask.dueDate,
          taskNumber: currentTask.taskNumber,
          spaceId: currentTask.spaceId,
          creatorId: currentTask.creatorId,
          assigneeId: currentTask.assigneeId,
          reporterId: currentTask.reporterId,
          taskCreatedAt: currentTask.createdAt,
          updatedBy: userId,
        },
      })

      // Update task with target version
      const revertedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          title: targetVersionData.title,
          description: targetVersionData.description,
          comment: targetVersionData.comment,
          status: targetVersionData.status,
          priority: targetVersionData.priority,
          tags: targetVersionData.tags,
          dueDate: targetVersionData.dueDate,
          assigneeId: targetVersionData.assigneeId,
          reporterId: targetVersionData.reporterId,
          version: newVersion,
          updatedAt: new Date(),
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

      return revertedTask
    })
  },
}

export default taskDao
