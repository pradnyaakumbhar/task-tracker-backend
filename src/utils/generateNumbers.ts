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

  async generateSpaceNumber(workspaceId: string): Promise<string> {
    const spaces = await prisma.space.findMany({
      where: { 
        workspaceId,
        spaceNumber: {
          startsWith: 'S'
        }
      },
      select: { spaceNumber: true },
      orderBy: { spaceNumber: 'desc' },
      take: 1
    })
  
    if (spaces.length === 0) {
      return 'S1'
    }
  
    const latestNumber = parseInt(spaces[0].spaceNumber.substring(1))
    return `S${latestNumber + 1}`
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
