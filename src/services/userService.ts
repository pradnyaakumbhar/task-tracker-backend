import userDao from "../dao/userDao";

const userService = {
    getUserProfile : async (userId: number) => {
        return await userDao.findUserById(userId);
    }
}

export default userService