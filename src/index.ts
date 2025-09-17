import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import prisma from './utils/prisma'
import routes from './routes/index'
import { connectRedis, disconnectRedis } from './utils/redis'
import { startScheduler } from './services/dueDateReminder'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

const connectDB = async () => {
  try {
    await prisma.$connect()
    await connectRedis()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exit(1)
  }
}

connectDB()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/api', routes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

startScheduler()
process.on('SIGINT', async () => {
  console.log('\n Shutting down...')
  await prisma.$disconnect()
  await disconnectRedis()
  process.exit(0)
})
// app.post('/api/trigger-reminders', async (req, res) => {
//   try {
//     await manualCheck()
//     res.json({ message: 'Due date reminder check triggered successfully' })
//   } catch (error) {
//     console.error('Error triggering reminder check:', error)
//   }
// })
