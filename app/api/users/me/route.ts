import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { kv } from "@vercel/kv"

export async function GET(request: NextRequest) {
  try {
    const userId = cookies().get("userId")?.value

    if (!userId) {
      console.log("No userId cookie found in /api/users/me request")
      return NextResponse.json(
        {
          error: "Not authenticated",
          details: "No user ID found in cookies",
        },
        { status: 401 },
      )
    }

    try {
      // Get user data
      console.log(`Fetching user data for ID: ${userId}`)
      const user = await kv.hgetall(`user:${userId}`)

      if (!user) {
        console.log(`User not found for ID: ${userId}`)
        return NextResponse.json(
          {
            error: "User not found",
            details: "User data not found in database",
          },
          { status: 404 },
        )
      }

      console.log(`Successfully retrieved user data for ID: ${userId}`)
      // Don't expose sensitive information
      const { password, ...safeUser } = user

      return NextResponse.json({
        user: {
          ...safeUser,
          id: userId,
        },
      })
    } catch (error) {
      console.error(`Error fetching user from KV store: ${error}`)
      return NextResponse.json(
        {
          error: "Failed to fetch user data",
          details: error instanceof Error ? error.message : "Unknown database error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error(`Unexpected error in users/me endpoint: ${error}`)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 },
    )
  }
}
