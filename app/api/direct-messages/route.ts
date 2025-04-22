import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { kv } from "@vercel/kv"

export async function GET(request: NextRequest) {
  try {
    const userId = cookies().get("userId")?.value

    if (!userId) {
      return NextResponse.json(
        {
          directMessages: [],
        },
        { status: 401 },
      )
    }

    try {
      // Get user's direct messages
      const dmKeys = (await kv.smembers(`user:${userId}:dms`)) || []
      const directMessages = []

      for (const dmId of dmKeys) {
        // Parse DM ID to extract user IDs
        const parts = dmId.split(":")
        if (parts.length < 3) continue

        const otherUserId = parts[1] === userId ? parts[2] : parts[1]

        // Get other user's info
        const otherUser = await kv.hgetall(`user:${otherUserId}`)

        if (otherUser) {
          directMessages.push({
            userId: otherUserId,
            name: otherUser.name || `User ${otherUserId.substring(0, 5)}`,
            avatar: otherUser.avatar || null,
          })
        }
      }

      return NextResponse.json({ directMessages })
    } catch (error) {
      console.error("Error fetching direct messages:", error)
      return NextResponse.json({
        directMessages: [],
        error: "Failed to fetch direct messages",
      })
    }
  } catch (error) {
    console.error("Unexpected error in direct messages endpoint:", error)
    return NextResponse.json({
      directMessages: [],
      error: "An unexpected error occurred",
    })
  }
}
