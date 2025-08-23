import spaceService from '../services/spaceService'
import { AuthRequest } from '../types/authTypes'
import { Response } from 'express'
import generateNumbers from '../utils/generateNumbers'

const spaceController = {
  createSpace: async (req: AuthRequest, res: Response) => {
    try {
      const { workspaceId, name, description } = req.body
      const userId = req.user!.userId

      if (!workspaceId || !name) {
        return res
          .status(400)
          .json({ error: 'Workspace ID and space name are required' })
      }

      const space = await spaceService.createSpaceInWorkspace(
        workspaceId,
        name,
        description || '',
        userId
      )

      res.status(201).json({
        message: 'Space created successfully',
        space: {
          id: space.id,
          name: space.name,
          spaceNumber: generateNumbers.formatSpaceNumber(space.spaceNumber),
          workspaceNumber: space.workspace.number,
        },
      })
    } catch (error) {
      console.error('Create space error:', error)
      if (error instanceof Error) {
        res.status(400).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  },

  getTasks: async (req: AuthRequest, res: Response) => {
    try {
      const { spaceId } = req.body
      const userId = req.user!.userId

      if (!spaceId) {
        return res.status(400).json({ error: 'Space ID is required' })
      }

      const tasks = await spaceService.getTasksBySpace(spaceId, userId)

      res.status(200).json({
        message: 'Tasks fetched successfully',
        tasks,
      })
    } catch (error) {
      console.error('Get tasks error:', error)
      if (error instanceof Error) {
        res.status(403).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  },

  deleteSpace: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params
      const userId = req.user!.userId

      if (!id) {
        return res.status(400).json({ error: 'Space ID is required' })
      }

      await spaceService.deleteSpace(id, userId)

      res.status(200).json({
        message: 'Space deleted successfully',
      })
    } catch (error) {
      console.error('Delete space error:', error)
      if (error instanceof Error) {
        res.status(403).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  },

  updateSpace: async (req: AuthRequest, res: Response) => {
    try {
      const { id, name, description } = req.body
      const userId = req.user!.userId

      if (!id) {
        return res.status(400).json({ error: 'Space ID is required' })
      }

      const updateData: any = {}
      if (name) updateData.name = name
      if (description !== undefined) updateData.description = description

      if (Object.keys(updateData).length === 0) {
        return res
          .status(400)
          .json({ error: 'At least one field to update is required' })
      }

      const space = await spaceService.updateSpace(id, updateData, userId)

      res.status(200).json({
        message: 'Space updated successfully',
        space: {
          id: space.id,
          name: space.name,
          spaceNumber: generateNumbers.formatSpaceNumber(space.spaceNumber),
          workspaceNumber: space.workspace.number,
        },
      })
    } catch (error) {
      console.error('Update space error:', error)
      if (error instanceof Error) {
        res.status(403).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  },
}

export default spaceController
