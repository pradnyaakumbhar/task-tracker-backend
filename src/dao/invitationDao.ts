import prisma from '../utils/prisma'

export interface CreateInvitationData {
  email: string
  workspaceId: string
}

const invitationDao = {
  createInvitation: async (data: CreateInvitationData) => {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    return await prisma.invitation.create({
      data: {
        email: data.email,
        workspaceId: data.workspaceId,
        expiresAt,
        status: 'PENDING',
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            number: true,
            owner: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })
  },

  findExistingInvitation: async (email: string, workspaceId: string) => {
    return await prisma.invitation.findFirst({
      where: {
        email,
        workspaceId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    })
  },
}

export default invitationDao
