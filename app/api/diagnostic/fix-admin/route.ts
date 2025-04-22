import { NextResponse } from "next/server"
import { fixAdminAccount } from "@/lib/auth-fix"

export async function POST() {
  try {
    const wasFixed = await fixAdminAccount()

    return NextResponse.json({
      success: true,
      wasFixed,
      message: wasFixed
        ? "Admin account password format was fixed. Try logging in now."
        : "Admin account password format was already correct.",
    })
  } catch (error: any) {
    console.error("Error in fix-admin endpoint:", error)
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
