import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { kv } from "@vercel/kv"

export async function GET(request: NextRequest) {
  try {
    const userId = cookies().get("userId")?.value

    if (!userId) {
      return NextResponse.json(
        {
          channels: [],
        },
        { status: 401 },
      )
    }

    try {
      // Get all channels
      const channelKeys = await kv.keys("channel:*")
      const channels = []

      for (const key of channelKeys) {
        // Extract channel ID from key
        const channelId = key.split(":")[1]
        if (!channelId) continue

        const channel = await kv.hgetall(`channel:${channelId}`)
        if (channel) {
          channels.push({
            id: channelId,
            name: channel.name || channelId,
            description: channel.description || "",
          })
        }
      }

      return NextResponse.json({ channels })
    } catch (error) {
      console.error("Error fetching channels:", error)
      return NextResponse.json({
        channels: [],
        error: "Failed to fetch channels",
      })
    }
  } catch (error) {
    console.error("Unexpected error in channels endpoint:", error)
    return NextResponse.json({
      channels: [],
      error: "An unexpected error occurred",
    })
  }
}
