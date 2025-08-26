export interface InvitationData {
  id: string
  email: string
  workspaceId: string
  workspaceName: string
  senderName: string
  senderId: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: string
  expiresAt: string
}

export interface CreateInvitationRequest {
  email: string;
  workspaceId: string;
  workspaceName: string;
}

export interface InvitationHandleResponse {
  success: boolean;
  action: 'workspace_added' | 'login_required' | 'register_required' | 'email_mismatch';
  invitation?: InvitationData;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
}

export interface InvitationResult {
  success: boolean;
  invitationId?: string;
  error?: string;
}
