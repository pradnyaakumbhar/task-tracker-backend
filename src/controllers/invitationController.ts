import invitationService from "../services/invitationServices";
import { Request, Response } from 'express';
import { AuthRequest } from '../types/authTypes';
import { isValidEmail } from '../utils/validators';

const invitationcontroller = {
    sendInvitation: async (req: AuthRequest, res: Response) => {
        try {
          const { email, workspaceId, workspaceName } = req.body;
          const sender = req.user!;
    
          // Validation
          if (!email || !workspaceId || !workspaceName) {
            return res.status(400).json({
              error: 'Email, workspaceId, and workspaceName are required'
            });
          }
    
          if (!isValidEmail(email)) {
            return res.status(400).json({
              error: 'Invalid email address'
            });
          }
    
          const result = await invitationService.createAndSendInvitation({
            email,
            workspaceId,
            workspaceName,
            senderName: sender.name,
            senderId: sender.userId
          });
    
          if (!result.success) {
            return res.status(400).json({
              error: result.error
            });
          }
    
          res.status(201).json({
            message: 'Invitation sent successfully',
            invitationId: result.invitationId
          });
    
        } catch (error: any) {
          console.error('Send invitation error:', error);
          res.status(500).json({
            error: 'Failed to send invitation'
          });
        }
      },
}

export default invitationcontroller