import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getUser } from "@/lib/redis"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    requireAuth()
    const { userId } = params

    const user = await getUser(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't expose sensitive information
    const { password, ...safeUser } = user

    return NextResponse.json({
      user: {
        ...safeUser,
        id: userId,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}
