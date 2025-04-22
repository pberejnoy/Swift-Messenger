import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import { simpleHash } from "@/lib/auth-utils"

export async function GET() {
  try {
    const adminEmail = "pberejnoy@v0.com"
    const adminPassword = "Sl@ckV0"

    console.log("=== CHECKING ADMIN ACCOUNT ===")

    // Check if admin exists
    const userId = await redis.get(`email:${adminEmail}`)

    if (!userId) {
      return NextResponse.json({
        exists: false,
        message: "Admin account does not exist",
        recommendation: "Use the 'Complete Admin Reset' button to create the admin account",
      })
    }

    // Get admin user data
    const user = await redis.hgetall(`user:${userId}`)

    if (!user) {
      return NextResponse.json({
        exists: true,
        hasData: false,
        message: "Admin account exists but has no data",
        recommendation: "Use the 'Complete Admin Reset' button to recreate the admin account",
      })
    }

    // Check password format
    const simpleHashedPassword = simpleHash(adminPassword)
    const isBcryptHash = user.password && /^\$2[aby]\$\d+\$/.test(user.password)

    // Check if admin flag is set
    const isAdmin = user.isAdmin === "true" || user.isAdmin === true

    // Check rate limits
    const rateKeys = await redis.keys(`ratelimit:login:*`)
    const hasRateLimits = rateKeys.length > 0

    // Check failed attempts
    const failedAttemptsKeys = await redis.keys(`failedAttempts:*`)
    const hasFailedAttempts = failedAttemptsKeys.length > 0

    return NextResponse.json({
      exists: true,
      hasData: true,
      userId,
      email: user.email,
      isAdmin,
      passwordFormat: isBcryptHash ? "bcrypt" : "simple-hash",
      passwordMatches: user.password === simpleHashedPassword,
      hasRateLimits,
      rateLimitCount: rateKeys.length,
      hasFailedAttempts,
      failedAttemptsCount: failedAttemptsKeys.length,
      recommendation: !isAdmin
        ? "Admin flag is not set, use 'Complete Admin Reset'"
        : user.password !== simpleHashedPassword
          ? "Password hash doesn't match, use 'Fix Admin Account'"
          : hasRateLimits || hasFailedAttempts
            ? "Rate limits or failed attempts exist, use 'Clear Rate Limits'"
            : "Admin account appears to be correctly configured",
    })
  } catch (error: any) {
    console.error("Error checking admin account:", error)
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
