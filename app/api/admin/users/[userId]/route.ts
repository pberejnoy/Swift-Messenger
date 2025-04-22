import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { redis, getUser, createUser } from "@/lib/redis"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    // Ensure the requester is an admin
    await requireAdmin()

    const { userId } = params
    const user = await getUser(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't expose password
    const { password, ...safeUser } = user

    return NextResponse.json({ user: { id: userId, ...safeUser } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

export async function PATCH(request: Request, { params }: { params: { userId: string } }) {
  try {
    // Ensure the requester is an admin
    await requireAdmin()

    const { userId } = params
    const updates = await request.json()

    // Get current user data
    const user = await getUser(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user data
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: Date.now(),
    }

    await createUser(userId, updatedUser)

    // Don't expose password
    const { password, ...safeUser } = updatedUser

    return NextResponse.json({ user: { id: userId, ...safeUser } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  try {
    // Ensure the requester is an admin
    await requireAdmin()

    const { userId } = params

    // Get user data to find email
    const user = await getUser(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user data
    await redis.del(`user:${userId}`)

    // Delete email to userId mapping
    if (user.email) {
      await redis.del(`email:${user.email}`)
    }

    // Remove user from channels
    const userChannels = await redis.smembers(`user:${userId}:channels`)
    for (const channelId of userChannels) {
      await redis.srem(`channel:${channelId}:members`, userId)
    }
    await redis.del(`user:${userId}:channels`)

    // Remove user's DMs
    await redis.del(`user:${userId}:dms`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
