import { NextResponse } from "next/server"
import { requireAdmin, register } from "@/lib/auth"
import { redis, getUser } from "@/lib/redis"

export async function GET() {
  try {
    // Ensure the requester is an admin
    await requireAdmin()

    // Get all user IDs
    const userKeys = await redis.keys("user:*")
    const userIds = userKeys.map((key) => key.split(":")[1])

    // Get user details
    const users = []
    for (const id of userIds) {
      const user = await getUser(id)
      if (user) {
        // Don't expose password
        const { password, ...safeUser } = user
        users.push({
          id,
          ...safeUser,
        })
      }
    }

    return NextResponse.json({ users })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

export async function POST(request: Request) {
  try {
    // Ensure the requester is an admin
    await requireAdmin()

    const { name, email, password, isAdmin } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Register the new user
    const userId = await register(email, name, password, isAdmin)

    return NextResponse.json({ success: true, userId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
