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
}

export default spaceDao
