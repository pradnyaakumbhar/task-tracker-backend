import userDao from "../dao/userDao";

const userService = {
    getUserProfile : async (userId: string) => {
        return await userDao.findUserById(userId);
    },

    getUserWorkspaces : async (userId: string) => {
        return await userDao.findWorkspacesByUserId(userId);
    }
}

export default userService