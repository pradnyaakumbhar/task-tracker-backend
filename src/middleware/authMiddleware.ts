import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import userDao from '../dao/userDao'
import { AuthRequest } from '../types/authTypes'

const JWT_SECRET = process.env.JWT_SECRET as string

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: 'Access token required' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await userDao.findUserById(decoded.userId)

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' })
    }

    req.user = { userId: user.id, email: user.email, name: user.name }
    next()
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Invalid token' })
  }
}
