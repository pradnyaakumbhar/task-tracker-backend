import taskService from '../services/taskService'
import { AuthRequest } from '../types/authTypes'
import { Response } from 'express'
import generateNumbers from '../utils/generateNumbers'

const taskController = {
  createTask: async (req: AuthRequest, res: Response) => {
    try {
      const {
        title,
        description,
        comment,
        priority,
        status,
        tags,
        dueDate,
        spaceId,
        assigneeId,
        reporterId,
      } = req.body
      const creatorId = req.user!.userId

      if (!title || !spaceId) {
        return res.status(400).json({
          error: 'Title and space ID are required',
        })
      }

      // Validate priority
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
      if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({
          error: 'Invalid priority. Must be one of: LOW, MEDIUM, HIGH, URGENT',
        })
      }

      // Validate status
      const validStatuses = [
        'TODO',
        'IN_PROGRESS',
        'IN_REVIEW',
        'DONE',
        'CANCELLED',
      ]
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          error:
            'Invalid status. Must be one of: TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED',
        })
      }

      const taskData = {
        title,
        description,
        comment,
        priority: priority || 'MEDIUM',
        status: status || 'TODO',
        tags: tags || [],
        dueDate: dueDate ? new Date(dueDate) : undefined,
        spaceId,
        creatorId,
        assigneeId,
        reporterId: reporterId || creatorId,
      }

      const task = await taskService.createTask(taskData, creatorId)

      res.status(201).json({
        message: 'Task created successfully',
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          comment: task.comment,
          status: task.status,
          priority: task.priority,
          tags: task.tags,
          dueDate: task.dueDate,
          version: task.version,
          taskNumber: generateNumbers.formatTaskNumber(task.taskNumber),
          spaceNumber: task.space.spaceNumber,
          workspaceNumber: task.space.workspace.number,
          assignee: {
            id: task.assignee?.id,
            name: task.assignee?.name,
            email: task.assignee?.email,
          },
          reporter: {
            id: task.reporter.id,
            name: task.reporter.name,
            email: task.reporter.email,
          },
          creator: {
            id: task.creator.id,
            name: task.creator.name,
            email: task.creator.email,
          },
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        },
      })
    } catch (error) {
      console.error('Create task error:', error)
      if (error instanceof Error) {
        res.status(400).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  },

  getTaskDetails: async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.body
      const userId = req.user!.userId

      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' })
      }

      const task = await taskService.getTaskDetails(taskId, userId)

      res.status(200).json({
        message: 'Task details fetched successfully',
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          comment: task.comment,
          status: task.status,
          priority: task.priority,
          tags: task.tags,
          dueDate: task.dueDate,
          version: task.version,
          taskNumber: generateNumbers.formatTaskNumber(task.taskNumber),
          spaceNumber: task.space.spaceNumber,
          workspaceNumber: task.space.workspace.number,
          assignee: task.assignee
            ? {
                id: task.assignee.id,
                name: task.assignee.name,
                email: task.assignee.email,
              }
            : null,
          reporter: {
            id: task.reporter.id,
            name: task.reporter.name,
            email: task.reporter.email,
          },
          creator: {
            id: task.creator.id,
            name: task.creator.name,
            email: task.creator.email,
          },
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        },
      })
    } catch (error) {
      console.error('Get task details error:', error)
      if (error instanceof Error) {
        res.status(403).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  },

  updateTask: async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.params
      const updateData = req.body
      const userId = req.user!.userId

      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' })
      }

      // Validate priority
      if (updateData.priority) {
        const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
        if (!validPriorities.includes(updateData.priority)) {
          return res.status(400).json({
            error:
              'Invalid priority. Must be one of: LOW, MEDIUM, HIGH, URGENT',
          })
        }
      }

      // Validate status
      if (updateData.status) {
        const validStatuses = [
          'TODO',
          'IN_PROGRESS',
          'IN_REVIEW',
          'DONE',
          'CANCELLED',
        ]
        if (!validStatuses.includes(updateData.status)) {
          return res.status(400).json({
            error:
              'Invalid status. Must be one of: TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED',
          })
        }
      }

      // Convert dueDate to Date object
      if (updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate)
      }

      const task = await taskService.updateTask(taskId, updateData, userId)

      res.status(200).json({
        message: 'Task updated successfully',
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          comment: task.comment,
          status: task.status,
          priority: task.priority,
          tags: task.tags,
          dueDate: task.dueDate,
          version: task.version,
          taskNumber: generateNumbers.formatTaskNumber(task.taskNumber),
          spaceNumber: task.space.spaceNumber,
          workspaceNumber: task.space.workspace.number,
          assignee: task.assignee
            ? {
                id: task.assignee.id,
                name: task.assignee.name,
                email: task.assignee.email,
              }
            : null,
          reporter: {
            id: task.reporter.id,
            name: task.reporter.name,
            email: task.reporter.email,
          },
          creator: {
            id: task.creator.id,
            name: task.creator.name,
            email: task.creator.email,
          },
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        },
      })
    } catch (error) {
      console.error('Update task error:', error)
      if (error instanceof Error) {
        res.status(403).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  },

  deleteTask: async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.params
      const userId = req.user!.userId

      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' })
      }

      await taskService.deleteTask(taskId, userId)

      res.status(200).json({
        message: 'Task deleted successfully',
      })
    } catch (error) {
      console.error('Delete task error:', error)
      if (error instanceof Error) {
        res.status(403).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  },

  getTaskVersions: async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.body
      const userId = req.user!.userId

      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' })
      }

      const versions = await taskService.getTaskVersions(taskId, userId)
      res.status(200).json({
        message: 'Task versions retrieved successfully',
        versions: versions.map((version) => ({
          id: version.id,
          version: version.version,
          title: version.title,
          description: version.description,
          comment: version.comment,
          status: version.status,
          priority: version.priority,
          tags: version.tags,
          dueDate: version.dueDate,
          taskNumber: generateNumbers.formatTaskNumber(version.taskNumber),
          updateReason: version.updateReason,
          updater: {
            id: version.updater.id,
            name: version.updater.name,
            email: version.updater.email,
          },
          taskCreatedAt: version.taskCreatedAt,
          versionCreatedAt: version.versionCreatedAt,
        })),
      })
    } catch (error) {
      console.error('Get task versions error:', error)
      if (error instanceof Error) {
        res.status(403).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  },

  getTaskVersionDetails: async (req: AuthRequest, res: Response) => {
    try {
      const { taskId, version } = req.body
      const userId = req.user!.userId

      if (!taskId || !version) {
        return res
          .status(400)
          .json({ error: 'Task ID and version are required' })
      }

      const versionNumber = parseInt(version)
      if (isNaN(versionNumber)) {
        return res.status(400).json({ error: 'Version must be a number' })
      }

      const taskVersion = await taskService.getTaskVersionDetails(
        taskId,
        versionNumber,
        userId
      )

      res.status(200).json({
        message: 'Task version retrieved successfully',
        version: {
          id: taskVersion.id,
          version: taskVersion.version,
          title: taskVersion.title,
          description: taskVersion.description,
          comment: taskVersion.comment,
          status: taskVersion.status,
          priority: taskVersion.priority,
          tags: taskVersion.tags,
          dueDate: taskVersion.dueDate,
          taskNumber: generateNumbers.formatTaskNumber(taskVersion.taskNumber),
          updateReason: taskVersion.updateReason,
          updater: {
            id: taskVersion.updater.id,
            name: taskVersion.updater.name,
            email: taskVersion.updater.email,
          },
          taskCreatedAt: taskVersion.taskCreatedAt,
          versionCreatedAt: taskVersion.versionCreatedAt,
        },
      })
    } catch (error) {
      console.error('Get task version error:', error)
      if (error instanceof Error) {
        res.status(403).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  },

  revertToVersion: async (req: AuthRequest, res: Response) => {
    try {
      const { version, taskId } = req.body
      const userId = req.user!.userId

      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' })
      }

      if (!version) {
        return res.status(400).json({ error: 'Version number is required' })
      }

      const versionNumber = parseInt(version)
      if (isNaN(versionNumber)) {
        return res.status(400).json({ error: 'Version must be a number' })
      }

      const task = await taskService.revertToVersion(
        taskId,
        versionNumber,
        userId
      )

      res.status(200).json({
        message: `Task reverted to version ${versionNumber} successfully`,
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          comment: task.comment,
          status: task.status,
          priority: task.priority,
          tags: task.tags,
          dueDate: task.dueDate,
          version: task.version,
          taskNumber: generateNumbers.formatTaskNumber(task.taskNumber),
          spaceNumber: task.space.spaceNumber,
          workspaceNumber: task.space.workspace.number,
          assignee: task.assignee
            ? {
                id: task.assignee.id,
                name: task.assignee.name,
                email: task.assignee.email,
              }
            : null,
          reporter: {
            id: task.reporter.id,
            name: task.reporter.name,
            email: task.reporter.email,
          },
          creator: {
            id: task.creator.id,
            name: task.creator.name,
            email: task.creator.email,
          },
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        },
      })
    } catch (error) {
      console.error('Revert task error:', error)
      if (error instanceof Error) {
        res.status(400).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  },

  getTaskAnalytics: async (req: AuthRequest, res: Response) => {
    try {
      const { workspaceId } = req.body
      const userId = req.user!.userId

      if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID is required' })
      }

      const analytics = await taskService.getTaskAnalytics(workspaceId, userId)

      res.status(200).json({
        message: 'Task analytics fetched successfully',
        analytics,
      })
    } catch (error) {
      console.error('Get task analytics error:', error)
      if (error instanceof Error) {
        res.status(403).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  },
}

export default taskController
