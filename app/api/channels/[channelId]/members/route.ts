import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getChannelMembers, getUser } from "@/lib/redis"

export async function GET(request: Request, { params }: { params: { channelId: string } }) {
  try {
    requireAuth()
    const { channelId } = params

    const memberIds = await getChannelMembers(channelId)
    const members = []

    for (const id of memberIds) {
      const user = await getUser(id)
      if (user) {
        // Don't expose sensitive information
        const { password, ...safeUser } = user
        members.push({
          id,
          ...safeUser,
        })
      }
    }

    return NextResponse.json({ members })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
