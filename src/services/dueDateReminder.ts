import cron from 'node-cron'
import { sendDueDateReminder } from '../utils/emailService'
import generateNumbers from '../utils/generateNumbers'
import taskDao from '../dao/taskDao'

interface TaskWithDetails {
  id: string
  title: string
  taskNumber: number
  dueDate: Date
  assignee: {
    id: string
    name: string
    email: string
  } | null
  reporter: {
    id: string
    name: string
    email: string
  } | null
  space: {
    spaceNumber: string
    name: string
    workspace: {
      name: string
      number: string
    }
  }
}

let isRunning = false

const sendReminder = async (
  task: TaskWithDetails,
  daysLeft: number
): Promise<void> => {
  // asssignee, reporter, due date can be null in prisma schema, causing type error
  if (!task.assignee && !task.reporter && !task.dueDate) {
    return
  }

  try {
    const reminderData = {
      taskId: task.id,
      taskTitle: task.title,
      taskNumber: generateNumbers.formatTaskNumber(task.taskNumber),
      dueDate: task.dueDate,
      assigneeEmail: task.assignee?.email || '',
      assigneeName: task.assignee?.name || 'Unassigned',
      reporterEmail: task.reporter?.email,
      reporterName: task.reporter?.name,
      workspaceName: task.space.workspace.name,
      spaceName: task.space.name,
      workspaceNumber: task.space.workspace.number,
      spaceNumber: task.space.spaceNumber,
    }

    const results = await sendDueDateReminder(reminderData, daysLeft)
  } catch (error) {
    console.error(`Error sending reminder for task ${task.id}:`, error)
  }
}

export const checkDueDateReminders = async (): Promise<void> => {
  if (isRunning) {
    return
  }
  isRunning = true
  try {
    const now = new Date()

    // Calculate dates for 7 days and 1 day from now
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)

    // Set time to start and end of day
    const sevenDaysStart = new Date(sevenDaysFromNow.setHours(0, 0, 0, 0))
    const sevenDaysEnd = new Date(sevenDaysFromNow.setHours(23, 59, 59, 999))

    const oneDayStart = new Date(oneDayFromNow.setHours(0, 0, 0, 0))
    const oneDayEnd = new Date(oneDayFromNow.setHours(23, 59, 59, 999))

    // Find tasks due in 7 days
    const tasksDueIn7Days = await taskDao.getTasksDueInRange(
      sevenDaysStart,
      sevenDaysEnd
    )

    // Find tasks due in 1 day
    const tasksDueIn1Day = await taskDao.getTasksDueInRange(
      oneDayStart,
      oneDayEnd
    )

    // Send 7-day reminders
    for (const task of tasksDueIn7Days) {
      await sendReminder(task, 7)
    }

    // Send 1-day reminders
    for (const task of tasksDueIn1Day) {
      await sendReminder(task, 1)
    }

    console.log(`completed reminder check`)
  } catch (error) {
    console.error('Error in due date reminder check:', error)
  } finally {
    isRunning = false
  }
}

export const startScheduler = (): void => {
  // Run daily at 9:00 AM
  cron.schedule(
    '0 9 * * *',
    async () => {
      await checkDueDateReminders()
    },
    {
      timezone: process.env.TIMEZONE || 'UTC',
    }
  )

  console.log('Due date reminder scheduler started')
}

// export const manualCheck = async (): Promise<void> => {
//   await checkDueDateReminders()
// }
