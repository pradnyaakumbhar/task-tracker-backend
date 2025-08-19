import { Request, Response } from 'express';
import userService from '../services/userService';
import { AuthRequest } from '../middleware/authMiddleware';

const userController = {
  getProfile : async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const user = await userService.getUserProfile(userId);
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
          message: 'Profile fetched successfully',
          user
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
  },

  getWorkspaces : async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const workspaces = await userService.getUserWorkspaces(userId);
      
      res.status(200).json({
        message: 'Workspaces fetched successfully',
        workspaces
      });
    } catch (error) {
      console.error('Get workspaces error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default userController