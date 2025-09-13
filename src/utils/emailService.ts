// import nodemailer from 'nodemailer';
// import { getInvitationEmailTemplate } from './emailTemplates'

// const EMAIL_CONFIG = {
//     host: process.env.SMTP_HOST,
//     port: parseInt(process.env.SMTP_PORT || '587'),
//     secure: false,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS
//     }
//   };

//   let transporter: nodemailer.Transporter | null = null;

//   const createTransporter = () => {
//     if (!transporter) {
//       transporter = nodemailer.createTransport(EMAIL_CONFIG);
//     }
//     return transporter;
//   };

//   export const sendInvitationEmail = async (
//     email: string,
//     workspaceName: string,
//     senderName: string,
//     invitationId: string
//   ): Promise<boolean> => {
//     try {
//       const transporter = createTransporter();

//       const invitationLink = `${process.env.CLIENT_URL}/invitation/${invitationId}`;

//       // Get email template
//       const emailTemplate = getInvitationEmailTemplate(
//         workspaceName,
//         senderName,
//         invitationLink
//       );

//       // Email options
//       const mailOptions = {
//         from: `${process.env.FROM_NAME || 'Your App Name'} <${process.env.FROM_EMAIL || EMAIL_CONFIG.auth.user}>`,
//         to: email,
//         subject: emailTemplate.subject,
//         html: emailTemplate.html,
//         text: emailTemplate.text
//       };

//       // Send email
//       const result = await transporter.sendMail(mailOptions);

//       console.log(`Invitation email sent successfully to ${email}`, {
//         messageId: result.messageId,
//         workspaceName,
//         invitationId
//       });

//       return true;

//     } catch (error) {
//       console.error(`Failed to send invitation email to ${email}:`, error);
//       return false;
//     }
//   };

import nodemailer from 'nodemailer'
import {
  getExistingUserInvitationTemplate,
  getNewUserInvitationTemplate,
} from './emailTemplates'

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface EmailOptions {
  from: string
  to: string
  subject: string
  html: string
  text: string
}

const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // Convert string to boolean
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}

let transporter: nodemailer.Transporter | null = null

const createTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport(EMAIL_CONFIG)

    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('Email transporter verification failed:', error)
      } else {
        console.log('Email server is ready to send messages')
      }
    })
  }
  return transporter
}

// Enhanced function with user existence parameter
export const sendInvitationEmail = async (
  email: string,
  workspaceName: string,
  senderName: string,
  invitationId: string,
  userExists: boolean = false
): Promise<boolean> => {
  try {
    const transporter = createTransporter()

    const invitationLink = `${process.env.CLIENT_URL}/invitation/${invitationId}`

    // Get email template based on if user exist in db or not
    const emailTemplate = userExists
      ? getExistingUserInvitationTemplate(
          workspaceName,
          senderName,
          invitationLink
        )
      : getNewUserInvitationTemplate(workspaceName, senderName, invitationLink)

    const mailOptions: EmailOptions = {
      from: `${process.env.FROM_NAME || 'Task Tracker'} <${
        process.env.FROM_EMAIL || EMAIL_CONFIG.auth.user
      }>`,
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    }

    const result = await transporter.sendMail(mailOptions)

    console.log(
      `${
        userExists ? 'Login' : 'Registration'
      } invitation email sent to ${email}`,
      {
        messageId: result.messageId,
        workspaceName,
        invitationId,
        userExists,
      }
    )

    return true
  } catch (error) {
    console.error(`Failed to send invitation email to ${email}:`, error)
    return false
  }
}

export const sendEmail = async (options: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<boolean> => {
  try {
    const transporter = createTransporter()

    const mailOptions: EmailOptions = {
      from: `${process.env.FROM_NAME || 'Task Tracker'} <${
        process.env.FROM_EMAIL || EMAIL_CONFIG.auth.user
      }>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`Email sent successfully to ${options.to}`, {
      messageId: result.messageId,
    })

    return true
  } catch (error) {
    console.error(`Failed to send email to ${options.to}:`, error)
    return false
  }
}
