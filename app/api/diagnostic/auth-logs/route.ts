import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { getRecentAuthLogs } from "@/lib/auth-logger"

export async function GET(request: Request) {
  try {
    // Only admins can view logs
    await requireAdmin()

    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")

    const logs = await getRecentAuthLogs(limit)

    return NextResponse.json({
      success: true,
      logs,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to retrieve auth logs",
      },
      { status: 401 },
    )
  }
}
