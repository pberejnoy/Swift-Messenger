import { NextResponse } from "next/server"
import { login } from "@/lib/auth"
import { logAuthEvent } from "@/lib/auth-logger"

export async function POST(request: Request) {
  // Get client IP for logging
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const userAgent = request.headers.get("user-agent") || "unknown"

  try {
    logAuthEvent({
      event: "diagnostic_login_test",
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    })

    const { email, password } = await request.json()

    if (!email || !password) {
      logAuthEvent({
        event: "diagnostic_test_missing_credentials",
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      })
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    try {
      // Attempt login
      const user = await login(email, password)

      logAuthEvent({
        event: "diagnostic_test_login_successful",
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
        userId: user.id,
        email: email,
      })

      return NextResponse.json({
        success: true,
        userId: user.id,
        isAdmin: user.isAdmin === true,
      })
    } catch (error: any) {
      logAuthEvent({
        event: "diagnostic_test_login_failed",
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
        email: email,
        error: error.message,
      })

      return NextResponse.json({ error: error.message || "Login failed" }, { status: 401 })
    }
  } catch (error: any) {
    logAuthEvent({
      event: "diagnostic_test_unexpected_error",
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      error: error.message || "Unknown error",
    })
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
