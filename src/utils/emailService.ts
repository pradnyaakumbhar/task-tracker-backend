import nodemailer from 'nodemailer'
import {
  getExistingUserInvitationTemplate,
  getNewUserInvitationTemplate,
  getDueDateReminderTemplate,
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

interface TaskReminderData {
  taskId: string
  taskTitle: string
  taskNumber: string
  dueDate: Date
  assigneeEmail: string
  assigneeName: string
  reporterEmail?: string
  reporterName?: string
  workspaceName: string
  spaceName: string
  workspaceNumber: string
  spaceNumber: string
}

const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
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

export const sendDueDateReminder = async (
  taskData: TaskReminderData,
  daysLeft: number
): Promise<{ assigneeSent: boolean; reporterSent: boolean }> => {
  const results = { assigneeSent: false, reporterSent: false }

  try {
    const transporter = createTransporter()

    // Send reminder to assignee
    if (taskData.assigneeEmail) {
      try {
        const assigneeTemplate = getDueDateReminderTemplate(
          taskData.taskTitle,
          taskData.taskNumber,
          taskData.dueDate,
          taskData.workspaceName,
          taskData.spaceName,
          taskData.workspaceNumber,
          taskData.spaceNumber,
          taskData.assigneeName,
          'assignee',
          taskData.assigneeName,
          daysLeft
        )

        const assigneeMailOptions: EmailOptions = {
          from: `${process.env.FROM_NAME || 'Task Tracker'} <${
            process.env.FROM_EMAIL || EMAIL_CONFIG.auth.user
          }>`,
          to: taskData.assigneeEmail,
          subject: assigneeTemplate.subject,
          html: assigneeTemplate.html,
          text: assigneeTemplate.text,
        }

        const assigneeResult = await transporter.sendMail(assigneeMailOptions)
        results.assigneeSent = true

        console.log(
          `Due date reminder sent to assignee ${taskData.assigneeEmail}`,
          {
            messageId: assigneeResult.messageId,
            taskId: taskData.taskId,
            role: 'assignee',
            daysLeft,
          }
        )
      } catch (error) {
        console.error(
          `Failed to send reminder to assignee ${taskData.assigneeEmail}:`,
          error
        )
      }
    }

    // Send reminder to reporter (if different from assignee)
    if (
      taskData.reporterEmail &&
      taskData.reporterName &&
      taskData.reporterEmail !== taskData.assigneeEmail
    ) {
      try {
        const reporterTemplate = getDueDateReminderTemplate(
          taskData.taskTitle,
          taskData.taskNumber,
          taskData.dueDate,
          taskData.workspaceName,
          taskData.spaceName,
          taskData.workspaceNumber,
          taskData.spaceNumber,
          taskData.reporterName,
          'reporter',
          taskData.assigneeName,
          daysLeft
        )

        const reporterMailOptions: EmailOptions = {
          from: `${process.env.FROM_NAME || 'Task Tracker'} <${
            process.env.FROM_EMAIL || EMAIL_CONFIG.auth.user
          }>`,
          to: taskData.reporterEmail,
          subject: reporterTemplate.subject,
          html: reporterTemplate.html,
          text: reporterTemplate.text,
        }

        const reporterResult = await transporter.sendMail(reporterMailOptions)
        results.reporterSent = true

        console.log(
          `Due date reminder sent to reporter ${taskData.reporterEmail}`,
          {
            messageId: reporterResult.messageId,
            taskId: taskData.taskId,
            role: 'reporter',
            daysLeft,
          }
        )
      } catch (error) {
        console.error(
          `Failed to send reminder to reporter ${taskData.reporterEmail}:`,
          error
        )
      }
    }

    return results
  } catch (error) {
    console.error(
      `Failed to send due date reminders for task ${taskData.taskId}:`,
      error
    )
    return results
  }
}

// export const sendEmail = async (options: {
//   to: string
//   subject: string
//   html: string
//   text: string
// }): Promise<boolean> => {
//   try {
//     const transporter = createTransporter()

//     const mailOptions: EmailOptions = {
//       from: `${process.env.FROM_NAME || 'Task Tracker'} <${
//         process.env.FROM_EMAIL || EMAIL_CONFIG.auth.user
//       }>`,
//       to: options.to,
//       subject: options.subject,
//       html: options.html,
//       text: options.text,
//     }

//     const result = await transporter.sendMail(mailOptions)
//     console.log(`Email sent successfully to ${options.to}`, {
//       messageId: result.messageId,
//     })

//     return true
//   } catch (error) {
//     console.error(`Failed to send email to ${options.to}:`, error)
//     return false
//   }
// }
