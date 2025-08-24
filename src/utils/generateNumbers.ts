import prisma from './prisma'

const generateNumbers = {
  async generateWorkspaceNumber(): Promise<string> {
    const result = await prisma.$queryRaw<
      [{ nextval: bigint }]
    >`SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 3) AS INTEGER)), 0) + 1 as nextval 
        FROM workspaces 
        WHERE number ~ '^WS[0-9]+$' `

    const nextNumber = Number(result[0].nextval)
    return `WS${nextNumber}`
  },

  async generateSpaceNumber(workspaceId: string): Promise<number> {
    const result = await prisma.space.aggregate({
      where: { workspaceId },
      _max: { spaceNumber: true },
    })

    return (result._max.spaceNumber || 0) + 1
  },

  formatSpaceNumber(spaceNumber: number): string {
    return `S${spaceNumber}`
  },

  async generateTaskNumber(spaceId: string): Promise<number> {
    const result = await prisma.task.aggregate({
      where: { spaceId },
      _max: { taskNumber: true },
    })

    return (result._max.taskNumber || 0) + 1
  },

  formatTaskNumber(taskNumber: number): string {
    return `T${taskNumber}`
  },
}

export default generateNumbers
