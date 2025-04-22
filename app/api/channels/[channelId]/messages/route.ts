import { NextResponse } from "next/server"
import { requireAuth, getCurrentUser } from "@/lib/auth"
import { getChannelMessages, addMessage } from "@/lib/redis"

export async function GET(request: Request, { params }: { params: { channelId: string } }) {
  try {
    requireAuth()
    const { channelId } = params

    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    const messages = await getChannelMessages(channelId, limit, offset)

    return NextResponse.json({ messages })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

export async function POST(request: Request, { params }: { params: { channelId: string } }) {
  try {
    const userId = requireAuth()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { channelId } = params
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    const messageId = await addMessage(channelId, {
      content,
      senderId: userId,
      senderName: user.name,
    })

    return NextResponse.json({
      success: true,
      messageId,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
