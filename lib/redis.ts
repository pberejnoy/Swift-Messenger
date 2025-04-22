import { Redis } from "ioredis"

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

// Message-related functions
export async function addMessage(channelId: string, message: any) {
  try {
    const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    await redis.hset(`message:${messageId}`, {
      ...message,
      timestamp: Date.now(),
    })
    await redis.zadd(`channel:${channelId}:messages`, {
      score: Date.now(),
      member: messageId,
    })
    return messageId
  } catch (error) {
    console.error(`Error adding message to channel ${channelId}:`, error)
    throw error
  }
}

export async function getChannelMessages(channelId: string, limit = 50, offset = 0) {
  try {
    const messageIds = await redis.zrange(`channel:${channelId}:messages`, offset, offset + limit - 1, { rev: true })

    const messages = []
    for (const id of messageIds) {
      const message = await redis.hgetall(`message:${id}`)
      if (message) {
        messages.push({ id, ...message })
      }
    }

    return messages
  } catch (error) {
    console.error(`Error getting messages for channel ${channelId}:`, error)
    throw error
  }
}

// Direct message functions
export async function createDM(user1Id: string, user2Id: string) {
  try {
    const users = [user1Id, user2Id].sort()
    const dmId = `dm:${users[0]}:${users[1]}`

    await redis.sadd(`user:${user1Id}:dms`, dmId)
    await redis.sadd(`user:${user2Id}:dms`, dmId)

    return dmId
  } catch (error) {
    console.error(`Error creating DM between users ${user1Id} and ${user2Id}:`, error)
    throw error
  }
}

export async function getUserDMs(userId: string) {
  try {
    return await redis.smembers(`user:${userId}:dms`)
  } catch (error) {
    console.error(`Error getting DMs for user ${userId}:`, error)
    throw error
  }
}

export async function addDirectMessage(dmId: string, message: any) {
  try {
    const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    await redis.hset(`message:${messageId}`, {
      ...message,
      timestamp: Date.now(),
    })
    await redis.zadd(`${dmId}:messages`, {
      score: Date.now(),
      member: messageId,
    })
    return messageId
  } catch (error) {
    console.error(`Error adding message to DM ${dmId}:`, error)
    throw error
  }
}

export async function getDMMessages(dmId: string, limit = 50, offset = 0) {
  try {
    const messageIds = await redis.zrange(`${dmId}:messages`, offset, offset + limit - 1, { rev: true })

    const messages = []
    for (const id of messageIds) {
      const message = await redis.hgetall(`message:${id}`)
      if (message) {
        messages.push({ id, ...message })
      }
    }

    return messages
  } catch (error) {
    console.error(`Error getting messages for DM ${dmId}:`, error)
    throw error
  }
}
