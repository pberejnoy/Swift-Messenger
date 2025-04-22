import { NextResponse } from "next/server"
import { requireAuth, getCurrentUser } from "@/lib/auth"
import { createDM, getDMMessages, addDirectMessage } from "@/lib/redis"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const currentUserId = requireAuth()
    const { userId: otherUserId } = params

    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    // Create or get DM channel ID
    const users = [currentUserId, otherUserId].sort()
    const dmId = `dm:${users[0]}:${users[1]}`

    const messages = await getDMMessages(dmId, limit, offset)

    return NextResponse.json({ messages })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const currentUserId = requireAuth()
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { userId: otherUserId } = params
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    // Create or get DM channel
    const users = [currentUserId, otherUserId].sort()
    const dmId = await createDM(users[0], users[1])

    const messageId = await addDirectMessage(dmId, {
      content,
      senderId: currentUserId,
      senderName: currentUser.name,
    })

    return NextResponse.json({
      success: true,
      messageId,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
