import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { kv } from "@vercel/kv"

export async function GET(request: NextRequest) {
  try {
    // Get the current user ID from cookies
    const userId = cookies().get("userId")?.value

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 },
      )
    }

    // Get all messages for this user (both channel and direct)
    // This is a simplified implementation - in a real app, you'd need more sophisticated filtering
    const allMessages = []

    // Get user's channels
    const userChannels = (await kv.smembers(`user:${userId}:channels`)) || []

    // Get messages from each channel
    for (const channelId of userChannels) {
      const channelMessages = (await kv.lrange(`channel:${channelId}:messages`, 0, 50)) || []
      allMessages.push(...channelMessages)
    }

    // Get direct messages
    const directMessages = (await kv.lrange(`user:${userId}:direct_messages`, 0, 50)) || []
    allMessages.push(...directMessages)

    // Sort messages by timestamp
    allMessages.sort((a, b) => a.timestamp - b.timestamp)

    return NextResponse.json({
      messages: allMessages.slice(-50), // Return the 50 most recent messages
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch messages",
      },
      { status: 500 },
    )
  }
}
