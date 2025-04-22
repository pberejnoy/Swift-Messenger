import type React from "react"
import { getCurrentUser, requireAuth } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"

export default async function ChannelsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userId = requireAuth()
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
