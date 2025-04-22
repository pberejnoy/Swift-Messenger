import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import { register } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address",
        },
        { status: 400 },
      )
    }

    const userId = await register(email, name, password)

    // Add user to general channel by default
    const generalChannelExists = await redis.exists("channel:general")

    if (!generalChannelExists) {
      await redis.hset("channel:general", {
        name: "General",
        description: "General discussion",
        createdBy: "system",
        createdAt: Date.now(),
      })
      await redis.sadd("channels", "general")
    }

    await redis.sadd("channel:general:members", userId)
    await redis.sadd(`user:${userId}:channels`, "general")

    return NextResponse.json({ success: true, userId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
