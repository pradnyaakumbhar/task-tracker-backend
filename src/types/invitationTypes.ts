// export interface InvitationData {
//   id: string
//   email: string
//   workspaceId: string
//   workspaceName: string
//   senderName: string
//   senderId: string
//   status: 'pending' | 'accepted' | 'declined' | 'expired'
//   createdAt: string
//   expiresAt: string
// }

// export interface CreateInvitationRequest {
//   email: string;
//   workspaceId: string;
//   workspaceName: string;
// }

// export interface InvitationHandleResponse {
//   success: boolean;
//   action: 'workspace_added' | 'login_required' | 'register_required' | 'email_mismatch';
//   invitation?: InvitationData;
//   user?: {
//     id: string;
//     name: string;
//     email: string;
//   };
//   error?: string;
// }

// export interface InvitationResult {
//   success: boolean;
//   invitationId?: string;
//   error?: string;
// }

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface InvitationData {
  id: string
  email: string
  workspaceId: string
  workspaceName: string
  senderName: string
  senderId: string
  status: InvitationStatus
  createdAt: string
  expiresAt: string
  userExists?: boolean
  workspaceNumber?: string
}

export interface InvitationResult {
  success: boolean
  invitationId?: string
  error?: string
  userExists?: boolean
}

export interface AcceptInvitationResult {
  success: boolean
  error?: string
  workspace?: any
}

export interface JoinInvitationResult {
  action: 'register' | 'login' | 'accepted' | 'expired' | 'error'
  invitation?: InvitationData
  workspace?: any
  workspaceNumber?: string
  error?: string
  message?: string
}
