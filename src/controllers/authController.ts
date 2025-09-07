import { Request, Response } from 'express'
import { isValidEmail, isValidPassword } from '../utils/validators'
import authService from '../services/authService'

const authcontroller = {
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body

      if (!name || !email || !password) {
        return res.status(400).json({
          error: 'name, email and password are required',
        })
      }
      if (!isValidEmail(email)) {
        return res.status(400).json({
          error: 'Invalid email',
        })
      }
      if (!isValidPassword(password)) {
        return res.status(400).json({
          error: 'Passowrd must be at least 6 characters long',
        })
      }

      const result = await authService.registerUser(name, email, password)

      res.status(201).json({
        message: 'User registered successfully',
        token: result.token,
        user: result.user,
      })
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and Password are required',
        })
      }

      const result = await authService.loginUser(email, password)

      res.status(201).json({
        message: 'Login successfull',
        token: result.token,
        user: result.user,
      })
    } catch (error: any) {
      return res.status(400).json({ error: error.message })
    }
  },

  registerWithInvitation: async (req: Request, res: Response) => {
    try {
      const { name, email, password, invitationId } = req.body

      // Input validation
      if (!name || !email || !password) {
        return res.status(400).json({
          error: 'Name, email, and password are required',
        })
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          error: 'Invalid email address',
        })
      }
      if (!isValidPassword(password)) {
        return res.status(400).json({
          error: 'Passowrd must be at least 6 characters long',
        })
      }

      const result = await authService.registerUserWithInvitation({
        name,
        email,
        password,
        invitationId,
      })

      res.status(201).json({
        message: 'Registration successful',
        token: result.token,
        user: result.user,
        ...(result.workspace && { workspace: result.workspace }),
        ...(result.workspace && { workspaceNumber: result.workspace.number }),
        ...(result.invitationAccepted && { invitationAccepted: true }),
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed'

      if (
        errorMessage.includes('already exists') ||
        errorMessage.includes('Invalid') ||
        errorMessage.includes('expired')
      ) {
        return res.status(400).json({ error: errorMessage })
      }

      res.status(500).json({ error: 'Failed to create account' })
    }
  },
}

export default authcontroller
