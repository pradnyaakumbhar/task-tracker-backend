import nodemailer from 'nodemailer';
import {getInvitationEmailTemplate} from './emailTemplates';

const EMAIL_CONFIG = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };

  let transporter: nodemailer.Transporter | null = null;

  const createTransporter = () => {
    if (!transporter) {
      transporter = nodemailer.createTransport(EMAIL_CONFIG);
    }
    return transporter;
  };

  export const sendInvitationEmail = async (
    email: string,
    workspaceName: string,
    senderName: string,
    invitationId: string
  ): Promise<boolean> => {
    try {
      const transporter = createTransporter();

      const invitationLink = `${process.env.CLIENT_URL}/invitation/${invitationId}`;
      
      // Get email template
      const emailTemplate = getInvitationEmailTemplate(
        workspaceName,
        senderName,
        invitationLink
      );
      
      // Email options
      const mailOptions = {
        from: `${process.env.FROM_NAME || 'Your App Name'} <${process.env.FROM_EMAIL || EMAIL_CONFIG.auth.user}>`,
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      };
      
      // Send email
      const result = await transporter.sendMail(mailOptions);
      
      console.log(`Invitation email sent successfully to ${email}`, {
        messageId: result.messageId,
        workspaceName,
        invitationId
      });
      
      return true;
      
    } catch (error) {
      console.error(`Failed to send invitation email to ${email}:`, error);
      return false;
    }
  };
  