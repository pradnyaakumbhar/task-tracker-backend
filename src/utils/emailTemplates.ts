// export const getInvitationEmailTemplate = (
//   workspaceName: string,
//   senderName: string,
//   invitationLink: string
// ) => {
//   return {
//     subject: `You're invited to join ${workspaceName}`,
//     html: `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="utf-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Workspace Invitation</title>
//         <style>
//           body {
//             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//             line-height: 1.6;
//             color: #333;
//             background-color: #f4f4f4;
//             margin: 0;
//             padding: 20px;
//           }
//           .container {
//             max-width: 600px;
//             margin: 0 auto;
//             background: white;
//             border-radius: 10px;
//             box-shadow: 0 0 20px rgba(0,0,0,0.1);
//             overflow: hidden;
//           }
//           .header {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             padding: 30px;
//             text-align: center;
//           }
//           .header h1 {
//             margin: 0;
//             font-size: 28px;
//             font-weight: 300;
//           }
//           .content {
//             padding: 40px 30px;
//           }
//           .workspace-info {
//             background: #f8f9fa;
//             border-radius: 8px;
//             padding: 20px;
//             margin: 20px 0;
//             border-left: 4px solid #667eea;
//           }
//           .cta-button {
//             display: inline-block;
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             padding: 15px 30px;
//             text-decoration: none;
//             border-radius: 8px;
//             font-weight: bold;
//             margin: 20px 0;
//             transition: transform 0.2s;
//           }
//           .cta-button:hover {
//             transform: translateY(-2px);
//           }
//           .footer {
//             background: #f8f9fa;
//             padding: 20px 30px;
//             text-align: center;
//             color: #666;
//             font-size: 14px;
//           }
//           .link-fallback {
//             background: #f8f9fa;
//             padding: 15px;
//             border-radius: 5px;
//             margin: 20px 0;
//             word-break: break-all;
//             font-family: monospace;
//             font-size: 12px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>You're Invited!</h1>
//           </div>

//           <div class="content">
//             <p>Hi there!</p>

//             <p><strong>${senderName}</strong> has invited you to join their workspace:</p>

//             <div class="workspace-info">
//               <h3 style="margin: 0 0 10px 0; color: #667eea;">📋 ${workspaceName}</h3>
//               <p style="margin: 0; color: #666;">Join this workspace to build together.</p>
//             </div>

//             <p>Click the button below to accept the invitation and get started:</p>

//             <div style="text-align: center;">
//               <a href="${invitationLink}" class="cta-button">Accept Invitation</a>
//             </div>

//             <p style="color: #666; font-size: 14px;">
//               If the button doesn't work, you can copy and paste this link into your browser:
//             </p>

//             <div class="link-fallback">
//               ${invitationLink}
//             </div>

//             <p style="color: #666; font-size: 14px;">
//               ⏰ This invitation will expire in 7 days.
//             </p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `,
//     text: `
//       You're invited to join ${workspaceName}!

//       ${senderName} has invited you to collaborate in their workspace: ${workspaceName}

//       To accept this invitation, visit: ${invitationLink}

//       This invitation will expire in 7 days.

//       If you weren't expecting this email, you can safely ignore it.
//     `
//   };
// };

// emailTemplates.ts - Different templates for existing vs new users
interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export const getExistingUserInvitationTemplate = (
  workspaceName: string,
  senderName: string,
  invitationLink: string
): EmailTemplate => {
  return {
    subject: `You're invited to join ${workspaceName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Workspace Invitation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
          .content { padding: 40px 30px; }
          .workspace-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; transition: transform 0.2s; }
          .cta-button:hover { transform: translateY(-2px); }
          .login-notice { background: #e3f2fd; border: 1px solid #2196f3; border-radius: 8px; padding: 15px; margin: 20px 0; color: #1565c0; }
          .link-fallback { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; word-break: break-all; font-family: monospace; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You're Invited!</h1>
          </div>
          <div class="content">
            <p>Hi there!</p>
            <p><strong>${senderName}</strong> has invited you to join their workspace:</p>
            <div class="workspace-info">
              <h3 style="margin: 0 0 10px 0; color: #667eea;">📋 ${workspaceName}</h3>
              <p style="margin: 0; color: #666;">Join this workspace to collaborate with your team.</p>
            </div>
            <p>Click the button below to sign in and join the workspace:</p>
            <div style="text-align: center;">
              <a href="${invitationLink}" class="cta-button color: #eee">Sign In & Join Workspace</a>
            </div>
            <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link:</p>
            <div class="link-fallback">${invitationLink}</div>
            <p style="color: #666; font-size: 14px;">⏰ This invitation will expire in 7 days.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      You're invited to join ${workspaceName}!
      
      ${senderName} has invited you to collaborate in their workspace: ${workspaceName}
      
      To join the workspace, visit: ${invitationLink}
      
      This invitation will expire in 7 days.
    `,
  }
}

// Template for new users (need to register)
export const getNewUserInvitationTemplate = (
  workspaceName: string,
  senderName: string,
  invitationLink: string
): EmailTemplate => {
  return {
    subject: `You're invited to join ${workspaceName} - Create your account`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Workspace Invitation - Create Account</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
          .content { padding: 40px 30px; }
          .workspace-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #4caf50; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; transition: transform 0.2s; }
          .cta-button:hover { transform: translateY(-2px); }
          .register-notice { background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin: 20px 0; color: #2e7d32; }
          .benefits { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .benefits ul { margin: 0; padding-left: 20px; }
          .benefits li { margin: 8px 0; color: #555; }
          .link-fallback { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; word-break: break-all; font-family: monospace; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome! You're Invited</h1>
          </div>
          <div class="content">
            <p>Hello!</p>
            <p><strong>${senderName}</strong> has invited you to join their workspace:</p>
            <div class="workspace-info">
              <h3 style="margin: 0 0 10px 0; color: #4caf50;">📋 ${workspaceName}</h3>
              <p style="margin: 0; color: #666;">Create your account and start collaborating with the team!</p>
            </div>
            <div class="register-notice">
              <strong>🎉 New to our platform?</strong> No worries! You can create your account and join the workspace in one simple step.
            </div>
            <p>Click the button below to create your account and join the workspace:</p>
            <div style="text-align: center;">
              <a href="${invitationLink}" class="cta-button">Create Account & Join Workspace</a>
            </div>
            <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link:</p>
            <div class="link-fallback">${invitationLink}</div>
            <p style="color: #666; font-size: 14px;">
              ⏰ This invitation will expire in 7 days.<br>
              💡 Already have an account? Simply sign in to join the workspace
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome! You're invited to join ${workspaceName}!
      
      ${senderName} has invited you to collaborate in their workspace: ${workspaceName}
      
      To create your account and join the workspace, visit: ${invitationLink}
      
      This invitation will expire in 7 days.
      
      Already have an account? Simply sign in when you visit the link above.
    `,
  }
}
