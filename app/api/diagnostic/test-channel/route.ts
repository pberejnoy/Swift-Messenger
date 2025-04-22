import { NextResponse } from "next/server"
import { getCurrentUser, requireAuth } from "@/lib/auth"
import { createChannel, channelExists, addUserToChannel } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const userId = requireAuth()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { name } = await request.json()
    const channelId = `test-${name}-${Date.now()}`

    // Check if channel already exists
    const exists = await channelExists(channelId)
    if (exists) {
      return NextResponse.json({ error: "Test channel already exists" }, { status: 409 })
    }

    // Create test channel
    await createChannel(channelId, {
      name: `Test: ${name}`,
      description: "This is a test channel created by the diagnostic tool",
      createdBy: userId,
      createdAt: Date.now(),
      isTestChannel: true,
    })

    // Add the creator to the channel
    await addUserToChannel(userId, channelId)

    return NextResponse.json({
      success: true,
      channelId,
      message: "Test channel created successfully",
    })
  } catch (error: any) {
    console.error("Error in test channel creation:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
