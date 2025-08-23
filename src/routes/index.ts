import express, { Request, Response } from 'express'
import authRoutes from './authRoutes'
import userRoutes from './userRoutes'
import workspaceRoutes from './workspaceRoutes'
import spaceRoutes from './spaceRoutes'
import taskRoutes from './taskRoutes'

const router = express.Router()

router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
})

router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/workspace', workspaceRoutes)
router.use('/space', spaceRoutes)
router.use('/task', taskRoutes)

export default router
