import { User } from '../generated/prisma';
import prisma from '../utils/prisma';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

interface UserWithoutPassword {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const userDao = {
    createUser : async (userData: CreateUserData): Promise<User> => {
        return await prisma.user.create({
            data: userData,
        });
    },

    findUserByEmail : async (email: string): Promise<User | null> => {
        return await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                createdAt: true,
                updatedAt: true
            }
        });
    },

    findUserById : async (id: string): Promise<UserWithoutPassword | null> => {
        return await prisma.user.findUnique({
            where: { id },
            select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true
            }
        });
    },

    findUsersByEmails : async (emails: string[]) => {
        return await prisma.user.findMany({
            where: {
                email: { in: emails }
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });
    },

    updateUser : async (id: string, data: Partial<CreateUserData>): Promise<User> => {
        return await prisma.user.update({
            where: { id },
            data
        });
    },

    deleteUser : async (id: string): Promise<User> => {
        return await prisma.user.delete({
            where: { id }
        });
    },

    findAllUsers : async (): Promise<UserWithoutPassword[]> => {
        return await prisma.user.findMany({
            select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true
            }
        });
    }
};

export default userDao;