import { User } from '../generated/prisma'
import prisma from '../utils/prisma'

interface CreateUserData {
  name: string
  email: string
  password: string
}

interface UserWithoutPassword {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

const userDao = {
  createUser: async (userData: CreateUserData): Promise<User> => {
    return await prisma.user.create({
      data: userData,
    })
  },

  findUserByEmail: async (email: string): Promise<User | null> => {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  },

  findUserById: async (id: string): Promise<UserWithoutPassword | null> => {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  },

  findUsersByEmails: async (emails: string[]) => {
    return await prisma.user.findMany({
      where: {
        email: { in: emails },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })
  },

  updateUser: async (
    id: string,
    data: Partial<CreateUserData>
  ): Promise<User> => {
    return await prisma.user.update({
      where: { id },
      data,
    })
  },

  deleteUser: async (id: string): Promise<User> => {
    return await prisma.user.delete({
      where: { id },
    })
  },

  findWorkspacesByUserId: async (userId: string) => {
    return await prisma.workspace.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
      },
      include: {
        spaces: {
          select: {
            id: true,
            name: true,
            spaceNumber: true,
            _count: { select: { tasks: true } },
          },
        },
        _count: { select: { spaces: true, members: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },
}

export default userDao
