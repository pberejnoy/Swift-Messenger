import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { kv } from "@vercel/kv"

export async function GET(request: NextRequest) {
  try {
    const userId = cookies().get("userId")?.value

    if (!userId) {
      return NextResponse.json({
        isLoggedIn: false,
        message: "No session found",
      })
    }

    try {
      // Verify user exists
      const user = await kv.hgetall(`user:${userId}`)

      if (!user) {
        // Clear invalid cookie
        cookies().delete("userId")

        return NextResponse.json({
          isLoggedIn: false,
          message: "Invalid session - user not found",
        })
      }

      return NextResponse.json({
        isLoggedIn: true,
        userId: userId,
        userRole: user.role || "user",
      })
    } catch (kvError) {
      console.error("KV error during session check:", kvError)

      // Don't clear cookie on KV errors to prevent unnecessary logouts
      return NextResponse.json(
        {
          isLoggedIn: true, // Assume logged in if KV fails
          userId: userId,
          error: "Database error during session check",
          debug: kvError instanceof Error ? kvError.message : String(kvError),
        },
        { status: 200 }, // Return 200 to prevent logout on temporary KV issues
      )
    }
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json(
      {
        isLoggedIn: false,
        error: "Failed to check session",
        debug: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
