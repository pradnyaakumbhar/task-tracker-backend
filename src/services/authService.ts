import jwt from 'jsonwebtoken'
import userDao from '../dao/userDao'
import bcrypt from 'bcryptjs'
import invitationService from './invitationServices'
import invitationDao from '../dao/invitationDao'

const JWT_SECRET = process.env.JWT_SECRET as string

interface AuthResult {
  success: boolean
  token: string
  user: { id: string; name: string; email: string }
}

interface AuthWithInvitationResult extends AuthResult {
  workspace?: any
  invitationAccepted?: boolean
}

const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })
}

const authService = {
  verifyToken: (token: string): any => {
    return jwt.verify(token, JWT_SECRET)
  },

  loginUser: async (request: {
    email: string
    password: string
    invitationId?: string
  }): Promise<AuthWithInvitationResult> => {
    const { email, password, invitationId } = request

    const user = await userDao.findUserByEmail(email)
    if (!user) throw new Error('Invalid email or password')

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) throw new Error('Invalid email or password')

    const token = generateToken(user.id, user.email)

    const result: AuthWithInvitationResult = {
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    }

    if (invitationId) {
      try {
        const acceptResult = await invitationService.acceptInvitation(
          invitationId,
          user.id,
          user.email
        )
        if (acceptResult.success) {
          result.workspace = acceptResult.workspace
          result.invitationAccepted = true
        }
      } catch (error) {
        console.error('Error processing invitation after login:', error)
      }
    }

    return result
  },

  registerUser: async (request: {
    name: string
    email: string
    password: string
    invitationId?: string
  }): Promise<AuthWithInvitationResult> => {
    const { name, email, password, invitationId } = request

    if (invitationId) {
      const invitation = await invitationDao.getInvitation(invitationId)
      if (!invitation) throw new Error('Invalid or expired invitation')
      if (invitation.email !== email)
        throw new Error('Email does not match invitation')
    }

    const existingUser = await userDao.findUserByEmail(email)
    if (existingUser) throw new Error('User with this email already exists')

    const hashedPassword = await bcrypt.hash(password, 12)
    const newUser = await userDao.createUser({
      name,
      email,
      password: hashedPassword,
    })

    const token = generateToken(newUser.id, newUser.email)

    const result: AuthWithInvitationResult = {
      success: true,
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    }

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
        }
      } catch (error) {
        console.error('Error processing invitation after registration:', error)
      }
    }

    return result
  },
}

export default authService
