import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getChannel } from "@/lib/redis"

export async function GET(request: Request, { params }: { params: { channelId: string } }) {
  try {
    requireAuth()
    const { channelId } = params

    const channel = await getChannel(channelId)

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 })
    }

    return NextResponse.json({ channel })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
