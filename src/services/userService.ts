import userDao from "../dao/userDao";

const userService = {
    getUserProfile : async (userId: string) => {
        return await userDao.findUserById(userId);
    }
}

export default userService