import { redis } from "./redis"

// Define the log event type
type AuthLogEvent = {
  event: string
  timestamp: string
  ip: string
  userAgent: string
  userId?: string
  email?: string
  error?: string
  details?: any
  attemptCount?: number
}

// Maximum number of log events to keep in Redis
const MAX_LOG_EVENTS = 1000

// Log authentication events to Redis and optionally to a file
export async function logAuthEvent(event: AuthLogEvent) {
  try {
    // Add to Redis for real-time access
    const logKey = `auth:logs`

    // Create a unique ID for the log entry
    const logId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`

    // Store the log event in Redis
    await redis.hset(`auth:log:${logId}`, event)

    // Add to the sorted set of logs with timestamp as score
    const timestamp = new Date(event.timestamp).getTime()
    await redis.zadd(logKey, { score: timestamp, member: logId })

    // Trim the log to keep only the most recent events
    const count = await redis.zcard(logKey)
    if (count > MAX_LOG_EVENTS) {
      const toRemove = count - MAX_LOG_EVENTS
      const oldLogIds = await redis.zrange(logKey, 0, toRemove - 1)

      // Remove old log entries
      if (oldLogIds.length > 0) {
        await redis.zrem(logKey, ...oldLogIds)

        // Remove the individual log data
        for (const id of oldLogIds) {
          await redis.del(`auth:log:${id}`)
        }
      }
    }

    // Also log to console for development
    console.log(`AUTH LOG [${event.event}]:`, {
      timestamp: event.timestamp,
      ip: event.ip,
      email: event.email || "N/A",
      userId: event.userId || "N/A",
      error: event.error || "N/A",
      details: event.details || {},
    })
  } catch (error) {
    // Fallback to console if Redis logging fails
    console.error("Failed to log auth event:", error)
    console.log("Auth event that failed to log:", event)
  }
}

// Get recent authentication logs
export async function getRecentAuthLogs(limit = 100) {
  try {
    const logKey = `auth:logs`
    const logIds = await redis.zrange(logKey, -limit, -1, { rev: true })

    const logs = []
    for (const id of logIds) {
      const log = await redis.hgetall(`auth:log:${id}`)
      if (log) {
        logs.push(log)
      }
    }

    return logs
  } catch (error) {
    console.error("Failed to get auth logs:", error)
    return []
  }
}

// Get logs for a specific user
export async function getUserAuthLogs(userId: string, limit = 50) {
  try {
    const logs = await getRecentAuthLogs(500) // Get a larger set to filter from
    return logs.filter((log) => log.userId === userId).slice(0, limit)
  } catch (error) {
    console.error(`Failed to get auth logs for user ${userId}:`, error)
    return []
  }
}

// Get logs for a specific IP address
export async function getIpAuthLogs(ip: string, limit = 50) {
  try {
    const logs = await getRecentAuthLogs(500) // Get a larger set to filter from
    return logs.filter((log) => log.ip === ip).slice(0, limit)
  } catch (error) {
    console.error(`Failed to get auth logs for IP ${ip}:`, error)
    return []
  }
}
