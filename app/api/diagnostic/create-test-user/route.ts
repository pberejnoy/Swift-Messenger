import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { redis } from "@/lib/redis"
import { simpleHash } from "@/lib/auth-utils"
import { logAuthEvent } from "@/lib/auth-logger"

export async function POST(request: Request) {
  try {
    // Get client IP for logging
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    console.log("=== CREATING TEST USER ACCOUNT ===")

    // Generate a unique email and simple password
    const userId = uuidv4()
    const timestamp = Date.now()
    const email = `test-user-${timestamp}@messaging-app.com`
    const password = `TestUser${timestamp.toString().slice(-6)}`

    // Use simple hash for password to ensure compatibility
    const hashedPassword = simpleHash(password)

    // Create the user in Redis
    await redis.hset(`user:${userId}`, {
      email,
      name: "Test User",
      password: hashedPassword,
      isAdmin: false,
      createdAt: timestamp,
      lastLogin: null,
      loginAttempts: 0,
    })

    // Create email to userId mapping
    await redis.set(`email:${email}`, userId)

    // Add user to general channel by default
    const generalChannelExists = await redis.exists("channel:general")

    if (!generalChannelExists) {
      await redis.hset("channel:general", {
        name: "General",
        description: "General discussion",
        createdBy: "system",
        createdAt: timestamp,
      })
      await redis.sadd("channels", "general")
    }

    await redis.sadd("channel:general:members", userId)
    await redis.sadd(`user:${userId}:channels`, "general")

    // Log the event
    logAuthEvent({
      event: "test_user_created",
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      userId,
      email,
    })

    console.log(`Test user created successfully: ${email} / ${password}`)

    return NextResponse.json({
      success: true,
      message: "Test user created successfully",
      credentials: {
        email,
        password,
        userId,
      },
    })
  } catch (error: any) {
    console.error("Error creating test user:", error)
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
