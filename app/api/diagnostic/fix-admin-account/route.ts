import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import { simpleHash } from "@/lib/auth-utils"

export async function POST() {
  try {
    const adminEmail = "pberejnoy@v0.com"
    const adminPassword = "Sl@ckV0"

    console.log("=== FIXING ADMIN ACCOUNT ===")

    // Check if admin exists
    const userId = await redis.get(`email:${adminEmail}`)

    if (!userId) {
      console.log("Admin account does not exist, creating it")

      // Create a new admin account
      const newUserId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)

      // Hash the password using simple hash
      const hashedPassword = simpleHash(adminPassword)

      // Create the user
      await redis.hset(`user:${newUserId}`, {
        email: adminEmail,
        name: "Super Admin",
        password: hashedPassword,
        isAdmin: true,
        createdAt: Date.now(),
        lastLogin: null,
        loginAttempts: 0,
      })

      // Create email to userId mapping
      await redis.set(`email:${adminEmail}`, newUserId)

      return NextResponse.json({
        success: true,
        message: "Admin account created successfully",
        userId: newUserId,
      })
    }

    // Get admin user data
    const user = await redis.hgetall(`user:${userId}`)

    if (!user) {
      console.log("Admin user data not found, recreating it")

      // Hash the password using simple hash
      const hashedPassword = simpleHash(adminPassword)

      // Create the user
      await redis.hset(`user:${userId}`, {
        email: adminEmail,
        name: "Super Admin",
        password: hashedPassword,
        isAdmin: true,
        createdAt: Date.now(),
        lastLogin: null,
        loginAttempts: 0,
      })

      return NextResponse.json({
        success: true,
        message: "Admin user data recreated successfully",
        userId,
      })
    }

    // Update the admin account with the correct password hash
    const correctHash = simpleHash(adminPassword)

    console.log("Updating admin account with correct password hash")
    console.log(`Current hash: ${user.password ? user.password.substring(0, 20) + "..." : "undefined"}`)
    console.log(`Correct hash: ${correctHash.substring(0, 20)}...`)

    await redis.hset(`user:${userId}`, {
      ...user,
      password: correctHash,
      isAdmin: true,
      updatedAt: Date.now(),
      loginAttempts: 0,
      lockedUntil: null,
    })

    // Clear any rate limits
    const rateKeys = await redis.keys(`ratelimit:login:*`)
    for (const key of rateKeys) {
      await redis.del(key)
    }

    // Clear failed attempts
    const failedAttemptsKeys = await redis.keys(`failedAttempts:*`)
    for (const key of failedAttemptsKeys) {
      await redis.del(key)
    }

    return NextResponse.json({
      success: true,
      message: "Admin account fixed successfully",
      userId,
    })
  } catch (error: any) {
    console.error("Error fixing admin account:", error)
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
