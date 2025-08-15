import { Request, Response } from 'express';
import userService from '../services/userService';

const userController = {
  getProfile : async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const user = await userService.getUserProfile(userId);
        
        if (!user) {
        return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default userController