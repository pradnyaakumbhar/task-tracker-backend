import { User } from '../generated/prisma';
import prisma from '../utils/prisma';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

const userDao = {
    createUser : async (userData: CreateUserData): Promise<User> => {
        return await prisma.user.create({
            data: userData
        });
    },

    findUserByEmail : async (email: string): Promise<User | null> => {
        return await prisma.user.findUnique({
            where: { email }
        });
    }
};

export default userDao;