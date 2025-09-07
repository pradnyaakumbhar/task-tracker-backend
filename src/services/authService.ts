import jwt from 'jsonwebtoken'
import userDao from '../dao/userDao'
import bcrypt from 'bcryptjs'
const JWT_SECRET = process.env.JWT_SECRET as string
import invitationService from './invitationServices'
import invitationDao from '../dao/invitationDao'

interface AuthResult {
  token: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface AuthWithInvitationResult extends AuthResult {
  workspace?: any
  invitationAccepted?: boolean
}

interface RegisterWithInvitationRequest {
  name: string
  email: string
  password: string
  invitationId?: string
}

interface TokenPayload {
  userId: string
  email: string
  name?: string
}

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '1d' })
}

const authService = {
  verifyToken: (token: string): any => {
    return jwt.verify(token, JWT_SECRET)
  },

  registerUser: async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> => {
    // Check if user already exists
    const existingUser = await userDao.findUserByEmail(email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = await userDao.createUser({
      name,
      email,
      password: hashedPassword,
    })

    // Generate JWT token
    const token = generateToken(user.id, user.email)

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }
  },

  loginUser: async (email: string, password: string): Promise<AuthResult> => {
    // Check if user already exists
    const user = await userDao.findUserByEmail(email)
    if (!user) {
      throw new Error('Invalid email or password')
    }
    // chek if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email)

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }
  },

  registerUserWithInvitation: async (
    request: RegisterWithInvitationRequest
  ): Promise<AuthWithInvitationResult> => {
    const { name, email, password, invitationId } = request

    // Validate invitation if provided
    if (invitationId) {
      const invitation = await invitationDao.getInvitation(invitationId)

      if (!invitation) {
        throw new Error('Invalid or expired invitation')
      }

      if (invitation.email !== email) {
        throw new Error('Email does not match invitation')
      }
    }

    // Check if user already exists
    const existingUser = await userDao.findUserByEmail(email)
    if (existingUser) {
      throw new Error('USER_EXISTS')
    }

    // Create user
    const newUser = await userDao.createUser({ name, email, password })

    // Generate JWT token
    const token = generateToken(newUser.id, newUser.email)
    const result: AuthWithInvitationResult = {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    }

    // accept invitation
    if (invitationId) {
      try {
        const acceptResult =
          await invitationService.acceptInvitationAfterRegistration(
            invitationId,
            newUser.id,
            newUser.email
          )

        if (acceptResult.success) {
          result.workspace = acceptResult.workspace
          result.invitationAccepted = true
        } else {
          console.warn(
            `Failed to auto-accept invitation for user ${newUser.id}:`,
            acceptResult.error
          )
          result.invitationAccepted = false
        }
      } catch (error) {
        console.error('Error processing invitation after registration:', error)
        result.invitationAccepted = false
      }
    }

    return result
  },
}

export default authService
