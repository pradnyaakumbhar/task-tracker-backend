import { Workspace } from '../generated/prisma';
import prisma from '../utils/prisma';
import generateNumbers from "../utils/generateNumbers";

export interface CreateWorkspaceData {
  name: string;
  description?: string;
  ownerId: string;
  memberEmails: string[];
}

const workspaceDao = {
    createWorkspace : async (data: CreateWorkspaceData) => {
        const number = await generateNumbers.generateWorkspaceNumber();
        return await prisma.workspace.create({
            data: {
                name: data.name,
                description: data.description,
                number: number,
                ownerId: data.ownerId,
                memberEmails: data.memberEmails,
            },
            include: {
                owner: { select: { id: true, name: true, email: true } },
                members: { select: { id: true, name: true, email: true } },
                _count: { select: { spaces: true } }
            }
        });
    },

    findWorkspaceByNumber : async (number: string) => {
        return await prisma.workspace.findUnique({
            where: { number }
        });
    },

    findWorkspaceById : async (workspaceId: string) => {
        return await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                owner: { select: { id: true, name: true, email: true } },
                members: { select: { id: true, name: true, email: true } },
                spaces: {
                    include: {
                    _count: { select: { tasks: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                _count: { select: { spaces: true, members: true } }
            }
        });
    },

    findWorkspacesByUserId : async (userId: string) => {
        return await prisma.workspace.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { id: userId } } }
                ]
            },
            include: {
                owner: { select: { id: true, name: true, email: true } },
                members: { select: { id: true, name: true, email: true } },
                spaces: {
                    select: {
                    id: true,
                    name: true,
                    _count: { select: { tasks: true } }
                    }
                },
                _count: { select: { spaces: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    addMembersToWorkspace : async (workspaceId: string, userIds: string[]) => {
        return await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                members: {
                    connect: userIds.map(id => ({ id }))
                }
            },
            include: {
                members: { select: { id: true, name: true, email: true } }
            }
        });
    },

    checkUserWorkspaceAccess : async (userId: string, workspaceId: string) => {
        const workspace = await prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                OR: [
                    { ownerId: userId },
                    { members: { some: { id: userId } } }
                ]
            }
        });
        return !!workspace;
    },

    isUserWorkspaceOwner : async (userId: string, workspaceId: string) => {
        const workspace = await prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                ownerId: userId
            }
        });
        return !!workspace;
    }
}

export default workspaceDao;