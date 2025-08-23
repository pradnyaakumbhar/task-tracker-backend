import generateNumbers from '../utils/generateNumbers'
import prisma from '../utils/prisma'

export interface CreateSpaceData {
  name: string
  description?: string
  workspaceId: string
}

const spaceDao = {
  createSpace: async (data: CreateSpaceData) => {
    // Generate space number in workspace
    const spaceNumber = await generateNumbers.generateSpaceNumber(
      data.workspaceId
    )

    return await prisma.space.create({
      data: {
        name: data.name,
        description: data.description,
        spaceNumber: spaceNumber,
        workspaceId: data.workspaceId,
      },
      include: {
        workspace: { select: { id: true, name: true, number: true } },
        _count: { select: { tasks: true } },
      },
    })
  },

  findSpaceById: async (spaceId: string) => {
    return await prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            number: true,
            ownerId: true,
            members: { select: { id: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
    })
  },

  findTasksBySpaceId: async (spaceId: string) => {
    return await prisma.task.findMany({
      where: { spaceId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        reporter: { select: { id: true, name: true, email: true } },
        space: {
          select: {
            id: true,
            name: true,
            spaceNumber: true,
            workspace: { select: { id: true, name: true, number: true } },
          },
        },
      },
      orderBy: { taskNumber: 'asc' },
    })
  },

  deleteSpace: async (spaceId: string) => {
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
      select: { spaceNumber: true, workspaceId: true },
    })

    if (!space) {
      throw new Error('Space not found')
    }

    await prisma.space.delete({
      where: { id: spaceId },
    })

    return { message: 'Space deleted successfully' }
  },

  updateSpace: async (spaceId: string, data: Partial<CreateSpaceData>) => {
    return await prisma.space.update({
      where: { id: spaceId },
      data,
      include: {
        workspace: { select: { id: true, name: true, number: true } },
        _count: { select: { tasks: true } },
      },
    })
  },
}

export default spaceDao
