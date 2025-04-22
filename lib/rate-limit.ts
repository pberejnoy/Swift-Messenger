import { redis } from "./redis"

// Store failed login attempts in Redis instead of in-memory
export async function storeFailedAttempt(identifier: string) {
  try {
    const key = `failedAttempts:${identifier}`

    // Get current count
    const current = await redis.get(key)
    const count = current ? Number.parseInt(current as string) : 0

    // Increment count
    await redis.set(key, (count + 1).toString())

    // Set expiry if this is the first request (5 minutes)
    if (count === 0) {
      await redis.expire(key, 300)
    }

    return count + 1
  } catch (error) {
    console.error("Error storing failed attempt:", error)
    return 0
  }
}

// Get failed login attempts count
export async function getFailedAttempts(identifier: string): Promise<number> {
  try {
    const key = `failedAttempts:${identifier}`
    const count = await redis.get(key)
    return count ? Number.parseInt(count as string) : 0
  } catch (error) {
    console.error("Error getting failed attempts:", error)
    return 0
  }
}

// Reset failed login attempts
export async function resetFailedAttempts(identifier: string): Promise<void> {
  try {
    const key = `failedAttempts:${identifier}`
    await redis.del(key)
  } catch (error) {
    console.error("Error resetting failed attempts:", error)
  }
}

// Clear all rate limits for a specific identifier
export async function clearRateLimits(identifier: string): Promise<void> {
  try {
    // Clear rate limit keys
    const rateKeys = await redis.keys(`ratelimit:*:${identifier}`)
    for (const key of rateKeys) {
      await redis.del(key)
    }

    // Clear failed attempts
    await resetFailedAttempts(identifier)

    console.log(`Rate limits cleared for ${identifier}`)
  } catch (error) {
    console.error("Error clearing rate limits:", error)
  }
}

// Simple rate limiting implementation
export async function rateLimit(
  identifier: string,
  action: string,
  limit = 15, // Increased from 10 to 15
  windowMs = 60000,
  isAdminAttempt = false,
): Promise<boolean> {
  try {
    // Skip rate limiting for admin login attempts
    if (isAdminAttempt) {
      console.log("Bypassing rate limit for admin login attempt")
      return false // Not rate limited
    }

    const key = `ratelimit:${action}:${identifier}`

    // Get current count
    const current = await redis.get(key)
    const count = current ? Number.parseInt(current as string) : 0

    if (count >= limit) {
      console.log(`Rate limit exceeded for ${identifier} on action ${action}: ${count}/${limit}`)
      return true // Rate limited
    }

    // Increment count
    await redis.set(key, (count + 1).toString())

    // Set expiry if this is the first request
    if (count === 0) {
      await redis.expire(key, Math.floor(windowMs / 1000))
    }

    console.log(`Rate limit for ${identifier} on action ${action}: ${count + 1}/${limit}`)
    return false // Not rate limited
  } catch (error) {
    console.error("Rate limiting error:", error)
    return false // Don't rate limit on error
  }
}
