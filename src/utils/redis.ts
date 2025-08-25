import { createClient, RedisClientType } from 'redis'

let client: any | RedisClientType = null

export const connectRedis = async () => {
  try {
    // Create client
    client = createClient({})

    client.on('error', (err: any) => {
      console.log('Redis Client Error', err)
    })

    // Connect to Redis
    await client.connect()

    return client
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    throw error
  }
}

export const getRedisClient = (): RedisClientType => {
  if (!client) {
    throw new Error('Redis client not initialized')
  }
  return client
}

export const disconnectRedis = async () => {
  try {
    if (client && client.isOpen) {
      await client.quit()
      client = null
      console.log('Redis disconnected')
    }
  } catch (error) {
    console.error('Error disconnecting Redis:', error)
  }
}
