import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import { logAuthEvent } from "@/lib/auth-logger"

export async function POST(request: Request) {
  try {
    // Get client IP for logging
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    console.log("=== CLEARING RATE LIMITS ===")
    logAuthEvent({
      event: "clear_rate_limits_requested",
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    })

    // Clear rate limits for this IP
    const rateKeys = await redis.keys(`ratelimit:login:${ip}`)

    if (rateKeys.length > 0) {
      console.log(`Found ${rateKeys.length} rate limit keys for IP ${ip}`)
      for (const key of rateKeys) {
        await redis.del(key)
        console.log(`Deleted rate limit key: ${key}`)
      }
    } else {
      console.log(`No rate limit keys found for IP ${ip}`)
    }

    // Also clear any global rate limits
    const globalRateKeys = await redis.keys("ratelimit:login:*")
    console.log(`Found ${globalRateKeys.length} total rate limit keys`)

    if (globalRateKeys.length > 0) {
      for (const key of globalRateKeys) {
        await redis.del(key)
        console.log(`Deleted global rate limit key: ${key}`)
      }
    }

    // Clear failed attempts tracking
    const failedAttemptsKeys = await redis.keys("failedAttempts:*")

    if (failedAttemptsKeys.length > 0) {
      console.log(`Found ${failedAttemptsKeys.length} failed attempts keys`)
      for (const key of failedAttemptsKeys) {
        await redis.del(key)
        console.log(`Deleted failed attempts key: ${key}`)
      }
    }

    // Clear in-memory failed attempts map if it exists
    if (global.failedAttempts) {
      global.failedAttempts.clear()
      console.log("Cleared in-memory failed attempts map")
    }

    logAuthEvent({
      event: "rate_limits_cleared",
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Rate limits have been cleared. You can now attempt to log in again.",
    })
  } catch (error: any) {
    console.error("Error clearing rate limits:", error)
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
