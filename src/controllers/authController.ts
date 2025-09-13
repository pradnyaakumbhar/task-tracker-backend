import { Request, Response } from 'express'
import { isValidEmail, isValidPassword } from '../utils/validators'
import authService from '../services/authService'
import userDao from '../dao/userDao'

const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password, invitationId } = req.body

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Name, email, and password are required',
        })
      }

      if (!isValidEmail(email)) {
        return res
          .status(400)
          .json({ success: false, error: 'Invalid email format' })
      }

      if (!isValidPassword(password)) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long',
        })
      }

      const result = await authService.registerUser({
        name,
        email,
        password,
        invitationId,
      })

      const response: any = {
        success: result.success,
        message: 'Registration successful',
        token: result.token,
        user: result.user,
      }

      if (result.workspace) {
        response.workspace = result.workspace
        response.workspaceNumber = result.workspace.number
      }

      if (result.invitationAccepted !== undefined) {
        response.invitationAccepted = result.invitationAccepted
      }

      res.status(201).json(response)
    } catch (error: any) {
      console.error('Registration error:', error)

      if (error.message.includes('already exists')) {
        return res.status(409).json({ success: false, error: error.message })
      }

      if (
        error.message.includes('Invalid') ||
        error.message.includes('expired')
      ) {
        return res.status(400).json({ success: false, error: error.message })
      }

      return res
        .status(500)
        .json({ success: false, error: 'Registration failed' })
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password, invitationId } = req.body

      if (!email || !password) {
        return res
          .status(400)
          .json({ success: false, error: 'Email and password are required' })
      }

      const result = await authService.loginUser({
        email,
        password,
        invitationId,
      })

      const response: any = {
        success: result.success,
        message: 'Login successful',
        token: result.token,
        user: result.user,
      }

      if (result.workspace) {
        response.workspace = result.workspace
        response.workspaceNumber = result.workspace.number
      }

      if (result.invitationAccepted !== undefined) {
        response.invitationAccepted = result.invitationAccepted
      }

      res.status(200).json(response)
    } catch (error: any) {
      console.error('Login error:', error)

      if (error.message.includes('Invalid')) {
        return res
          .status(401)
          .json({ success: false, error: 'Invalid email or password' })
      }

      return res.status(500).json({ success: false, error: 'Login failed' })
    }
  },

  verify: async (req: Request, res: Response) => {
    try {
      const { token } = req.body

      if (!token) {
        return res
          .status(400)
          .json({ success: false, error: 'Token is required' })
      }

      const decoded = authService.verifyToken(token)
      const user = await userDao.findUserById(decoded.userId)

      if (!user) {
        return res.status(401).json({ success: false, error: 'User not found' })
      }

      res.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email },
      })
    } catch (error) {
      res.status(401).json({ success: false, error: 'Invalid token' })
    }
  },
}

export default authController
