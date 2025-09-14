import { Workspace } from '../generated/prisma'
import prisma from '../utils/prisma'
import generateNumbers from '../utils/generateNumbers'

export interface CreateWorkspaceData {
  name: string
  description?: string
  ownerId: string
  memberEmails: string[]
}

const workspaceDao = {
  createWorkspace: async (data: CreateWorkspaceData) => {
    const number = await generateNumbers.generateWorkspaceNumber()
    return await prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description,
        number: number,
        ownerId: data.ownerId,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true } },
        _count: { select: { spaces: true } },
      },
    })
  },

  findWorkspaceByNumber: async (number: string) => {
    return await prisma.workspace.findUnique({
      where: { number },
    })
  },

  findWorkspaceById: async (workspaceId: string) => {
    return await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true } },
        spaces: {
          include: {
            _count: { select: { tasks: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { spaces: true, members: true } },
      },
    })
  },

  findWorkspacesByUserId: async (userId: string) => {
    return await prisma.workspace.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true } },
        spaces: {
          select: {
            id: true,
            name: true,
            _count: { select: { tasks: true } },
          },
        },
        _count: { select: { spaces: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  addMembersToWorkspace: async (workspaceId: string, userIds: string[]) => {
    return await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        members: {
          connect: userIds.map((id) => ({ id })),
        },
      },
      include: {
        members: { select: { id: true, name: true, email: true } },
      },
    })
  },

  checkUserWorkspaceAccess: async (userId: string, workspaceId: string) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
      },
    })
    return !!workspace
  },

  checkUserWorkspaceAccessByEmail: async (
    email: string,
    workspaceId: string
  ): Promise<boolean> => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [{ owner: { email } }, { members: { some: { email } } }],
      },
    })

    return !!workspace
  },

  isUserWorkspaceOwner: async (userId: string, workspaceId: string) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        ownerId: userId,
      },
    })
    return !!workspace
  },

  findSpacesByWorkspaceId: async (workspaceId: string) => {
    return await prisma.space.findMany({
      where: { workspaceId },
      include: {
        workspace: { select: { number: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { spaceNumber: 'asc' },
    })
  },

  getTodayDueTasks: async (workspaceId: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    return await prisma.task.findMany({
      where: {
        dueDate: {
          gte: today,
          lte: endOfDay,
        },
        space: {
          workspaceId: workspaceId,
        },
        status: {
          not: 'DONE',
        },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true, email: true } },
        space: {
          select: {
            id: true,
            name: true,
            spaceNumber: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    })
  },

  getUpcomingTasks: async (workspaceId: string, days: number = 7) => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const futureDate = new Date(today)
    futureDate.setDate(futureDate.getDate() + days)
    futureDate.setHours(23, 59, 59, 999)

    return await prisma.task.findMany({
      where: {
        dueDate: {
          gt: today,
          lte: futureDate,
        },
        space: {
          workspaceId: workspaceId,
        },
        status: {
          not: 'DONE',
        },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true, email: true } },
        space: {
          select: {
            id: true,
            name: true,
            spaceNumber: true,
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
    })
  },

  getWorkspaceTasksWithStatus: async (workspaceId: string) => {
    return await prisma.space.findMany({
      where: {
        workspaceId: workspaceId,
      },
      select: {
        id: true,
        name: true,
        spaceNumber: true,
        _count: {
          select: {
            tasks: true,
          },
        },
        tasks: {
          select: {
            status: true,
          },
        },
      },
    })
  },
}

export default workspaceDao
