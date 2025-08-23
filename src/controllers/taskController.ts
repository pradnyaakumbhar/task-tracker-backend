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

      // UPDATED VALIDATION: assigneeId is now required, reporterId is optional
      if (!title || !spaceId || !assigneeId) {
        return res.status(400).json({
          error: 'Title, space ID, and assignee ID are required',
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
        assigneeId, // Now required
        reporterId: reporterId || creatorId, // Default to creator if not provided
      }

      const task = await taskService.createTask(taskData, creatorId)

      // Format response exactly as requested
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
          taskNumber: generateNumbers.formatTaskNumber(task.taskNumber),
          spaceNumber: generateNumbers.formatSpaceNumber(
            task.space.spaceNumber
          ),
          workspaceNumber: task.space.workspace.number,
          assignee: {
            id: task.assignee!.id, // Now guaranteed to exist
            name: task.assignee!.name,
            email: task.assignee!.email,
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
        message: 'Task details retrieved successfully',
        task: {
          id: task.id,
          title: task.title,
          description: task.description,
          comment: task.comment,
          status: task.status,
          priority: task.priority,
          tags: task.tags,
          dueDate: task.dueDate,
          taskNumber: generateNumbers.formatTaskNumber(task.taskNumber),
          spaceNumber: generateNumbers.formatSpaceNumber(
            task.space.spaceNumber
          ),
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

      // Validate priority if provided
      if (updateData.priority) {
        const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
        if (!validPriorities.includes(updateData.priority)) {
          return res.status(400).json({
            error:
              'Invalid priority. Must be one of: LOW, MEDIUM, HIGH, URGENT',
          })
        }
      }

      // Validate status if provided
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

      // Convert dueDate to Date object if provided
      if (updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate)
      }

      const task = await taskService.updateTask(taskId, updateData, userId)

      // Format response exactly as requested
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
          taskNumber: generateNumbers.formatTaskNumber(task.taskNumber),
          spaceNumber: generateNumbers.formatSpaceNumber(
            task.space.spaceNumber
          ),
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
}

export default taskController
