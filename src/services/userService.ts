import userDao from '../dao/userDao'

interface UserWithoutPassword {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

const userService = {
  getUserProfile: async (
    userId: string
  ): Promise<UserWithoutPassword | null> => {
    return await userDao.findUserById(userId)
  },

  getUserWorkspaces: async (userId: string) => {
    return await userDao.findWorkspacesByUserId(userId)
  },
}

export default userService
