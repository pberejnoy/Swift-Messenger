import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth-utils"
import { kv } from "@vercel/kv"

export async function GET(request: NextRequest) {
  try {
    console.log("Diagnostics request received")

    // Admin credentials
    const adminEmail = "pberejnoy@v0.com"

    // Check KV connection
    let kvStatus = "Unknown"
    let adminStatus = "Not found"
    let adminId = null
    let adminData = null
    let expectedHash = null
    let sessionStatus = "Unknown"

    try {
      await kv.ping()
      kvStatus = "Connected"

      // Check if admin exists
      const existingAdmin = await kv.hgetall(`user:email:${adminEmail}`)

      if (existingAdmin && existingAdmin.id) {
        adminId = existingAdmin.id
        adminStatus = "Found by email"

        // Get the admin user data
        adminData = await kv.hgetall(`user:${existingAdmin.id}`)

        if (adminData) {
          adminStatus = "Found with complete data"
        } else {
          adminStatus = "Found by email but missing user data"
        }
      }
    } catch (kvError) {
      kvStatus = `Error: ${kvError instanceof Error ? kvError.message : String(kvError)}`
    }

    // Generate expected password hash
    try {
      expectedHash = await hashPassword("Sl@ckV0")
    } catch (hashError) {
      console.error("Error generating hash:", hashError)
    }

    // Check session endpoint
    try {
      const sessionResponse = await fetch(new URL("/api/auth/session", request.url).toString())

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        sessionStatus = `Status: ${sessionResponse.status}, IsLoggedIn: ${sessionData.isLoggedIn || false}`
      } else {
        sessionStatus = `Error status: ${sessionResponse.status}`
      }
    } catch (sessionError) {
      sessionStatus = `Error: ${sessionError instanceof Error ? sessionError.message : String(sessionError)}`
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      kvStatus,
      adminStatus,
      adminId,
      adminEmail,
      adminDataExists: !!adminData,
      adminPasswordMatch: adminData ? adminData.password === expectedHash : false,
      expectedPasswordHash: expectedHash,
      actualPasswordHash: adminData ? adminData.password : null,
      sessionStatus,
    })
  } catch (error) {
    console.error("Diagnostics error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run diagnostics",
        debug: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
