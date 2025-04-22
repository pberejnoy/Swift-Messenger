import { NextResponse } from "next/server"
import { getCurrentUser, requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const userId = requireAuth()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has basic permissions
    return NextResponse.json({
      success: true,
      userId,
      permissions: {
        authenticated: true,
        isAdmin: user.isAdmin === true,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Permission check failed" }, { status: 401 })
  }
}
