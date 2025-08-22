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
}

export default spaceController
