import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth-utils"
import { kv } from "@vercel/kv"

export async function POST(request: NextRequest) {
  try {
    console.log("Fix admin account request received")

    // Admin credentials
    const adminEmail = "pberejnoy@v0.com"
    const adminPassword = "Sl@ckV0"
    const adminId = "admin-" + Date.now()

    try {
      // Check KV connection first
      await kv.ping()
      console.log("KV connection successful")

      // Check if admin exists
      const existingAdmin = await kv.hgetall(`user:email:${adminEmail}`)

      if (existingAdmin && existingAdmin.id) {
        console.log(`Existing admin found with ID: ${existingAdmin.id}`)

        // Get the admin user data
        const adminUser = await kv.hgetall(`user:${existingAdmin.id}`)

        if (adminUser) {
          console.log("Updating existing admin account")

          // Update admin password
          const hashedPassword = await hashPassword(adminPassword)

          await kv.hset(`user:${existingAdmin.id}`, {
            password: hashedPassword,
            role: "admin",
            updatedAt: Date.now(),
          })

          return NextResponse.json({
            success: true,
            message: `Admin account updated with ID: ${existingAdmin.id}`,
          })
        }
      }

      // Create new admin account
      console.log("Creating new admin account")
      const hashedPassword = await hashPassword(adminPassword)

      const newAdminUser = {
        id: adminId,
        email: adminEmail,
        name: "Admin User",
        password: hashedPassword,
        role: "admin",
        createdAt: Date.now(),
      }

      // Store admin user by ID and email
      await kv.hset(`user:${adminId}`, newAdminUser)
      await kv.hset(`user:email:${adminEmail}`, { id: adminId })

      return NextResponse.json({
        success: true,
        message: `New admin account created with ID: ${adminId}`,
      })
    } catch (kvError) {
      console.error("KV operation error:", kvError)
      return NextResponse.json(
        {
          success: false,
          error: "Database operation failed",
          debug: kvError instanceof Error ? kvError.message : String(kvError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Fix admin account error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fix admin account",
        debug: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
