import { NextResponse } from "next/server"
import { testRedisConnection } from "@/lib/redis"

export async function GET() {
  try {
    const isConnected = await testRedisConnection()

    if (isConnected) {
      return NextResponse.json({ success: true, message: "Redis connection successful" })
    } else {
      return NextResponse.json({ success: false, error: "Redis connection failed" }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Redis connection error" }, { status: 500 })
  }
}
