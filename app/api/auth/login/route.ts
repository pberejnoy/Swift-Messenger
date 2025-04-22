import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { hashPassword } from "@/lib/auth-utils"
import { kv } from "@vercel/kv"

export async function POST(request: NextRequest) {
  try {
    console.log("Login request received")

    // Parse request body safely
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Failed to parse request body:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
        },
        { status: 400 },
      )
    }

    const { email, password } = body

    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()
    console.log(`Attempting login for email: ${normalizedEmail}`)

    // Special handling for admin account
    if (normalizedEmail === "pberejnoy@v0.com") {
      console.log("Admin login attempt detected")

      try {
        // Check if admin exists in KV store
        const adminUser = await kv.hgetall(`user:email:${normalizedEmail}`)

        if (!adminUser) {
          console.log("Admin user not found, creating admin account")

          // Create admin user if it doesn't exist
          const adminId = "admin-" + Date.now()
          const hashedPassword = await hashPassword("Sl@ckV0")

          const newAdminUser = {
            id: adminId,
            email: normalizedEmail,
            name: "Admin User",
            password: hashedPassword,
            role: "admin",
            createdAt: Date.now(),
          }

          // Store admin user by ID and email
          await kv.hset(`user:${adminId}`, newAdminUser)
          await kv.hset(`user:email:${normalizedEmail}`, { id: adminId })

          console.log("Admin account created successfully")

          // Set cookies and return success
          cookies().set("userId", adminId, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
          })

          return NextResponse.json({
            success: true,
            message: "Admin account created and logged in successfully",
            debug: "Created new admin account",
          })
        }

        // Admin exists, verify password directly for admin
        if (password === "Sl@ckV0") {
          console.log("Admin password matched directly")

          // Get the admin user ID
          const adminId = adminUser.id

          // Set cookies and return success
          cookies().set("userId", adminId, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
          })

          return NextResponse.json({
            success: true,
            message: "Admin logged in successfully",
            debug: "Admin direct password match",
          })
        }
      } catch (kvError) {
        console.error("KV error during admin login:", kvError)
        return NextResponse.json(
          {
            success: false,
            error: "Database error during login",
            debug: kvError instanceof Error ? kvError.message : String(kvError),
          },
          { status: 500 },
        )
      }
    }

    // Regular user flow
    try {
      console.log("Looking up user by email")
      const userIdObj = await kv.hgetall(`user:email:${normalizedEmail}`)

      if (!userIdObj || !userIdObj.id) {
        console.log("User not found")
        return NextResponse.json(
          {
            success: false,
            error: "Invalid email or password",
            debug: `User not found for email: ${normalizedEmail}`,
          },
          { status: 401 },
        )
      }

      const userId = userIdObj.id
      console.log(`Found user ID: ${userId}`)

      const user = await kv.hgetall(`user:${userId}`)

      if (!user) {
        console.log("User data not found")
        return NextResponse.json(
          {
            success: false,
            error: "Invalid email or password",
            debug: `User data not found for ID: ${userId}`,
          },
          { status: 401 },
        )
      }

      console.log("Verifying password")
      // Use direct comparison for admin password
      let isValid = false

      if (normalizedEmail === "pberejnoy@v0.com" && password === "Sl@ckV0") {
        isValid = true
      } else {
        // For regular users, verify password hash
        try {
          const hashedInput = await hashPassword(password)
          isValid = hashedInput === user.password
        } catch (hashError) {
          console.error("Password hash verification error:", hashError)
          return NextResponse.json(
            {
              success: false,
              error: "Authentication error",
              debug: "Password verification failed",
            },
            { status: 500 },
          )
        }
      }

      if (!isValid) {
        console.log("Password verification failed")
        return NextResponse.json(
          {
            success: false,
            error: "Invalid email or password",
            debug: "Password verification failed",
          },
          { status: 401 },
        )
      }

      console.log("Password verified, setting cookies")

      // Set cookies
      cookies().set("userId", userId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      })

      return NextResponse.json({
        success: true,
        message: "Logged in successfully",
      })
    } catch (dbError) {
      console.error("Database error during regular login:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database error during login",
          debug: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        debug: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
