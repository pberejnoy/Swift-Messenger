import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json()

    // In a real application, you would:
    // 1. Validate the error data
    // 2. Store it in a database or send it to an error tracking service
    // 3. Add additional context (user info, browser info, etc.)

    // For now, we'll just log it to the console
    console.error("Client error logged:", errorData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging client error:", error)
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 })
  }
}
