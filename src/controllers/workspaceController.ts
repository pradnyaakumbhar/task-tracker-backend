import { Response } from "express";
import workspaceService from "../services/workspaceService";
import generateNumbers from "../utils/generateNumbers";
import { AuthRequest } from "../types/authTypes";

const workspaceController = {
    createWorkspace : async (req:  AuthRequest, res: Response) => {
        try {
            const { name, description, memberEmails = [] } = req.body;
            const ownerId = req.user!.userId;
            // validation
            if(!name) {
                return res.status(400).json({ error: 'Workspace name is required' });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            for (const email of memberEmails) {
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ error: `Invalid email format: ${email}` });
                }
            }
            // generate workspace no... WS1, WS2
            const number = generateNumbers.generateWorkspaceNumber()

            const workspace = await workspaceService.createWorkspaceWithInvites(
                name,
                description || '',
                ownerId,
                memberEmails
            );
            res.status(200).json({
                message: 'Workspace created successfully',
                workspace: {
                    id: workspace.id,
                    name: workspace.name,
                    workspaceNumber: workspace.number
                }
            });
        } catch (error) {
            console.error('Create workspace error:', error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
}

export default workspaceController;