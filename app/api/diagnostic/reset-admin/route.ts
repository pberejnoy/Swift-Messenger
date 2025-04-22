import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import { v4 as uuidv4 } from "uuid"
import crypto from "crypto"

// Direct simple hash function to ensure consistency
function directSimpleHash(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST() {
  try {
    const adminEmail = "pberejnoy@v0.com"
    const adminPassword = "Sl@ckV0"

    console.log("=== ADMIN ACCOUNT COMPLETE RESET ===")

    // 1. Check if admin exists and delete it
    const existingUserId = await redis.get(`email:${adminEmail}`)
    if (existingUserId) {
      console.log(`Deleting existing admin account with ID: ${existingUserId}`)
      await redis.del(`user:${existingUserId}`)
      await redis.del(`email:${adminEmail}`)
    }

    // 2. Create a new admin account with a fresh ID
    const userId = uuidv4()
    console.log(`Creating new admin account with ID: ${userId}`)

    // 3. Hash the password using simple hash
    const hashedPassword = directSimpleHash(adminPassword)
    console.log(`Admin password: ${adminPassword}`)
    console.log(`Admin password hash: ${hashedPassword}`)

    // 4. Store the user data
    await redis.hset(`user:${userId}`, {
      email: adminEmail,
      name: "Super Admin",
      password: hashedPassword,
      isAdmin: true,
      createdAt: Date.now(),
      lastLogin: null,
      loginAttempts: 0,
    })

    // 5. Create email to userId mapping
    await redis.set(`email:${adminEmail}`, userId)

    console.log("Admin account reset completed successfully")

    return NextResponse.json({
      success: true,
      message: "Admin account has been completely reset. You can now log in with the default credentials.",
      userId,
    })
  } catch (error: any) {
    console.error("Error resetting admin account:", error)
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
