import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import { simpleHash } from "@/lib/auth-utils"

export async function GET() {
  try {
    const adminEmail = "pberejnoy@v0.com"
    const adminPassword = "Sl@ckV0"

    console.log("=== VERIFYING ADMIN PASSWORD HASH ===")

    // Get admin user ID
    const userId = await redis.get(`email:${adminEmail}`)
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "Admin account not found",
        recommendation: "Use the 'Complete Admin Reset' button to create the admin account",
      })
    }

    // Get admin user data
    const user = await redis.hgetall(`user:${userId}`)
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Admin user data not found",
        recommendation: "Use the 'Complete Admin Reset' button to recreate the admin account",
      })
    }

    // Generate the expected hash
    const expectedHash = simpleHash(adminPassword)

    // Compare the hashes
    const hashesMatch = expectedHash === user.password

    // Check if admin flag is set
    const isAdmin = user.isAdmin === "true" || user.isAdmin === true

    return NextResponse.json({
      success: true,
      userId,
      email: user.email,
      isAdmin,
      storedPasswordHash: user.password ? `${user.password.substring(0, 20)}...` : "undefined",
      expectedPasswordHash: `${expectedHash.substring(0, 20)}...`,
      hashesMatch,
      recommendation: !isAdmin
        ? "Admin flag is not set, use 'Complete Admin Reset'"
        : !hashesMatch
          ? "Password hash doesn't match, use 'Fix Admin Account'"
          : "Admin account appears to be correctly configured",
    })
  } catch (error: any) {
    console.error("Error verifying admin password hash:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
